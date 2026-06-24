// Standalone runtime verification of DrizzleStore against an embedded Postgres (PGlite).
// Proves the Drizzle queries + schema are correct without provisioning a server.
// Usage: npm run db:verify
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import * as schema from "../src/db/schema";
import { DrizzleStore, type DB } from "../src/server/store-drizzle";
import type { Viewer } from "../src/lib/types";

const SUPER: Viewer = { role: "superadmin", clientId: "cl_aithreus" };
const CLIENT: Viewer = { role: "affiliate_client", clientId: "cl_dimers" };

let failures = 0;
function check(cond: boolean, msg: string) {
  if (cond) console.log(`  ✓ ${msg}`);
  else {
    console.error(`  ✗ ${msg}`);
    failures++;
  }
}

async function main() {
  const client = new PGlite(); // in-memory embedded Postgres
  const db = drizzle(client, { schema });

  // Apply the generated migration SQL (real schema DDL).
  const dir = join(process.cwd(), "drizzle");
  const sqlFiles = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  if (!sqlFiles.length) {
    console.error("No migrations found — run `npm run db:generate` first.");
    process.exit(1);
  }
  for (const f of sqlFiles) await client.exec(readFileSync(join(dir, f), "utf8"));

  const store = new DrizzleStore(db as unknown as DB);
  await store.reset();

  console.log("DrizzleStore (PGlite) verification:");
  const ttSuper = await store.listOperators("TT", SUPER);
  check(ttSuper.length === 8, `superadmin sees 8 TT operators (incl. internalOnly) — got ${ttSuper.length}`);
  const ttClient = await store.listOperators("TT", CLIENT);
  check(ttClient.length === 7, `affiliate_client sees 7 TT operators (internalOnly hidden) — got ${ttClient.length}`);

  const sitesClient = await store.listSites("TT", CLIENT);
  check(sitesClient.length === 1, `client sees only its own TT site — got ${sitesClient.length}`);

  const pub = await store.getLatestPublished("site_dimers_tt");
  check(!!pub, "published config exists for the demo site (seed-time publish)");
  check(!!pub && Object.keys(pub.targets).length > 0, "published config carries redirect targets");

  const products = await store.listProducts();
  check(products.length === 4, `4 products seeded — got ${products.length}`);
  const page = await store.getPageBySlug("calibration");
  check(!!page && page.title === "Calibration explained", "doc page reads back by slug");

  // mutation round-trip
  const op = await store.createOperator({
    verticalId: "v_tt", name: "ZVerify", slug: "zverify", buttonLabel: "Bet on ZVerify",
    brandColor: "#1FD1E6", affiliateUrl: "https://zverify.example/aff", active: true,
    category: "odds", role: "r", authType: "apiKey", integrationStatus: "live", internalOnly: false, estPayout: 50, logoAssetId: null,
  });
  const back = await store.getOperator(op.id);
  check(back?.name === "ZVerify", "createOperator → getOperator round-trip");
  await store.deleteOperator(op.id);
  check(!(await store.getOperator(op.id)), "deleteOperator removes the row");

  const events = await store.listEvents({ type: "click", siteId: "st_dimers_tt" });
  check(events.length > 0, `analytics events present — ${events.length} clicks for the demo site`);

  if (failures) {
    console.error(`\n✗ ${failures} check(s) failed.`);
    process.exit(1);
  }
  console.log("\n✓ DrizzleStore verified against Postgres (PGlite). The DATABASE_URL path is sound.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

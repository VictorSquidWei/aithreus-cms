// Seed a real Postgres database via Drizzle. Requires DATABASE_URL + tables created
// (`npm run db:push`). Usage: DATABASE_URL=… npm run db:seed
import { createDrizzleStore } from "../src/server/store-drizzle";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("Set DATABASE_URL before seeding (see docs/engineering/DATABASE.md).");
    process.exit(1);
  }
  const store = createDrizzleStore();
  await store.reset();
  console.log("✓ Seeded Postgres with demo data (verticals, operators, sites, widgets, products, docs, events).");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

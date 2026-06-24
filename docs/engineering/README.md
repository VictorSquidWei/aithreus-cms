# Aithreus CMS — Engineering integration guide

This folder is the handoff for engineers taking the prototype to production: where every endpoint lives, how to wire a real database, and how to replace the documented stubs with real systems.

## Start here
| Doc | What it covers |
|---|---|
| [ARCHITECTURE.md](ARCHITECTURE.md) | The code map — where everything lives, the layers, the data flow. |
| [ENDPOINTS.md](ENDPOINTS.md) | Every HTTP endpoint + server action: path, file, contract, what to connect. |
| [DATABASE.md](DATABASE.md) | Switching from the in-memory store to Postgres (Drizzle): provision, migrate, seed. |
| [INTEGRATION.md](INTEGRATION.md) | The stubs/seams to wire for full production functionality (auth, postbacks, feeds, analytics, CDN). |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deploying to AWS eu-west-1 (Amplify + RDS + S3/CloudFront). |

## 30-second orientation
- **Stack:** Next.js 15 (App Router) + TypeScript, Tailwind, custom `jose` session auth, Drizzle ORM (Postgres).
- **Data layer:** one async repository interface, [`src/server/data-store.ts`](../../src/server/data-store.ts). Two implementations:
  - `InMemoryStore` ([`src/server/store.ts`](../../src/server/store.ts)) — the **default** (zero-setup demo).
  - `DrizzleStore` ([`src/server/store-drizzle.ts`](../../src/server/store-drizzle.ts)) — **Postgres**, used automatically when `DATABASE_URL` is set.
- **Swap is one env var:** set `DATABASE_URL` → the app uses Postgres. Nothing else changes. (See DATABASE.md.)
- **The runtime trio** (config endpoint, redirect/tracking, `embed.js`) is what powers embedded widgets on client sites. (See ENDPOINTS.md.)
- **Specs are the source of truth:** [`/specs`](../../specs/INDEX.md) documents every feature, traced to the source requirements.

## Verify the Postgres path locally (no server needed)
```bash
npm run db:generate   # generate SQL migrations from the Drizzle schema
npm run db:verify     # run DrizzleStore against embedded Postgres (PGlite) — asserts reads/writes
```

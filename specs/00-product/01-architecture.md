# 01 — Architecture

| | |
|---|---|
| **Spec ID** | `00-product/01-architecture` |
| **Status** | approved |
| **Altitude** | System |
| **Date** | 2026-06-21 |
| **Traces to** | Report §3 (stack), §6 (runtime), §3.3 (env); Handoff §8 |

---

## 1. Purpose & scope

Fix the technology stack, application topology, repository layout, environment/secrets contract, and build/deploy story. Lower specs assume these decisions. Schema lives in `02-data-model`; auth in `03-auth-and-roles`; routes in `04-information-architecture`.

The report makes the stack "already decided" (Report §3) but offers alternatives. This spec **collapses the alternatives to one buildable path** and records the rationale, incorporating the owner's three confirmations (2026-06-21):

- **Hosting = AWS, eu-west-1 (Dublin)** — not Vercel (Handoff §8; Report §3.1 AWS fallback path).
- **Postgres = yes, but deferred** — build the frontend prototype first against a swappable in-memory store; drop Postgres in later. No DB provisioning blocks early phases.
- **Proceed under delegated authority** — phases are not individually re-gated; blockers are surfaced.

## 2. Chosen stack

| Concern | Choice | Rationale (ref) |
|---|---|---|
| Framework | **Next.js 15 (App Router) + TypeScript** | Report §3.1; Handoff §8. SSR for gated marketing; Route Handlers for config/redirect/event APIs; one deployable. |
| UI | **Tailwind CSS + shadcn/ui** | Report §3.2. One token set powers marketing + admin. |
| Data access | **Repository interface** with two impls: **InMemoryStore** (now) → **DrizzleStore (Postgres)** (later) | Owner decision; see D4/D6. |
| Transactional DB (later) | **PostgreSQL on AWS RDS, eu-west-1** | Report §3.1 (AWS path). Source of truth once wired. |
| ORM / migrations (later) | **Drizzle ORM** (`drizzle-kit`) | Report §3.1–§3.2. |
| Analytics store | **`events` table + rollup views** (same store) | Report §3.1. ClickHouse = documented production seam, not built. |
| Auth | **Auth.js (NextAuth) — Credentials provider**, hashed passwords, session cookies, `role` + `clientId` claims | Report §3.1–§3.2; Handoff §8. |
| Widget runtime | **Vanilla TS → single self-contained IIFE** (esbuild) | Report §3.1, §6.2. Framework-free, tens of KB, style-isolated. |
| Config & redirect endpoints | **Next.js Route Handlers (Node runtime)** | Report §6.1, §6.3 — see D3. |
| Hosting | **AWS eu-west-1: Amplify Hosting (Next SSR) + RDS Postgres + S3/CloudFront for `embed.js`** | Owner decision; Report §3.1 AWS path. |
| Package manager / Node | **npm**, Node ≥ 20 LTS | Lowest-friction default. |
| E2E / QA | **Playwright** (1280px + 375px) | Report §10; drives the §9.14 loop. |

### 2.1 Resolved architecture decisions

- **D1 — Single Next.js app, not a monorepo.** Marketing, gated app, `/admin` Link CMS, APIs, and the runtime endpoints live in one project (Report §3.2). The widget is a separate *build target* in the same repo (§5).
- **D2 — Hand-built admin on the repository layer; Payload CMS deferred.** Prototype stack (Report §3.2) specifies hand-built UI on a single data layer; running Payload **and** our store means two data layers and two admin UIs. Build all admin screens (B1 content + B2 Link CMS) by hand. Payload remains the documented production option for B1; schema doesn't preclude it.
- **D3 — Node runtime for config/redirect/event handlers, not edge.** Edge runtimes can't use a standard Postgres driver and complicate the in-memory store. Ship on **Node runtime**; preserve edge as a documented optimization. Low latency still comes from response `Cache-Control` + publish-time cache-busting (`08-publish-workflow`).
- **D4 — Postgres deferred behind a repository interface.** All server reads/writes go through a `DataStore` interface (`src/server/store`). Phase 2–6 run on `InMemoryStore` (module-singleton, seeded at boot from `/seed` fixtures). Phase 7 adds `DrizzleStore` (RDS Postgres). **The UI never imports the store impl directly** — only the interface — so the swap is a one-line factory change, zero UI rewrites.
- **D5 — Auto-save = working state; Publish = a published snapshot.** Working edits write live to the working tables. **Publish** computes the fully-resolved config and writes a `PublishedConfig` snapshot per `configId` (detail in `08-publish-workflow`). The runtime only ever reads published snapshots. This makes "no redeploy" atomic and safe, and works identically in-memory or on Postgres.
- **D6 — The §9.14 loop works on the in-memory store.** In-memory state persists for the server-process lifetime, which is sufficient to demo change→Publish→reload. Postgres later makes it durable/multi-instance. **Therefore the full-stack-functional acceptance criteria are met before Postgres is wired.**

## 3. Application topology

```
                          ┌─────────────────────────────────────────────┐
   Browser (operator/      │  Next.js 15 app  (AWS Amplify, eu-west-1)     │
   internal user)  ───────▶│                                              │
                          │  Layer A  /            marketing + portfolio   │
                          │  Layer A  /products /platform /integrations…  │  ──▶ DataStore
                          │  Layer B  /admin/*    Link CMS + content       │   (InMemory now,
                          │                                                │    RDS Postgres later)
   Client's own website    │  API (Node Route Handlers):                  │
   with pasted snippet:    │   GET  /api/embed/config/:configId  ─────────┼──▶ PublishedConfig
   <div .aithreus-widget>  │   GET  /r/:configId/:wid/:operatorId (302)   ┼──▶ events (write)
   <script embed.js> ─────▶│   POST /api/embed/event   (impression beacon)┼──▶ events (write)
                          │   POST /api/embed/postback (conversion stub)  ┼──▶ events (write)
                          │                                                │
   S3 + CloudFront:       │   /widget/v1/embed.js  (built artifact)        │
   cdn.aithreus.com  ◀────┴────────────────────────────────────────────────┘
                                            ▲
   /demo/client-site  (real page, real snippet) ──────────────────────────┘  proves §9.14
```

No-redeploy loop: **admin edit → auto-save (working store) → Publish → PublishedConfig snapshot + cache bump → `embed.js` fetch → CTA `href` = `/r/...` → redirect logs event + 302 to resolved affiliate URL → events feed Performance.**

## 4. Runtime trio (specs in `20-runtime/`)

1. **Config endpoint** `GET /api/embed/config/:configId` → published, **resolved, active-only, internalOnly-filtered** JSON; CORS open; short-TTL cache, busted on Publish.
2. **Redirect/tracking** `GET /r/:configId/:widgetInstanceId/:operatorId` → write `click`, resolve URL from published config, **302**. Impressions via `POST /api/embed/event`; conversions via `POST /api/embed/postback` (simulated).
3. **`embed.js`** — framework-free; scans `.aithreus-widget`, dedupes config fetch per `configId`, renders widget UI from `sampleDataJson` + **data-driven CTAs** from `config.widgets[id].ctas`, style-isolated (Shadow DOM / namespaced), fires impression beacons.

## 5. Repository structure

```
aithreus-cms/
├── specs/                      # source of truth (this tree)
├── docs/source/               # source-doc index + CMS-2 extraction
├── src/
│   ├── app/
│   │   ├── (marketing)/        # Layer A public + gated pages
│   │   ├── admin/              # Layer B1 + B2 (route-group, role-gated)
│   │   ├── demo/client-site/   # §9.14 proof page
│   │   ├── api/embed/config/[configId]/route.ts
│   │   ├── api/embed/event/route.ts
│   │   ├── api/embed/postback/route.ts
│   │   ├── api/auth/[...nextauth]/route.ts
│   │   └── r/[configId]/[wid]/[operatorId]/route.ts   # redirect
│   ├── server/
│   │   ├── store/              # DataStore interface + InMemoryStore (+ DrizzleStore later)
│   │   ├── resolution.ts       # the §4.6 resolution algorithm (storage-agnostic)
│   │   ├── visibility.ts       # §4.9 filters
│   │   └── actions/            # server actions (visibility-enforced)
│   ├── db/                     # drizzle schema + migrations (Phase 7)
│   ├── lib/                    # auth, utils, types
│   └── components/             # React components (per components/* specs)
├── widget/src/embed.ts         # framework-free widget source
├── widget/build.mjs            # esbuild → ../public/widget/v1/embed.js
├── public/widget/v1/embed.js   # built artifact
├── seed/                       # operators.json + full fixtures + seed script
├── tests/e2e/                  # Playwright (incl. the §9.14 loop)
├── drizzle.config.ts           # (Phase 7)
├── .env.example
└── README.md
```

> Widget builds via a tiny **esbuild** step (`npm run build:widget`) independent of Next's bundler, wired into `predev`/`prebuild`.

## 6. Environment & secrets (`.env.example` — Report §3.3)

```
# DATABASE_URL deferred — when unset, the app runs on the in-memory store (D4).
# DATABASE_URL=postgres://user:pass@<rds-endpoint>.eu-west-1.rds.amazonaws.com/aithreus
AUTH_SECRET=                                      # openssl rand -base64 32
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_WIDGET_CDN_URL=http://localhost:3000/widget/v1/embed.js   # prod: https://cdn.aithreus.com/widget/v1/embed.js
CONFIG_CACHE_TTL_SECONDS=60
AWS_REGION=eu-west-1
# CLICKHOUSE_URL=                                 # optional production analytics seam (unused)
```

## 7. Build, run, deploy

- **Dev (no DB needed):** `npm install` → set `AUTH_SECRET` in `.env` → `npm run dev` (runs `build:widget` first; seeds in-memory store at boot).
- **Scripts:** `dev`, `build`, `start`, `build:widget`, `seed`, `test:e2e`; (Phase 7) `db:push`, `db:migrate`.
- **Deploy:** AWS **Amplify Hosting** (Next SSR) in **eu-west-1**; `embed.js` to **S3 + CloudFront** (`cdn.aithreus.com`); **RDS Postgres** in eu-west-1 once wired. `AUTH_SECRET` (+ later `DATABASE_URL`) as Amplify env vars. `main` kept deployable; phase branches → PRs.
- **README** documents setup/env/run/deploy.

## 8. UI states

N/A — architecture spec. Loading/empty/error contracts are per-screen and in `components/ui-states`.

## 9. Non-goals (architecture-level)

- No ClickHouse / separate analytics service (rollups in the same store).
- No edge runtime in the prototype (Node handlers; edge is a documented seam, D3).
- No Payload CMS in the prototype (D2).
- No live third-party API calls (registry sync + postbacks are stubs).
- No Postgres wiring until the frontend prototype is complete (D4; Phase 7).

## 10. Open questions

- **OQ-A — Postgres provider for Phase 7.** RDS Postgres in eu-west-1 is assumed. Confirm at Phase 7 whether to use RDS directly, Aurora Serverless v2, or a managed alt; until then the in-memory store is authoritative. *(Non-blocking.)*
- **OQ-B — Amplify vs ECS Fargate.** Amplify Hosting is the default for Next SSR on AWS; ECS/Fargate is the alternative if VPC/private-RDS networking demands it. Decide at deploy time. *(Non-blocking.)*

## 11. Traceability

| Decision | Source |
|---|---|
| Next.js 15 + TS, Tailwind/shadcn, Drizzle, Auth.js | Report §3.1–§3.2; Handoff §8 |
| AWS eu-west-1 hosting (Amplify + RDS + CloudFront) | Owner decision 2026-06-21; Report §3.1 (AWS path); Handoff §8 |
| Repository interface, in-memory-first, Postgres deferred | Owner decision 2026-06-21; Report §3.2 (stack-agnostic note) |
| Runtime trio | Report §6.1–§6.4 |
| `.env.example` | Report §3.3 |
| Playwright QA at 1280px + 375px | Report §10 |

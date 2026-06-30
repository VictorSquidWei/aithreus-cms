# Aithreus CMS — Functionality & Production Handoff

> The single, comprehensive reference for this system: **what it does** (across VNX-Terminal, VNX plugins, TT-Terminal, TT plugins) and **how an engineering team takes it to production** (including AWS).
>
> Companion docs: [GUIDE.md](GUIDE.md) (navigation), [DEMO.md](DEMO.md) (walkthrough), [docs/engineering/](docs/engineering/README.md) (deep references), [specs/INDEX.md](specs/INDEX.md) (feature specs). This file consolidates and is self-contained.
>
> **Live demo:** **https://aithreus-cms.vercel.app** (`client@dimers.com` / `client123`). Vercel SSR; in-memory store (see [DEPLOYMENT.md](docs/engineering/DEPLOYMENT.md) for the cross-instance-persistence caveat and the AWS production path).

---

## Table of contents
1. [What this system is](#1-what-this-system-is)
2. [The two verticals and the product switch](#2-the-two-verticals-and-the-product-switch)
3. [Terminals (and bots): VNX-Terminal, VNX-Bot, TT-Terminal, TT-Bot](#3-terminals-and-bots)
4. [Plugins: VNX plugins & TT plugins (operators / integrations)](#4-plugins-vnx--tt)
5. [Widgets and the no-redeploy link loop](#5-widgets-and-the-no-redeploy-link-loop)
6. [Roles, visibility & security](#6-roles-visibility--security)
7. [Screen-by-screen capability map](#7-screen-by-screen-capability-map)
8. [How it's built (architecture & code map)](#8-architecture--code-map)
9. [Current state: done vs. stubbed](#9-current-state-done-vs-stubbed)
10. [Production handoff — steps to finish](#10-production-handoff)
11. [Database: switch to Postgres](#11-database-postgres)
12. [Integration seams to wire](#12-integration-seams)
13. [AWS deployment (eu-west-1)](#13-aws-deployment)
14. [Security hardening checklist](#14-security-hardening)
15. [Testing & verification](#15-testing--verification)
16. [Repository & branches](#16-repository--branches)

---

## 1. What this system is

**One unified Aithreus web property** with two layers plus a runtime artifact, on one design system, one auth, one data model:

- **Layer A — product/marketing site.** Presents Aithreus's products as CMS-managed content (gated B2B + internal).
- **Layer B — the flagship affiliate Link CMS.** Self-serve admin where affiliate clients manage every operator link on every embedded widget, from one place, without touching code.
- **Runtime — the embeddable widget (`embed.js`).** What affiliate clients paste into *their* sites; it renders widgets with operator call-to-action buttons whose links are controlled centrally from the CMS.

The commercial core: products ship embeddable widgets → widgets carry operator (plugin) CTAs → the Link CMS controls which operators are promoted where, and **links change live without re-embedding**.

---

## 2. The two verticals and the product switch

Everything is organized as **two verticals × two product types**, on one shared engine:

| | **VNX** (Prediction Markets) | **TT** (Sports) |
|---|---|---|
| **Terminal** (read-only, no execution) | VNX-Terminal | TT-Terminal |
| **Bot** (autonomous execution) | VNX-Bot | TT-Bot |

**How the system keeps them separate (the mechanism):**
- The data model carries a **`verticalId`** on `Operator`, `WidgetType`, `Site`, and `Product`. Verticals seeded: `TT` ("TT (Sports)") and `VNX` ("VNX (Prediction Markets)").
- A persistent **TT | VNX product switch** in the admin top bar (`src/components/product-switch.tsx`) sets a cookie read by every screen (`getActiveVertical()`, `src/server/vertical.ts`). Flipping it re-scopes operators, sites, widgets, and analytics to that vertical.
- The catalog scales to the design's 19 TT / 34 VNX widget counts with **no schema change** — only data.

This is exactly the design's "one unified CMS with a product switch."

---

## 3. Terminals and bots

The four products are full CMS content records (`Product`), seeded and editable:

| Product | Vertical | Type | Executes? | Example modules (the product's components) |
|---|---|---|---|---|
| **VNX-Terminal** | VNX | Terminal | No (read-only, no funds/keys) | Market discovery, Edge calculation, Calibration tracking, Position sizing, Execution plan (deep-link out), Knowledge/RAG |
| **VNX-Bot** | VNX | Bot | Yes (Polymarket + Kalshi APIs) | Exchange Layer, Market Data Engine, Execution Engine, Risk Engine, Strategy Engine, Health System |
| **TT-Terminal** | TT | Terminal | No | Multi-sportsbook edge discovery, Calibration core, Fractional-Kelly sizing, Sports signals (weather/timing/LLV), CLV tracking |
| **TT-Bot** | TT | Bot | Yes (beta) | Prediction pipeline, Calibration, Sizing & risk, Trading orchestrator, **Venue operational handling (internal-only)** |

**What the CMS does with terminals/bots:**
- **Presentation** (`/products/[slug]`): hero + **execution posture** (terminals = "read-only · no funds/keys"; bots = "executes autonomously"), "what it does", **Modules** grid, Strategies, **Integrations** (the vertical's plugins), Status metrics, and a Changelog timeline. All read from content.
- **Management** (content panel, `/admin/content`, internal only): edit a product's tagline / description / status / execution posture; manage docs and add releases (changelog). Edits **revalidate the live product page** — change a tagline, it's live. Every edit is recorded in the **Audit log**.
- **Status** (`/status`): read-only health — per-product metrics (uptime, signals/day, Brier, CLV) plus a **9-component health bar** for the bots (ported from VNX-Bot). No live trade/bot control (deliberately out of scope).
- **Invariant enforced:** TT-Bot's venue/operational handling is flagged `internalOnly` and never shown to affiliate clients or the public.

Data model: `Product`, `Module`, `Strategy`, `Tier`, `Changelog`, `StatusFeed` (see `src/lib/types.ts`, `specs/00-product/02-data-model.md`).

---

## 4. Plugins: VNX & TT

In the design docs, "plugins" = the **Integration / Plugin catalog**. This build unifies *Integration* and *Operator* into **one `Operator` entity** read two ways — the project's central design insight:

- The **Link CMS** reads `buttonLabel / brandColor / affiliateUrl / active` → the affiliate link a plugin promotes.
- The **/integrations** page reads `name / category / role / authType / integrationStatus` → the same record as a product integration.

### Seeded plugins (verified)
| Vertical | Plugins / operators |
|---|---|
| **TT (Sports)** | DraftKings, FanDuel, BetMGM, Caesars, Pinnacle (sharp reference), The Odds API (data), **Stake.com (internal-only)**, BetRivers |
| **VNX (Prediction Markets)** | Polymarket, Kalshi, CalcX, PredictIt |

### How plugins are managed (per vertical, scoped by the product switch)
1. **Step 1 · Operators** (`/admin/operators`) — full **CRUD** of plugins: name, button label, brand color, affiliate URL, and an **Active toggle that is a global kill switch**. Turning a plugin off removes its CTA from every widget, everywhere. (Server actions: `src/server/actions/operators.ts`.)
2. **Step 3 · Edit links** (`/admin/links`) — override a plugin's URL **per site and per widget**. Multi-CTA widgets show **one row per plugin**, each marked **INHERITED** (uses the Step-1 default) or **CUSTOM** (overridden); Reset restores inheritance. (Resolution algorithm: `src/server/resolution.ts`.)
3. **Integrations grid** (`/integrations`) — the same plugins presented as product integrations, grouped by vertical, with `internalOnly` filtered out for affiliate clients.

### The resolution algorithm (most-specific-wins)
For each CTA slot `(site, widget, operator)`:
1. operator `active === false` → **render no CTA** (global kill switch);
2. else a per-`(site, widget, operator)` override exists → **CUSTOM** (override URL);
3. else → **INHERITED** (operator default URL).

Single-CTA widgets render one slot (first active operator); multi-CTA widgets render one slot **per active operator** — **data-driven from the operator list**, never hardcoded. Add an active operator and it automatically gets a CTA slot on every applicable multi-CTA widget, with zero code changes.

---

## 5. Widgets and the no-redeploy link loop

### Widget catalog (per vertical, seeded)
| Vertical | Widgets |
|---|---|
| **TT** | Probability Widget (single), Line Movement Chart (single), Injury Impact Ticker (single), **Odds Comparison Table (multi-CTA)**, Player Projection Suite (multi-CTA) |
| **VNX** | **Whale Tracker (multi-CTA)**, Probability Widget (single), Market Comparison Table (multi-CTA) |

Managed in: **Widget Gallery** (`/admin/gallery`, preview each widget with the client's live plugin buttons), **Edit Links** (per-plugin overrides), **Embed** (`/admin/embed`, the copy-paste snippet).

### The headline loop (works end-to-end, both verticals)
1. Client pastes the snippet **once per widget instance**:
   ```html
   <div class="aithreus-widget" data-config-id="{configId}" data-widget="{widgetInstanceId}" data-theme="dark"></div>
   <script src="{NEXT_PUBLIC_WIDGET_CDN_URL}" async></script>
   ```
2. `embed.js` (`widget/src/embed.ts`) fetches `GET /api/embed/config/:configId` and renders the widget + data-driven plugin CTAs into a **Shadow DOM** (style-isolated from the host page).
3. Each CTA `href` is a **tracking redirect** (`/r/:configId/:widgetInstanceId/:operatorId`) — never the raw affiliate URL. The redirect logs a click event and 302s to the resolved URL.
4. In the CMS, change/toggle a plugin's link → **Publish** → the published config snapshot updates → reload the client page → the CTA updates, **with no change to the embed code and no redeploy.**

Try it live at `/demo/client-site`. Runtime details: [docs/engineering/ENDPOINTS.md](docs/engineering/ENDPOINTS.md).

---

## 6. Roles, visibility & security

Three roles (seeded users; logins shown on the login screen):

| Role | Email / pass | Sees |
|---|---|---|
| `superadmin` | `super@aithreus.internal` / `super123` | everything incl. internal-only plugins (e.g. Stake.com) |
| `internal_editor` | `editor@aithreus.internal` / `editor123` | internal data + the content panel |
| `affiliate_client` | `client@dimers.com` / `client123` | only its own sites/overrides/performance; no internal-only data |

Visibility rules (enforced server-side in `src/server/visibility.ts`, re-checked in every action):
- `internalOnly` operators/modules → internal roles only; never to clients, public pages, widgets, or the runtime config.
- Inactive operators → excluded from widgets/runtime, still editable in the Link CMS.
- **Draft sites → excluded from live widget config** (enforced at the config endpoint).
- `affiliate_client` scoped to its own `clientId`.
- Auth = signed-JWT cookie (`jose`); route guards in `src/middleware.ts`; internal-only admin areas 403 for clients.
- **Raw affiliate URLs never reach the client** — only `/r/...` redirect hrefs; the real URL is resolved server-side.

---

## 7. Screen-by-screen capability map

**Public:** `/` (landing), `/portfolio` (2×2 matrix), `/login`, `/demo/client-site`.

**Product site (gated):** `/products/[slug]` (per product), `/platform` (shared signal-and-calibration engine), `/integrations` (plugin grid per vertical), `/status` (read-only health), `/docs` + `/docs/[slug]`.

**Link CMS (`/admin`, product switch in top bar):**
| Route | Capability |
|---|---|
| `/admin` | Dashboard — KPIs + setup progress |
| `/admin/setup` | Guided 4-step setup |
| `/admin/operators` | **Step 1** — plugin/operator CRUD + active kill-switch |
| `/admin/sites` | **Step 2** — site CRUD + configId + live counts |
| `/admin/links` | **Step 3** — per-plugin/per-widget overrides (INHERITED/CUSTOM) |
| `/admin/embed` | **Step 4** — per-widget embed snippet |
| `/admin/gallery` | Widget gallery (preview with live plugin config) |
| `/admin/performance` | Views / clicks / CTR / conversions / revenue, time-series, per-operator breakdown, CSV export |
| `/admin/content` | *(internal)* edit products/modules/docs/releases |
| `/admin/audit` | *(internal)* publishes + content edits log |

---

## 8. Architecture & code map

Next.js 15 (App Router) + TypeScript, Tailwind, `jose` auth, Drizzle ORM (Postgres).

| Concern | Path |
|---|---|
| Routes / pages | `src/app/**` (`(marketing)`, `(gated)`, `admin`, `demo`) |
| HTTP endpoints | `src/app/api/embed/*`, `src/app/r/[configId]/[wid]/[operatorId]` |
| **Repository interface** (the seam) | `src/server/data-store.ts` |
| In-memory store (default) | `src/server/store.ts` (+ `getStore()` factory) |
| **Postgres store (Drizzle)** | `src/server/store-drizzle.ts` |
| Drizzle schema / migrations | `src/db/schema.ts` · `drizzle/` |
| Seed data | `src/server/seed-data.ts`, `src/server/seed-content.ts` |
| Resolution algorithm (pure) | `src/server/resolution.ts` |
| Visibility / RBAC | `src/server/visibility.ts` |
| Auth + guards | `src/lib/auth.ts`, `src/server/session.ts`, `src/middleware.ts` |
| Server actions (writes) | `src/server/actions/*` |
| Analytics rollups | `src/server/analytics.ts` |
| Widget runtime | `widget/src/embed.ts` → `public/widget/v1/embed.js` |

**Key invariant:** the UI depends only on the `DataStore` interface — swapping persistence (in-memory ⇄ Postgres) is a factory change driven by one env var. Full map: [docs/engineering/ARCHITECTURE.md](docs/engineering/ARCHITECTURE.md).

---

## 9. Current state: done vs. stubbed

**Done & verified (acceptance §9.1–§9.15; build clean; 25/25 E2E; Drizzle 10/10):** both verticals; the full Link CMS (operators, sites, edit-links/resolution, embed, gallery, performance, publish); the embeddable runtime + no-redeploy loop; the presentation layer; content panel + audit; auth + RBAC + visibility; Postgres/Drizzle behind the interface.

**Intentional stubs / seams (documented, not defects):** real auth/IdP; operator API-key registry sync; real operator conversion postbacks; live in-widget market data; ClickHouse analytics; config-cache invalidation; widget CDN; Prometheus-fed status. Each is small and isolated — see §12.

---

## 10. Production handoff

The fastest path for the next team:

1. **Run it** to understand it: `npm install && npm run dev` → http://localhost:3000 (demo logins on the login screen). Read [GUIDE.md](GUIDE.md).
2. **Stand up Postgres** and flip to it (§11) — one env var.
3. **Wire the integration seams** you need for go-live (§12).
4. **Deploy to AWS** (§13).
5. **Harden** (§14) and wire CI to the test suite (§15).

---

## 11. Database (Postgres)

Two backends implement one async interface (`src/server/data-store.ts`): `InMemoryStore` (default demo) and `DrizzleStore` (Postgres). `getStore()` uses Postgres when `DATABASE_URL` is set — **no code change**.

```bash
export DATABASE_URL="postgres://user:pass@host:5432/aithreus"
npm run db:push     # create tables from the Drizzle schema (or db:generate + drizzle-kit migrate)
npm run db:seed     # load demo data (same dataset as the in-memory store)
npm run dev         # app now reads/writes Postgres
npm run db:verify   # (no server needed) runs the real DrizzleStore on embedded Postgres — 10 assertions
```
Production notes: use a pooled connection (RDS Proxy / PgBouncer / Neon pooled) for serverless; add FKs + indexes (`config_id`, `site_id`, `events.ts`) before scale; prefer migrations over `db:push`. Full detail: [docs/engineering/DATABASE.md](docs/engineering/DATABASE.md).

---

## 12. Integration seams

Each seam is isolated; file pointers below. Full version: [docs/engineering/INTEGRATION.md](docs/engineering/INTEGRATION.md).

| # | Seam | Now | Wire to | Files |
|---|---|---|---|---|
| 1 | **Auth / SSO** | `jose` cookie + seeded users | Auth.js (NextAuth v5) or Clerk; map IdP groups → roles + `clientId` | `src/lib/auth.ts`, `src/server/session.ts`, `src/server/actions/auth.ts`, `src/middleware.ts` |
| 2 | **Plugin registry sync** | operators from seed | importer that upserts from your API-key registry | `src/server/seed-content.ts` → new importer using `DataStore` |
| 3 | **Conversions (S2S postback)** | `/api/embed/postback` appends a conversion (stub) | per-operator signature/secret validation + dedup + real value | `src/app/api/embed/postback/route.ts` |
| 4 | **In-widget market data** | sample data | live feed (fetch in `embed.js` or include in config) — CTA layer already real | `widget/src/embed.ts`, `WidgetType.sampleDataJson` |
| 5 | **Analytics at scale** | events in store + JS rollups | ClickHouse (`CLICKHOUSE_URL`) + dashboard rollups | `src/server/analytics.ts` |
| 6 | **Config caching** | `no-store` (always fresh) | short `s-maxage` + `revalidateTag('config:'+id)` on publish + CDN | config route + `src/server/actions/publish.ts` |
| 7 | **Widget CDN** | served from `/public` | S3 + CloudFront; set `NEXT_PUBLIC_WIDGET_CDN_URL` | `widget/build.mjs`, env |
| 8 | **Status / telemetry** | seeded `StatusFeed` | Prometheus-style metrics (read-only) | `StatusFeed` + `/status` |

---

## 13. AWS deployment

Target: **eu-west-1 (Dublin)** — Next.js on **Amplify Hosting** (SSR), **RDS Postgres**, `embed.js` on **S3 + CloudFront**. Full version: [docs/engineering/DEPLOYMENT.md](docs/engineering/DEPLOYMENT.md).

### Environment variables
| Var | Purpose |
|---|---|
| `DATABASE_URL` | RDS/pooled Postgres. Presence switches the app to Drizzle. |
| `AUTH_SECRET` | Signs the session JWT (`openssl rand -base64 32`). **Required.** |
| `NEXT_PUBLIC_APP_URL` | Public app origin. |
| `NEXT_PUBLIC_WIDGET_CDN_URL` | Absolute URL of `embed.js` (CloudFront). |
| `CONFIG_CACHE_TTL_SECONDS` | Config cache TTL (when caching enabled). |
| `AWS_REGION` | `eu-west-1`. |
| `CLICKHOUSE_URL` | Optional analytics sink. |

### App — Amplify Hosting
1. Connect the GitHub repo (`main`); Next.js auto-detected.
2. Build = `npm run build` (its `prebuild` builds the widget bundle first); Amplify serves SSR.
3. Set the env vars (incl. `DATABASE_URL`, `AUTH_SECRET`).
4. `pg` is already marked external (`serverExternalPackages: ["pg"]` in `next.config.mjs`).
5. *Alternative for private-VPC RDS:* deploy the same app to **ECS Fargate** (containerized `npm start`) in the VPC.

### Database — RDS Postgres
1. Provision RDS Postgres / Aurora Serverless v2 in eu-west-1; use a pooled endpoint for serverless.
2. With `DATABASE_URL` set (one-off task/CI): `npm run db:push` then optionally `npm run db:seed`.

### Widget CDN — S3 + CloudFront
1. `npm run build:widget` → `public/widget/v1/embed.js`.
2. Upload to S3; front with CloudFront (e.g. `https://cdn.aithreus.com/widget/v1/embed.js`); set `NEXT_PUBLIC_WIDGET_CDN_URL`.
3. Invalidate CloudFront on widget releases.

---

## 14. Security hardening

- [ ] Replace dev auth with real IdP/SSO; remove seeded demo logins; set a strong `AUTH_SECRET` (seam §12.1).
- [ ] `DATABASE_URL` set; migrations applied; `/api/dev/reset-store` stays disabled in prod (already no-ops).
- [ ] Lock CORS on `/api/embed/*` to client domains if you don't want fully-open embeds (currently `*`).
- [ ] Add rate-limiting/bot-filtering on `/r/*` and `/api/embed/*`.
- [ ] Validate operator postback signatures (seam §12.3).
- [ ] Add FKs/indexes + analytics retention (§11).
- [ ] Confirm `internalOnly` filtering in any new read paths (`src/server/visibility.ts`).

---

## 15. Testing & verification

```bash
npm run typecheck   # tsc --noEmit
npm run build       # production build (also builds the widget)
npm run test:e2e    # Playwright — 25 tests across all phases (incl. the §9.14 no-redeploy loop)
npm run db:verify   # DrizzleStore on embedded Postgres — 10 assertions
```
Tests live in `tests/e2e/`. The §9.14 loop and the §4.9 draft-site gate are covered. Wire these into CI (GitHub Actions) before merging changes.

---

## 16. Repository & branches

- **Repo:** `github.com/VictorSquidWei/aithreus-cms`.
- **`main`** is the complete, deployable project (fast-forwarded to the final commit). Clone/pull `main`.
- The `phase/01…phase/07-*` branches are the historical build checkpoints (system specs → app shell → Link CMS → runtime → presentation/content → Postgres/polish), all ancestors of `main`.
- The spec tree (`specs/INDEX.md`) is the per-feature source of truth, each traced to the original design documents.

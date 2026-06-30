# Aithreus Unified CMS

One unified Aithreus web property: a **gated B2B product-marketing site** (Layer A) + the flagship affiliate **Link CMS** admin app (Layer B2) + a **content control panel** (Layer B1) + a **real embeddable widget runtime** (`embed.js`). Built full-stack functional — the headline loop is real: **edit/toggle an operator link in the CMS → Publish → the widget on a client page updates with no re-embed and no redeploy.**

> **This project is spec-driven.** The single source of truth is [`/specs`](specs/INDEX.md). No implementation lands without a governing, approved spec. Read [`specs/INDEX.md`](specs/INDEX.md) first.

## ▶ Want to see it?

- **Live demo:** **https://aithreus-cms.vercel.app** — log in with `client@dimers.com` / `client123` (Vercel SSR; see [DEPLOYMENT.md](docs/engineering/DEPLOYMENT.md) for the in-memory-store caveat).
- **Run locally:** `npm install && npm run dev`, open **http://localhost:3000**, log in with `client@dimers.com` / `client123`.
- **[HANDOFF.md](HANDOFF.md)** — comprehensive functionality (per vertical) + production/AWS handoff (the master reference).
- **[GUIDE.md](GUIDE.md)** — what it is, how to navigate, how the demo works (start here).
- **[DEMO.md](DEMO.md)** — a 10-minute click-by-click walkthrough script.
- **[docs/engineering/](docs/engineering/README.md)** — endpoints, database, integration seams, deployment (for the engineering team).

The app is fully populated with demo data on every start (no database required).

## Status

**All phases complete (1–7).** System specs; app shell + auth + product switch; the full **Link CMS** (operators, sites, edit-links/resolution, embed, gallery, performance, publish); the **embeddable widget runtime** + `/demo/client-site` (the §9.14 no-redeploy loop); the **presentation layer**; the **content panel + audit log**; and the **Postgres/Drizzle persistence layer** (behind the async repository interface — set `DATABASE_URL` to switch from the in-memory demo store; runtime-verified via `npm run db:verify`). Acceptance criteria §9.1–§9.15 covered. See [`specs/INDEX.md`](specs/INDEX.md).

## Database

Runs on an in-memory store by default (zero setup). Set `DATABASE_URL` to use Postgres via Drizzle — no code changes. See **[docs/engineering/DATABASE.md](docs/engineering/DATABASE.md)**.

## Stack (see [`specs/00-product/01-architecture.md`](specs/00-product/01-architecture.md))

- **Next.js 15 (App Router) + TypeScript**, Tailwind + shadcn/ui
- **Auth.js** (credentials, 3 roles: `superadmin` / `internal_editor` / `affiliate_client`)
- **Data layer:** repository interface, **in-memory store now**, **AWS RDS Postgres + Drizzle later** (Postgres deferred until the frontend prototype is done)
- **Widget runtime:** framework-free IIFE built with esbuild, served at `/widget/v1/embed.js`
- **Hosting:** AWS eu-west-1 (Amplify Hosting + RDS + S3/CloudFront)
- **QA:** Playwright at 1280px + 375px (drives the end-to-end loop)

## Getting started (no database required)

```bash
npm install
cp .env.example .env        # set AUTH_SECRET (openssl rand -base64 32)
npm run dev                 # builds the widget, seeds the in-memory store, starts Next on :3000
```

The app runs entirely on the in-memory store while `DATABASE_URL` is unset. Wiring Postgres is Phase 7.

### Dev login credentials (seeded; dev only)

| Role | Email | Password |
|---|---|---|
| superadmin | `super@aithreus.internal` | _(see seed constants / README on first run)_ |
| internal_editor | `editor@aithreus.internal` | _(see seed constants)_ |
| affiliate_client | `client@dimers.com` | _(see seed constants)_ |

## Scripts

| Script | Does |
|---|---|
| `npm run dev` | Build widget → seed → Next dev server |
| `npm run build` | Build widget → Next production build |
| `npm start` | Start the production server |
| `npm run build:widget` | Compile `widget/src/embed.ts` → `public/widget/v1/embed.js` (esbuild) |
| `npm run seed` | (Re)seed the active store |
| `npm run test:e2e` | Playwright E2E incl. the §9.14 no-redeploy loop |

## Deploy (AWS eu-west-1)

- Next app → **Amplify Hosting** (SSR). `embed.js` → **S3 + CloudFront** (`cdn.aithreus.com`). DB → **RDS Postgres** (Phase 7).
- Set `AUTH_SECRET` (and later `DATABASE_URL`) as environment variables. Keep `main` deployable.

## Project layout

```
specs/      the source of truth (read INDEX.md)
src/app/    routes: (marketing) · admin · demo · api · r
src/server/ store interface + in-memory impl · resolution · visibility
widget/     framework-free embed.js source + esbuild step
seed/       fixtures + seed script
tests/e2e/  Playwright
```

## Source documents

The build is governed by three documents (precedence on conflict: **Report → Handoff → CMS-2**). See [`docs/source/`](docs/source/README.md).

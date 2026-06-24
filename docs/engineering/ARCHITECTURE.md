# Architecture & code map

One Next.js app delivers three things: a gated marketing/product site (Layer A), the affiliate Link CMS admin (Layer B), and an embeddable widget runtime that client sites load.

## Layers
```
Browser ─▶ Next.js app (AWS Amplify, eu-west-1)
            ├─ (marketing)/        public landing + portfolio
            ├─ (gated)/            product pages, platform, integrations, status, docs   [Layer A]
            ├─ admin/              Link CMS + content panel + audit                       [Layer B]
            ├─ api/embed/*, r/*    runtime endpoints (config, redirect, events)
            └─ DataStore ──▶ InMemoryStore (default) | DrizzleStore (Postgres, DATABASE_URL)

Client's own site ─▶ <script src=".../widget/v1/embed.js"> ─▶ GET /api/embed/config/:configId
                                                            └▶ CTA click ─▶ GET /r/... ─▶ 302 to affiliate URL
```

## Where everything lives
| Concern | Path |
|---|---|
| Routes / pages | `src/app/**` (route groups: `(marketing)`, `(gated)`, `admin`, `demo`) |
| HTTP endpoints | `src/app/api/embed/*`, `src/app/r/[configId]/[wid]/[operatorId]`, `src/app/api/dev/*` |
| **Repository interface** | `src/server/data-store.ts` (the async contract both stores implement) |
| In-memory store (default) | `src/server/store.ts` (also the `getStore()` factory) |
| **Postgres store (Drizzle)** | `src/server/store-drizzle.ts` |
| Drizzle schema | `src/db/schema.ts` · migrations in `drizzle/` |
| Seed data | `src/server/seed-data.ts` (core), `src/server/seed-content.ts` (products/docs/etc.) |
| Link-resolution algorithm | `src/server/resolution.ts` (pure functions) |
| Visibility / RBAC filters | `src/server/visibility.ts` |
| Auth (session) | `src/lib/auth.ts` (jose), `src/server/session.ts`, `src/middleware.ts` (route guards) |
| Server actions (writes) | `src/server/actions/{auth,operators,sites,overrides,publish,content}.ts` |
| Analytics rollups | `src/server/analytics.ts` |
| Widget runtime source | `widget/src/embed.ts` → built by `widget/build.mjs` → `public/widget/v1/embed.js` |
| React components | `src/components/**` (`ui/`, `link-cms/`, `presentation/`, `admin-content/`) |
| Design tokens | `src/app/globals.css` + `tailwind.config.ts` |
| Specs (source of truth) | `specs/INDEX.md` |

## Request → data flow
1. A page/server-action calls `getStore()` and `await`s the async repository methods.
2. `getStore()` returns `DrizzleStore` if `DATABASE_URL` is set, else `InMemoryStore`.
3. Admin edits write to working tables; **Publish** (`src/server/actions/publish.ts`) computes a resolved snapshot (`buildPublishedSnapshot`) and writes a `PublishedConfig` row + redirect `targets`.
4. The config endpoint serves the latest `PublishedConfig.payload`; `embed.js` renders CTAs whose `href` is `/r/...`; the redirect logs a click event and 302s to the resolved affiliate URL.

## Key invariants
- The UI **only** depends on `DataStore` (the interface) — never on a concrete store. Swapping persistence is a factory change.
- Raw affiliate URLs are **never** sent to the client; only tracking-redirect hrefs are. The redirect resolves the real URL server-side from `PublishedConfig.targets`.
- `internalOnly` operators/modules and inactive operators are filtered server-side (`visibility.ts`) and never reach widgets/public pages.

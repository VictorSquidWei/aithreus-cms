# Integration seams — making it fully functional

The prototype is full-stack functional with documented stubs where a real external system belongs. Each seam below is small and isolated. Wire them to go fully live.

## 1. Auth / identity → real IdP or SSO
- **Now:** credentials login with seeded users; signed-JWT cookie via `jose`.
- **Files:** `src/lib/auth.ts` (sign/verify), `src/server/session.ts` (read session), `src/server/actions/auth.ts` (login/logout), `src/middleware.ts` (guards), users in seed.
- **Wire:** replace `loginAction` + session issuance with Auth.js (NextAuth v5) or Clerk; map IdP groups → roles (`superadmin` / `internal_editor` / `affiliate_client`) and `clientId`. Keep `getViewer()`/`getSession()` shape so the rest of the app is untouched. Add password reset, MFA, lockout.

## 2. Operator catalog ← API-key registry sync
- **Now:** operators come from the seed (`src/server/seed-content.ts` / `seed-data.ts`).
- **Wire:** add an importer that pulls from your API-key registry and upserts via `DataStore.createOperator/updateOperator`. Map registry fields → `Operator` (name, brandColor, affiliateUrl, category, authType, integrationStatus, `internalOnly`). Run on a schedule or webhook. (Report §4.7.)

## 3. Conversions ← operator postbacks (S2S)
- **Now:** `POST /api/embed/postback` appends a conversion event (stub); conversions are also simulated in the seed.
- **File:** `src/app/api/embed/postback/route.ts`.
- **Wire:** per operator, validate the postback (shared secret / signature / IP allowlist), dedupe by click id, capture real `value`/currency, then append the conversion event. Pass a click id through the redirect (`/r/...`) to attribute.

## 4. In-widget data ← real market/odds feeds
- **Now:** widgets render `WidgetType.sampleDataJson` (representative data).
- **Files:** `widget/src/embed.ts` (renderer), `WidgetType.sampleDataJson` (seed). The **CTA layer is already real** (data-driven from the published config); only the data-viz uses samples.
- **Wire:** have `embed.js` fetch live data from your feed/API per widget type, or include data in the config payload. Keep the CTA rendering as-is.

## 5. Analytics at scale → ClickHouse (or rollups)
- **Now:** events in the same store; dashboard reads JS rollups (`src/server/analytics.ts`).
- **Wire:** dual-write click/impression/conversion events to ClickHouse (env `CLICKHOUSE_URL`) and point the Performance dashboard rollups at it. Until then, add Postgres indexes + a materialized rollup. (Report §3.1.)

## 6. Config caching / invalidation
- **Now:** config endpoint is `no-store` (always fresh — guarantees the no-redeploy loop).
- **Files:** `src/app/api/embed/config/[configId]/route.ts`, publish in `src/server/actions/publish.ts`.
- **Wire:** switch to short `s-maxage` + `revalidateTag('config:'+configId)` on publish, and front with a CDN. The publish action already isolates the invalidation point.

## 7. Widget CDN
- **Now:** `embed.js` served from `/public/widget/v1/` (same origin).
- **Wire:** upload to S3 + CloudFront on build; set `NEXT_PUBLIC_WIDGET_CDN_URL=https://cdn.…/widget/v1/embed.js`. Add SRI + a versioned path strategy.

## 8. Status / telemetry → Prometheus
- **Now:** `/status` reads seeded `StatusFeed` rows + a static 9-component health bar.
- **Wire:** populate `StatusFeed` from your Prometheus-style metrics endpoints (read-only). (Handoff §4.)

## Out of scope (intentionally) — see specs/00-product/00-overview §8
Pricing, live bot/trade control, TT-Bot venue/anti-detection handling, full custom branding, page-level overrides, multi-user RBAC beyond 3 roles, A/B testing, scheduled changes, bulk import/export. The data model leaves seams for these (`specs/00-product/02-data-model §6`).

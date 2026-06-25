# Codebase audit

**Date:** 2026-06-24 · **Scope:** entire codebase reviewed against the project purpose (the three source docs + acceptance criteria Report §9).

## Method
- Reviewed the security-sensitive boundaries: the link-resolution algorithm, visibility/RBAC filters (§4.9), the runtime endpoints (config / redirect / event / postback), and the auth guards.
- Checked **store parity** — that `InMemoryStore` and `DrizzleStore` behave identically (shared seed, pure resolution, shared visibility).
- Static scan: no `console.*`, `TODO`, `as any`, or `@ts-ignore` in app source.
- `tsc --noEmit` clean · `npm run build` clean · `npm run test:e2e` 24/24 · `npm run db:verify` 10/10.

## Findings & fixes
1. **[Security · fixed] Draft sites could leak into live widget config.** `GET /api/embed/config/:configId` returned any published snapshot without checking site status. `publishAll` publishes all of a client's sites in the active vertical, including `draft` ones — so a draft site could be served live, violating §4.9 rule 3. **Fix:** the config endpoint now requires `site.status === "live"`; a regression test (`tests/e2e/phase4.spec.ts`) publishes the draft VNX site and asserts its config is still `404`.
2. **[Quality · fixed] `store-drizzle.ts` indirection.** Used inline `import("@/lib/types").X` type references and dynamic `import()` for the visibility helpers. **Fix:** consolidated to static top-level imports.

## Verified correct (no change needed)
- **Resolution algorithm:** active kill-switch → CUSTOM override → INHERITED default; single-CTA = first active operator, multi-CTA = all active; data-driven from the operator list (`src/server/resolution.ts`, pure).
- **No raw URL exposure:** the config payload and client never see affiliate URLs; only `/r/...` tracking hrefs. The redirect resolves the real URL server-side from `PublishedConfig.targets`.
- **Visibility:** `internalOnly` + inactive operators filtered server-side; `affiliate_client` scoped to its own `clientId`; enforced centrally in `src/server/visibility.ts` and re-checked in every server action.
- **Auth:** middleware guards + action-level re-checks; internal-only areas (`/admin/content`, `/admin/audit`) 403 for clients.
- **The §9.14 loop** holds (config served `no-store`; Publish writes a fresh snapshot).
- **Store parity:** Drizzle path runtime-verified on PGlite (`db:verify`).

## Known, intentional simplifications (documented seams — not defects)
- **Performance breakdown** is per-operator aggregated across widgets, not per-operator-within-each-widget (Report §5.6 finer granularity). High-level §9.9 ask is met.
- **UI font** is the system stack; Inter self-hosting is a polish item (`specs/00-product/05-design-system §4`).
- **Seed** lives in `src/server/seed-*.ts` (the architecture sketch shows a top-level `/seed`).
- **Production seams** (real auth/IdP, operator conversion postbacks, live market-data feeds, ClickHouse analytics, config caching, widget CDN, telemetry) are stubbed and documented in [INTEGRATION.md](INTEGRATION.md).

## Result
Acceptance criteria §9.1–§9.15 covered. Build clean; 24/24 E2E; Drizzle 10/10. One real security gap found and fixed; two quality cleanups applied.

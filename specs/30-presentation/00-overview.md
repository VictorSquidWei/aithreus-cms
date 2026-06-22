# 30 — Presentation layer (overview)

| | |
|---|---|
| **Spec ID** | `30-presentation/00-overview` |
| **Status** | implemented |
| **Traces to** | Report §7 (Layer A); Handoff §3–§7 |

## 1. Purpose & scope
Layer A — the gated B2B presentation site that renders **products as CMS content** (Handoff §3). Public shell = marketing landing + portfolio; everything else gates behind auth and is shown in a gated chrome (`GatedTopNav`).

## 2. Routes & owners
| Route | Access | Owner |
|---|---|---|
| `/` | public | `01-marketing-landing` |
| `/portfolio` | public | `02-portfolio-matrix` |
| `/products/[slug]` | gated | `03-product-pages` |
| `/platform` | gated | `04-platform` |
| `/integrations` | gated | `05-integrations` |
| `/status` | gated | `06-status` |
| `/docs`, `/docs/[slug]` | gated | `07-docs` |

## 3. Cross-cutting
- **Gated chrome:** `(gated)` route group + `GatedTopNav` (Portfolio · Platform · Integrations · Status · Docs · "Link CMS" → /admin · theme · sign out). Middleware redirects unauthenticated users to `/login`.
- **Operator ≡ Integration:** `/integrations` and product pages read the `Operator` table as integrations; `internalOnly` filtered for `affiliate_client` (§4.9).
- **Execution posture** is first-class on every product surface (Handoff §2): terminals = "Read-only · no funds/keys"; bots = "Executes autonomously".
- Content comes from the store (Products/Modules/Strategies/Changelog/StatusFeed/Pages), editable in the content panel (`40-admin-content`).

## 4. Acceptance (Report §9.1 public shell + Layer-A coverage)
1. Public sees only `/`, `/portfolio` (+ login/runtime/demo); all presentation detail gates.
2. Product pages render hero + posture + modules + integrations + status + changelog from CMS content.
3. `internalOnly` modules/operators hidden from `affiliate_client`.
4. Integrations grid reads `Operator`; platform/status/docs render from content.

## 5. Components (Report §8.2)
ProductCard, ModuleCard, IntegrationGrid/OperatorBadge, ExecutionPostureBadge, CalibrationStat, HealthIndicatorBar, StatusPill, ChangelogTimeline, RichContentBlock, GatedTopNav.

## 6. Non-goals
Public product detail (gated); SEO/marketing depth beyond the landing; real telemetry feeds (seeded StatusFeed).

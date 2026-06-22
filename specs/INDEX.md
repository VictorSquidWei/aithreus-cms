# Aithreus Unified CMS — Specification Index

**Living table of contents for all specs.** This file is the single navigational source of truth for the spec-driven build. Every spec is written **top-down, biggest-to-smallest**; no implementation code is written for a capability until its governing spec is **approved**.

- **Methodology:** spec-first. We change the spec before we change the code. Every implementation commit references its spec path; any behavior change updates the spec in the same commit.
- **Authoritative source docs:** `Aithreus_Unified_CMS_Build_Report.md` (the **report** — wins on conflict), `Aithreus_Product_Website_Handoff.md` (the **Handoff**), `CMS-2.pdf` (**CMS-2**). Citations below use `Report §`, `Handoff §`, `CMS-2 §`.

### Status legend
| Status | Meaning |
|---|---|
| `planned` | Filename reserved; not yet drafted. |
| `draft` | Written, awaiting owner approval. |
| `approved` | Owner-approved; cleared for implementation. |
| `implemented` | Code merged and QA-passed against the spec's acceptance criteria. |

---

## Phase 1 — System specs (`/specs/00-product/`) — *highest altitude*

| Spec | Title | Status | Traces to |
|---|---|---|---|
| [00-product/00-overview.md](00-product/00-overview.md) | Unified product overview, glossary, Operator≡Integration | **approved** | Report §0–§2; Handoff §1–§2; CMS-2 §1 |
| [00-product/01-architecture.md](00-product/01-architecture.md) | Stack, app topology, repo layout, env/secrets, deploy | **approved** | Report §3; Handoff §8 |
| [00-product/02-data-model.md](00-product/02-data-model.md) | Full schema: tables, fields, relations, visibility rules | **approved** | Report §4; Handoff §6; CMS-2 §6 |
| [00-product/03-auth-and-roles.md](00-product/03-auth-and-roles.md) | Roles, sessions, route guards, visibility filtering | **approved** | Report §4.1, §4.9; Handoff §11 |
| [00-product/04-information-architecture.md](00-product/04-information-architecture.md) | Site map / routes / navigation | **approved** | Report §7; Handoff §7 |
| [00-product/05-design-system.md](00-product/05-design-system.md) | Tokens, typography, density, component inventory | **approved** | Report §8; Handoff §9 |

## Phase 3 — Link CMS, the flagship (`/specs/10-link-cms/`)

| Spec | Title | Status | Traces to |
|---|---|---|---|
| [10-link-cms/00-overview.md](10-link-cms/00-overview.md) | Link CMS area overview: product switch, auto-save, cross-cutting | **approved** | Report §5; CMS-2 §4–§7 |
| [10-link-cms/01-welcome-setup.md](10-link-cms/01-welcome-setup.md) | Welcome / guided 4-step setup | planned | Report §5.0; CMS-2 §4 |
| [10-link-cms/02-operators.md](10-link-cms/02-operators.md) | Step 1 — Operators (CRUD + active kill-switch) | planned | Report §5.1; CMS-2 §4 (Step 1), §7 |
| [10-link-cms/03-sites.md](10-link-cms/03-sites.md) | Step 2 — Sites (CRUD + configId + live counts) | planned | Report §5.2; CMS-2 §4 (Step 2) |
| [10-link-cms/04-edit-links.md](10-link-cms/04-edit-links.md) | Step 3 — Edit links + **resolution algorithm** | planned | Report §5.3, §4.6; CMS-2 §2–§3, §4 (Step 3) |
| [10-link-cms/05-embed-code.md](10-link-cms/05-embed-code.md) | Step 4 — Embed code (per-site config, per-widget snippet) | planned | Report §5.4; CMS-2 §4 (Step 4) |
| [10-link-cms/06-widget-gallery.md](10-link-cms/06-widget-gallery.md) | Widget Gallery (preview + grab embed) | planned | Report §5.5; CMS-2 §5 |
| [10-link-cms/07-performance.md](10-link-cms/07-performance.md) | Performance dashboard (views/clicks/CTR/conv/rev) | planned | Report §5.6; CMS-2 §5 |
| [10-link-cms/08-publish-workflow.md](10-link-cms/08-publish-workflow.md) | Auto-save + "Publish to live widgets" + cache bust | planned | Report §5.7; CMS-2 §7 |

## Phase 4 — Runtime trio + demo (`/specs/20-runtime/`) — *the headline proof*

| Spec | Title | Status | Traces to |
|---|---|---|---|
| [20-runtime/00-overview.md](20-runtime/00-overview.md) | Runtime overview: the no-redeploy loop, three artifacts | planned | Report §6 |
| [20-runtime/01-config-endpoint.md](20-runtime/01-config-endpoint.md) | `GET /api/embed/config/:configId` (resolved, active-only) | planned | Report §6.1 |
| [20-runtime/02-redirect-tracking.md](20-runtime/02-redirect-tracking.md) | `/r/:configId/:wid/:opId` redirect + events + postback | planned | Report §6.3 |
| [20-runtime/03-embed-widget.md](20-runtime/03-embed-widget.md) | Framework-free `embed.js` + snippet | planned | Report §6.2, §6.4 |
| [20-runtime/04-demo-client-site.md](20-runtime/04-demo-client-site.md) | `/demo/client-site` proving §9.14 loop | planned | Report §6.4, §9.14 |

## Phase 5 — Presentation layer (`/specs/30-presentation/`) — *Layer A*

| Spec | Title | Status | Traces to |
|---|---|---|---|
| [30-presentation/00-overview.md](30-presentation/00-overview.md) | Presentation area overview (gated B2B + public shell) | planned | Report §7; Handoff §7 |
| [30-presentation/01-marketing-landing.md](30-presentation/01-marketing-landing.md) | Public marketing landing | planned | Report §7; Handoff §7 |
| [30-presentation/02-portfolio-matrix.md](30-presentation/02-portfolio-matrix.md) | 2×2 product matrix | planned | Handoff §2; Report §7 |
| [30-presentation/03-product-pages.md](30-presentation/03-product-pages.md) | Product detail pages (4 products) | planned | Handoff §3; Report §4.8 |
| [30-presentation/04-platform.md](30-presentation/04-platform.md) | Shared signal-and-calibration platform page | planned | Handoff §4 |
| [30-presentation/05-integrations.md](30-presentation/05-integrations.md) | Global integrations grid (reads Operator) | planned | Handoff §5; Report §4.3 |
| [30-presentation/06-status.md](30-presentation/06-status.md) | Read-only StatusFeed / health | planned | Handoff §3.3, §4; Report §4.8 |
| [30-presentation/07-docs.md](30-presentation/07-docs.md) | CMS-managed docs/pages | planned | Handoff §7; Report §4.8 (Page) |

## Phase 6 — Content control panel + audit (`/specs/40-admin-content/`) — *Layer B1*

| Spec | Title | Status | Traces to |
|---|---|---|---|
| [40-admin-content/00-overview.md](40-admin-content/00-overview.md) | Content control panel area overview | planned | Report §7; Handoff §7 |
| [40-admin-content/01-content-control-panel.md](40-admin-content/01-content-control-panel.md) | Edit Products/Modules/Strategies/Pages/Changelog | planned | Handoff §7; Report §4.8 |
| [40-admin-content/02-audit-log.md](40-admin-content/02-audit-log.md) | Audit log of publishes/edits | planned | Report §7 (`/admin/audit`) |

## Cross-cutting — Components (`/specs/components/`) — *written just-in-time before each is built*

> One spec per reusable component (Report §8.2). These are lightweight and authored in the phase that first needs them (mostly Phase 2–3), **not** all in Phase 1. Trivially-related components may be grouped to reduce overhead (owner's call).

| Spec | Component(s) | Status | Traces to |
|---|---|---|---|
| [components/00-overview.md](components/00-overview.md) | Conventions: props, `data-testid`, shared states | **approved** | Report §8.2–§8.3 |
| [components/app-shell.md](components/app-shell.md) | AppShell / Sidebar / TopBar | **implemented** | Report §8.3 |
| [components/theme-toggle.md](components/theme-toggle.md) | ThemeToggle (dark-first) | **implemented** | Report §8.3 |
| [components/product-switch.md](components/product-switch.md) | ProductSwitch (TT\|VNX) | **implemented** | Report §8.2; CMS-2 §1 |
| [components/logo.md](components/logo.md) | Aithreus SVG mark + favicon | **implemented** | Report §8.4 |
| [components/portfolio-matrix.md](components/portfolio-matrix.md) | PortfolioMatrix (2×2) | planned | Report §8.2; Handoff §2 |
| [components/product-card.md](components/product-card.md) | ProductCard | planned | Report §8.2; Handoff §9 |
| [components/module-card.md](components/module-card.md) | ModuleCard | planned | Report §8.2; Handoff §9 |
| [components/integration-grid.md](components/integration-grid.md) | IntegrationGrid + OperatorBadge | planned | Report §8.2; Handoff §9 |
| [components/execution-posture-badge.md](components/execution-posture-badge.md) | ExecutionPostureBadge | planned | Report §8.2; Handoff §9 |
| [components/calibration-stat.md](components/calibration-stat.md) | CalibrationStat (Brier/ECE/CLV) | planned | Report §8.2; Handoff §9 |
| [components/health-indicator-bar.md](components/health-indicator-bar.md) | HealthIndicatorBar (9-component) | planned | Report §8.2; Handoff §9, §3.3 |
| [components/status-pill.md](components/status-pill.md) | StatusPill | planned | Report §8.2 |
| [components/changelog-timeline.md](components/changelog-timeline.md) | ChangelogTimeline | planned | Report §8.2 |
| [components/rich-content-block.md](components/rich-content-block.md) | RichContentBlock | planned | Report §8.2 |
| [components/admin-table.md](components/admin-table.md) | AdminTable (sort/filter/export) | planned | Report §8.2 |
| [components/feature-flag-toggle.md](components/feature-flag-toggle.md) | FeatureFlagToggle | planned | Report §8.2 |
| [components/publish-bar.md](components/publish-bar.md) | PublishBar (diff summary) | planned | Report §8.2; Report §5.7 |
| [components/operator-form.md](components/operator-form.md) | OperatorForm | planned | Report §8.2; Report §5.1 |
| [components/active-toggle.md](components/active-toggle.md) | ActiveToggle (kill switch) | planned | Report §8.2; CMS-2 §3 |
| [components/site-card.md](components/site-card.md) | SiteCard (with counts) | planned | Report §8.2; Report §5.2 |
| [components/link-state-badge.md](components/link-state-badge.md) | LinkStateBadge (INHERITED/CUSTOM) | planned | Report §8.2; CMS-2 §4 (Step 3) |
| [components/override-row.md](components/override-row.md) | OverrideRow (URL input + reset) | planned | Report §8.2; Report §5.3 |
| [components/embed-snippet-box.md](components/embed-snippet-box.md) | EmbedSnippetBox (copy) | planned | Report §8.2; Report §5.4 |
| [components/widget-preview-frame.md](components/widget-preview-frame.md) | WidgetPreviewFrame | planned | Report §8.2; Report §5.5 |
| [components/step-progress.md](components/step-progress.md) | StepProgress (4-step) | planned | Report §8.2; Report §5.0 |
| [components/kpi-card.md](components/kpi-card.md) | KpiCard | planned | Report §8.2; Report §5.6 |
| [components/time-series-chart.md](components/time-series-chart.md) | TimeSeriesChart + Sparkline | planned | Report §8.2; Report §5.6 |
| [components/breakdown-table.md](components/breakdown-table.md) | BreakdownTable | planned | Report §8.2; Report §5.6 |
| [components/ui-states.md](components/ui-states.md) | Skeleton / empty / error / toast patterns | planned | Report §8.3 |

---

## Phase → spec → acceptance-criteria traceability

The build order follows **Report §10**. Each phase is gated: write spec(s) → approval → implement → Playwright QA (1280px + 375px) → commit.

| Build phase (Report §10) | Spec area | Satisfies acceptance criteria (Report §9) |
|---|---|---|
| 1. System specs + scaffold/schema/seed | `00-product/*` | foundation for all |
| 2. Auth + shell + product switch | `00-product/03`, `components/app-shell`, `product-switch` | §9.1–§9.3 |
| 3. Link CMS screens | `10-link-cms/*` | §9.4–§9.10 |
| 4. Runtime trio + demo | `20-runtime/*` | §9.11–§9.14 |
| 5. Presentation layer | `30-presentation/*` | §9.1 (public shell) |
| 6. Content control panel + audit | `40-admin-content/*` | content-management coverage |
| 7. Polish + full QA | `05-design-system`, `components/ui-states` | §9.15 |

# 04 — Information Architecture

| | |
|---|---|
| **Spec ID** | `00-product/04-information-architecture` |
| **Status** | approved |
| **Altitude** | System |
| **Date** | 2026-06-21 |
| **Traces to** | Report §7 (supersedes Handoff §7 by merging the Link CMS) |

---

## 1. Purpose & scope

The canonical route map, navigation structure, and the product-switch scoping behavior. Each route names the spec that owns it. Guards are in `03-auth-and-roles`; visuals in `05-design-system`.

## 2. Route map (Report §7)

### Public (unauthenticated)
| Route | Purpose | Owning spec |
|---|---|---|
| `/` | Aithreus marketing landing (signal-and-calibration story; CTA to log in / request access) | `30-presentation/01-marketing-landing` |
| `/portfolio` | The 2×2 product matrix (VNX/TT × Terminal/Bot) | `30-presentation/02-portfolio-matrix` |
| `/login` | Credentials login | `03-auth-and-roles` |

### Authenticated app (gated B2B + internal)
| Route | Purpose | Owning spec |
|---|---|---|
| `/products/[slug]` | Product detail (vnx-terminal, vnx-bot, tt-terminal, tt-bot): what it does, modules, integrations grid, status, changelog | `30-presentation/03-product-pages` |
| `/platform` | Shared signal-and-calibration engine | `30-presentation/04-platform` |
| `/integrations` | Global integrations grid (reads `Operator`, internalOnly filtered) | `30-presentation/05-integrations` |
| `/status` | Read-only StatusFeed / health (9-component HealthIndicatorBar) | `30-presentation/06-status` |
| `/docs` | CMS-managed docs/pages | `30-presentation/07-docs` |

### Admin / Link CMS (`/admin`, role-gated) — with persistent **TT \| VNX product switch** in the top bar
| Route | Purpose | Owning spec |
|---|---|---|
| `/admin` | Dashboard: product status, recent changes, setup progress, headline KPIs | `10-link-cms/00-overview` |
| `/admin/setup` | Welcome / guided 4-step setup | `10-link-cms/01-welcome-setup` |
| `/admin/operators` | Step 1 — Operators | `10-link-cms/02-operators` |
| `/admin/sites` | Step 2 — Sites | `10-link-cms/03-sites` |
| `/admin/links` | Step 3 — Edit links | `10-link-cms/04-edit-links` |
| `/admin/embed` | Step 4 — Embed code | `10-link-cms/05-embed-code` |
| `/admin/gallery` | Widget Gallery | `10-link-cms/06-widget-gallery` |
| `/admin/performance` | Performance dashboard | `10-link-cms/07-performance` |
| `/admin/content` | Layer-B1 content panel (internal only) | `40-admin-content/01-content-control-panel` |
| `/admin/audit` | Audit log (internal only) | `40-admin-content/02-audit-log` |

### Runtime & demo
| Route | Purpose | Owning spec |
|---|---|---|
| `/api/embed/config/[configId]` | Config endpoint | `20-runtime/01-config-endpoint` |
| `/r/[configId]/[wid]/[operatorId]` | Click redirect | `20-runtime/02-redirect-tracking` |
| `/api/embed/event`, `/api/embed/postback` | Impression beacon / conversion stub | `20-runtime/02-redirect-tracking` |
| `/widget/v1/embed.js` | Built widget bundle (static) | `20-runtime/03-embed-widget` |
| `/demo/client-site` | Fake affiliate page using the real snippet (proves §9.14) | `20-runtime/04-demo-client-site` |

## 3. The product switch (TT \| VNX) — scoping behavior

- A **persistent control in the `/admin` top bar** (`components/product-switch`).
- Selecting a vertical scopes **every admin screen's data** by `verticalId`: operators, sites, widget catalog, widget instances, overrides, analytics (Report §4.2, §9.3).
- **Active vertical persists** across navigation and reload via a cookie (`aithreus_vertical`, default `TT`), reflected in a URL query (`?v=TT|VNX`) for shareable deep links. Cookie is the source of truth; URL param overrides on load.
- The **presentation layer** (`/products`, `/integrations`, etc.) is organized by vertical via its own content, independent of the admin switch.

## 4. Navigation structure

**Admin sidebar** (collapsible sections; `components/app-shell`):
```
[Aithreus logo]        [ TT | VNX switch ]   [theme] [user menu]
─ SETUP
   Dashboard            /admin
   Setup guide          /admin/setup
─ LINK CMS
   1 · Operators        /admin/operators
   2 · Sites            /admin/sites
   3 · Edit links       /admin/links
   4 · Embed code       /admin/embed
   Widget gallery       /admin/gallery
   Performance          /admin/performance
─ CONTENT            (internal roles only)
   Content panel        /admin/content
   Audit log            /admin/audit
[ PublishBar — sticky footer: "Publish to live widgets" + last-published ]
```

**Public/gated top nav:** Aithreus logo · Portfolio · Products (dropdown: 4) · Platform · Integrations · Status · Docs · [Log in / user menu].

## 5. Cross-route conventions

- **Breadcrumbs** in admin: `Vertical › Section › Screen`.
- **Deep links** carry `?v=` so a shared `/admin/links` link lands on the right vertical.
- **Step ordering** (Operators→Sites→Edit links→Embed) is numbered in nav to mirror the guided setup (CMS-2 §4).
- Route-group `(marketing)` for Layer A; `admin/` route segment for Layer B with its own layout (sidebar + product switch + publish bar).

## 6. UI states

- **Empty admin (new client):** dashboard + each step show meaningful empty states routing the user to "add your first operator/site" (Report §8.3). Setup-guide checkmarks derive from data presence.
- **Loading:** route-level skeletons (`components/ui-states`).
- **404:** in-app not-found with link home.

## 7. Acceptance criteria

1. Every route above resolves; guards behave per `03-auth-and-roles`.
2. The product switch re-scopes operators/widgets/sites/analytics across all admin screens (Report §9.3) and persists across reload.
3. Public users reach only `/`, `/portfolio`, `/login` (+ runtime/demo); everything else gates (Report §9.1).
4. Admin nav reflects role (content/audit hidden from `affiliate_client`).

## 8. Non-goals

Per-page (intra-site) routing inside the Link CMS (page-level overrides = Phase 2). Localized routes / i18n. Public product detail (gated).

## 9. Open questions

None blocking. Whether `/admin` landing differs by role (client vs internal) is handled in `10-link-cms/00-overview` (default: same dashboard, data-scoped).

## 10. Traceability

| Content | Source |
|---|---|
| Full site map | Report §7 |
| Product switch scoping | Report §4.2, §9.3; CMS-2 §1 |
| Merge of Link CMS into IA | Report §7 (supersedes Handoff §7) |
| Demo route for §9.14 | Report §6.4, §7 |

# 10 — Link CMS (overview)

| | |
|---|---|
| **Spec ID** | `10-link-cms/00-overview` |
| **Status** | approved |
| **Altitude** | Feature area (the flagship — Layer B2) |
| **Date** | 2026-06-21 |
| **Traces to** | Report §5; CMS-2 §2–§7 |

---

## 1. Purpose & scope
The flagship affiliate **Link CMS**: a self-serve tool where a client manages every affiliate link on every widget on every site **from one place, without touching code** (CMS-2 §1). This overview fixes the cross-cutting behavior shared by all Link-CMS screens; each screen has its own spec (`01`–`08`). It also owns the **`/admin` dashboard** route.

The 4-step flow (CMS-2 §4) + supporting surfaces:
`Welcome/Setup → 1 Operators → 2 Sites → 3 Edit links → 4 Embed` · **Widget Gallery** · **Performance** · **Publish**.

## 2. Cross-cutting behaviors (every Link-CMS screen obeys these)

1. **Product switch scoping.** Every screen reads the active vertical via `getActiveVertical()` (cookie, default TT) and shows only that vertical's data (`components/product-switch`, IA §3, Report §9.3).
2. **Client scoping & visibility.** Reads pass through `server/visibility.ts`: `affiliate_client` sees only its own `clientId`; `internalOnly` operators hidden from clients; inactive operators stay visible in admin but never in widgets/runtime (`02-data-model §5`).
3. **Auto-save working state.** Edits (operator fields, override URLs, toggles, site fields) persist **immediately** to the working tables via server actions, with a toast confirmation. There is **no separate "save" button** (CMS-2 §7).
4. **Working vs published.** Auto-save writes **working state**. The runtime serves only **published** snapshots. The explicit **"Publish to live widgets"** action (`08-publish-workflow`) promotes working→published and busts the runtime cache. Until Publish, widget changes are invisible to embedded sites. This is the safety mechanism behind the no-redeploy promise.
5. **Resolution algorithm.** The single most-specific-wins resolver (`04-edit-links §`, Report §4.6) is the canonical logic that turns operators + overrides into rendered CTAs; Embed, Gallery, Publish, and the runtime all consume it.
6. **Data-driven CTAs.** Operator-button rendering is driven by the operator list, never hardcoded per widget (CMS-2 §3 "implications for build"). Adding an active operator exposes CTA slots across every applicable multi-CTA widget with zero per-widget changes.

## 3. The `/admin` dashboard (owned here)
Implemented in Phase 2. Shows: headline KPIs (operators, active operators, sites, embedded widgets — all vertical+viewer scoped), **setup progress** (4 checkmarks derived from data presence), and a recent-activity panel (full audit feed arrives with `08`). Empty states route first-run clients to "add your first operator."

## 4. UI states (shared vocabulary, per `05-design-system §10`)
- **Loading:** table/card skeletons.
- **Empty:** guided CTA ("No operators yet — add your first affiliate deal").
- **Error:** inline message + retry; toast on failed save.
- **Success:** toast on save/publish; optimistic where safe, reconciled on server response.

## 5. Acceptance criteria → per-screen ownership (Report §9.4–§9.10)
| § | Criterion | Owning spec |
|---|---|---|
| §9.4 | Operator CRUD + active toggle removes/restores CTAs everywhere | `02-operators` (+ `08`, runtime) |
| §9.5 | Site CRUD + live pages/links/overrides counts + auto `configId` | `03-sites` |
| §9.6 | Edit-links INHERITED/CUSTOM, multi-CTA per-operator rows, reset | `04-edit-links` |
| §9.7 | Per-widget embed snippet with correct configId + widget id; copy | `05-embed-code` |
| §9.8 | Gallery preview with sample data **and** resolved operator config | `06-widget-gallery` |
| §9.9 | Performance: views/clicks/CTR/conv/rev, time-series + per-operator breakdown, filter, export | `07-performance` |
| §9.10 | Auto-save + Publish with diff summary | `08-publish-workflow` |

## 6. Non-goals (Report §11; CMS-2 §8)
Page-level overrides, Widget Builder, full custom branding, multi-user RBAC, A/B testing, scheduled changes, bulk import/export — Phase 2 (seams preserved, `02-data-model §6`).

## 7. Open questions
None blocking. Per-operator override granularity is validated-with-partners in CMS-2 §3 but built in v1 (Report confirms).

## 8. Traceability
Report §5 (all subsections); CMS-2 §2 (inheritance), §3 (multi-CTA/data-driven), §4 (4-step flow), §5 (supporting surfaces), §6 (data hierarchy), §7 (v1 scope incl. auto-save + Publish).

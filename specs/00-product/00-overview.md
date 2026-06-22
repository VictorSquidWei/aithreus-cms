# 00 — Unified Product Overview

| | |
|---|---|
| **Spec ID** | `00-product/00-overview` |
| **Status** | draft (awaiting approval) |
| **Altitude** | System (highest) |
| **Date** | 2026-06-21 |
| **Traces to** | Report §0, §1, §2, §12; Handoff §1, §2; CMS-2 §1 |

---

## 1. Purpose & scope

Define the single mental model for the whole property so every lower spec inherits one consistent vocabulary and one set of non-negotiable decisions. This spec does **not** define schema (see `02-data-model`), routes (`04-information-architecture`), or stack (`01-architecture`); it defines **what we are building and why the pieces are one product**.

We are building **one unified Aithreus web property** comprising **two integrated layers plus one runtime artifact**, on **one design system, one auth, one database** (Report §0):

```
AITHREUS  (one property · one design system · one auth · one DB)
│
├── LAYER A — Presentation site        (gated B2B marketing/portfolio; reads CMS content)
│
└── LAYER B — Authenticated admin app  (/admin)
      ├── B1. Content control panel     (edit Products, Modules, Strategies, Pages, Changelog, Status)
      └── B2. LINK CMS  ◀── FLAGSHIP    (operators · sites · edit-links · embed · gallery · performance)
              Product switch: TT | VNX
              resolves into ▼
                 RUNTIME ARTIFACT — embeddable widget script (embed.js)
                 loads published config at runtime · renders operator CTAs ·
                 links change from the CMS with NO re-embed / NO redeploy
```

**Build priority order** (Report §10): the **Link CMS (B2)** and the **runtime trio** are the commercial heart and are built **before** the marketing pages.

## 2. The conceptual bridge — Operator ≡ Integration (the unifying insight)

This is the single idea that makes the two source documents *one* product rather than two bolted-together apps (Report §1):

- The Handoff's **products** (VNX-Terminal, TT-Terminal, …) ship **widgets**.
- Those widgets are exactly the **embeddable widgets** the Link CMS manages.
- Each widget renders **operator CTAs** (Polymarket, Kalshi, sportsbooks…) — the same entities that appear as **integrations** in the Handoff's catalog (Handoff §5) and as **operators** in CMS-2.

> **Therefore "Integration" (Handoff) and "Operator" (CMS-2) are the same underlying entity, modeled once.** One `Operator` row, two readers:
> - the **Link CMS** reads `buttonLabel / brandColor / affiliateUrl / active`;
> - the **presentation site** reads `name / category / role / authType / integrationStatus` and renders it in an "Integrations" grid.
>
> Canonical table = `Operator` (see `02-data-model`). This is **authoritative** and must not be split into two tables.

## 3. Confirmed scope & build-depth decisions (non-negotiable — do not re-litigate)

Per Report §0:

1. **Scope = BOTH source documents, unified into one property.** Product-marketing site + Link CMS share one codebase, one design system, one auth, with a top-level **product switch (TT ↔ VNX)**.
2. **Backend depth = FULL-STACK FUNCTIONAL.** Real database, real auth, a working link-resolution API, and a working `embed.js` that loads config from a live endpoint and renders operator CTAs resolved through the inheritance chain — **changeable from the CMS without re-embedding**. The "edit links in the CMS → live on the widget without redeploy" loop **must be demonstrable end-to-end** (it is acceptance criterion §9.14), not mocked.
3. Everything tagged `(proposed)` in the Handoff is **confirmed** unless the report overrides it.
4. **Conflict resolution order:** Report → Handoff → CMS-2.

## 4. Confirmed product decisions (resolves Handoff §11 open questions — Report §2)

| Question | Decision for the prototype |
|---|---|
| Presentation-layer audience | **Gated B2B + internal admin.** Public sees a marketing landing + portfolio overview only; product detail, integrations, status, and the entire Link CMS require auth. |
| CMS editor type | **DB-backed admin UI** for non-technical editors (affiliate clients + internal staff). No Git-backed CMS. |
| Control panel scope | **Content + read-only operational status only.** No live trade/bot control. StatusFeed is read-only. |
| Single source of truth for integrations | **The `Operator` table in this app's DB.** A documented, idempotent `syncOperatorsFromRegistry()` stub seeds from a local fixture and marks the production sync seam (Report §4.7). |
| TT-Bot venue handling | **Internal-only, never rendered.** `internalOnly: true` rows are filtered from every public / client-facing / widget / runtime read (visibility rules in `03-auth-and-roles`). |

Additional confirmed scope: CMS-2 **v1** is the Link CMS target (CMS-2 §7); CMS-2 **Phase-2** items are out of scope but the data model must not preclude them (seams in Report §4.10).

## 5. Glossary (canonical terms — used verbatim across all specs)

| Term | Definition |
|---|---|
| **Vertical** | A product line: `TT` (sports) or `VNX` (prediction markets). The **product switch** toggles the active vertical and scopes every admin screen. |
| **Operator** (≡ Integration) | An affiliate-link target *and* a product integration. Canonical entity. Holds the **default** affiliate URL. |
| **Client** | An affiliate company (Catena, Dimers, GDC…) or Aithreus internal. Owns sites and users. |
| **Site** | A client domain that embeds widgets. Has a unique **`configId`** baked into embed snippets. |
| **WidgetType** | A catalog entry for an embeddable widget (e.g. Odds Comparison Table). Has `ctaMode` = `single`\|`multi`. |
| **WidgetInstance** | A specific embed of a WidgetType on a specific Site. |
| **CTA slot** | A single operator call-to-action button rendered inside a widget. Single-CTA widgets have one; multi-CTA widgets have one per active operator. |
| **LinkOverride** | A per-`(site, widgetInstance, operator)` URL override. Its **absence = INHERITED**; its **presence = CUSTOM**. |
| **Resolution chain** | most-specific-wins: operator-inactive → no CTA; else override → CUSTOM; else operator default → INHERITED (full algorithm in `10-link-cms/04-edit-links`). |
| **Published config** | The promoted, runtime-served snapshot of a site's resolved widget config. Produced by **Publish**; served by the config endpoint. |
| **Working state** | Continuously auto-saved admin edits, **not** live until Publish. |
| **internalOnly** | A flag on Operators/Modules hiding them from all non-internal reads. |

## 6. The headline value proposition (the loop that must work)

> A client pastes the embed snippet **once per widget instance**. Thereafter, **every link change made in the Link CMS goes live on their site after Publish — with no edit to the embed code and no redeploy of their page** (CMS-2 §4 Step 4; Report §6).

Mechanism (detailed in `20-runtime/*`): the snippet references a `configId`, not URLs. `embed.js` fetches the **published** config at runtime; CTA `href`s point at a **tracking redirect** (`/r/...`), never the raw affiliate URL; **Publish** promotes working→published and busts the config cache. Change → Publish → next page load reflects it.

## 7. System-wide acceptance criteria (summary — full list in Report §9)

The prototype is "done" when all 15 of Report §9 pass. Grouped:

- **Unified shell (§9.1–§9.3):** public landing + portfolio render; everything else gated; 3 seeded roles with correct visibility; **product switch** re-scopes operators/widgets/sites/analytics.
- **Link CMS (§9.4–§9.10):** operator CRUD + active kill-switch; site CRUD + live counts + auto `configId`; edit-links INHERITED/CUSTOM + multi-CTA per-operator rows + reset; per-widget embed snippet; gallery preview with resolved config; performance dashboard with per-operator breakdown; auto-save + Publish with diff.
- **Runtime (§9.11–§9.14):** config endpoint returns published/resolved/active-only; framework-free `embed.js` renders data-driven CTAs scoped from host CSS; redirect logs + 302s; **the §9.14 end-to-end loop passes**.
- **Quality (§9.15):** dark-first, data-dense, custom palette, monospace numerics, SVG logo, responsive, skeleton/empty/error states, `data-testid`s.

Each detailed spec restates the subset of §9 it owns and adds screen-level acceptance criteria.

## 8. Explicit non-goals (Report §11 — do not build)

- Pricing / commercial tiers as prices (tiers = feature flags only).
- Live bot/trade control from the panel (status is read-only).
- TT-Bot Stake.com venue / anti-detection operational handling — never surfaced.
- CMS-2 Phase-2: full custom branding (logo upload/fonts), page-level overrides, Widget Builder, RBAC beyond 3 roles, A/B testing, scheduled link changes, bulk import/export. **Seams preserved** (Report §4.10).
- Real market-data/odds feeds inside widgets (render representative sample data).
- Real operator affiliate postbacks (documented stub + simulated conversions).

## 9. Known intentional stubs (documented, not gaps — Report §12)

External API-key registry sync (idempotent local seed); operator conversion postbacks (simulated probabilistically from clicks); in-widget market data (sample data); ClickHouse analytics (Postgres rollups acceptable for prototype).

## 10. UI states

N/A at this altitude — this is a conceptual spec. UI states are defined per screen/component in lower specs.

## 11. Open questions (need owner decision before/at approval)

1. **OQ-1 — Source docs in-repo.** Recommend committing the three source docs into `/docs/source/` (the report + Handoff as `.md`, CMS-2 as both `.pdf` and extracted `.md`) so spec citations are repo-resolvable and the build is self-contained. Approve? *(Default: yes.)*
2. **OQ-2 — Component-spec granularity.** ~30 component specs (one per Report §8.2 item) is faithful to the methodology but heavy. Keep one-per-component, or allow grouping trivially-related ones (e.g. badges together)? *(Default: keep one-per-component, authored just-in-time.)*
3. **OQ-3 — Confirm the conflict-resolution precedence** (Report → Handoff → CMS-2) is acceptable as the standing tie-breaker for all specs. *(Default: yes, per Report §0.)*

## 12. Traceability

| This spec's content | Source |
|---|---|
| Two-layer + runtime model | Report §0–§1; Handoff §1 |
| Operator ≡ Integration unification | Report §1 (bridge) |
| Scope/build-depth decisions | Report §0 |
| Confirmed product decisions table | Report §2; Handoff §11 |
| Headline value prop / no-redeploy loop | Report §6; CMS-2 §4 (Step 4) |
| Acceptance criteria summary | Report §9 |
| Non-goals | Report §11 |
| Intentional stubs | Report §12 |

# 10.04 — Step 3: Edit Links + Resolution Algorithm

| | |
|---|---|
| **Spec ID** | `10-link-cms/04-edit-links` |
| **Status** | approved |
| **Traces to** | Report §5.3, **§4.6 (algorithm)**; CMS-2 §2, §3, §4 (Step 3) |

## 1. Purpose & scope
The override layer ("most clients skip it"). Pick a site → see every widget instance and its link state → override per `(site, widget, operator)` or reset to inherit. Defines the **canonical resolution algorithm** used here, in Embed, Gallery, Publish, and the runtime.

## 2. The resolution algorithm (authoritative — Report §4.6, CMS-2 §2/§6)
For a CTA slot `(site, widgetInstance, operator)` — **most-specific-wins**:
1. `operator.active === false` → **render no CTA** (global kill switch).
2. else a `LinkOverride` exists for `(siteId, widgetInstanceId, operatorId)` → use `override.affiliateUrl` → state **CUSTOM**.
3. else → use `operator.affiliateUrl` → state **INHERITED**.

Per widget:
- **single-CTA** (`ctaMode='single'`): resolve **one** slot = the first active operator in the vertical (deterministic by name order). One row in Edit Links.
- **multi-CTA** (`ctaMode='multi'`): iterate **every active, non-internalOnly operator** in the vertical; resolve one slot each, independently. One row per operator.

> **Data-driven (CMS-2 §3).** Slots come from the operator list, never hardcoded per widget. Adding an active operator auto-adds a slot to every applicable multi-CTA widget — no per-widget code.

Runtime exposure: the rendered CTA `href` is always the **tracking redirect** `/r/{configId}/{widgetInstanceId}/{operatorId}` — never the raw affiliate URL (§20).

## 3. Screen requirements (Report §5.3)
- **Site picker** (this client's sites). Page picker shown but **disabled / "Phase 2"** (v1 = site-level).
- Lists **every widget instance** on the site, each header showing its type + `ctaMode` + overall state.
- **Per-operator rows:** operator name · current **resolved URL** (mono) · **state badge** (INHERITED / CUSTOM) · editable URL input · **Reset** (only when CUSTOM).
- Typing a URL into a row → upsert `LinkOverride` (→ CUSTOM); **Reset** deletes it (→ INHERITED). Inactive operators show a muted "off (kill-switch)" row, no CTA.
- **Operator filter** at top to manage Polymarket vs Kalshi vs others independently.
- **Auto-save** to working state on blur/change (toast); nothing live until Publish (§08).

## 4. Data / API
```
listResolvedWidgets(siteId)  -> [{ instance, type, rows: [{ operator, state, resolvedUrl, active }] }]
upsertOverride(siteId, widgetInstanceId, operatorId, url)   // → CUSTOM
resetOverride(siteId, widgetInstanceId, operatorId)         // delete → INHERITED
```
Resolution lives in `src/server/resolution.ts` (pure, shared).

## 5. UI states
- **Loading:** row skeletons. **Empty:** "This site has no widgets yet — add one from the Gallery." **No sites:** route to Step 2.
- **Error:** inline invalid-URL; toast on save failure. **Success:** badge flips INHERITED↔CUSTOM live; toast.

## 6. Acceptance (Report §9.6)
1. Selecting a site lists its widget instances with INHERITED/CUSTOM badges.
2. Multi-CTA widgets expand to one row per active operator.
3. Typing a URL creates an override (CUSTOM); Reset restores inheritance (INHERITED).
4. Inactive operators render no CTA row/slot.
5. `data-testid`: `site-picker`, `widget-block-<wid>`, `override-row-<wid>-<opId>`, `override-input-<wid>-<opId>`, `override-state-<wid>-<opId>`, `override-reset-<wid>-<opId>`.

## 7. Non-goals
Page-level overrides, scheduled changes, A/B (Phase 2). Bulk edits.

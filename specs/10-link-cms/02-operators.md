# 10.02 — Step 1: Operators

| | |
|---|---|
| **Spec ID** | `10-link-cms/02-operators` |
| **Status** | approved |
| **Traces to** | Report §5.1; CMS-2 §4 (Step 1), §7; §4.3 |

## 1. Purpose & scope
Manage the operator catalog for the active vertical — the **source of truth** every widget defaults to. Full CRUD + the **global active kill-switch**.

> **Operator model (reconciliation).** Per Report §4.3/§4.6, operators are a **global per-vertical catalog** with a single `affiliateUrl` default and a **global `active` toggle** ("kill switch"). Per-client/per-site differences are expressed via `LinkOverride` (Step 3), not by per-client operator rows. `internalOnly` operators are visible only to internal roles.

## 2. Requirements (Report §5.1)
- **Table** for the active vertical: name · button label · brand-color swatch · affiliate URL (truncated, mono) · **active toggle** · row actions (edit, delete).
- **Create/Edit form (v1 fields, exactly):** Operator name · Button label · Brand color (color picker + hex) · Affiliate URL · Active toggle.
- **Active toggle = global kill switch:** toggling off must remove that operator's CTA from every widget preview / runtime config (verified in Gallery §06 and runtime §20).
- Inline help: "This is the source of truth. Every widget defaults to these URLs unless overridden."
- **Validation:** valid http(s) URL; unique name per vertical; valid hex brand color.
- **Auto-save:** the active toggle persists immediately (toast). Form create/edit persists on submit (toast). No live effect until Publish (§08).
- **Visibility:** `internalOnly` rows shown only to internal roles (§4.9).

## 3. Data / API (server actions)
```
createOperator(input)         // name,buttonLabel,brandColor,affiliateUrl,active,(facets defaulted)
updateOperator(id, patch)
deleteOperator(id)
setOperatorActive(id, active) // the kill switch
```
All re-validate auth + vertical scope, then `revalidatePath('/admin/operators')` (and dashboard).

## 4. UI states
- **Loading:** table skeleton.
- **Empty:** "No operators yet — add your first affiliate deal" + primary CTA.
- **Error:** inline validation under fields; toast on failed save.
- **Success:** toast "Operator saved" / "DraftKings turned off".

## 5. Acceptance (Report §9.4)
1. Full CRUD on operators with the five v1 fields.
2. Active toggle removes/restores the operator's CTAs everywhere (asserted via Gallery/runtime resolution).
3. Validation enforced (URL, unique name/vertical, hex).
4. `internalOnly` hidden from `affiliate_client`.
5. `data-testid`: `operators-table`, `operator-row-<id>`, `operator-active-<id>`, `operator-new`, `operator-form`, `operator-save`, `operator-delete-<id>`.

## 6. Non-goals
Logo upload, fonts, expanded branding (Phase 2). Per-client operator rows (model is a global catalog).

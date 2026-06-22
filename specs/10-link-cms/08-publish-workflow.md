# 10.08 — Publish workflow

| | |
|---|---|
| **Spec ID** | `10-link-cms/08-publish-workflow` |
| **Status** | approved |
| **Traces to** | Report §5.7, §6.1; CMS-2 §7 |

## 1. Purpose & scope
Auto-save keeps working state continuously; **"Publish to live widgets"** is the explicit promotion of working → the published snapshot the runtime serves, with a **diff summary** and cache invalidation.

## 2. Requirements (Report §5.7)
- Global **PublishBar** (sticky footer) with a **"Publish to live widgets"** button + **"Last published"** timestamp.
- Clicking opens a **diff summary** dialog: "N link change(s) across M site(s) since last publish", per-site breakdown.
- Confirm → for each of the client's sites in the active vertical: build the resolved snapshot (`buildPublishedSnapshot`), store a new `PublishedConfig` (version++), set `lastPublishedAt`, and **invalidate the runtime config cache** for affected `configId`s (Phase 4 wires the cache tag; here we store + revalidate).
- Auto-save persists working edits continuously (no save button); Publish is the only promotion.

## 3. Data / API
```
computePublishDiffAction() -> { sitesAffected, changedLinks, perSite:[{domain,changed}] }
publishAllAction()         -> { ok, diff } | { ok:false, error }
```
Diff compares the freshly-built `targets` map to the last published `targets` per site.

## 4. UI states
- **Computing:** "Computing changes…" while diff loads.
- **No changes:** "No changes — re-publishing current state."
- **Success:** toast "Published · N link change(s) live"; timestamp updates.

## 5. Acceptance (Report §9.10)
1. Auto-save persists edits (verified across Steps 1/3).
2. Publish promotes working → published with a diff summary.
3. After Publish, the runtime config endpoint serves the new snapshot (verified in Phase 4 / §9.14).
4. `data-testid`: `publish-bar`, `publish-open`, `publish-confirm`.

## 6. Non-goals
Scheduled publishing, per-site selective publish UI, rollback (Phase 2). Full audit entry is added in Phase 6.

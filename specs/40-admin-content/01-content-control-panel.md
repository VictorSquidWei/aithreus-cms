# 40.01 — Content control panel

| | | |
|---|---|---|
| **Spec ID** | `40-admin-content/01-content-control-panel` | **Status:** implemented · **Traces:** Handoff §7; Report §4.8, §7 |

## Purpose
Gated `/admin/content` (internal) — edit presentation content; changes reflect on the live site.

## Requirements
- **Products:** table of the four products; **Edit** dialog updates tagline, "what it does" (markdown), status, executes posture. Save → `revalidatePath(/products/[slug])` + `/status` + audit (`product.update`).
- **Docs (Pages):** New / Edit / Delete dialogs (title, slug on create, markdown body). Save → `revalidatePath(/docs...)` + audit (`page.create|update|delete`).
- **Changelog:** "Add release" dialog (product, version, date, notes) → `revalidatePath(/products/[slug])` + audit (`changelog.create`).
- Validation: required fields; unique page slug.

## Acceptance
1. Editing a product's tagline updates the live product page.
2. Creating/deleting a doc reflects on `/docs`.
3. Adding a release shows on the product's changelog.
4. Every edit writes an audit entry.
Testids: `content-products`, `content-edit-<slug>`, `product-save`, `page-new`, `page-save`, `page-delete-<slug>`, `changelog-new`, `changelog-save`.

## Non-goals
Module/strategy/tier CRUD, media library, WYSIWYG (Phase 2 / seam-ready).

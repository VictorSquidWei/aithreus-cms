# 40 — Content control panel + audit (overview)

| | |
|---|---|
| **Spec ID** | `40-admin-content/00-overview` |
| **Status** | implemented |
| **Traces to** | Report §7 (Layer B1); Handoff §7 |

## 1. Purpose & scope
Layer B1 — the **internal** content control panel that edits the presentation content (Products, Docs/Pages, Changelog) plus an **audit log** of publishes and edits. Restricted to `superadmin` / `internal_editor` (middleware + server-action re-checks; §4.9).

## 2. Routes
| Route | Owner |
|---|---|
| `/admin/content` | `01-content-control-panel` |
| `/admin/audit` | `02-audit-log` |

## 3. Cross-cutting
- **Internal-only.** `affiliate_client` is 403'd by middleware and never sees the nav entries.
- **Edits reflect live.** Saving content `revalidatePath`s the affected presentation routes (e.g. editing VNX-Terminal's tagline updates `/products/vnx-terminal`).
- **Everything audited.** Product/page/changelog edits and publishes append `AuditEntry` rows visible in the audit log.

## 4. Acceptance
1. Content edits persist and reflect on the live presentation pages.
2. Publishes + content edits appear in the audit log with actor + timestamp.
3. `affiliate_client` cannot reach `/admin/content` or `/admin/audit` (403).

## 5. Non-goals
Full module/strategy/tier CRUD UI (Products edit + Docs CRUD + Changelog add cover the CMS story; remaining entities are seam-ready in the store). Media library, rich-text WYSIWYG (markdown textarea).

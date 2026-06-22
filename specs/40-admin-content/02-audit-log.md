# 40.02 — Audit log

| | | |
|---|---|---|
| **Spec ID** | `40-admin-content/02-audit-log` | **Status:** implemented · **Traces:** Report §7 (`/admin/audit`) |

## Purpose
Gated `/admin/audit` (internal) — a log of publishes and content edits.

## Requirements
- Table: when (timestamp) · actor (name) · action (tag) · summary, newest first.
- Sources: `publishAllAction` (action `publish`) and content actions (`product.update`, `page.create|update|delete`, `changelog.create`). Seeded with a couple of entries.
- Read-only.

## Acceptance
Shows seeded + live entries; a publish or content edit adds a row with actor + timestamp; testid `audit-table`. (Report §7)

## Non-goals
Filtering/export, diff detail per entry, immutability guarantees (Phase 2).

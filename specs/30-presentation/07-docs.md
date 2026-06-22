# 30.07 — Docs

| | | |
|---|---|---|
| **Spec ID** | `30-presentation/07-docs` | **Status:** implemented · **Traces:** Handoff §7; Report §4.8 (Page) |

## Purpose
Gated `/docs` (index) + `/docs/[slug]` — CMS-managed documentation pages.

## Requirements
- `/docs` lists `Page` records as cards linking to `/docs/[slug]`.
- `/docs/[slug]` renders title + body via `RichContentBlock` (markdown-ish: paragraphs, bullets, **bold**).
- Pages are editable in the content panel (`40-admin-content`) — create/edit/delete reflect here.
- 404 for unknown slug.

## Acceptance
Docs list + detail render from store Pages; edits in the content panel appear here; testids `doc-<slug>`. (Handoff §7)

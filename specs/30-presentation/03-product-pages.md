# 30.03 — Product pages

| | | |
|---|---|---|
| **Spec ID** | `30-presentation/03-product-pages` | **Status:** implemented · **Traces:** Handoff §3; Report §4.8, §7 |

## Purpose
Gated `/products/[slug]` for the four products — what it does, modules, integrations, status, changelog — all from CMS content.

## Requirements
- Hero: vertical, name, status pill, tagline, **execution-posture badge**, type.
- Sections: **What it does** (RichContentBlock), **Status** (metric stats), **Modules** (ModuleCard grid, `internalOnly` filtered by viewer), **Strategies** (bots), **Integrations** (IntegrationGrid of the vertical's operators, internalOnly filtered), **Changelog** (timeline).
- 404 for unknown slug.

## Acceptance
1. All four product pages render the sections from store content.
2. `internalOnly` modules (e.g. TT-Bot venue handling) hidden from `affiliate_client`; visible to internal roles.
3. Execution posture correct (terminals read-only, bots execute).
Testids: `product-card-<slug>`, `module-<id>`, `integration-<slug>`, `execution-posture`. (Report §9; Handoff §3)

# 30.02 — Portfolio matrix

| | | |
|---|---|---|
| **Spec ID** | `30-presentation/02-portfolio-matrix` | **Status:** implemented · **Traces:** Handoff §2; Report §7 |

## Purpose
Public `/portfolio` — the 2×2 product matrix (VNX/TT × Terminal/Bot) at a glance.

## Requirements
- Two rows (Terminal / Bot), two columns (VNX / TT); each cell a card linking to `/products/[slug]`.
- Each card: vertical chip, name, **execution-posture badge** (read-only vs executes), tagline.
- Clicking a card when logged out → login (gated detail), then the product page.

## Acceptance
4 product cards render with posture badges; cards link to `/products/[slug]`; testids `product-<name>`. (Handoff §2)

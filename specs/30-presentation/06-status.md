# 30.06 — Status

| | | |
|---|---|---|
| **Spec ID** | `30-presentation/06-status` | **Status:** implemented · **Traces:** Handoff §3.3, §4; Report §2 (read-only), §4.8 |

## Purpose
Gated `/status` — read-only product & system health from the `StatusFeed`.

## Requirements
- Per product: status pill + metric stats (uptime, signals/day, Brier, CLV…).
- For bots: a 9-component **HealthIndicatorBar** (ported from VNX-Bot), colored by component status.
- **Read-only** — no control actions (Report §2 confirmed decision).

## Acceptance
Renders per-product metrics + health bars; no control affordances; testids `status-<slug>`, `health-bar`. (Handoff §3.3)

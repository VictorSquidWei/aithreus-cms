# 30.04 — Platform

| | | |
|---|---|---|
| **Spec ID** | `30-presentation/04-platform` | **Status:** implemented · **Traces:** Handoff §4; Report §7 |

## Purpose
Gated `/platform` — the shared signal-and-calibration engine under all four products.

## Requirements
- The pipeline (data → features → models → calibrated probability + CI → edge → fractional-Kelly sizing) as a visual chain.
- Calibration stats (Brier / ECE / CLV).
- Shared primitives grid (calibration core, auth, telemetry, alerting, config+versioning, infra=AWS eu-west-1).

## Acceptance
Renders the pipeline, calibration stats, and shared-primitives grid. (Handoff §4)

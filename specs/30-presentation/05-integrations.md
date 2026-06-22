# 30.05 — Integrations grid

| | | |
|---|---|---|
| **Spec ID** | `30-presentation/05-integrations` | **Status:** implemented · **Traces:** Handoff §5; Report §4.3, §7 |

## Purpose
Gated `/integrations` — the global integrations grid, reading the **`Operator`** table (the Operator≡Integration unification).

## Requirements
- Grouped by vertical; each operator shown as an `OperatorBadge` (brand initial, name, role, category, integration status).
- `internalOnly` operators (e.g. Stake.com) hidden from `affiliate_client`; visible to internal roles (§4.9).

## Acceptance
Grid reads `Operator`; internalOnly filtered per role; testids `integration-grid`, `integration-<slug>`. (Handoff §5; Report §4.3)

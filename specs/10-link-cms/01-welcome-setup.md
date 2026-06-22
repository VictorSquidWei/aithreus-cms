# 10.01 — Welcome / Guided 4-step setup

| | |
|---|---|
| **Spec ID** | `10-link-cms/01-welcome-setup` |
| **Status** | approved |
| **Traces to** | Report §5.0; CMS-2 §4 (Welcome) |

## 1. Purpose & scope
A guided onboarding that walks a new client through Steps 1–4 in order, with progress + "you are here", driven by real data. Skippable and re-openable from the nav ("Setup guide").

## 2. Requirements
- Four step cards in order: **1 Operators → 2 Sites → 3 Edit links → 4 Embed**, each with a one-line description, a link to its screen, and a **completion checkmark derived from data**:
  - Step 1 done = ≥1 operator (active) in the vertical.
  - Step 2 done = ≥1 site.
  - Step 3 = optional (marked "optional"); done if ≥1 override OR explicitly acknowledged.
  - Step 4 done = ≥1 site has been **published** (lastPublishedAt set).
- Progress indicator (e.g. "2 of 4") + a `StepProgress` strip.
- Scoped to active vertical + viewer's client.
- Re-openable anytime; not a blocker (skippable).

## 3. Data / API
Derives entirely from existing reads (operators, sites, overrides, publish state) — no new mutations.

## 4. UI states
- **Fresh client:** all steps open, Step 1 highlighted as "start here".
- **Partial:** completed steps checked + muted; next step highlighted.
- **Complete:** all checked + a "You're live" confirmation.

## 5. Acceptance
1. Step checkmarks reflect real data (adding an operator checks Step 1, etc.).
2. Each step links to its screen; progress count correct.
3. `data-testid`: `setup-guide`, `setup-step-1..4`, `setup-progress`.

## 6. Non-goals
Interactive in-line wizards inside each step (links out to the real screens). Persisting "skipped" server-side (derive from data).

# 10.06 — Widget Gallery

| | |
|---|---|
| **Spec ID** | `10-link-cms/06-widget-gallery` |
| **Status** | approved |
| **Traces to** | Report §5.5; CMS-2 §5 |

## 1. Purpose & scope
A live catalog of every embeddable `WidgetType` for the active vertical. Each card previews the widget with sample data **and** the client's resolved operator CTAs (so they see exactly which buttons render given their active operators), plus a "Grab embed" action.

## 2. Requirements (Report §5.5)
- One card per `WidgetType` (active vertical): name, description, `ctaMode` badge.
- **`WidgetPreviewFrame`**: a clean, on-brand placeholder render of the widget's data viz (from `sampleDataJson`) **plus data-driven operator CTAs** — single → first active operator; multi → one button per active operator, each in the operator's `brandColor`/`buttonLabel`. Thumbnails are placeholders (CMS-2 note), but the CTA layer is real.
- The preview reflects the **active operator set**: turning an operator off in Step 1 removes its button here (demonstrates §9.4 "removes CTAs everywhere").
- **"Grab embed"** → Step 4 embed for the widget.

## 3. UI states
- **No active operators:** preview shows "No active operators — turn one on in Step 1."
- **No widget types:** (won't happen with seed) empty catalog message.

## 4. Acceptance (Report §9.8)
1. Every widget type previews with sample data **and** the client's resolved operator config.
2. Multi-CTA widgets show one button per active operator; single-CTA show one.
3. Toggling an operator off in Step 1 removes its CTA from the preview.
4. `data-testid`: `gallery`, `gallery-card-<key>`, `widget-preview`.

## 5. Non-goals
Real widget visual designs / real market data (separate workstream — representative sample data only). Widget Builder (Phase 2).

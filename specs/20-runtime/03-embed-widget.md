# 20.03 — Embeddable widget (`embed.js`)

| | |
|---|---|
| **Spec ID** | `20-runtime/03-embed-widget` |
| **Status** | approved |
| **Traces to** | Report §6.2, §6.4 |

## 1. Purpose & scope
A framework-free, self-contained IIFE (esbuild) served at `/widget/v1/embed.js`. Renders embedded widgets from the published config, with data-driven operator CTAs, style-isolated from the host page.

## 2. Snippet (Report §6.2)
```html
<div class="aithreus-widget" data-config-id="{configId}" data-widget="{widgetInstanceId}" data-theme="dark"></div>
<script src="{NEXT_PUBLIC_WIDGET_CDN_URL}" async></script>
```

## 3. Behavior (Report §6.4)
1. On load, find all `.aithreus-widget` nodes.
2. Derive the API base from the widget script's own origin; group nodes by `data-config-id`; **fetch config once per `configId`**.
3. For each node, look up `data-widget` in `config.widgets`; render the widget UI (from `sampleDataJson`) + **data-driven CTAs** from `config.widgets[id].ctas`.
4. CTAs: single → one button; multi → one button per operator, each in the operator's `color`/`label`, `href` = absolute tracking redirect.
5. **Style isolation** via Shadow DOM (host CSS can't bleed in/out).
6. Fire an **impression beacon** per CTA on render.

## 4. Acceptance (Report §9.12)
1. Framework-free bundle renders widgets + data-driven CTAs from config.
2. Style-isolated (Shadow DOM) — does not break or inherit host CSS.
3. Multiple widgets on a page share one config fetch per `configId`.
4. Impression beacons fire; clicks hit the redirect.

## 5. Non-goals
Real widget visual designs / live market data (representative sample data); theming beyond dark; SRI/versioned CDN strategy (production seam).

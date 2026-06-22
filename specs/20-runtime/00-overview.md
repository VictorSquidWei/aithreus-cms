# 20 — Runtime (overview)

| | |
|---|---|
| **Spec ID** | `20-runtime/00-overview` |
| **Status** | approved |
| **Traces to** | Report §6 |

## 1. Purpose & scope
The headline value prop made real: a client pastes a snippet **once per widget instance**; thereafter every link change in the CMS goes live after **Publish** with **no re-embed, no redeploy**. Three artifacts:

1. **Config endpoint** (`01`) — serves the published, resolved, active-only config by `configId`.
2. **Redirect/tracking** (`02`) — logs a click then 302s to the resolved affiliate URL; impression + postback endpoints.
3. **`embed.js`** (`03`) — framework-free; fetches config, renders widgets + data-driven CTAs (style-isolated), fires impressions.

Proven by **`/demo/client-site`** (`04`) and the **§9.14** automated loop.

## 2. The loop (acceptance §9.14)
`edit/toggle operator in CMS → Publish → reload demo page → CTA updates` — with the embed code unchanged. Mechanism: snippet references a `configId` (not URLs); `embed.js` fetches the **published** snapshot at runtime; CTA hrefs are tracking redirects; Publish writes a new snapshot and the endpoint serves it fresh.

## 3. Data flow
admin edit → working store → **Publish** → `PublishedConfig` (payload + server-only `targets`) → config endpoint (fresh) → `embed.js` renders CTAs (`href=/r/...`) → redirect logs `click` + 302 → events → Performance.

## 4. Prototype notes
- Same-origin in dev (demo + API + widget on one app); CORS headers set for cross-origin client sites.
- Config served `no-store` to guarantee the loop on reload; production uses short `s-maxage` + tag revalidation on publish (documented seam).
- Live sites are **pre-published at seed** so the demo renders immediately.

## 5. Traceability
Report §6.1 (config), §6.2 (snippet), §6.3 (tracking), §6.4 (widget behavior + demo loop), §9.11–§9.14.

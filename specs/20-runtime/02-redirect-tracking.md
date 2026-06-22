# 20.02 — Redirect & tracking

| | |
|---|---|
| **Spec ID** | `20-runtime/02-redirect-tracking` |
| **Status** | approved |
| **Traces to** | Report §6.3 |

## 1. Purpose & scope
Make every CTA click measurable and centrally re-targetable: the CTA points at a tracking redirect, which logs a click then 302s to the resolved affiliate URL. Plus an impression beacon and a conversion postback stub.

## 2. Contracts
```
GET /r/{configId}/{widgetInstanceId}/{operatorId}
  1. resolve target = latest PublishedConfig(configId).targets["{wid}:{operatorId}"]   (server-only map)
  2. append event { type:'click', configId, siteId, widgetInstanceId, operatorId, verticalId, ts, anonId, ua, referer }
  3. 302 → target   (404 if no target)

POST /api/embed/event   { type:'impression', configId, widgetInstanceId, operatorId }
  → append impression event; 204. CORS + OPTIONS.

POST /api/embed/postback   { configId, widgetInstanceId, operatorId, value? }   (operator S2S stub)
  → append conversion event (documented stub; real operator postbacks are out of scope — Report §11). CORS + OPTIONS.
```
- The raw affiliate URL only ever appears in the 302 `Location` — never in client-readable JSON.
- New clicks/impressions land in the same `events` store → the Performance dashboard reflects them live.

## 3. Acceptance (Report §9.13)
1. `/r/...` logs a click then 302s to the resolved affiliate URL.
2. Impression beacons append impression events.
3. Conversions can be simulated via the postback stub (and seeded synthetically).
4. Endpoints are public + CORS-enabled.

## 4. Non-goals
Real operator postback integration, bot-click filtering, attribution windows (production seams).

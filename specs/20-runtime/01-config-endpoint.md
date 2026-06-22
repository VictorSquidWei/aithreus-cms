# 20.01 — Config endpoint

| | |
|---|---|
| **Spec ID** | `20-runtime/01-config-endpoint` |
| **Status** | approved |
| **Traces to** | Report §6.1 |

## 1. Purpose & scope
`GET /api/embed/config/:configId` → the **published**, resolved, **active-only**, `internalOnly`-filtered config for a site. The only data the embeddable widget reads.

## 2. Contract
```
GET /api/embed/config/{configId}
200 → {
  configId, vertical,
  operators: [{ id, name, buttonLabel, brandColor, active:true }],   // active, non-internalOnly only
  widgets: {
    "<widgetInstanceId>": {
      widgetInstanceId, widgetTypeKey, ctaMode, ctaRendering, sampleDataJson,
      ctas: [ { operatorId, label, color, href:"/r/{configId}/{wid}/{operatorId}" } ]   // tracking redirect, NOT raw URL
    }
  }
}
404 → site/config not found OR never published
```
- Body comes verbatim from the latest `PublishedConfig.payload` (resolution happened at publish time, §10.04/§10.08).
- **No raw affiliate URLs** in the response — only tracking-redirect hrefs.
- Headers: `Access-Control-Allow-Origin: *`, `Content-Type: application/json`, `Cache-Control: no-store` (prototype; production: short `s-maxage` + revalidate-on-publish). `OPTIONS` preflight supported.

## 3. Acceptance (Report §9.11)
1. Returns the published, resolved, active-only config; excludes inactive + `internalOnly` operators.
2. CTA hrefs are tracking redirects, never raw affiliate URLs.
3. Unpublished/unknown `configId` → 404.
4. CORS allows cross-origin fetch.

## 4. Non-goals
Per-request resolution (done at publish), auth (public endpoint), rate-limiting (production seam).

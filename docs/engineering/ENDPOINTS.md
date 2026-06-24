# Endpoints reference

Every externally-reachable endpoint and every write action, with its file, contract, and what to connect for production.

## Runtime HTTP endpoints (public, CORS-enabled — consumed by embedded widgets)

### 1. Widget config
- **`GET /api/embed/config/:configId`**
- File: `src/app/api/embed/config/[configId]/route.ts`
- Returns the latest **published** config for a site (resolved, active-only, `internalOnly` filtered). CTA `href`s are tracking redirects — **no raw affiliate URLs**.
- Response: `{ configId, vertical, operators[], widgets: { [widgetInstanceId]: { widgetTypeKey, ctaMode, ctaRendering, sampleDataJson, ctas: [{ operatorId, label, color, href }] } } }`
- 404 if the site was never published.
- Headers: `Access-Control-Allow-Origin: *`, `Cache-Control: no-store`.
- **Production:** change `no-store` → short `s-maxage` + call `revalidateTag('config:'+configId)` on publish (see `src/server/actions/publish.ts`). Serve behind a CDN.

### 2. Click redirect / tracking
- **`GET /r/:configId/:widgetInstanceId/:operatorId`**
- File: `src/app/r/[configId]/[wid]/[operatorId]/route.ts`
- Logs a `click` event, then **302**s to the resolved affiliate URL (looked up from `PublishedConfig.targets`).
- **Production:** add bot filtering, click dedup, and attribution params as needed.

### 3. Impression beacon
- **`POST /api/embed/event`** body `{ type:'impression', configId, widgetInstanceId, operatorId }`
- File: `src/app/api/embed/event/route.ts` → appends an `impression` event. `204`.

### 4. Conversion postback (STUB)
- **`POST /api/embed/postback`** body `{ configId, widgetInstanceId, operatorId, value? }`
- File: `src/app/api/embed/postback/route.ts` → appends a `conversion` event.
- **This is a documented stub.** Wire each operator's real S2S postback (signature/secret validation, dedup, currency) here. See INTEGRATION.md §Conversions.

### 5. Widget bundle (static)
- **`GET /widget/v1/embed.js`** — built from `widget/src/embed.ts` by `widget/build.mjs` into `public/widget/v1/`.
- The snippet clients paste:
  ```html
  <div class="aithreus-widget" data-config-id="{configId}" data-widget="{widgetInstanceId}" data-theme="dark"></div>
  <script src="{NEXT_PUBLIC_WIDGET_CDN_URL}" async></script>
  ```
- **Production:** publish `embed.js` to S3 + CloudFront and point `NEXT_PUBLIC_WIDGET_CDN_URL` at it (versioned path `/widget/v1/`).

## Dev-only endpoint
- **`POST /api/dev/reset-store`** — re-seeds the store. File: `src/app/api/dev/reset-store/route.ts`. **Disabled when `NODE_ENV=production`.** Remove or keep guarded.

## Auth (server actions + middleware, not REST)
- Login/logout are **server actions** in `src/server/actions/auth.ts` (`loginAction`, `logoutAction`). Session is a signed-JWT cookie (`jose`) — `src/lib/auth.ts`.
- Route protection: `src/middleware.ts` (public allowlist; `/admin/*` requires auth; `/admin/{content,audit,users}` require internal roles).
- **Production:** replace with your IdP/SSO (Auth.js / Clerk). See INTEGRATION.md §Auth. There is intentionally **no** `/api/auth/*` route yet.

## Write surface (server actions — the app's mutation API)
All under `src/server/actions/`, all enforce auth + visibility, all `revalidatePath` the affected routes:
| Action file | Functions |
|---|---|
| `operators.ts` | create / update / setActive / delete operator |
| `sites.ts` | create / update / delete site |
| `overrides.ts` | upsert / reset link override |
| `publish.ts` | `computePublishDiffAction`, `publishAllAction` (writes `PublishedConfig`) |
| `content.ts` | update product, page CRUD, add changelog (internal-only; audited) |
| `auth.ts` | login / logout |

> To expose a REST/GraphQL API instead, wrap the same `DataStore` (`src/server/data-store.ts`) in route handlers — the store is the single seam.

## Page routes (server-rendered)
Public: `/`, `/portfolio`, `/login`, `/demo/client-site`.
Gated: `/products/[slug]`, `/platform`, `/integrations`, `/status`, `/docs`, `/docs/[slug]`.
Admin: `/admin`, `/admin/{setup,operators,sites,links,embed,gallery,performance,content,audit}`.

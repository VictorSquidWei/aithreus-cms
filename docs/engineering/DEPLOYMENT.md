# Deployment

## Live demo — Vercel (current)
The shareable build runs on **Vercel** (native Next.js SSR) at **https://aithreus-cms.vercel.app** — a fast public link for demos. AWS (below) remains the eventual production target.

- **Deploy:** `vercel deploy --prod` from the repo root. Project `contextive-ai/aithreus-cms`, linked via `.vercel/` (gitignored). The GitHub repo is connected, so pushes to `main` also trigger a deploy.
- **Build:** Vercel runs `npm run build`; the `prebuild` hook builds the widget bundle (`public/widget/v1/embed.js`) first, so the runtime is complete.
- **Runtime:** in-memory store (no `DATABASE_URL`) — seeds on cold start, and a published demo config ships in the seed so the widget loop renders immediately. **Caveat:** each serverless instance holds its own in-memory store, so live edits / Publish may not persist across instances or cold starts. Set `DATABASE_URL` (any Postgres) for shared, durable state — the DrizzleStore activates automatically.
- **Auth:** `AUTH_SECRET` falls back to a dev value if unset (fine for a throwaway demo); set a real secret for anything else. Cookies are `Secure` in production and Vercel serves HTTPS, so sessions work.

> **Why not GitHub Pages:** this is an SSR app — middleware auth guards, API routes (config endpoint, `/r/` redirect, event beacon), and server actions all need a Node server. GitHub Pages serves only static files; a static export (`output: 'export'`) can't build the dynamic `cookies()`/`headers()` server components and drops all API routes, so login, admin, and the edit→Publish→live-widget loop would not work. Use an SSR host (Vercel above, or AWS below).

## Production target — AWS eu-west-1 (Dublin)

Target topology: Next.js app on **Amplify Hosting** (SSR), **RDS Postgres**, `embed.js` on **S3 + CloudFront**.

## Environment variables
| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection (RDS / pooled). Setting it switches the app to the Drizzle store. |
| `AUTH_SECRET` | Signs the session JWT. `openssl rand -base64 32`. **Required in prod.** |
| `NEXT_PUBLIC_APP_URL` | Public app origin. |
| `NEXT_PUBLIC_WIDGET_CDN_URL` | Absolute URL of `embed.js` (CloudFront). |
| `CONFIG_CACHE_TTL_SECONDS` | Config cache TTL (when you enable caching). |
| `AWS_REGION` | `eu-west-1`. |
| `CLICKHOUSE_URL` | Optional analytics sink (see INTEGRATION.md §5). |

See `.env.example`.

## App (Amplify Hosting)
1. Connect the GitHub repo; framework auto-detected (Next.js).
2. Build command `npm run build` (runs `prebuild` → builds the widget bundle first), output served by Amplify SSR.
3. Set the env vars above (incl. `DATABASE_URL`, `AUTH_SECRET`).
4. `pg` is marked external (`serverExternalPackages: ["pg"]` in `next.config.mjs`) so it bundles cleanly for SSR.
> Alternative if you need private-VPC RDS access: deploy the same app to **ECS Fargate** (containerized `npm start`) in the VPC. The app is portable Next.js.

## Database (RDS Postgres, eu-west-1)
1. Provision RDS Postgres (or Aurora Serverless v2). Use a pooled endpoint / RDS Proxy for serverless.
2. From CI or a one-off task with `DATABASE_URL` set:
   ```bash
   npm run db:push     # create tables (or db:generate + drizzle-kit migrate)
   npm run db:seed     # optional: load demo data
   ```
3. Confirm the app picks up Postgres (it does automatically when `DATABASE_URL` is present).

## Widget CDN (S3 + CloudFront)
1. `npm run build:widget` produces `public/widget/v1/embed.js`.
2. Upload to an S3 bucket; front with CloudFront at e.g. `https://cdn.aithreus.com/widget/v1/embed.js`.
3. Set `NEXT_PUBLIC_WIDGET_CDN_URL` to that URL so generated snippets reference the CDN.
4. CloudFront caches `embed.js`; invalidate on widget releases. (Config JSON is served by the app, not the CDN, unless you add caching per INTEGRATION.md §6.)

## Pre-launch checklist
- [ ] `AUTH_SECRET` set; demo logins removed/replaced (INTEGRATION.md §1).
- [ ] `DATABASE_URL` set; migrations applied; `/api/dev/reset-store` disabled (it already no-ops in prod).
- [ ] `embed.js` on CDN; `NEXT_PUBLIC_WIDGET_CDN_URL` set.
- [ ] Config caching + `revalidateTag` enabled (INTEGRATION.md §6).
- [ ] Postgres indexes/FKs + analytics retention (DATABASE.md notes).
- [ ] CORS on `/api/embed/*` reviewed (currently `*` for embeds).

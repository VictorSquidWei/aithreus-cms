# 03 — Auth & Roles

| | |
|---|---|
| **Spec ID** | `00-product/03-auth-and-roles` |
| **Status** | approved |
| **Altitude** | System |
| **Date** | 2026-06-21 |
| **Traces to** | Report §4.1, §4.9, §2; Handoff §8, §11; CMS-2 §8 (RBAC=Phase 2) |

---

## 1. Purpose & scope

Define authentication, the three roles, session shape, route guards, and the centralized visibility filtering that enforces Report §4.9 on every read. Schema for `User`/`Client`/`Session` is in `02-data-model`; this spec defines **behavior and enforcement**.

## 2. Roles (Report §4.1)

| Role | Who | Can see / do |
|---|---|---|
| `superadmin` | Aithreus internal owner | Everything: all clients, all verticals, `internalOnly` data, content panel, audit, Link CMS for any client. |
| `internal_editor` | Aithreus staff | Same visibility as superadmin for content + `internalOnly`, but **not** user/role management or destructive client ops. |
| `affiliate_client` | An affiliate company's login | Only **their own `clientId`**'s sites/overrides/performance; the Link CMS scoped to their data; **never** `internalOnly` rows, never other clients' data, never the content panel. |

> CMS-2 v1 = "one login per client"; multi-user RBAC beyond these three roles is Phase 2 (CMS-2 §8). The three roles already exist in the model so the prototype can demo each view.

## 3. Authentication

- **Auth.js (NextAuth) Credentials provider.** Email + password; `passwordHash` via **bcrypt** (cost 10). No third-party IdP in the prototype.
- **Session = JWT cookie** (httpOnly, secure in prod, `SameSite=Lax`). Claims: `userId`, `role`, `clientId`, `name`, `email`. TTL 7 days, sliding.
- **`AUTH_SECRET`** from env signs the JWT.
- **Seeded users (3)** — one per role (Report §10.1), e.g.:
  - `super@aithreus.internal` → `superadmin` (internal client)
  - `editor@aithreus.internal` → `internal_editor` (internal client)
  - `client@dimers.com` → `affiliate_client` (Dimers client)
  - Seeded passwords come from `.env`/seed constants and are surfaced in the README dev section (dev only).

## 4. Route guards

Enforced in **Next.js middleware** + re-checked in server actions/data access (never trust the client). Three zones (routes defined in `04-information-architecture`):

| Zone | Routes | Guard |
|---|---|---|
| **Public** | `/`, `/portfolio`, `/login`, `/api/embed/*`, `/r/*`, `/widget/*`, `/demo/*` | None (open). Widget/runtime endpoints are intentionally public + CORS-open. |
| **Gated app** | `/products/*`, `/platform`, `/integrations`, `/status`, `/docs` | Any authenticated user. |
| **Admin** | `/admin/*` | Authenticated **and** role ∈ {superadmin, internal_editor} for content/audit; `affiliate_client` may reach the **Link CMS** sub-routes scoped to their client, but **not** `/admin/content`, `/admin/audit`, `/admin/users`. |

Unauthenticated access to a gated/admin route → redirect to `/login?next=<path>`. Authenticated but unauthorized (e.g. client hitting `/admin/content`) → `403` page, not a redirect loop.

## 5. Visibility filtering (Report §4.9 — `server/visibility.ts`, applied on every read)

A single module wraps all reads with the current session. Rules (mirrors `02-data-model §5`):

1. `internalOnly==true` rows → only for `superadmin`/`internal_editor`.
2. `Operator.active==false` → excluded from widget config + runtime + CTA rendering; **still returned** to the Link CMS admin so it can be toggled back on.
3. Draft sites / unpublished content → admin-visible, runtime-excluded until Publish.
4. `affiliate_client` → all queries constrained to `session.clientId`.
5. Public/unauth → curated landing + portfolio only.

**The runtime config endpoint always applies rules 1–3 regardless of session** (it serves end users), so `internalOnly` and inactive operators can never leak into a widget.

## 6. Data shapes

```ts
type SessionClaims = { userId: string; role: Role; clientId: string; name: string; email: string }
type Role = 'superadmin' | 'internal_editor' | 'affiliate_client'
// visibility context threaded into every store read:
type Viewer = { role: Role; clientId: string } | { role: 'public' }
```

## 7. UI states

- **Login form:** idle → submitting (button spinner, inputs disabled) → error (inline "Invalid email or password", no field-specific leak) → success (redirect to `next` or role home: admin→`/admin`, client→`/admin` Link CMS, gated user→`/portfolio`).
- **403 page:** clear "You don't have access to this area" + link back to an allowed home.
- **Session expiry:** next server action returns 401 → toast + redirect to `/login?next=`.

## 8. Acceptance criteria (Report §9.2)

1. Login works for all three seeded roles.
2. `affiliate_client` **cannot** see `internalOnly` data or any other client's data (sites, overrides, performance) — verified by Playwright logging in as the client and asserting absence.
3. `internal_editor`/`superadmin` **can** see `internalOnly` data.
4. Direct navigation to an unauthorized admin route yields `403` (not content); to a gated route while logged out yields a login redirect that returns the user to `next` after auth.
5. Widget config endpoint never returns `internalOnly` or inactive operators, even with no session.

## 9. Non-goals

SSO/OAuth, MFA, password reset flows, multi-user-per-client RBAC, granular per-resource permissions (all Phase 2). Rate-limiting/lockout is out of prototype scope (noted as a production seam).

## 10. Open questions

None blocking. Seed credentials list to live in README (dev-only) — confirm at Phase 1 commit.

## 11. Traceability

| Content | Source |
|---|---|
| Three roles + one-login-per-client | Report §4.1; CMS-2 §7–§8 |
| Session tokens + hashed credentials | Handoff §8; Report §3.1 |
| Visibility rules | Report §4.9 |
| Gated B2B + internal audience | Report §2; Handoff §11 |
| Runtime never leaks internalOnly/inactive | Report §4.9, §6.1 |

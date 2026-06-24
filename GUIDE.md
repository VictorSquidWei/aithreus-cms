# Aithreus CMS — Complete guide

A plain-language guide to what this website is, how it's organized, how to navigate it, and how the demo works. For a tight click-by-click script, see [DEMO.md](DEMO.md). For wiring it to production systems, see [docs/engineering/](docs/engineering/README.md).

---

## 1. What this is

**One unified Aithreus web property** with two layers plus a runtime artifact:

- **Layer A — the product/marketing site.** Presents the four Aithreus products (VNX-Terminal, VNX-Bot, TT-Terminal, TT-Bot) as CMS-managed content: what each does, its modules, integrations, status, and changelog.
- **Layer B — the flagship affiliate Link CMS.** A self-serve admin where affiliate clients manage every operator link on every widget on every site — from one place, without touching code.
- **Runtime — the embeddable widget (`embed.js`).** What affiliate clients paste into their own websites. It renders widgets with operator call-to-action buttons whose links are controlled centrally from the CMS.

**The core business idea:** Aithreus builds trading/analytics products that ship embeddable widgets. Those widgets contain operator buttons (Polymarket, Kalshi, DraftKings…). The Link CMS lets clients manage which operators get promoted where — and change links live without re-embedding. That's what makes the widgets sellable to operators.

**The headline capability:** edit/toggle a link in the CMS → click Publish → it's live on the client's site, **with no change to the embed code and no redeploy.**

---

## 2. How to run it

```bash
npm install        # first time only
npm run dev
```
Open **http://localhost:3000**. It's fully populated with demo data on every start (no database required).

**Demo logins** (also shown on the login screen):

| Role | Email | Password | Shows |
|---|---|---|---|
| Affiliate client | `client@dimers.com` | `client123` | the client's own self-serve view |
| Internal staff | `editor@aithreus.internal` | `editor123` | internal data + the content panel |
| Superadmin | `super@aithreus.internal` | `super123` | everything, incl. internal-only operators |

---

## 3. How to navigate it

### Public (no login)
- **`/`** — marketing landing (the signal/calibration story).
- **`/portfolio`** — the 2×2 product matrix (VNX/TT × Terminal/Bot). Cards link into the product pages (sign-in required).

### Product site (after login) — top nav
- **Portfolio · Platform · Integrations · Status · Docs**, plus a **"Link CMS"** button to jump to the admin.
- **Product pages** (`/products/vnx-bot`, etc.): hero + execution posture (terminals are read-only, bots execute), what it does, modules, strategies, integrations, status metrics, changelog.
- **Platform**: the shared signal-and-calibration engine.
- **Integrations**: the operator catalog shown as integrations (the same `Operator` records the Link CMS uses).
- **Status**: read-only health metrics + a 9-component health bar for the bots.
- **Docs**: CMS-managed documentation pages.

### Link CMS (admin) — left sidebar, with a **TT | VNX product switch** in the top bar
- **Dashboard** — KPIs + setup progress.
- **Setup guide** — the guided 4-step flow.
- **1 · Operators** — the affiliate-link source of truth; an **Active** toggle is a global kill switch.
- **2 · Sites** — the client's domains; each has a `configId` and live counts.
- **3 · Edit links** — override default URLs per site/widget; **multi-CTA widgets show one row per operator**; INHERITED vs CUSTOM badges; Reset to inherit.
- **4 · Embed code** — the copy-paste snippet per widget.
- **Widget gallery** — every widget previewed with the client's live operator buttons.
- **Performance** — views/clicks/CTR/conversions/revenue, time-series, per-operator breakdown, CSV export.
- **Content panel** *(internal only)* — edit products, docs, and releases; changes reflect on the live product site.
- **Audit log** *(internal only)* — every publish and content edit, with who and when.

The **product switch (TT | VNX)** re-scopes every admin screen to that product line.

### Demo page
- **`/demo/client-site`** — a mock external article that embeds real widgets via the snippet. Used to prove the no-redeploy loop.

---

## 4. How the demo works (the money moment)

1. Open **`/demo/client-site`** — you'll see two embedded widgets with operator buttons (e.g. "Bet on FanDuel"). This page only contains the pasted snippet; it loads `embed.js`, which fetches the published config and renders the buttons.
2. In another tab, log into the **Link CMS** → **Operators** → toggle **FanDuel** off (or change its URL). Click **Publish to live widgets** and confirm the diff.
3. Reload the demo page → the FanDuel button is **gone** — with no change to the embed code.

Behind the scenes: the snippet references a `configId`, not URLs. `embed.js` calls `GET /api/embed/config/:configId` for the **published** config. Each button's link is a tracking redirect (`/r/...`) that logs a click and 302s to the real affiliate URL. **Publish** promotes your working edits into the published config the runtime serves. (Full mechanics in [docs/engineering/ENDPOINTS.md](docs/engineering/ENDPOINTS.md).)

---

## 5. How it's built (one paragraph)

Next.js 15 + TypeScript, Tailwind, dark-first design. All data goes through one async repository interface; by default it uses an **in-memory store** (the demo data), and it switches to **Postgres (Drizzle ORM)** automatically when `DATABASE_URL` is set — no other change. Auth is a signed-JWT cookie with three roles and server-side visibility filtering (internal-only data never reaches clients or widgets). The widget runtime is a framework-free script that renders into a Shadow DOM so it can't clash with the host page. Everything is spec-driven — [`specs/INDEX.md`](specs/INDEX.md) documents each feature traced to the source requirements.

---

## 6. Where to go next
- **Show someone:** [DEMO.md](DEMO.md) — the 10-minute walkthrough script.
- **Take it to production:** [docs/engineering/README.md](docs/engineering/README.md) — endpoints, database, integration seams, deployment.
- **Understand a feature in depth:** [specs/INDEX.md](specs/INDEX.md).

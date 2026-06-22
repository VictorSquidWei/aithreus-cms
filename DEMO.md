# Aithreus — Demo walkthrough

A guided script for showing the prototype. Everything runs locally with seeded demo data — no database or external services required.

## Run it (2 minutes)

```bash
npm install        # first time only
npm run dev
```

Open **http://localhost:3000**.

> The app runs entirely on an in-memory store seeded at startup, so it's fully populated with demo data every time. (Postgres is wired in a later phase; nothing else is needed to demo.)

### Demo logins (shown on the login screen too)

| Role | Email | Password | Use it to show… |
|---|---|---|---|
| Affiliate client | `client@dimers.com` | `client123` | the self-serve client experience (their own data only) |
| Internal staff | `editor@aithreus.internal` | `editor123` | internal-only data + the content panel |
| Superadmin | `super@aithreus.internal` | `super123` | everything, incl. internal-only operators |

---

## The 10-minute tour

### 1. The story (public) — `/`
Open the landing page. One line: *Aithreus turns market data into calibrated probabilities and edges, then manages every affiliate link on every embedded widget from one place.* Click **Portfolio** to show the 2×2: VNX/TT × Terminal/Bot, with the key invariant — **terminals are read-only, bots execute**.

### 2. Log in → the workspace — `/admin`
Log in as **client@dimers.com**. The dashboard shows live KPIs and setup progress. Point out the **TT | VNX product switch** in the top bar — flip it and watch every screen re-scope to the other product line.

### 3. The flagship: Link CMS (this is the commercial heart)
Walk the four steps in the sidebar:
- **1 · Operators** — the affiliate-link source of truth. Toggle an operator's **Active** switch off — that's the global kill switch (we'll see it remove buttons in a second).
- **2 · Sites** — the client's domains; each has a unique `configId` and live counts.
- **3 · Edit links** — pick *dimers.com*. The **Odds Comparison Table** is multi-CTA, so it shows **one row per operator**. Note **INHERITED** vs **CUSTOM** badges; type a URL to override, hit **Reset** to inherit again.
- **4 · Embed code** — the copy-paste snippet. *"Paste once; links update from here forever."*
- **Widget gallery** — every widget previewed with the client's live operator buttons (in each operator's brand color).
- **Performance** — views / clicks / CTR / conversions / revenue, a time-series, and a per-operator breakdown. Export CSV.

### 4. ⭐ The headline: change a link without re-embedding
This is the demo that sells the product. Open two tabs:
1. **Tab A:** `http://localhost:3000/demo/client-site` — a mock external betting article with two embedded widgets. Note a CTA, e.g. **"Bet on FanDuel."**
2. **Tab B:** the CMS → **Operators** → toggle **FanDuel** off (or change its URL). Then click **Publish to live widgets** (bottom bar) and confirm the diff.
3. Back to **Tab A** → **reload**. The FanDuel button is gone — **with zero changes to the embed code and no redeploy.**

That loop — edit in the CMS, publish, live on the client's site — is the whole value proposition, and it's real.

### 5. The product story (presentation layer)
From the top nav: **Portfolio → a product** (e.g. VNX-Terminal) → what it does, modules, integrations, status, changelog. Then **Platform** (the shared calibration engine), **Integrations** (the same operators, shown as integrations), **Status** (read-only health bars), **Docs**.

### 6. It's a CMS (content panel + audit) — log in as internal
Log in as **editor@aithreus.internal**. Go to **Content panel** (only internal staff see it). Edit a product's tagline → Save → open that product page → the change is live. Then open **Audit log** — your edit (and every publish) is recorded with who and when.

### 7. Roles & visibility (optional)
Log in as **super@aithreus.internal** and open **Integrations** — you'll see **Stake.com**, which is internal-only and hidden from affiliate clients. Log back in as the client to confirm it's gone. Same rule keeps clients from seeing each other's sites and data.

---

## What to emphasize to a stakeholder
- **One unified property:** a marketing/product site **and** the affiliate Link CMS, one design system, one auth, one data model.
- **The no-redeploy loop is real** (step 4) — this is what unblocks selling widgets to operators.
- **Operator ≡ Integration:** the integrations powering our terminals are the same operators clients promote — modeled once.
- **Full-stack functional now, production-ready seams:** in-memory store today, Postgres/Drizzle behind the same interface next; AWS eu-west-1; analytics pipeline (clicks → redirect → events → dashboard) already wired.

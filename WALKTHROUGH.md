# Aithreus — Product Walkthrough

*A guided, plain-English tour of the live demo, from login to finish. No technical background needed.*

**Live demo:** https://aithreus-cms.vercel.app

---

## What you're looking at

Aithreus is a platform with two sides that work together:

1. **The public product site** — how Aithreus presents its products (the sports and prediction-market "terminals" and "bots") to the outside world.
2. **The Link CMS** — the heart of this demo. It lets a partner (for example, a sports-media website like **Dimers**) manage the **"Bet now" buttons** that appear inside widgets embedded on their website — and change where those buttons send people, **instantly, without touching their website's code**.

> **The one idea to remember:** A partner pastes a small snippet onto their website **once**. From then on, everything about the betting buttons — which sportsbooks appear, the partner's personal tracking links, turning a book on or off — is controlled from this dashboard. They click **Publish**, and their live website updates within seconds. They never call a developer again.

Everything in this demo is populated with realistic **sample data** so you can click through a complete, working product. (The sample partner is "Dimers," the sportsbooks are DraftKings, FanDuel, etc., and the sample article is a "Lakers vs Celtics" preview.)

---

## How to log in

Go to **https://aithreus-cms.vercel.app** and click **Log in**. The login screen lists three demo accounts you can click to use. For this walkthrough, **start as the partner ("Dimers")**:

| Use this | Email | Password | What they see |
|---|---|---|---|
| **Start here (partner view)** | `client@dimers.com` | `client123` | Only Dimers' own data — their links, sites, and performance |
| Internal admin | `super@aithreus.internal` | `super123` | Everything across all partners + internal tools |
| Internal editor | `editor@aithreus.internal` | `editor123` | The content tools for the public product site |

---

## Part 1 — The partner experience (log in as Dimers)

### 1. The workspace at a glance

After logging in you land on the **Dashboard**. A few things to notice:

- **Top-right "TT / VNX" switch** — Aithreus runs two business lines. **TT = Sports** (sportsbooks like DraftKings and FanDuel) and **VNX = Prediction Markets** (platforms like Polymarket and Kalshi). Flipping this switch re-scopes the entire dashboard to that line of business. We'll stay on **TT (Sports)**.
- **Left sidebar** — the workflow, laid out as four numbered steps (Operators → Sites → Edit links → Embed code), plus a Widget Gallery and Performance.
- **Dashboard cards** — a quick summary: how many betting platforms are set up, how many are active, how many websites, and how many widgets are live.

### 2. Setup guide

Click **Setup guide**. This is the "getting started" checklist that walks a new partner through the four steps to go live. Every step shows a green check when complete. It's the friendly on-ramp; the real work happens in the four numbered screens below.

### 3. Step 1 — Operators (the headline feature)

Click **1 · Operators**. **This is the most important screen in the demo.**

This is where the partner lists every betting platform they promote and — crucially — **pastes their own affiliate/tracking link for each one.** An affiliate link is the special URL that tells the sportsbook "this customer came from Dimers," so Dimers gets paid.

In the demo you'll see Dimers has set up:

- **DraftKings, FanDuel, BetMGM, Caesars, Pinnacle** — each with Dimers' own tracking link (you'll see `...?b=dimers-7741` in the URL) and an **Active** switch turned on.
- **BetRivers** and **The Odds API** — present but switched off ("catalog off").

What the partner can do here:

- **Type a new tracking link** into any platform's box — it saves automatically, and a small "saved" confirmation appears.
- **Flip the Active switch** off — this is a **kill switch**. If a partner's deal with a sportsbook ends, they turn it off and that book's button disappears from every widget on their site (after they Publish).

> **Why this matters:** Every partner sets *their own* links here. Dimers' DraftKings link is completely separate from any other partner's DraftKings link. One partner can never see or affect another's links. This is the new capability we built — modeled on how sites like dimers.com handle affiliate links.

### 4. Step 2 — Sites

Click **2 · Sites**. A "site" is a website where the partner embeds Aithreus widgets. Dimers has one: **dimers.com**, marked **live**. The card shows how many pages, links, and custom overrides it has, with shortcuts to edit its links or grab its embed code.

### 5. Step 3 — Edit links (fine-tuning)

Click **3 · Edit links**. Most partners never need this, but it's powerful: it lets them **override** a link for one specific widget. 

Each betting platform shows a badge:
- **INHERITED** — this widget uses the default tracking link from Step 1.
- **CUSTOM** — this widget uses a special one-off link (in the demo, DraftKings is set to a custom link just for the odds table, e.g. for a specific campaign).

They can type a custom link, or click **Reset** to go back to the default. It's the "exception handling" screen.

### 6. Step 4 — Embed code

Click **4 · Embed code**. This is the snippet a partner copies and pastes onto their website **one time**, per widget. Each widget (Odds Comparison Table, Probability Widget, Line Movement Chart) has its own copy-paste block and a **Copy** button.

> The important promise, stated right on the screen: *"Paste once per widget. After that, every link change in the CMS pushes live after Publish — no redeploy."*

### 7. Widget Gallery — see the widgets

Click **Widget gallery**. This previews every widget type with the partner's live setup:

- **Probability Widget** — a single matchup's win probability and "edge."
- **Line Movement Chart** — how a betting line moved over time.
- **Injury Impact Ticker** — injury news with modeled impact.
- **Odds Comparison Table** — the best price across every sportsbook, with **one "Bet on..." button per book**.
- **Player Projection Suite** — player props vs model projections.

Notice the buttons are color-matched to each sportsbook's brand. If you go back to Step 1 and turn a platform off, then return here, its button disappears from the previews — a quick way to see the kill switch in action.

### 8. Performance — the results

Click **Performance**. This is the partner's analytics dashboard with realistic sample numbers:

- **Headline numbers:** Views, Clicks, Click-through rate, Conversions, and Estimated revenue (~$7,370 in the demo).
- **A trend chart** over the last 14 days (Views, Clicks, Conversions).
- **A per-sportsbook breakdown table** — how each book performed (views, clicks, conversions, estimated revenue), with an **Export CSV** button.

This answers the partner's core question: *"Which sportsbooks are actually making me money?"*

---

## Part 2 — The "magic moment" (the live update loop)

This is the demo's centerpiece — worth doing live in front of an audience.

1. **Open the sample partner website:** https://aithreus-cms.vercel.app/demo/client-site
   This is a mock Dimers article, *"Lakers vs Celtics: where the edge is tonight."* It contains an **embedded odds table and probability widget** with live "Bet on..." buttons. This page is intentionally "dumb" — it only contains the one-time snippet; it has no idea which sportsbooks or links it's showing.

2. **Now make a change in the CMS.** Go back to **Step 1 · Operators**, and either:
   - turn a sportsbook **off** (e.g. FanDuel), or
   - **edit a tracking link**.

3. **Click "Publish to live widgets"** (bottom-right of the dashboard) and confirm.

4. **Reload the sample article.** The change is already there — FanDuel's button is gone, or the link now points to the new destination — **with no change to the article's code.**

> That's the whole pitch in 30 seconds: **the partner controls their live betting buttons from a dashboard, in real time, forever — without ever touching their website again.** Behind the scenes, every button click is also tracked (it routes through Aithreus, records the click, then forwards the visitor to the sportsbook), which is what powers the Performance screen.

---

## Part 3 — The internal view (log out, then log in as the admin)

Log out and log back in as **`super@aithreus.internal` / `super123`**. This is the Aithreus team's own view. Two things to show:

### Content panel
Click **Content panel** (under "Content" in the sidebar). This is where the Aithreus team edits the **public product marketing** — the four products and their descriptions:

- **TT-Bot** *(Beta)* — calibrated sports predictions with automated bet sizing and execution.
- **TT-Terminal** *(Live)* — multi-sportsbook edge discovery anchored to a sharp reference line.
- **VNX-Bot** *(Live)* — autonomous trading on Polymarket + Kalshi.
- **VNX-Terminal** *(Live)* — prediction-market analytics that finds an edge and links you out to trade it.

They can also manage **documentation pages** (e.g. "Calibration explained," "Getting started"). Edits here update the public-facing site.

### What "internal" sees that a partner doesn't
- The internal admin sees **all partners**, not just Dimers.
- They see **internal-only platforms** (e.g. a book reserved for internal use) that are hidden from partners.
- There's an **Audit log** recording who changed what — important for trust and accountability.

> This demonstrates the access model: partners see only their own data; the Aithreus team sees everything and controls the shared product catalog.

---

## What to take away

- **For a partner (Dimers):** a single dashboard to manage every "Bet now" button across their site, with their own tracking links, an on/off switch per sportsbook, real-time publishing, and clear performance analytics — never needing a developer after the first install.
- **For Aithreus:** a multi-partner platform where each partner is cleanly isolated, the product catalog is centrally managed, and the embeddable widgets are the distribution channel.
- **Everything in this demo is functional**, running on realistic sample data so you can experience the complete product end to end.

*See the companion document, "Live Implementation Plan," for what is real today versus what we'll build to take this from demo to production.*

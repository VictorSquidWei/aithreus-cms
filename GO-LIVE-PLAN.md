# Aithreus — Live Implementation Plan

*From working demo to production. What is real today, what is still sample data, and the steps to take it live.*

**Companion to:** "Aithreus — Product Walkthrough" · **Live demo:** https://aithreus-cms.vercel.app

---

## The short version

The product you clicked through is **fully functional software**, not a mockup or a slideshow. The dashboard works, the publishing loop works, the embedded widgets work, and the analytics work. 

What makes it a *demo* is that it runs on **sample data** and is **not yet connected to the real, revenue-generating systems** — real affiliate deals, live odds/market feeds, and our own production terminals and bots. This document lays out exactly what's real, what's simulated, and the plan to close that gap.

---

## What is REAL today

| Capability | Status |
|---|---|
| The full Link CMS dashboard (Operators, Sites, Edit links, Embed code, Gallery, Performance) | ✅ Working |
| Per-partner affiliate links + per-sportsbook on/off kill switch | ✅ Working |
| The "edit → Publish → live widget updates with no redeploy" loop | ✅ Working end-to-end |
| Embeddable widgets that render on any external website | ✅ Working |
| Click tracking + redirect to the sportsbook | ✅ Working |
| Multi-partner data isolation (each partner sees only their own data) | ✅ Working |
| Three roles (internal admin, internal editor, partner) with proper access control | ✅ Working |
| Public product-marketing site + content editing tools | ✅ Working |

## What is SAMPLE DATA / not yet connected

| Area | Today (demo) | Needs to become |
|---|---|---|
| **Sportsbooks & affiliate deals** | Made-up books with placeholder links (`dimers-7741`) | Our real signed affiliate partners with their real tracking links |
| **Odds & market data inside widgets** | Static sample numbers ("Lakers vs Celtics", 58%) | Live feeds of real odds / prediction-market prices |
| **The terminals & bots** (TT-Terminal, TT-Bot, VNX-Terminal, VNX-Bot) | Described on the marketing site; not wired into the live data path | Connected to the production engines as they finish |
| **Partner accounts** | Three demo logins shown on the screen | Real partner accounts with secure sign-in |
| **Analytics numbers** | Generated sample traffic (14 days) | Real impressions, clicks, and conversions from live traffic |
| **Hosting & storage** | Free demo hosting; data resets on its own | Production hosting + a permanent database |

---

## The plan: five workstreams to go live

These can largely run in parallel. Each is described in plain terms first, with the technical specifics noted for the engineering team.

### 1. Production foundation (hosting + permanent database)
**Goal:** move from the throwaway demo to a stable, always-on home where data is saved permanently.

- **Plain version:** Right now the demo "forgets" changes when it goes idle, because there's no permanent database attached. We stand up real hosting and a real database so every change is saved and shared.
- **Good news:** the software is *already built to support this* — it switches to a permanent database automatically once one is connected. No rewrite needed.
- **Technical:** deploy to **AWS (Amplify Hosting, eu-west-1)** or keep Vercel; attach **Postgres (RDS/Neon)** by setting `DATABASE_URL`; serve the widget file from a CDN (S3 + CloudFront). *(All documented in the engineering handoff.)*
- **Effort:** small — this is configuration, not new development.

### 2. Real affiliate partners & tracking links
**Goal:** replace the sample sportsbooks with our actual signed deals.

- **Plain version:** Swap the placeholder books and links for the real sportsbooks we have affiliate agreements with, each with the correct tracking link, so clicks actually earn revenue.
- **Technical:** import operators from our real affiliate/API-key registry instead of the demo seed; validate each tracking link; confirm conversions post back correctly (the conversion-tracking endpoint exists as a stub today and needs each partner's secret + validation).
- **Dependency:** signed affiliate agreements must be in place.

### 3. Connect the terminals, bots & live data
**Goal:** make the widgets show *real* numbers and tie the platform to our production engines.

- **Plain version:** The widgets currently show illustrative figures. We connect them to live odds and prediction-market data so the probabilities, lines, and prices are real and current. As **TT-Terminal, TT-Bot, VNX-Terminal, and VNX-Bot** finish hardening for production, we wire their outputs into the same widgets and product pages.
- **Technical:** feed live market data into the widget runtime (either fetched by the widget or included in the published config); integrate the terminal/bot engines via their APIs as each reaches production readiness.
- **Note:** this is the workstream most dependent on the terminals/bots themselves being production-ready, which is in progress.

### 4. Real partner accounts & secure sign-in
**Goal:** replace the three visible demo logins with proper, secure partner accounts.

- **Plain version:** Today anyone can use the demo logins printed on the screen. For launch, each partner gets their own secure account, and we remove the demo ones.
- **Technical:** swap the demo login for a real identity provider / single sign-on (e.g. Auth.js or Clerk), map partner identities to the right access level and partner record, and set production security keys. A partner onboarding flow (invite → set up links → embed → publish) sits on top.

### 5. Analytics, compliance & launch hardening
**Goal:** make the numbers production-grade and the platform compliant and safe.

- **Plain version:** Make the analytics handle real traffic volume, and put the legal/compliance guardrails in place that the betting space requires before we point real users at it.
- **Technical:** move analytics to a scalable pipeline (e.g. ClickHouse) for real volume; add config caching for speed at scale; review responsible-gambling, geo/state targeting, and data-handling requirements; finalize CORS and security review on the public widget endpoints.

---

## Suggested sequencing

1. **First:** Production foundation (1) — gives us a permanent, shareable, always-on environment. *(Fast.)*
2. **In parallel:** Real partners & links (2) and Real accounts (4) — these make it a genuine product for a first partner.
3. **As engines finish:** Terminals, bots & live data (3) — the biggest external dependency.
4. **Before public launch:** Analytics, compliance & hardening (5).
5. **Pilot:** launch with **one** partner (a real "Dimers"), prove the loop end-to-end with real revenue, then scale to more partners.

> **Bottom line:** the hard part — a working, multi-partner, real-time link-management platform with embeddable widgets and analytics — **is already built and demonstrable today.** The remaining work is connecting it to real partners, real data, and our production terminals/bots, plus standard production hardening. Most of it is integration and configuration rather than building from scratch.

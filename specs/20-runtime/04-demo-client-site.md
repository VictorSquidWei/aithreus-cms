# 20.04 — Demo client site (the §9.14 proof)

| | |
|---|---|
| **Spec ID** | `20-runtime/04-demo-client-site` |
| **Status** | approved |
| **Traces to** | Report §6.4, §9.14 |

## 1. Purpose & scope
`/demo/client-site` — a fake affiliate page (styled unlike the app, to read as an external site) that embeds real widgets via the **real snippet**, proving the no-redeploy loop end-to-end.

## 2. Requirements
- Public route. Renders a generic "client" page that pastes the actual snippet for the demo site (`configId = site_dimers_tt`) — at least one **multi-CTA** widget (Odds Comparison Table) so multiple operator CTAs render.
- Loads `/widget/v1/embed.js`; the widget renders into the page via Shadow DOM with no shared styling.
- A short caption explaining this is an external page using only the pasted snippet.

## 3. The loop (acceptance §9.14)
1. Visit `/demo/client-site` → operator CTAs render (e.g. "Bet on FanDuel").
2. In the CMS: toggle an operator off (or change its URL/label) → **Publish**.
3. Reload `/demo/client-site` → the CTA updates (e.g. FanDuel gone) — **with the embed code unchanged**.
Driven by Playwright as an automated check (`phase4.spec.ts`).

## 4. Acceptance
- `data-testid` on the demo container; CTAs discoverable across the open Shadow DOM.
- The loop passes in CI/local Playwright.

## 5. Non-goals
A real third-party domain; multiple demo personas (one is enough to prove the loop).

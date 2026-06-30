# 10.09 — Per-client affiliate links (Step 1, revised)

| | |
|---|---|
| **Spec ID** | `10-link-cms/09-affiliate-links` |
| **Status** | approved |
| **Date** | 2026-06-23 |
| **Traces to** | CMS-2 §4 (Step 1 — "Affiliate URL: the actual link with their tracking ID"); Report §4.3, §4.6; Handoff §5; real-world: dimers.com publisher model |

---

## 1. Purpose & scope
Each **client login** sets **their own affiliate link per platform** (FanDuel, DraftKings, Kalshi, Polymarket, …). That per-client link is the default a client's widgets resolve to — exactly how an affiliate publisher (e.g. Dimers) configures their own book/operator deals. This revises Step 1 (Operators) from editing a shared catalog URL to managing **the logged-in client's affiliate links**.

> **Model refinement (supersedes the global-URL reading of Report §4.6).** The original prototype treated `Operator.affiliateUrl` + `Operator.active` as global (single-tenant). CMS-2 §4 Step 1 is explicit that **each client** adds operators **with their own tracking URL**, and §9.2 requires clients not to see/affect each other's data. So affiliate URL + the per-operator on/off move to a **per-client** record. `Operator` remains the shared **catalog** (the list of available platforms + branding + integration facets). This is the multi-tenant-correct model and matches the Dimers publisher pattern.

## 2. Data model
New entity (see `02-data-model §3.3a`):
```
AffiliateLink                  // one per (client, operator)
  id
  clientId   -> Client
  operatorId -> Operator        // a catalog operator in the client's vertical
  affiliateUrl                   // the client's link, with their tracking ID
  active     (bool)              // the client's per-operator on/off (kill switch)
  // uniqueness: at most one row per (clientId, operatorId)
```
`Operator` is unchanged structurally but is now the **catalog** (name, slug, buttonLabel, brandColor, category/role/authType/integrationStatus, internalOnly, estPayout, and `affiliateUrl` as a **house/seed default**, not the per-client link). `Operator.active` becomes a catalog-availability flag (internal), no longer the per-client kill switch.

## 3. Resolution chain (revised — supersedes §04-edit-links §2 ordering)
For a CTA slot `(site, widgetInstance, operator)` where the site belongs to client **C**:
1. operator not in the vertical catalog, or `internalOnly` (for non-internal readers) → excluded.
2. **C has no `AffiliateLink` for the operator, or `AffiliateLink.active === false`** → **render no CTA** (the client hasn't enabled this platform — the per-client kill switch).
3. else a site/widget `LinkOverride` exists → **CUSTOM** (override URL).
4. else → **INHERITED** = the client's `AffiliateLink.affiliateUrl`.

Eligible operators for a client = catalog operators (vertical, non-internalOnly) that C has an **active** `AffiliateLink` for. Single-CTA widget → first eligible; multi-CTA → one slot per eligible operator (still fully data-driven). The CTA `href` remains the tracking redirect `/r/...`; the redirect resolves the real URL from the published snapshot.

## 4. Step 1 · Operators screen (revised)
- Lists the **catalog operators for the active vertical** (non-internalOnly for clients; internal roles also see internalOnly).
- Per operator row: platform name + brand swatch (read-only, from catalog) · **"Your affiliate URL"** (inline editable, save on blur) · **Active** toggle (the client's per-operator on/off) · a "configured / not set" indicator.
- Editing the URL **upserts** the client's `AffiliateLink` (defaults `active=true` on first save); the toggle flips `active`. An operator with no link / inactive renders no CTA anywhere for that client.
- Inline help: "Set the affiliate link (with your tracking ID) for each platform you promote. Every widget uses these unless overridden in Step 3."
- A **"+ Add platform"** affordance adds a new operator to the vertical catalog (kept for extensibility; primarily internal — production wires the API-key registry, `INTEGRATION.md §2`).
- Validation: valid http(s) URL.
- Auto-save (toast); not live until Publish.

## 5. Data / API (server actions)
```
upsertAffiliateLinkAction(operatorId, affiliateUrl)   // create/update the client's link (active defaults true)
setAffiliateLinkActiveAction(operatorId, active)      // client's per-operator kill switch
// (catalog) createOperatorAction stays for adding a platform to the vertical catalog
```
All scoped to the viewer's `clientId`; auto-save + revalidate.

## 6. Store
`listAffiliateLinks(clientId, verticalKey)`, `getAffiliateLink(clientId, operatorId)`, `upsertAffiliateLink(clientId, operatorId, url)`, `setAffiliateLinkActive(clientId, operatorId, active)`. Implemented on the `DataStore` interface + both backends; resolution receives the client's links as plain data (pure functions).

**Integrity (audited):**
- The `(clientId, operatorId)` pair is the link's identity — at most one row (data-model §3.3a). Enforced by a DB unique constraint (`affiliate_links_client_operator_unique`); the Drizzle upsert is `INSERT … ON CONFLICT DO UPDATE`, so concurrent saves can never create duplicate rows that would race resolution's last-writer-wins map.
- `upsertAffiliateLink` is the only create path and **always** requires a client-supplied URL (active defaults true). `setAffiliateLinkActive` flips the flag on an **existing** link only — it never mints one, so toggling an unconfigured operator can't silently publish a CTA pointing at the catalog house URL. The toggle is disabled in the UI until a URL is set ("Set a tracking link first").

## 7. UI states
- **Loading:** table skeleton. **Empty catalog:** "No platforms yet" (won't happen with seed).
- **Not-set operator:** empty URL field, inactive toggle, muted "not set" hint.
- **Error:** inline invalid-URL; toast on save failure. **Success:** toast; CTA appears/disappears in Gallery/runtime after publish.

## 8. Acceptance
1. A client sets their own affiliate URL per platform; it persists per client and is **not visible to or shared with other clients** (Dimers' FanDuel link ≠ Catena's).
2. Setting/changing a client's affiliate link changes that client's widget CTAs (after Publish) — verified via the gallery + the §9.14 demo loop.
3. The client's per-operator **Active** toggle removes/restores that operator's CTA everywhere for that client (the kill switch).
4. Operators a client hasn't configured render no CTA for that client.
5. Site/widget overrides (Step 3, CUSTOM) still win over the client's affiliate link.
6. `data-testid`: `operators-table`, `operator-row-<id>`, `affiliate-url-<operatorId>`, `operator-active-<operatorId>`.

## 9. Non-goals
Per-client custom branding/labels (label/color stay catalog-level — Phase 2); deal/commission terms; multi-user-per-client editing (Phase-2 RBAC). The data model leaves room (a per-client label could later live on `AffiliateLink`).

**Phase-2 seams observed on Dimers (research):** (a) **geo/state-based operator visibility** — which books surface varies by jurisdiction; (b) **per-operator promo-offer CTAs** — a separate "Featured offers / Claim Now" module with bonus copy ("Bet $5, Get $200…", "T&Cs apply"), distinct from the odds CTA; (c) a **"best odds + Compare (N)"** featured-book pattern. The per-client affiliate link built here is the foundation these layer on (each would add fields/tables, not change the link model). Confirmed: Dimers injects the publisher's outbound affiliate link **client-side at click time** — the same model as our `embed.js` → `/r/...` tracking redirect.

## 10. Traceability
CMS-2 §4 Step 1 (client's own affiliate URL) · Report §4.3 (Operator), §4.6 (resolution, here refined per-client) · §9.2 (client isolation) · Handoff §5 (integration catalog).

# 02 — Data Model

| | |
|---|---|
| **Spec ID** | `00-product/02-data-model` |
| **Status** | approved |
| **Altitude** | System |
| **Date** | 2026-06-21 |
| **Traces to** | Report §4 (authoritative — supersedes Handoff §6 & CMS-2 §6); §4.6–§4.10 |

---

## 1. Purpose & scope

The single schema that satisfies **both** source documents. Shapes are **storage-agnostic**: they define the `DataStore` interface (`01-architecture` D4) and map 1:1 to Drizzle tables in Phase 7. PKs are `id` (uuid v4 string) unless noted. `createdAt`/`updatedAt` only where they earn their place (publish, audit, analytics). Field notation is TS-ish; `-> X` = FK relation.

The **resolution algorithm** that walks this model is specified in `10-link-cms/04-edit-links` (Report §4.6); this spec defines the data it walks.

## 2. Entity-relationship overview

```
Client 1─* User                         Vertical 1─* Operator
Client 1─* Site                         Vertical 1─* WidgetType
Vertical 1─* Site                       Vertical 1─* Product
Site 1─* WidgetInstance ─* WidgetType   Product 1─* Module / Strategy / Tier / Changelog
Site 1─* LinkOverride                    Product *─* Operator (read as "Integration", via verticalId)
(Site,WidgetInstance,Operator) 1─0..1 LinkOverride   ← the override unit
Site 1─* PublishedConfig (latest = live)            ← Publish output (D5)
Event *─ (Site, WidgetInstance, Operator, Vertical) ← analytics
```

## 3. Tables

### 3.1 Tenancy & identity (Report §4.1)
```
Client   { id; name; type: 'affiliate'|'internal'; status: 'active'|'paused' }
User     { id; clientId->Client; email (unique); passwordHash; role: 'superadmin'|'internal_editor'|'affiliate_client'; name }
Session  // managed by Auth.js: token + expiry + userId
```
> CMS-2 v1 = "one login per client"; we keep `User`+roles so the prototype can demo internal-admin vs affiliate-client views. RBAC beyond the 3 roles = Phase 2.

### 3.2 Product switch (Report §4.2)
```
Vertical { id; key: 'TT'|'VNX'; name; domain: 'sports'|'prediction_markets'; description }
```
Everything below is **scoped by `verticalId`** so the product switch filters operators, widgets, sites, overrides, analytics.

### 3.3 Operator ≡ Integration (Report §4.3 — modeled once, two readers)
```
Operator {
  id; verticalId->Vertical; name; slug;
  // --- Link CMS facet (CMS-2 Step 1) ---
  buttonLabel; brandColor (hex); affiliateUrl (DEFAULT in resolution chain); active (bool);
  // --- Integration facet (Handoff §5, rendered on product site) ---
  category: 'data'|'execution'|'odds'|'reference'|'econ'|'weather'|'notification'|'metrics';
  role; authType: 'EIP-712/HMAC'|'RSA-PSS'|'apiKey'|'none'|...;
  integrationStatus: 'live'|'beta'|'planned';
  internalOnly (bool);                 // e.g. Stake.com — never shown publicly/in widgets
  estPayout (number, optional);        // synthetic est-revenue-per-conversion for the dashboard
  logoAssetId->MediaAsset (nullable);  // Phase-2 branding seam
}
```
- **Link CMS reads** `buttonLabel/brandColor/affiliateUrl/active`. **Product site reads** `name/category/role/authType/integrationStatus`.
- `active==false` → **no widget renders a CTA for this operator anywhere** (global kill switch, CMS-2 §3).
- `internalOnly==true` → filtered from all non-internal reads (§5).

### 3.3a AffiliateLink — per-client affiliate link (revised Step 1; see `10-link-cms/09-affiliate-links`)
```
AffiliateLink                     // one per (client, operator)
  id
  clientId   -> Client
  operatorId -> Operator           // a catalog operator in the client's vertical
  affiliateUrl                      // the client's link, with their tracking ID
  active     (bool)                 // the client's per-operator on/off (kill switch)
  // unique: at most one row per (clientId, operatorId)
```
> The `Operator` (§3.3) is the **shared catalog** (branding + integration facets + a house/seed `affiliateUrl` default + a catalog `active` availability flag). Each **client** sets their own affiliate URL + on/off here. This is the multi-tenant-correct refinement of the original global model (CMS-2 §4 Step 1; §9.2 client isolation). **Resolution default becomes the client's `AffiliateLink.affiliateUrl`** (then site/widget `LinkOverride` still wins) — full chain in `10-link-cms/09-affiliate-links §3`.

### 3.4 Site & embed (Report §4.4)
```
Site {
  id; clientId->Client; verticalId->Vertical;
  domain; status: 'live'|'draft';
  configId (unique);                  // baked into embed snippets; runtime loads config by this
  lastPublishedAt (nullable);
  // counts (#pages, #links/instances, #overrides) are COMPUTED live, never stored
}
```

### 3.5 Widget catalog & instances (Report §4.5)
```
WidgetType {
  id; verticalId->Vertical; key; name; description;
  ctaMode: 'single'|'multi';
  ctaRendering: 'fixed_slot'|'per_row'|'per_market';
  sampleDataJson (json);              // Gallery + embed.js preview data
  thumbnailAssetId->MediaAsset (nullable);   // placeholder for now
}
WidgetInstance {
  id; siteId->Site; widgetTypeId->WidgetType;
  // page-scoping column reserved (Phase 2); v1 stops at site level
}
```
**Catalog seed (must ship):**
- **TT (sports):** `probability_widget` (single), `line_movement_chart` (single), `injury_impact_ticker` (single), `odds_comparison_table` (multi/per_row — the canonical 100+-book multi-CTA example), `player_projection_suite` (multi/per_row).
- **VNX (prediction markets):** `whale_tracker` (multi — CTAs across every operator a whale touches), `probability_widget_vnx` (single), `odds_comparison_table_vnx` (multi/per_row).
- Model must scale to TT=19 / VNX=34 widgets with **no schema change**; prototype ships ~4–6 per vertical.

### 3.6 Overrides (Report §4.6)
```
LinkOverride {
  id; siteId->Site; widgetInstanceId->WidgetInstance; operatorId->Operator;
  affiliateUrl;                       // the overriding URL
  // scheduledStart/End reserved (Phase 2); page-scope reserved (Phase 2)
}
```
- Uniqueness: at most **one** row per `(siteId, widgetInstanceId, operatorId)`.
- **Presence = CUSTOM; absence = INHERITED.** Reset = delete the row.

### 3.7 Published config (D5 — the runtime's source of truth)
```
PublishedConfig {
  id; siteId->Site; configId (indexed); verticalKey;
  payloadJson (json);                 // fully-resolved config the runtime serves (see 20-runtime/01)
  version (int, increments per publish);   // drives "last published" + cache key
  publishedByUserId->User; publishedAt;
}
```
The config endpoint reads the **latest** `PublishedConfig` for a `configId`. Working-table edits are invisible to the runtime until Publish writes a new snapshot (`08-publish-workflow`).

### 3.8 Analytics (Report §6.3; §3.1)
```
Event {
  id; type: 'impression'|'click'|'conversion';
  configId; siteId->Site; widgetInstanceId->WidgetInstance; operatorId->Operator; verticalId->Vertical;
  ts; anonId; ua (nullable); referer (nullable); meta (json, nullable);   // meta.value for conversion revenue
}
```
Rollups (views, not stored tables): group by `site × widget × operator × day`; `CTR = clicks/impressions`; `estRevenue = Σ conversions × operator.estPayout`. Prototype seeds synthetic events **and** appends live ones (Report §5.6).

### 3.9 Presentation content (Report §4.8 — Layer A)
```
Product    { id; verticalId->Vertical; name; type:'terminal'|'bot'; executes(bool); holdsFunds(bool);
             holdsCredentials(bool); tagline; whatItDoes(richtext); status:'live'|'beta'|'planned'; heroAssetId->MediaAsset }
Module     { id; productId->Product; name; summary; category:'data'|'signal'|'calibration'|'execution'|'risk'|'health'|'alerting'|'ui'; detail(richtext); internalOnly(bool) }
Strategy   { id; productId->Product; name; description; venue; status }
Tier       { id; productId->Product; name; featureFlags: string[] }     // no prices
Page       { id; slug (unique); title; blocks(json) }
Changelog  { id; productId->Product; date; version; notes(richtext) }
StatusFeed { id; productId->Product; metricKey; value; updatedAt }      // read-only telemetry surface
MediaAsset { id; url; type; alt }
```
**Seed all four products** (Report §3 / Handoff §3): `VNX-Terminal` (terminal, executes:false), `VNX-Bot` (bot, executes:true), `TT-Terminal` (terminal, executes:false), `TT-Bot` (bot, executes:true), with modules/strategies. **TT-Bot venue-handling modules = `internalOnly:true`.**

## 4. Resolution data dependency

For each `(site, widgetInstance, operator)` CTA slot the resolver uses: `Operator.active`, `LinkOverride` (presence/url), `Operator.affiliateUrl`. Algorithm + per-CTA-mode iteration → `10-link-cms/04-edit-links` (Report §4.6).

## 5. Visibility / filtering rules (Report §4.9 — enforced in `server/visibility.ts` on every read)

1. `internalOnly==true` (Operators, Modules) → returned **only** to `superadmin` / `internal_editor`. Never to `affiliate_client`, public site, widget config, or runtime.
2. `Operator.active==false` → excluded from all widget config & CTA rendering, but **still visible/editable** in the Link CMS admin.
3. Draft `Site` / unpublished content → visible in admin, excluded from live widget config until **Publish**.
4. `affiliate_client` users → scoped to **their own `clientId`** only.
5. Public (unauth) → curated landing + portfolio only.

## 6. Phase-2 seams preserved (Report §4.10 — present but unbuilt)

`Operator.logoAssetId` (custom branding); page-scope columns on `WidgetInstance`/`LinkOverride` (page-level overrides); `LinkOverride.scheduledStart/End` (scheduled changes); `WidgetType` is composition-friendly (Widget Builder); roles already modeled (RBAC); export endpoints documented (bulk import/export).

## 7. Seed plan (Report §10.1 — `/seed`)

- 2 verticals (TT, VNX).
- ≥1 affiliate `Client` (e.g. Dimers) + 1 internal `Client`; **3 users** (one per role).
- Operators per vertical incl. **one `internalOnly`** (Stake.com under TT) and **one `active:false`**.
- Full **widget catalog** (§3.5).
- ≥2 `Site`s, several `WidgetInstance`s, a few `LinkOverride`s (so INHERITED/CUSTOM both appear).
- 4 `Product`s + modules/strategies (TT-Bot venue modules `internalOnly`).
- Synthetic `Event`s across site×widget×operator×time so dashboards are populated.
- Idempotent `syncOperatorsFromRegistry()` reads `/seed/operators.json` (Report §4.7).

## 8. UI states

N/A (data spec). Note: Site card counts (§3.4) and all rollups (§3.8) are **computed**, so their empty/loading states are owned by `03-sites` and `07-performance`.

## 9. Acceptance criteria

1. Schema expresses every entity in Report §4 with the field lists above; one `Operator` table serves both readers.
2. `DataStore` interface exposes CRUD for all working tables + resolution inputs + event append + rollup reads, with **no leakage of the storage impl** to callers.
3. Seed produces the §7 dataset; switching `verticalId` yields disjoint operator/widget/site/analytics sets (supports §9.3).
4. Visibility rules (§5) are enforced centrally, not per-screen.
5. `PublishedConfig` round-trips a resolved payload that the config endpoint can serve verbatim.

## 10. Non-goals

No pricing fields (tiers = flags). No ClickHouse schema. No multi-tenant sharding. No soft-delete/versioning beyond `PublishedConfig.version` and content `updatedAt`.

## 11. Open questions

- **OQ — est-revenue model.** Prototype uses `Operator.estPayout × conversions`. Confirm a per-operator default set in the fixture is acceptable vs a single global constant. *(Default: per-operator in fixture; non-blocking.)*

## 12. Traceability

| Content | Source |
|---|---|
| All tables/fields | Report §4.1–§4.8 |
| Operator≡Integration single table | Report §4.3, §1 |
| Resolution inputs | Report §4.6 |
| Visibility rules | Report §4.9 |
| Phase-2 seams | Report §4.10 |
| `PublishedConfig` (snapshot) | Derived from Report §5.7/§6.1 (D5) |
| `Event`/rollups | Report §6.3, §3.1 |
| Seed plan | Report §10.1 |

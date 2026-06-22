# 10.03 — Step 2: Sites

| | |
|---|---|
| **Spec ID** | `10-link-cms/03-sites` |
| **Status** | approved |
| **Traces to** | Report §5.2; CMS-2 §4 (Step 2); §4.4 |

## 1. Purpose & scope
Manage the client's sites (domains that embed widgets). Full CRUD. Each site owns a unique `configId` baked into embed snippets and loaded by the runtime.

## 2. Requirements (Report §5.2)
- **List of site cards**, each showing **live counts**: pages · links (widget instances) · overrides (computed, not stored — §4.4).
- Card also shows: domain, status (live/draft) pill, the `configId` (mono, copyable), last-published timestamp.
- **Create/Edit:** Domain, Live/draft status. On create, **auto-generate a unique `configId`** and display it.
- Caption per card: "Embeds {vertical} widgets."
- **Client scoping:** `affiliate_client` sees only its own client's sites; internal roles see all (§4.9). Each site is created under the viewer's client.
- Quick links from a card to Edit links / Embed for that site.

## 3. Data / API
```
createSite({ domain, status })   // auto configId; clientId from viewer; verticalId from active vertical
updateSite(id, { domain, status })
deleteSite(id)                    // cascades widget instances + overrides
siteCounts(id) -> { pages, links, overrides }   // computed
```

## 4. UI states
- **Loading:** card skeletons.
- **Empty:** "No sites yet — add the first domain you'll embed on."
- **Error:** inline (duplicate/invalid domain); toast on failure.
- **Success:** toast; new card appears with its `configId`.

## 5. Acceptance (Report §9.5)
1. Full CRUD on sites.
2. Each card shows live pages/links/overrides counts.
3. `configId` auto-generated on create and shown.
4. Client scoping enforced (Dimers can't see Catena's sites).
5. `data-testid`: `sites-list`, `site-card-<id>`, `site-configid-<id>`, `site-new`, `site-form`, `site-save`, `site-delete-<id>`.

## 6. Non-goals
Per-page management (page-level is Phase 2; v1 is site-level). DNS/verification.

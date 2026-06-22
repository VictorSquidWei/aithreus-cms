# 10.05 — Step 4: Embed code

| | |
|---|---|
| **Spec ID** | `10-link-cms/05-embed-code` |
| **Status** | approved |
| **Traces to** | Report §5.4, §6.2; CMS-2 §4 (Step 4) |

## 1. Purpose & scope
For each widget instance on a site, generate a copy-paste embed snippet. Paste once per instance; thereafter every link change pushes live after Publish — no redeploy.

## 2. Requirements (Report §5.4, §6.2)
- Site picker; lists every widget instance on the selected site.
- Per instance, an **`EmbedSnippetBox`** with the exact snippet:
  ```html
  <div class="aithreus-widget"
       data-config-id="{site.configId}"
       data-widget="{widgetInstanceId}"
       data-theme="dark"></div>
  <script src="{NEXT_PUBLIC_WIDGET_CDN_URL}" async></script>
  ```
- **One-click copy** (clipboard) with copied-confirmation.
- A note: "Paste once per widget instance; after that every link change in the CMS pushes live without redeploy."
- **"Test this embed"** action → opens the Widget Gallery preview rendered with this site's resolved config.

## 3. UI states
- **No sites:** route to Step 2. **No widgets on site:** "Add a widget from the Gallery."
- **Copy success:** button flips to "Copied".

## 4. Acceptance (Report §9.7)
1. Per-widget snippet generated with the correct `configId` + widget instance id.
2. Copy works.
3. `data-testid`: `embed-site-picker`, `embed-snippet-<wid>`, `embed-copy-<wid>`.

## 5. Non-goals
Theme/param builder UI (fixed `data-theme="dark"` for now); auto-insertion into client sites.

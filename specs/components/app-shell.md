# components/app-shell — AppShell (sidebar + top bar)

| | |
|---|---|
| **Spec ID** | `components/app-shell` |
| **Status** | approved |
| **Traces to** | Report §8.3; IA `04-information-architecture §4` |

## 1. Purpose & scope
The authenticated `/admin` chrome: a collapsible sidebar (nav sections) + a top bar (logo, **ProductSwitch**, ThemeToggle, user menu) + a sticky **PublishBar** footer slot. Wraps all admin screens.

## 2. Requirements
- **Sidebar** (per IA §4): SETUP (Dashboard, Setup guide), LINK CMS (1 Operators, 2 Sites, 3 Edit links, 4 Embed, Widget gallery, Performance), CONTENT (Content panel, Audit log — **internal roles only**). Active route highlighted with `--accent`. Sections collapsible; collapses to icons at narrow widths / 375px (drawer).
- **Top bar:** Wordmark (left), ProductSwitch (center/left of admin tools), ThemeToggle + user menu (right). User menu shows name/role + Sign out.
- **PublishBar** rendered as a sticky footer region (its own component, wired in Phase 3); AppShell provides the slot.
- **Role-aware nav:** `affiliate_client` does not see CONTENT section.
- Breadcrumbs region under the top bar (`Vertical › Section › Screen`).

## 3. API
```ts
<AppShell user={SessionClaims} vertical={'TT'|'VNX'}>{children}</AppShell>
```

## 4. States
- Sidebar expanded/collapsed (persist collapse in localStorage); mobile drawer (375px) toggled by a hamburger.
- Active link, hover, focus.
- Empty/first-run: dashboard surfaces setup CTAs (owned by `10-link-cms/00-overview`).

## 5. Acceptance
- Renders at 1280px (full sidebar) and 375px (drawer) with no overflow.
- Active route highlighted; CONTENT hidden for `affiliate_client`.
- ProductSwitch + ThemeToggle + user menu present and functional.
- `data-testid`: `app-sidebar`, `app-topbar`, `nav-<route>`, `user-menu`, `sidebar-toggle`.

## 6. Non-goals
Command palette, multi-level nested nav, customizable layout (later).

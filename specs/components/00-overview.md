# components/00 — Component conventions

| | |
|---|---|
| **Spec ID** | `components/00-overview` |
| **Status** | approved |
| **Traces to** | Report §8.2, §8.3 |

## 1. Purpose
Shared rules for every component spec. Component specs are lightweight and authored just-in-time before the component is built.

## 2. Conventions (apply to all components)
- **Tokens only.** Colors/spacing/typography come from the design system (`05-design-system`) via Tailwind token classes (`bg-surface-2`, `text-fg-muted`, `text-accent`, `font-mono`). No hard-coded hex except operator brand colors (which are data).
- **`data-testid`** on every interactive control and every meaningful display value (drives Playwright). Naming: `kebab-component-purpose` (e.g. `operator-row-active-toggle`).
- **States.** Each component declares its loading / empty / error / disabled states; default to skeleton (loading), guided empty state, inline error.
- **A11y.** Keyboard operable; visible focus ring (`--focus-ring`); semantic roles; `aria-*` on toggles/dialogs.
- **Server vs client.** Default to React Server Components; mark `"use client"` only when interactivity/state is needed.
- **Props are typed** with a small explicit interface; no `any`. Variants via a `variant`/`size` union, not boolean soup.
- **Responsive** at 1280px and 375px; no text overflow (truncate + title, or wrap).

## 3. Acceptance (per component)
Renders all declared states; testids present; matches tokens; responsive; keyboard-accessible.

## 4. Catalog
See `INDEX.md` → components section for the full list (Report §8.2). Each links its owning feature spec.

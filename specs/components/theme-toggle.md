# components/theme-toggle — ThemeToggle

| | |
|---|---|
| **Spec ID** | `components/theme-toggle` |
| **Status** | approved |
| **Traces to** | Report §8.3 (dark-mode first-class with a toggle) |

## 1. Purpose & scope
Toggle between dark (default) and light themes; persist the choice; no flash of wrong theme on load.

## 2. Requirements
- **Dark is default.** Toggling swaps the `dark` class on `<html>`.
- **Persist** to `localStorage` (`aithreus-theme`) **and** a cookie (so SSR renders the right class — no FOUC). A tiny inline script in `<head>` sets the class before paint from the cookie/localStorage.
- Icon button: sun (in dark mode, action = go light) / moon (in light mode). Tooltip "Toggle theme".

## 3. API
```ts
<ThemeToggle />            // self-contained client component
```

## 4. States
- idle (shows current-theme icon), hover, focus-visible ring, keyboard toggle (Enter/Space).
- SSR: reads cookie → correct initial class.

## 5. Acceptance
- Default load is dark.
- Toggle persists across reload (Playwright: toggle → reload → still light).
- No theme flash on reload.
- `data-testid="theme-toggle"`.

## 6. Non-goals
System-preference auto mode (could add later); multiple accent themes.

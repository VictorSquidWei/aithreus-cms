# components/product-switch — ProductSwitch (TT | VNX)

| | |
|---|---|
| **Spec ID** | `components/product-switch` |
| **Status** | approved |
| **Traces to** | Report §8.2, §4.2, §9.3; CMS-2 §1; IA `04-information-architecture §3` |

## 1. Purpose & scope
The persistent top-bar control that selects the active **Vertical** (`TT` or `VNX`) and **scopes every admin screen's data** by `verticalId`.

## 2. Requirements
- Segmented two-option control: **TT** (Sports) | **VNX** (Prediction Markets). Active option uses `--accent` treatment; inactive muted.
- **Source of truth = cookie `aithreus_vertical`** (default `TT`); also reflected in URL `?v=TT|VNX` for shareable deep links. On load, URL param (if present) overrides cookie, then writes back.
- Switching: set cookie, update URL param, and **refresh server data** for the current route (router refresh) so operators/sites/widgets/overrides/analytics re-scope (Report §9.3).
- Visible in the `/admin` top bar on every admin screen (persistent).
- Shows the vertical's display name on hover/tooltip ("TT (Sports)").

## 3. API
```ts
<ProductSwitch current: 'TT' | 'VNX' />     // client component; reads/writes cookie + URL
// server helper:
getActiveVertical(): 'TT' | 'VNX'           // reads cookie (default 'TT'); used by all admin loaders
```

## 4. States
- active/inactive segments; hover; focus ring; keyboard (←/→ or Tab+Enter) to switch.
- On switch: brief loading (route refresh skeleton).

## 5. Acceptance (Report §9.3)
- Toggling TT↔VNX changes the operators, widgets, sites, and analytics shown across all admin screens.
- Selection persists across navigation and reload (cookie).
- `?v=` deep link lands on the correct vertical.
- `data-testid="product-switch"`, `product-switch-tt`, `product-switch-vnx`.

## 6. Non-goals
More than two verticals; per-screen independent verticals (it's global).

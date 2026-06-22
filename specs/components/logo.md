# components/logo — Aithreus mark

| | |
|---|---|
| **Spec ID** | `components/logo` |
| **Status** | approved |
| **Traces to** | Report §8.4 |

## 1. Purpose & scope
A custom inline-SVG Aithreus brand mark + a 32px favicon. No styled text heading as a substitute (Report §8.4).

## 2. Requirements
- **Inline SVG**, geometric, **monochrome-first using `currentColor`** so it inherits text color (works on dark + light).
- Legible at **24px and 200px**.
- Concept: an **"A" / aperture formed from converging calibration lines** — a signal→edge motif (nods to the signal-and-calibration core, Handoff §4). Abstract, no photographic detail.
- A `Wordmark` variant = mark + "Aithreus" in the UI sans (500 weight), used in the sidebar/top nav.
- **Favicon:** 32×32 derived from the same mark, exported to `src/app/icon.svg` (Next auto-serves) + a PNG fallback.

## 3. API
```ts
<Logo size?: number = 24, className?: string />          // mark only, currentColor
<Wordmark className?: string />                           // mark + "Aithreus"
```

## 4. States
Static. Respects `currentColor`; no theme-specific assets needed.

## 5. Acceptance
- Renders crisply at 24px and 200px (Playwright screenshot check).
- Uses `currentColor` (verify by toggling theme — mark recolors).
- Favicon present; tab shows the mark.
- `data-testid="brand-logo"` / `brand-wordmark`.

## 6. Non-goals
Animated logo; multi-color brand variants (Phase 2).

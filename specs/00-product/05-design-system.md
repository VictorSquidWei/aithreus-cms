# 05 — Design System

| | |
|---|---|
| **Spec ID** | `00-product/05-design-system` |
| **Status** | approved |
| **Altitude** | System |
| **Date** | 2026-06-21 |
| **Traces to** | Report §8 (art direction, tokens, components, polish, logo); Handoff §9 |

---

## 1. Purpose & scope

The visual contract: art direction, color/type/density tokens, theming, the component inventory, the polish bar, and the logo. Concrete values are **normative** so the build hits a deliberate, non-generic look (acceptance §9.15). Per-component behavior lives in `components/*`.

## 2. Art direction (Report §8)

**Precise, sober, data-dense, dark-mode-first** — Bloomberg-terminal lineage, modernized. Not a playful consumer app. Conceal complexity behind clean hierarchy; respect data density without clutter. Tables and numbers are first-class. Affiliate operators live in dashboards all day — optimize for legibility and calm, not decoration.

## 3. Color tokens

Implemented as CSS custom properties on `:root` (dark default) and `.light`, consumed via Tailwind theme extension. **Dark is the default theme.**

### 3.1 Dark (default)
```
--bg:            #0B0E14   /* app background (near-black slate) */
--surface-1:     #10141D   /* base panels */
--surface-2:     #161B27   /* raised cards, table headers */
--surface-3:     #1C2230   /* popovers, hover rows, inputs */
--border:        #232B3A   /* hairline dividers */
--border-strong: #2E3850   /* focused/active borders */

--text:          #E8ECF4   /* primary */
--text-strong:   #FFFFFF   /* sparingly: key metrics, headings */
--text-muted:    #95A0B5   /* secondary labels */
--text-faint:    #5E6A82   /* placeholders, disabled */

--accent:        #1FD1E6   /* electric cyan — CTAs, active nav, key metrics ONLY */
--accent-hover:  #3BDDEF
--accent-active: #16B4C9
--on-accent:     #04141A   /* text/icon on accent fills */

--positive:      #2BD17E   /* up / edge / gain */
--negative:      #FF5C6A   /* down / loss */
--warning:       #F6B23C   /* paused / caution */
--focus-ring:    #1FD1E6
```

### 3.2 Light (secondary)
```
--bg:#F6F8FB; --surface-1:#FFFFFF; --surface-2:#F1F4F9; --surface-3:#E9EEF5;
--border:#E1E6EF; --border-strong:#C9D2E0;
--text:#0E1320; --text-strong:#000000; --text-muted:#586277; --text-faint:#8A93A6;
--accent:#0E9CB3; --accent-hover:#0B8499; --accent-active:#097C90; --on-accent:#FFFFFF;
--positive:#11A861; --negative:#D83A48; --warning:#C9851A;
```
*(Light values are tuned for AA contrast on white; accent darkened so cyan stays legible.)*

### 3.3 Usage rules
- **Accent is rationed:** primary CTAs, active nav item, focus ring, and at most one "headline metric" per view. Never as a background wash or decorative fill.
- **Semantic colors carry meaning only** (data up/down/paused) — never decoration.
- **Operator brand colors are data.** CTAs render in `operator.brandColor`; foreground text auto-picks black/white by luminance (`getReadableText(bg)`). Surfaces stay neutral so arbitrary brand colors sit well (Report §8.1).

## 4. Typography

- **UI sans:** **Inter** (self-hosted via `next/font` — no runtime CDN). Fallback `system-ui`. *(Prototype currently ships the system stack — `system-ui`/Segoe UI — to avoid a build-time font fetch; Inter self-hosting is a Phase-7 polish item.)*
- **Numeric / mono:** **JetBrains Mono** for numbers, URLs, `configId`s, snippets, tabular data — essential for the trading feel and snippet legibility (Report §8.1).
- **Tabular numerals:** apply `font-variant-numeric: tabular-nums` to all metric/table number cells.
- **Scale:** base **14px** (`text-sm`) in-app for density. In-app heading cap = **`text-xl`** (webapp rule, Report §8.1); marketing hero may exceed (up to `text-5xl`).
- **Weights:** 400 body, 500 labels/nav, 600 headings. Avoid 700+ in-app.

## 5. Density, shape, motion

- **Rows:** compact — control height `h-9`/`h-10`; table cell `py-2 px-3`. Generous-but-efficient gutters.
- **Radius:** `--radius: 6px` (controls), `8px` (cards). Hairline `1px` borders define elevation more than shadows.
- **Shadow:** minimal; rely on surface-lightness + border. Popovers get a soft shadow only.
- **Motion:** 150ms ease for hovers/toggles; respect `prefers-reduced-motion`. No flourish.
- **Focus:** always-visible `2px` `--focus-ring` outline (a11y).

## 6. Component inventory (Report §8.2 — each has a `components/*` spec)

**Shared/presentation:** AppShell, ThemeToggle, ProductSwitch, Logo, PortfolioMatrix, ProductCard, ModuleCard, IntegrationGrid/OperatorBadge, ExecutionPostureBadge, CalibrationStat (Brier/ECE/CLV), HealthIndicatorBar (9-component), StatusPill, ChangelogTimeline, RichContentBlock, AdminTable (sort/filter/export), FeatureFlagToggle, PublishBar (diff summary).

**Link-CMS-specific:** OperatorForm, ActiveToggle (kill switch), SiteCard (counts), LinkStateBadge (INHERITED/CUSTOM), OverrideRow (URL input + reset), EmbedSnippetBox (copy), WidgetPreviewFrame, StepProgress (4-step), KpiCard, TimeSeriesChart/Sparkline, BreakdownTable.

> Charts use a lightweight lib (Recharts or visx) themed to the tokens — **no external runtime fetches**.

## 7. Polish bar (Report §8.3 — required for §9.15)

- Collapsible sidebar sections; **dark-mode default** + toggle.
- "Last updated / last published" timestamps wherever data is non-live.
- **Skeleton loaders** for tables/charts; **meaningful empty states** ("No operators yet — add your first affiliate deal"); explicit **error states**; **toasts** on save/publish.
- **CSV export** on every table and chart.
- **`data-testid`** on all interactive + meaningful display elements (drives Playwright).
- No text overflow; responsive at **1280px and 375px** (QA breakpoints).

## 8. Logo (Report §8.4)

- Custom **inline SVG Aithreus mark** — geometric, monochrome-first using `currentColor`; legible at **24px and 200px**. Concept: an "A"/aperture formed from converging calibration lines (signal→edge motif), no photographic detail.
- **32px favicon** derived from the same mark. **No styled text heading as a substitute.**
- Spec + SVG source in `components/logo`.

## 9. Implementation notes

- Tailwind `theme.extend.colors` maps to the CSS vars (e.g. `bg-surface-2`, `text-muted`, `text-accent`).
- shadcn/ui components re-skinned to the tokens (no default violet/zinc look).
- One `globals.css` defines both theme blocks; `<html class="dark">` default; toggle swaps class + persists to `localStorage` + cookie (SSR-safe).
- A `tokens.md` cheat-sheet is generated for component authors.

## 10. UI states

This spec defines the *shared* state vocabulary (loading=skeleton, empty=guided CTA, error=inline+retry, success=toast); each screen/component spec instantiates it.

## 11. Acceptance criteria (Report §9.15)

1. Dark-first; custom palette above is in use (no default shadcn/AI-generic look).
2. Monospace tabular numerics on all metrics/tables.
3. Custom SVG logo + favicon present.
4. No text overflow; responsive at 1280px & 375px.
5. Skeleton/empty/error states and toasts present; CSV export on tables/charts.
6. `data-testid`s present on interactive/meaningful elements.

## 12. Non-goals

Full brand/style customization per operator (logos/fonts) = Phase 2. Multiple accent themes. Marketing-grade illustration/motion systems.

## 13. Traceability

| Content | Source |
|---|---|
| Art direction (Bloomberg-lineage, dark-dense) | Report §8 |
| Tokens (surfaces/accent/semantic/operator-as-data) | Report §8.1 |
| Typography (Inter + mono, text-xl cap, tabular) | Report §8.1 |
| Component inventory | Report §8.2; Handoff §9 |
| Polish bar | Report §8.3 |
| Logo | Report §8.4 |

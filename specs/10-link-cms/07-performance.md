# 10.07 — Performance dashboard

| | |
|---|---|
| **Spec ID** | `10-link-cms/07-performance` |
| **Status** | approved |
| **Traces to** | Report §5.6, §6.3; CMS-2 §5 |

## 1. Purpose & scope
Analytics at the widget-by-site level: views, affiliate clicks, CTR, conversions, estimated revenue — time-series + per-operator breakdown, filterable and exportable. Populated by seeded synthetic events now and by the live click pipeline (Phase 4).

## 2. Requirements (Report §5.6)
- **KPIs:** Views (impressions), Affiliate clicks, CTR (= clicks/impressions), Conversions, Est. revenue.
- **Time-series** (last 14 days): views/clicks/conversions.
- **Per-operator breakdown** (the key multi-CTA ask): impressions, clicks, CTR, conversions, est. revenue per operator.
- **Filters:** site (All / specific); vertical comes from the product switch. (Date range fixed to 14 days for the prototype; widget/operator filters are a documented extension.)
- **CSV export** of the breakdown.
- **Client scoping:** an `affiliate_client` sees only its own sites' events.
- Data source: `server/analytics.ts` rollups over the `events` store; seeded synthetic events + live events appended by the runtime (§20).

## 3. UI states
- **Empty (no events):** breakdown shows "No events yet"; KPIs show 0; chart empty.
- **Loading:** server-rendered; chart hydrates client-side.

## 4. Acceptance (Report §9.9)
1. Shows views/clicks/CTR/conversions/est-revenue.
2. Time-series + per-operator breakdown render.
3. Filterable by site; exportable to CSV.
4. Populated by seeded events (and live events once the runtime exists).
5. `data-testid`: `kpi-views`, `kpi-clicks`, `kpi-ctr`, `timeseries`, `breakdown-table`, `perf-site-filter`, `export-csv`.

## 5. Non-goals
ClickHouse, custom date pickers, cohort/funnel views, real operator postbacks (simulated conversions — Report §11).

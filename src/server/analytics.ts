// Analytics rollups — specs/10-link-cms/07-performance.md. Postgres rollup views replace these in Phase 7.
import type { AnalyticsEvent } from "@/lib/types";

export interface DayPoint {
  date: string;
  impressions: number;
  clicks: number;
  conversions: number;
}
export interface OperatorRow {
  operatorId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  revenue: number;
}
export interface Totals {
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  revenue: number;
}

function revenueOf(e: AnalyticsEvent): number {
  const v = e.meta?.value;
  return typeof v === "number" ? v : 0;
}

export function rollupByDay(events: AnalyticsEvent[]): DayPoint[] {
  const map = new Map<string, DayPoint>();
  for (const e of events) {
    const key = e.ts.slice(0, 10);
    const p = map.get(key) ?? { date: key, impressions: 0, clicks: 0, conversions: 0 };
    if (e.type === "impression") p.impressions++;
    else if (e.type === "click") p.clicks++;
    else p.conversions++;
    map.set(key, p);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function rollupByOperator(events: AnalyticsEvent[]): OperatorRow[] {
  const map = new Map<string, OperatorRow>();
  for (const e of events) {
    const r = map.get(e.operatorId) ?? { operatorId: e.operatorId, impressions: 0, clicks: 0, conversions: 0, ctr: 0, revenue: 0 };
    if (e.type === "impression") r.impressions++;
    else if (e.type === "click") r.clicks++;
    else {
      r.conversions++;
      r.revenue += revenueOf(e);
    }
    map.set(e.operatorId, r);
  }
  for (const r of map.values()) r.ctr = r.impressions ? r.clicks / r.impressions : 0;
  return [...map.values()].sort((a, b) => b.clicks - a.clicks);
}

export function totals(events: AnalyticsEvent[]): Totals {
  let impressions = 0,
    clicks = 0,
    conversions = 0,
    revenue = 0;
  for (const e of events) {
    if (e.type === "impression") impressions++;
    else if (e.type === "click") clicks++;
    else {
      conversions++;
      revenue += revenueOf(e);
    }
  }
  return { impressions, clicks, conversions, ctr: impressions ? clicks / impressions : 0, revenue };
}

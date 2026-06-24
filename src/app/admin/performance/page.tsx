import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { rollupByDay, rollupByOperator, totals } from "@/server/analytics";
import { formatInt, formatPct, formatUsd } from "@/lib/utils";
import { PageContainer, PageHeader } from "@/components/page-container";
import { KpiCard } from "@/components/link-cms/kpi-card";
import { TimeSeriesChart } from "@/components/link-cms/time-series-chart";
import { BreakdownTable } from "@/components/link-cms/breakdown-table";
import { ExportCsvButton } from "@/components/link-cms/export-csv-button";
import { SiteSelect } from "@/components/link-cms/site-select";

export default async function PerformancePage({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
  const viewer = await getViewer();
  const vertical = await getActiveVertical();
  const store = getStore();
  const sites = await store.listSites(vertical, viewer);
  const siteIds = new Set(sites.map((s) => s.id));
  const sp = await searchParams;
  const selected = sp.site && siteIds.has(sp.site) ? sp.site! : null;

  const v = await store.getVerticalByKey(vertical);
  const allEvents = await store.listEvents();
  let events = allEvents.filter((e) => e.verticalId === v?.id && siteIds.has(e.siteId));
  if (selected) events = events.filter((e) => e.siteId === selected);

  const opName = new Map((await store.rawOperators(vertical)).map((o) => [o.id, o.name]));
  const t = totals(events);
  const byDay = rollupByDay(events);
  const byOp = rollupByOperator(events).map((r) => ({
    operatorName: opName.get(r.operatorId) ?? r.operatorId,
    impressions: r.impressions,
    clicks: r.clicks,
    ctr: r.ctr,
    conversions: r.conversions,
    revenue: r.revenue,
  }));

  const kpis = [
    { label: "Views", value: formatInt(t.impressions) },
    { label: "Clicks", value: formatInt(t.clicks) },
    { label: "CTR", value: formatPct(t.ctr) },
    { label: "Conversions", value: formatInt(t.conversions) },
    { label: "Est. revenue", value: formatUsd(t.revenue) },
  ];

  const csvRows = byOp.map((r) => [
    r.operatorName,
    r.impressions,
    r.clicks,
    `${(r.ctr * 100).toFixed(1)}%`,
    r.conversions,
    Math.round(r.revenue),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Performance"
        subtitle={`${vertical} · last 14 days`}
        actions={
          <div className="flex items-center gap-2">
            <SiteSelect sites={sites.map((s) => ({ id: s.id, domain: s.domain }))} selected={selected} basePath="/admin/performance" />
            <ExportCsvButton
              filename="aithreus-performance.csv"
              headers={["Operator", "Views", "Clicks", "CTR", "Conversions", "Est. revenue (USD)"]}
              rows={csvRows}
            />
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {kpis.map((k) => (
          <KpiCard key={k.label} label={k.label} value={k.value} />
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-border bg-surface-1 p-4">
        <div className="mb-2 text-sm font-semibold text-fg">Views · Clicks · Conversions</div>
        <TimeSeriesChart data={byDay} />
      </div>

      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold text-fg">
          Per-operator breakdown {selected ? "" : "· all sites"}
        </div>
        <BreakdownTable rows={byOp} />
      </div>
    </PageContainer>
  );
}

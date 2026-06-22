import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";
import { StatusPill } from "@/components/presentation/status-pill";
import { CalibrationStat } from "@/components/presentation/calibration-stat";
import { HealthIndicatorBar, type HealthComponent } from "@/components/presentation/health-indicator-bar";

export const metadata = { title: "Status" };

export default async function StatusPage() {
  const store = getStore();
  const products = store.listProducts();

  return (
    <PageContainer>
      <PageHeader title="Status" subtitle="Live product & system health — read-only." />
      <div className="flex flex-col gap-4">
        {products.map((p) => {
          const all = store.listStatusFeed(p.id);
          const metrics = all.filter((s) => !s.metricKey.startsWith("health:"));
          const health: HealthComponent[] = all
            .filter((s) => s.metricKey.startsWith("health:"))
            .map((s) => ({
              name: s.metricKey.slice("health:".length),
              status: s.value === "ok" ? "ok" : s.value === "degraded" ? "degraded" : "down",
            }));
          return (
            <div key={p.id} className="rounded-lg border border-border bg-surface-1 p-4" data-testid={`status-${p.slug}`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-fg">{p.name}</h2>
                <StatusPill status={p.status} />
              </div>
              {metrics.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {metrics.map((mm) => (
                    <CalibrationStat key={mm.id} label={mm.metricKey} value={mm.value} />
                  ))}
                </div>
              )}
              {health.length > 0 && (
                <div className="mt-3">
                  <div className="mb-2 text-xs text-fg-faint">Component health</div>
                  <HealthIndicatorBar components={health} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

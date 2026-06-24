import { notFound } from "next/navigation";
import { getViewer } from "@/server/session";
import { getStore } from "@/server/store";
import { visibleModules } from "@/server/visibility";
import { PageContainer } from "@/components/page-container";
import { Badge } from "@/components/ui/badge";
import { ExecutionPostureBadge } from "@/components/presentation/execution-posture-badge";
import { StatusPill } from "@/components/presentation/status-pill";
import { ModuleCard } from "@/components/presentation/module-card";
import { IntegrationGrid } from "@/components/presentation/integration-grid";
import { CalibrationStat } from "@/components/presentation/calibration-stat";
import { ChangelogTimeline } from "@/components/presentation/changelog-timeline";
import { RichContentBlock } from "@/components/presentation/rich-content-block";
import type { VerticalKey } from "@/lib/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fg-faint">{title}</h2>
      {children}
    </section>
  );
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const viewer = await getViewer();
  const store = getStore();
  const product = await store.getProductBySlug(slug);
  if (!product) notFound();

  const vertical = await store.getVerticalById(product.verticalId);
  const vkey = (vertical?.key ?? "TT") as VerticalKey;
  const [modulesRaw, strategies, operators, changelog, statusAll] = await Promise.all([
    store.listModules(product.id),
    store.listStrategies(product.id),
    store.listOperators(vkey, viewer),
    store.listChangelog(product.id),
    store.listStatusFeed(product.id),
  ]);
  const modules = visibleModules(modulesRaw, viewer);
  const metrics = statusAll.filter((s) => !s.metricKey.startsWith("health:"));

  return (
    <PageContainer>
      <div className="mb-7">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-accent">{vkey}</span>
          <StatusPill status={product.status} />
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-fg">{product.name}</h1>
        <p className="mt-1 max-w-2xl text-fg-muted">{product.tagline}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <ExecutionPostureBadge executes={product.executes} />
          <Badge variant="muted">{product.type}</Badge>
        </div>
      </div>

      <Section title="What it does">
        <RichContentBlock text={product.whatItDoes} />
      </Section>

      {metrics.length > 0 && (
        <Section title="Status">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {metrics.map((mm) => (
              <CalibrationStat key={mm.id} label={mm.metricKey} value={mm.value} />
            ))}
          </div>
        </Section>
      )}

      <Section title="Modules">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((mm) => (
            <ModuleCard key={mm.id} module={mm} />
          ))}
        </div>
      </Section>

      {strategies.length > 0 && (
        <Section title="Strategies">
          <div className="grid gap-2 sm:grid-cols-2">
            {strategies.map((s) => (
              <div key={s.id} className="rounded-lg border border-border bg-surface-1 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-fg">{s.name}</span>
                  <span className="text-xs text-fg-faint">{s.venue}</span>
                </div>
                <p className="mt-1 text-xs text-fg-muted">{s.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Integrations">
        <IntegrationGrid operators={operators} />
      </Section>

      <Section title="Changelog">
        <ChangelogTimeline entries={changelog} />
      </Section>
    </PageContainer>
  );
}

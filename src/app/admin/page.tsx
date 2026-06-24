import Link from "next/link";
import { CheckCircle2, Circle, Globe, LayoutGrid, Plug, ToggleRight } from "lucide-react";
import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboard() {
  const viewer = await getViewer();
  const vertical = await getActiveVertical();
  const store = getStore();

  const v = await store.getVerticalByKey(vertical);
  const [operators, sites] = await Promise.all([
    store.listOperators(vertical, viewer),
    store.listSites(vertical, viewer),
  ]);
  const instanceLists = await Promise.all(sites.map((site) => store.listWidgetInstances(site.id)));
  const instances = instanceLists.flat();
  const activeOps = operators.filter((o) => o.active).length;
  const clientName =
    viewer.role === "affiliate_client"
      ? ((await store.getClientById(viewer.clientId))?.name ?? "Your client")
      : "All clients";

  const kpis = [
    { label: "Operators", value: operators.length, icon: Plug },
    { label: "Active operators", value: activeOps, icon: ToggleRight },
    { label: "Sites", value: sites.length, icon: Globe },
    { label: "Embedded widgets", value: instances.length, icon: LayoutGrid },
  ];

  const steps = [
    { label: "Add operators", href: "/admin/operators", done: operators.length > 0 },
    { label: "Add sites", href: "/admin/sites", done: sites.length > 0 },
    { label: "Embed widgets", href: "/admin/embed", done: instances.length > 0 },
    { label: "Publish to live", href: "/admin/embed", done: sites.some((s) => !!s.lastPublishedAt) },
  ];
  const doneCount = steps.filter((s) => s.done).length;

  return (
    <PageContainer>
      <PageHeader title="Dashboard" subtitle={`${v?.name ?? vertical} workspace · ${clientName}`} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} data-testid={`kpi-${k.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <CardContent className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-fg-muted">{k.label}</div>
                  <div className="nums mt-1 text-2xl font-semibold text-fg">{k.value}</div>
                </div>
                <Icon size={20} className="text-accent" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Setup progress</CardTitle>
            <span className="nums text-xs text-fg-muted">{doneCount}/4 complete</span>
          </CardHeader>
          <CardContent className="flex flex-col gap-1">
            {steps.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="flex items-center gap-2.5 rounded px-2 py-2 text-sm hover:bg-surface-2"
              >
                {s.done ? (
                  <CheckCircle2 size={16} className="text-positive" />
                ) : (
                  <Circle size={16} className="text-fg-faint" />
                )}
                <span className={s.done ? "text-fg-muted line-through" : "text-fg"}>{s.label}</span>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-fg-muted">
            <p>
              Use the <span className="text-fg">product switch</span> in the top bar to move between{" "}
              <span className="font-mono text-accent">TT</span> and{" "}
              <span className="font-mono text-accent">VNX</span> — every screen re-scopes to the selected vertical.
            </p>
            <p className="mt-2 text-fg-faint">Audit + live activity feed land with the publish workflow (Phase 3).</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

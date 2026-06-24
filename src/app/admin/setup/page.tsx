import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";
import { StepProgress } from "@/components/step-progress";
import { Card, CardContent } from "@/components/ui/card";

export default async function SetupPage() {
  const viewer = await getViewer();
  const vertical = await getActiveVertical();
  const store = getStore();

  const [operatorsAll, sites] = await Promise.all([
    store.listOperators(vertical, viewer),
    store.listSites(vertical, viewer),
  ]);
  const operators = operatorsAll.filter((o) => o.active);
  const overrideLists = await Promise.all(sites.map((site) => store.listOverrides(site.id)));
  const overrides = overrideLists.reduce((n, arr) => n + arr.length, 0);
  const published = sites.some((site) => !!site.lastPublishedAt);

  const steps = [
    { n: 1, label: "Add operators", href: "/admin/operators", desc: "Add every affiliate deal with its base URL.", done: operators.length > 0 },
    { n: 2, label: "Add sites", href: "/admin/sites", desc: "List the domains you'll embed widgets on.", done: sites.length > 0 },
    { n: 3, label: "Edit links (optional)", href: "/admin/links", desc: "Override default URLs per site & widget — most clients skip this.", done: overrides > 0 },
    { n: 4, label: "Embed & publish", href: "/admin/embed", desc: "Copy the snippet, then publish to go live.", done: published },
  ];
  const progress = steps.map((s) => ({ label: s.label, done: s.done }));

  return (
    <PageContainer>
      <PageHeader title="Setup guide" subtitle={`Welcome · get ${vertical} widgets live in four steps`} />
      <div data-testid="setup-guide">
        <div className="mb-5">
          <StepProgress steps={progress} />
        </div>
        <div className="flex flex-col gap-3">
          {steps.map((s) => (
            <Card key={s.n} data-testid={`setup-step-${s.n}`}>
              <CardContent className="flex items-center gap-4">
                {s.done ? (
                  <CheckCircle2 size={20} className="shrink-0 text-positive" />
                ) : (
                  <Circle size={20} className="shrink-0 text-fg-faint" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-fg">
                    {s.n}. {s.label}
                  </div>
                  <div className="text-xs text-fg-muted">{s.desc}</div>
                </div>
                <Link
                  href={s.href}
                  className="flex shrink-0 items-center gap-1 text-sm text-accent hover:underline"
                >
                  {s.done ? "Review" : "Start"} <ArrowRight size={14} />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}

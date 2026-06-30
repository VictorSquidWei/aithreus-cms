import Link from "next/link";
import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { eligibleOperators, slotsForWidget } from "@/server/resolution";
import { PageContainer, PageHeader } from "@/components/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WidgetPreviewFrame } from "@/components/link-cms/widget-preview-frame";

export default async function GalleryPage() {
  const viewer = await getViewer();
  const vertical = await getActiveVertical();
  const store = getStore();
  const [types, rawOps, links] = await Promise.all([
    store.listWidgetTypes(vertical),
    store.rawOperators(vertical),
    viewer.role === "public" ? Promise.resolve([]) : store.listAffiliateLinks(viewer.clientId),
  ]);
  const eligible = eligibleOperators(rawOps, links);

  return (
    <PageContainer>
      <PageHeader title="Widget gallery" subtitle={`${vertical} · preview each widget with your live operator config`} />
      <div className="grid gap-4 md:grid-cols-2" data-testid="gallery">
        {types.map((t) => {
          const ctas = slotsForWidget(eligible, t).map(({ operator }) => ({
            name: operator.slug,
            label: operator.buttonLabel,
            color: operator.brandColor,
          }));
          return (
            <div
              key={t.id}
              data-testid={`gallery-card-${t.key}`}
              className="rounded-lg border border-border bg-surface-1 p-4"
            >
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-fg">{t.name}</h3>
                  <p className="text-xs text-fg-muted">{t.description}</p>
                </div>
                <Badge variant={t.ctaMode === "multi" ? "accent" : "muted"}>
                  {t.ctaMode === "multi" ? "multi-CTA" : "single-CTA"}
                </Badge>
              </div>
              <WidgetPreviewFrame typeKey={t.key} ctaMode={t.ctaMode} sample={t.sampleDataJson} ctas={ctas} />
              <div className="mt-3 flex justify-end">
                <Button asChild size="sm" variant="subtle">
                  <Link href="/admin/embed">Grab embed</Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}

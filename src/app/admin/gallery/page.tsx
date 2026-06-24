import Link from "next/link";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { ctaOperators, slotOperatorsForWidget } from "@/server/resolution";
import { PageContainer, PageHeader } from "@/components/page-container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { WidgetPreviewFrame } from "@/components/link-cms/widget-preview-frame";

export default async function GalleryPage() {
  const vertical = await getActiveVertical();
  const store = getStore();
  const [types, rawOps] = await Promise.all([store.listWidgetTypes(vertical), store.rawOperators(vertical)]);
  const activeOps = ctaOperators(rawOps);

  return (
    <PageContainer>
      <PageHeader title="Widget gallery" subtitle={`${vertical} · preview each widget with your live operator config`} />
      <div className="grid gap-4 md:grid-cols-2" data-testid="gallery">
        {types.map((t) => {
          const ctas = slotOperatorsForWidget(activeOps, t).map((o) => ({
            name: o.slug,
            label: o.buttonLabel,
            color: o.brandColor,
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

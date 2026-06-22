import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";
import { EmbedView } from "@/components/link-cms/embed-view";

export default async function EmbedPage({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
  const viewer = await getViewer();
  const vertical = await getActiveVertical();
  const store = getStore();
  const sites = store.listSites(vertical, viewer);
  const sp = await searchParams;
  const selected = sp.site && sites.some((s) => s.id === sp.site) ? sp.site! : (sites[0]?.id ?? null);
  const cdn = process.env.NEXT_PUBLIC_WIDGET_CDN_URL ?? "http://localhost:3000/widget/v1/embed.js";

  let widgets: { instanceId: string; typeName: string; snippet: string }[] = [];
  if (selected) {
    const site = store.getSite(selected)!;
    widgets = store.listWidgetInstances(site.id).map((wi) => {
      const type = store.getWidgetType(wi.widgetTypeId);
      const snippet = `<div class="aithreus-widget"\n     data-config-id="${site.configId}"\n     data-widget="${wi.id}"\n     data-theme="dark"></div>\n<script src="${cdn}" async></script>`;
      return { instanceId: wi.id, typeName: type?.name ?? "Widget", snippet };
    });
  }

  return (
    <PageContainer>
      <PageHeader title="Embed code" subtitle={`Step 4 · ${vertical} · paste once per widget — links update without redeploy`} />
      <EmbedView sites={sites.map((s) => ({ id: s.id, domain: s.domain }))} selectedSiteId={selected} widgets={widgets} />
    </PageContainer>
  );
}

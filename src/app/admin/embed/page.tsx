import { headers } from "next/headers";
import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";
import { EmbedView } from "@/components/link-cms/embed-view";

export default async function EmbedPage({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
  const viewer = await getViewer();
  const vertical = await getActiveVertical();
  const store = getStore();
  const sites = await store.listSites(vertical, viewer);
  const sp = await searchParams;
  const selected = sp.site && sites.some((s) => s.id === sp.site) ? sp.site! : (sites[0]?.id ?? null);
  // Production points NEXT_PUBLIC_WIDGET_CDN_URL at the CDN. In dev (and the demo), fall back to the
  // request's own origin so the copyable snippet always references the host the app is actually running on
  // (e.g. :3100), not a hardcoded port.
  let cdn = process.env.NEXT_PUBLIC_WIDGET_CDN_URL;
  if (!cdn) {
    const host = (await headers()).get("host") ?? "localhost:3000";
    const proto = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
    cdn = `${proto}://${host}/widget/v1/embed.js`;
  }

  let widgets: { instanceId: string; typeName: string; snippet: string }[] = [];
  if (selected) {
    const site = (await store.getSite(selected))!;
    const instances = await store.listWidgetInstances(site.id);
    widgets = await Promise.all(
      instances.map(async (wi) => {
        const type = await store.getWidgetType(wi.widgetTypeId);
        const snippet = `<div class="aithreus-widget"\n     data-config-id="${site.configId}"\n     data-widget="${wi.id}"\n     data-theme="dark"></div>\n<script src="${cdn}" async></script>`;
        return { instanceId: wi.id, typeName: type?.name ?? "Widget", snippet };
      }),
    );
  }

  return (
    <PageContainer>
      <PageHeader title="Embed code" subtitle={`Step 4 · ${vertical} · paste once per widget — links update without redeploy`} />
      <EmbedView sites={sites.map((s) => ({ id: s.id, domain: s.domain }))} selectedSiteId={selected} widgets={widgets} />
    </PageContainer>
  );
}

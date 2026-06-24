import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { ctaOperators, resolveWidgetsForSiteAdmin } from "@/server/resolution";
import { PageContainer, PageHeader } from "@/components/page-container";
import { EditLinks, type WidgetBlock } from "@/components/link-cms/edit-links";

export default async function LinksPage({ searchParams }: { searchParams: Promise<{ site?: string }> }) {
  const viewer = await getViewer();
  const vertical = await getActiveVertical();
  const store = getStore();
  const sites = await store.listSites(vertical, viewer);
  const sp = await searchParams;
  const selected = sp.site && sites.some((s) => s.id === sp.site) ? sp.site! : null;

  let widgets: WidgetBlock[] = [];
  if (selected) {
    const site = (await store.getSite(selected))!;
    const [instances, rawOps, overrides, types] = await Promise.all([
      store.listWidgetInstances(site.id),
      store.rawOperators(vertical),
      store.listOverrides(site.id),
      store.listWidgetTypes(vertical),
    ]);
    const typeById = new Map(types.map((t) => [t.id, t]));
    widgets = resolveWidgetsForSiteAdmin({
      instances,
      widgetTypeById: (id) => typeById.get(id),
      activeOps: ctaOperators(rawOps),
      overrides,
    }).map((w) => ({
      instanceId: w.instance.id,
      typeName: w.type.name,
      typeKey: w.type.key,
      ctaMode: w.type.ctaMode,
      rows: w.rows.map((r) => ({
        operatorId: r.operator.id,
        operatorName: r.operator.name,
        brandColor: r.operator.brandColor,
        state: r.state,
        resolvedUrl: r.resolvedUrl,
      })),
    }));
  }

  return (
    <PageContainer>
      <PageHeader title="Edit links" subtitle={`Step 3 · ${vertical} · override default URLs per site & widget`} />
      <EditLinks sites={sites.map((s) => ({ id: s.id, domain: s.domain }))} selectedSiteId={selected} widgets={widgets} />
    </PageContainer>
  );
}

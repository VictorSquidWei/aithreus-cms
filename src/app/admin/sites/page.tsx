import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";
import { SitesManager } from "@/components/link-cms/sites-manager";

export default async function SitesPage() {
  const viewer = await getViewer();
  const vertical = await getActiveVertical();
  const store = getStore();
  const siteList = await store.listSites(vertical, viewer);
  const sites = await Promise.all(siteList.map(async (site) => ({ site, counts: await store.siteCounts(site.id) })));

  return (
    <PageContainer>
      <PageHeader title="Sites" subtitle={`Step 2 · ${vertical} · domains that embed your widgets`} />
      <SitesManager sites={sites} />
    </PageContainer>
  );
}

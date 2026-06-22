import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";
import { SitesManager } from "@/components/link-cms/sites-manager";

export default async function SitesPage() {
  const viewer = await getViewer();
  const vertical = await getActiveVertical();
  const store = getStore();
  const sites = store.listSites(vertical, viewer).map((site) => ({ site, counts: store.siteCounts(site.id) }));

  return (
    <PageContainer>
      <PageHeader title="Sites" subtitle={`Step 2 · ${vertical} · domains that embed your widgets`} />
      <SitesManager sites={sites} />
    </PageContainer>
  );
}

import { getViewer } from "@/server/session";
import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";
import { IntegrationGrid } from "@/components/presentation/integration-grid";

export const metadata = { title: "Integrations" };

export default async function IntegrationsPage() {
  const viewer = await getViewer();
  const store = getStore();
  const verticals = await store.listVerticals();
  const groups = await Promise.all(verticals.map(async (v) => ({ v, ops: await store.listOperators(v.key, viewer) })));

  return (
    <PageContainer>
      <PageHeader
        title="Integrations"
        subtitle="Every external connection, modeled once — the same entities the Link CMS promotes as operators."
      />
      <div className="flex flex-col gap-8">
        {groups.map(({ v, ops }) => (
          <section key={v.id}>
            <h2 className="mb-3 text-sm font-semibold text-fg">
              {v.name} <span className="font-normal text-fg-faint">· {v.domain.replace("_", " ")}</span>
            </h2>
            <IntegrationGrid operators={ops} />
          </section>
        ))}
      </div>
    </PageContainer>
  );
}

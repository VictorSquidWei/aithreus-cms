import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";
import { OperatorsManager } from "@/components/link-cms/operators-manager";

export default async function OperatorsPage() {
  const viewer = await getViewer();
  const vertical = await getActiveVertical();
  const store = getStore();
  const operators = await store.listOperators(vertical, viewer);
  const links = viewer.role === "public" ? [] : await store.listAffiliateLinks(viewer.clientId);
  const linkByOp = new Map(links.map((l) => [l.operatorId, l]));
  const rows = operators.map((operator) => ({ operator, link: linkByOp.get(operator.id) }));

  return (
    <PageContainer>
      <PageHeader title="Operators" subtitle={`Step 1 · ${vertical} · set your affiliate link per platform`} />
      <OperatorsManager rows={rows} />
    </PageContainer>
  );
}

import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";
import { OperatorsManager } from "@/components/link-cms/operators-manager";

export default async function OperatorsPage() {
  const viewer = await getViewer();
  const vertical = await getActiveVertical();
  const operators = getStore().listOperators(vertical, viewer);

  return (
    <PageContainer>
      <PageHeader title="Operators" subtitle={`Step 1 · ${vertical} · the affiliate-link source of truth`} />
      <OperatorsManager operators={operators} />
    </PageContainer>
  );
}

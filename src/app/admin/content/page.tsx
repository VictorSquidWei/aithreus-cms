import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";
import { ContentManager } from "@/components/admin-content/content-manager";

export default async function ContentPage() {
  const store = getStore();
  const [products, pages] = await Promise.all([store.listProducts(), store.listPages()]);
  return (
    <PageContainer>
      <PageHeader
        title="Content panel"
        subtitle="Edit products, docs, and releases — changes reflect on the live site."
      />
      <ContentManager products={products} pages={pages} />
    </PageContainer>
  );
}

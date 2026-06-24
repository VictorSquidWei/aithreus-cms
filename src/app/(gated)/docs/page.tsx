import Link from "next/link";
import { FileText } from "lucide-react";
import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";

export const metadata = { title: "Docs" };

export default async function DocsPage() {
  const pages = await getStore().listPages();
  return (
    <PageContainer>
      <PageHeader title="Docs" subtitle="Guides and reference — managed in the CMS." />
      <div className="grid gap-3 sm:grid-cols-2">
        {pages.map((pg) => (
          <Link
            key={pg.id}
            href={`/docs/${pg.slug}`}
            data-testid={`doc-${pg.slug}`}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-1 p-4 text-fg hover:border-border-strong"
          >
            <FileText size={16} className="text-accent" />
            <span className="font-medium">{pg.title}</span>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}

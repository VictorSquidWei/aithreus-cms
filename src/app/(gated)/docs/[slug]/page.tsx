import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";
import { RichContentBlock } from "@/components/presentation/rich-content-block";

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getStore().getPageBySlug(slug);
  if (!page) notFound();

  return (
    <PageContainer className="max-w-3xl">
      <Link href="/docs" className="mb-4 inline-flex items-center gap-1 text-xs text-fg-muted hover:text-fg">
        <ArrowLeft size={13} /> All docs
      </Link>
      <PageHeader title={page.title} />
      <RichContentBlock text={typeof page.blocks === "string" ? page.blocks : ""} />
    </PageContainer>
  );
}

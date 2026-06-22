import { Construction } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/page-container";
import { Card, CardContent } from "@/components/ui/card";

export function ScreenPlaceholder({ title, tag, note }: { title: string; tag?: string; note: string }) {
  return (
    <PageContainer>
      <PageHeader title={title} subtitle={tag} />
      <Card data-testid="screen-placeholder">
        <CardContent className="flex items-center gap-3 text-sm text-fg-muted">
          <Construction size={18} className="text-warning" />
          <span>{note}</span>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

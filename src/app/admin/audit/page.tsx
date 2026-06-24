import { getStore } from "@/server/store";
import { PageContainer, PageHeader } from "@/components/page-container";

export default async function AuditPage() {
  const audit = await getStore().listAudit();
  return (
    <PageContainer>
      <PageHeader title="Audit log" subtitle="Publishes and content edits." />
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm" data-testid="audit-table">
          <thead className="bg-surface-2 text-xs text-fg-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">When</th>
              <th className="px-3 py-2 text-left font-medium">Actor</th>
              <th className="px-3 py-2 text-left font-medium">Action</th>
              <th className="px-3 py-2 text-left font-medium">Summary</th>
            </tr>
          </thead>
          <tbody>
            {audit.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-xs text-fg-faint">
                  No activity yet — publish or edit content to populate the log.
                </td>
              </tr>
            ) : (
              audit.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="nums px-3 py-2 font-mono text-xs text-fg-faint">{a.ts.slice(0, 16).replace("T", " ")}</td>
                  <td className="px-3 py-2 text-fg">{a.actorName}</td>
                  <td className="px-3 py-2">
                    <span className="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">{a.action}</span>
                  </td>
                  <td className="px-3 py-2 text-fg-muted">{a.summary}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}

import type { Operator } from "@/lib/types";
import { getReadableText } from "@/lib/utils";
import { StatusPill } from "./status-pill";

export function OperatorBadge({ operator }: { operator: Operator }) {
  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface-1 p-3"
      data-testid={`integration-${operator.slug}`}
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[11px] font-bold"
          style={{ background: operator.brandColor, color: getReadableText(operator.brandColor) }}
        >
          {operator.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-sm font-medium text-fg">{operator.name}</div>
          <div className="truncate text-xs text-fg-faint">{operator.role}</div>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <StatusPill status={operator.integrationStatus} />
        <span className="text-[10px] uppercase tracking-wide text-fg-faint">{operator.category}</span>
      </div>
    </div>
  );
}

export function IntegrationGrid({ operators }: { operators: Operator[] }) {
  if (!operators.length) return <p className="text-sm text-fg-faint">No integrations.</p>;
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3" data-testid="integration-grid">
      {operators.map((o) => (
        <OperatorBadge key={o.id} operator={o} />
      ))}
    </div>
  );
}

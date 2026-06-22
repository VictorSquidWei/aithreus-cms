import { formatInt, formatPct, formatUsd } from "@/lib/utils";

export interface BreakdownRow {
  operatorName: string;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  revenue: number;
}

export function BreakdownTable({ rows }: { rows: BreakdownRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm" data-testid="breakdown-table">
        <thead className="bg-surface-2 text-xs text-fg-muted">
          <tr>
            <th className="px-3 py-2 text-left font-medium">Operator</th>
            <th className="px-3 py-2 text-right font-medium">Views</th>
            <th className="px-3 py-2 text-right font-medium">Clicks</th>
            <th className="px-3 py-2 text-right font-medium">CTR</th>
            <th className="px-3 py-2 text-right font-medium">Conv.</th>
            <th className="px-3 py-2 text-right font-medium">Est. rev.</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-xs text-fg-faint">
                No events yet for this selection.
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.operatorName} className="border-t border-border">
                <td className="px-3 py-2 text-fg">{r.operatorName}</td>
                <td className="nums px-3 py-2 text-right font-mono text-fg-muted">{formatInt(r.impressions)}</td>
                <td className="nums px-3 py-2 text-right font-mono text-fg-muted">{formatInt(r.clicks)}</td>
                <td className="nums px-3 py-2 text-right font-mono text-fg-muted">{formatPct(r.ctr)}</td>
                <td className="nums px-3 py-2 text-right font-mono text-fg-muted">{formatInt(r.conversions)}</td>
                <td className="nums px-3 py-2 text-right font-mono text-positive">{formatUsd(r.revenue)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

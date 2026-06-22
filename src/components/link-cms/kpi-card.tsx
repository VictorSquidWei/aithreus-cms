import { cn } from "@/lib/utils";

export function KpiCard({ label, value, hint, className }: { label: string; value: string; hint?: string; className?: string }) {
  return (
    <div
      className={cn("rounded-lg border border-border bg-surface-1 p-4", className)}
      data-testid={`kpi-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
    >
      <div className="text-xs text-fg-muted">{label}</div>
      <div className="nums mt-1 text-2xl font-semibold text-fg">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-fg-faint">{hint}</div>}
    </div>
  );
}

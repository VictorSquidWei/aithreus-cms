import { cn } from "@/lib/utils";

export function CalibrationStat({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string;
  sub?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface-1 p-4", className)}>
      <div className="text-xs text-fg-muted">{label}</div>
      <div className="nums mt-1 font-mono text-xl font-semibold text-fg">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-fg-faint">{sub}</div>}
    </div>
  );
}

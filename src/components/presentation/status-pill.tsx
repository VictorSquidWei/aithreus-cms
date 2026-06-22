import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  live: "text-positive border-positive",
  ok: "text-positive border-positive",
  beta: "text-warning border-warning",
  degraded: "text-warning border-warning",
  planned: "text-fg-muted border-border",
  down: "text-negative border-negative",
  paused: "text-negative border-negative",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const tone = TONE[status.toLowerCase()] ?? "text-fg-muted border-border";
  return (
    <span
      data-testid="status-pill"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
        tone,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

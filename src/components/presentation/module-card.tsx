import type { Module } from "@/lib/types";
import { cn } from "@/lib/utils";

const CAT: Record<string, string> = {
  data: "text-accent",
  signal: "text-positive",
  calibration: "text-accent",
  execution: "text-warning",
  risk: "text-negative",
  health: "text-positive",
  alerting: "text-warning",
  ui: "text-fg-muted",
};

export function ModuleCard({ module }: { module: Module }) {
  return (
    <div className="rounded-lg border border-border bg-surface-1 p-3" data-testid={`module-${module.id}`}>
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-medium text-fg">{module.name}</h4>
        <span className={cn("text-[10px] font-semibold uppercase tracking-wide", CAT[module.category] ?? "text-fg-muted")}>
          {module.category}
        </span>
      </div>
      <p className="mt-1 text-xs text-fg-muted">{module.summary}</p>
    </div>
  );
}

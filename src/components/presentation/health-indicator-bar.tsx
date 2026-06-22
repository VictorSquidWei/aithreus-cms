import { cn } from "@/lib/utils";

export interface HealthComponent {
  name: string;
  status: "ok" | "degraded" | "down";
}

const DOT: Record<HealthComponent["status"], string> = {
  ok: "bg-positive",
  degraded: "bg-warning",
  down: "bg-negative",
};

// Ported from VNX-Bot's 9-component health bar (Handoff §9).
export function HealthIndicatorBar({ components }: { components: HealthComponent[] }) {
  return (
    <div className="flex flex-wrap gap-1.5" data-testid="health-bar">
      {components.map((c) => (
        <div
          key={c.name}
          title={`${c.name}: ${c.status}`}
          className="flex items-center gap-1.5 rounded border border-border bg-surface-2 px-2 py-1"
        >
          <span className={cn("h-2 w-2 rounded-full", DOT[c.status])} />
          <span className="text-[11px] text-fg-muted">{c.name}</span>
        </div>
      ))}
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { LinkState } from "@/server/resolution";

export function LinkStateBadge({ state, className }: { state: LinkState; className?: string }) {
  return (
    <span
      data-testid="link-state"
      data-state={state}
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
        state === "CUSTOM" ? "border border-accent text-accent" : "border border-border text-fg-muted",
        className,
      )}
    >
      {state}
    </span>
  );
}

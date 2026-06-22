import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function StepProgress({ steps }: { steps: { label: string; done: boolean }[] }) {
  return (
    <div className="flex items-center" data-testid="setup-progress">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold",
              s.done ? "border-positive text-positive" : "border-border text-fg-muted",
            )}
          >
            {s.done ? <Check size={14} /> : i + 1}
          </div>
          {i < steps.length - 1 && <div className="h-px w-8 bg-border" />}
        </div>
      ))}
    </div>
  );
}

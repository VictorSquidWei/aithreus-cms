import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "neutral" | "accent" | "positive" | "negative" | "warning" | "muted";

const variants: Record<Variant, string> = {
  neutral: "bg-surface-3 text-fg border border-border",
  accent: "bg-transparent text-accent border border-accent",
  positive: "bg-transparent text-positive border border-positive",
  negative: "bg-transparent text-negative border border-negative",
  warning: "bg-transparent text-warning border border-warning",
  muted: "bg-surface-2 text-fg-muted border border-border",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", variants[variant], className)}
      {...props}
    />
  );
}

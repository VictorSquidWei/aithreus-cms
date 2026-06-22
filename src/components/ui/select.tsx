import * as React from "react";
import { cn } from "@/lib/utils";

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "h-9 rounded border border-border bg-surface-1 px-2 text-sm text-fg",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Select.displayName = "Select";

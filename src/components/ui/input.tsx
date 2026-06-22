import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-9 w-full rounded border border-border bg-surface-1 px-3 text-sm text-fg placeholder:text-fg-faint",
        "focus:border-border-strong focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

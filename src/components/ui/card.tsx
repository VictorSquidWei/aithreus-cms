import * as React from "react";
import { cn } from "@/lib/utils";

type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: DivProps) {
  return <div className={cn("rounded-lg border border-border bg-surface-1", className)} {...props} />;
}
export function CardHeader({ className, ...props }: DivProps) {
  return <div className={cn("flex items-center justify-between gap-3 border-b border-border p-4", className)} {...props} />;
}
export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-sm font-semibold text-fg", className)} {...props} />;
}
export function CardContent({ className, ...props }: DivProps) {
  return <div className={cn("p-4", className)} {...props} />;
}
export function CardFooter({ className, ...props }: DivProps) {
  return <div className={cn("border-t border-border p-4", className)} {...props} />;
}

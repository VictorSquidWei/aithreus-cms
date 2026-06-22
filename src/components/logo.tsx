import { cn } from "@/lib/utils";

// Aithreus mark — geometric "A"/aperture from converging calibration lines, monochrome
// via currentColor. specs/components/logo.md.
export function Logo({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
      data-testid="brand-logo"
      aria-hidden="true"
    >
      <path d="M4 20 L12 4 L20 20" />
      <path d="M7.6 14 L16.4 14" />
      <circle cx="12" cy="4" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-fg", className)} data-testid="brand-wordmark">
      <Logo size={22} className="text-accent" />
      <span className="text-sm font-semibold tracking-tight">Aithreus</span>
    </span>
  );
}

import Link from "next/link";
import { Wordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-surface-1">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link href="/" className="flex items-center">
            <Wordmark />
          </Link>
          <nav className="flex items-center gap-1 sm:gap-3">
            <Link href="/portfolio" className="rounded px-2 py-1.5 text-sm text-fg-muted hover:text-fg" data-testid="nav-portfolio">
              Portfolio
            </Link>
            <ThemeToggle />
            <Button asChild size="sm">
              <Link href="/login" data-testid="nav-login">
                Log in
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-fg-faint sm:px-6">
          © {2026} Aithreus · Signal-and-calibration analytics + affiliate Link CMS
        </div>
      </footer>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { Wordmark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/server/actions/auth";
import type { SessionClaims } from "@/lib/types";

const NAV = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/platform", label: "Platform" },
  { href: "/integrations", label: "Integrations" },
  { href: "/status", label: "Status" },
  { href: "/docs", label: "Docs" },
];

export function GatedTopNav({ user }: { user: SessionClaims }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-1">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-5">
          <Link href="/portfolio" className="flex items-center">
            <Wordmark />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const active = pathname === n.href || (n.href !== "/portfolio" && pathname.startsWith(n.href));
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  data-testid={`gnav-${n.href}`}
                  className={cn("rounded px-2 py-1.5 text-sm transition-colors", active ? "text-accent" : "text-fg-muted hover:text-fg")}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="subtle">
            <Link href="/admin" data-testid="gnav-admin">
              <LayoutGrid size={14} /> Link CMS
            </Link>
          </Button>
          <ThemeToggle />
          <form action={logoutAction}>
            <Button type="submit" size="sm" variant="ghost">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Code2,
  Compass,
  FileText,
  Globe,
  LayoutDashboard,
  LayoutGrid,
  Link2,
  Menu,
  Plug,
  ScrollText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SessionClaims, VerticalKey } from "@/lib/types";
import { Wordmark } from "@/components/logo";
import { ProductSwitch } from "@/components/product-switch";
import { ThemeToggle } from "@/components/theme-toggle";
import { ToastProvider } from "@/components/ui/toast";
import { PublishBar } from "@/components/link-cms/publish-bar";
import { logoutAction } from "@/server/actions/auth";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ size?: number }> };
type NavSection = { section: string; internal?: boolean; items: NavItem[] };

const NAV: NavSection[] = [
  {
    section: "Setup",
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/setup", label: "Setup guide", icon: Compass },
    ],
  },
  {
    section: "Link CMS",
    items: [
      { href: "/admin/operators", label: "1 · Operators", icon: Plug },
      { href: "/admin/sites", label: "2 · Sites", icon: Globe },
      { href: "/admin/links", label: "3 · Edit links", icon: Link2 },
      { href: "/admin/embed", label: "4 · Embed code", icon: Code2 },
      { href: "/admin/gallery", label: "Widget gallery", icon: LayoutGrid },
      { href: "/admin/performance", label: "Performance", icon: BarChart3 },
    ],
  },
  {
    section: "Content",
    internal: true,
    items: [
      { href: "/admin/content", label: "Content panel", icon: FileText },
      { href: "/admin/audit", label: "Audit log", icon: ScrollText },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/admin" && pathname.startsWith(href));
}

function NavLinks({ role, onNavigate }: { role: SessionClaims["role"]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const internal = role === "superadmin" || role === "internal_editor";
  return (
    <nav className="flex flex-col gap-5 p-3">
      {NAV.filter((s) => !s.internal || internal).map((s) => (
        <div key={s.section}>
          <div className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-fg-faint">
            {s.section}
          </div>
          <div className="flex flex-col gap-0.5">
            {s.items.map((it) => {
              const active = isActive(pathname, it.href);
              const Icon = it.icon;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={onNavigate}
                  data-testid={`nav-${it.href}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded px-2 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-surface-3 font-medium text-accent"
                      : "text-fg-muted hover:bg-surface-2 hover:text-fg",
                  )}
                >
                  <Icon size={16} />
                  <span>{it.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function UserMenu({ user }: { user: SessionClaims }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        data-testid="user-menu"
        className="flex items-center gap-2 rounded border border-border bg-surface-1 px-2.5 py-1.5 text-xs text-fg hover:bg-surface-3"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-fg">
          {user.name.charAt(0)}
        </span>
        <span className="hidden sm:inline">{user.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-52 rounded-lg border border-border bg-surface-2 p-1.5 shadow-lg">
          <div className="px-2 py-1.5">
            <div className="truncate text-sm text-fg">{user.name}</div>
            <div className="truncate text-xs text-fg-faint">{user.email}</div>
            <div className="mt-1 inline-flex rounded bg-surface-3 px-1.5 py-0.5 text-[10px] font-medium text-fg-muted">
              {user.role}
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              data-testid="sign-out"
              className="mt-1 w-full rounded px-2 py-1.5 text-left text-sm text-fg-muted hover:bg-surface-3 hover:text-fg"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function AppShell({
  user,
  vertical,
  lastPublished,
  children,
}: {
  user: SessionClaims;
  vertical: VerticalKey;
  lastPublished: string | null;
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = React.useState(false);
  return (
    <ToastProvider>
    <div className="flex min-h-screen flex-col bg-bg">
      {/* Top bar */}
      <header
        data-testid="app-topbar"
        className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-border bg-surface-1 px-3 sm:px-4"
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDrawer(true)}
            aria-label="Open navigation"
            data-testid="sidebar-toggle"
            className="inline-flex h-9 w-9 items-center justify-center rounded text-fg-muted hover:bg-surface-3 md:hidden"
          >
            <Menu size={18} />
          </button>
          <Link href="/admin" className="flex items-center">
            <Wordmark />
          </Link>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ProductSwitch current={vertical} />
          <ThemeToggle />
          <UserMenu user={user} />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside
          data-testid="app-sidebar"
          className="hidden w-60 shrink-0 border-r border-border bg-surface-1 md:block"
        >
          <NavLinks role={user.role} />
        </aside>

        {/* Mobile drawer */}
        {drawer && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setDrawer(false)} />
            <div className="absolute left-0 top-0 h-full w-64 border-r border-border bg-surface-1">
              <div className="flex h-14 items-center justify-between border-b border-border px-3">
                <Wordmark />
                <button
                  type="button"
                  onClick={() => setDrawer(false)}
                  aria-label="Close navigation"
                  className="inline-flex h-9 w-9 items-center justify-center rounded text-fg-muted hover:bg-surface-3"
                >
                  <X size={18} />
                </button>
              </div>
              <NavLinks role={user.role} onNavigate={() => setDrawer(false)} />
            </div>
          </div>
        )}

        <main className="min-w-0 flex-1">{children}</main>
      </div>

      <PublishBar lastPublished={lastPublished} />
    </div>
    </ToastProvider>
  );
}

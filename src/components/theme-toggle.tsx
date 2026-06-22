"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

// specs/components/theme-toggle.md — dark default; persist to localStorage + cookie; no FOUC.
export function ThemeToggle({ className }: { className?: string }) {
  const [isLight, setIsLight] = React.useState(false);

  React.useEffect(() => {
    setIsLight(document.documentElement.classList.contains("light"));
  }, []);

  function toggle() {
    const next = !isLight;
    setIsLight(next);
    document.documentElement.classList.toggle("light", next);
    const val = next ? "light" : "dark";
    try {
      localStorage.setItem("aithreus-theme", val);
    } catch {}
    document.cookie = `aithreus-theme=${val}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title="Toggle theme"
      aria-label="Toggle theme"
      data-testid="theme-toggle"
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded text-fg-muted hover:bg-surface-3 hover:text-fg",
        className,
      )}
    >
      {isLight ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}

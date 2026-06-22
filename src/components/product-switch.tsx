"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { VerticalKey } from "@/lib/types";

const OPTIONS: { key: VerticalKey; label: string; title: string }[] = [
  { key: "TT", label: "TT", title: "TT (Sports)" },
  { key: "VNX", label: "VNX", title: "VNX (Prediction Markets)" },
];

// specs/components/product-switch.md — cookie source of truth (+ ?v= deep link), refreshes server data.
export function ProductSwitch({ current }: { current: VerticalKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Honor a ?v= deep link that differs from the cookie (on mount).
  React.useEffect(() => {
    const urlV = searchParams.get("v");
    if ((urlV === "TT" || urlV === "VNX") && urlV !== current) {
      writeCookie(urlV);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function writeCookie(v: VerticalKey) {
    document.cookie = `aithreus_vertical=${v}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }

  function select(v: VerticalKey) {
    if (v === current) return;
    writeCookie(v);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("v", v);
    router.replace(`${pathname}?${params.toString()}`);
    router.refresh();
  }

  return (
    <div
      role="tablist"
      aria-label="Product switch"
      data-testid="product-switch"
      className="inline-flex items-center rounded border border-border bg-surface-1 p-0.5"
    >
      {OPTIONS.map((o) => {
        const active = o.key === current;
        return (
          <button
            key={o.key}
            role="tab"
            aria-selected={active}
            title={o.title}
            data-testid={`product-switch-${o.key.toLowerCase()}`}
            onClick={() => select(o.key)}
            className={cn(
              "rounded px-3 py-1 text-xs font-semibold transition-colors",
              active ? "bg-accent text-accent-fg" : "text-fg-muted hover:text-fg",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

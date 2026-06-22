"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "error";
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
}

const ToastCtx = React.createContext<{ toast: (message: string, tone?: Tone) => void }>({ toast: () => {} });

export function useToast() {
  return React.useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((message: string, tone: Tone = "default") => {
    const id = Date.now() + Math.random();
    setItems((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 2600);
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2" data-testid="toasts">
        {items.map((t) => (
          <div
            key={t.id}
            data-testid="toast"
            className={cn(
              "pointer-events-auto rounded border bg-surface-2 px-3 py-2 text-sm shadow-lg",
              t.tone === "error" ? "border-negative text-negative" : "border-border text-fg",
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

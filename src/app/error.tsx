"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
      <h1 className="text-xl font-semibold text-fg">Something went wrong</h1>
      <p className="max-w-sm text-sm text-fg-muted">An unexpected error occurred. You can try again.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}

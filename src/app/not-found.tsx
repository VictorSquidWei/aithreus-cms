import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
      <Logo size={36} className="text-accent" />
      <h1 className="text-xl font-semibold text-fg">Page not found</h1>
      <p className="max-w-sm text-sm text-fg-muted">That page doesn&apos;t exist or has moved.</p>
      <Button asChild>
        <Link href="/">Back home</Link>
      </Button>
    </main>
  );
}

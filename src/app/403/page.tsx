import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Access denied" };

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
      <ShieldX size={40} className="text-negative" />
      <h1 className="text-xl font-semibold text-fg">You don&apos;t have access to this area</h1>
      <p className="max-w-md text-sm text-fg-muted">
        This section is restricted to internal Aithreus staff. If you think this is a mistake, contact your
        administrator.
      </p>
      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/admin">Back to workspace</Link>
        </Button>
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </main>
  );
}

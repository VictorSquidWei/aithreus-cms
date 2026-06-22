import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

const DEV_LOGINS = [
  { email: "super@aithreus.internal", password: "super123", role: "superadmin" },
  { email: "editor@aithreus.internal", password: "editor123", role: "internal_editor" },
  { email: "client@dimers.com", password: "client123", role: "affiliate_client" },
];

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const session = await getSession();
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") ? sp.next : "/admin";
  if (session) redirect(next);

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg p-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 text-fg">
          <Logo size={28} className="text-accent" />
          <span className="text-lg font-semibold tracking-tight">Aithreus</span>
        </Link>
        <div className="rounded-lg border border-border bg-surface-1 p-6">
          <h1 className="text-lg font-semibold text-fg">Sign in</h1>
          <p className="mb-5 mt-0.5 text-sm text-fg-muted">Access the Link CMS and product workspace.</p>
          <LoginForm next={next} />
        </div>

        <div className="mt-4 rounded-lg border border-border bg-surface-2 p-3">
          <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-fg-faint">
            Demo logins (dev)
          </div>
          <ul className="flex flex-col gap-1.5 font-mono text-xs text-fg-muted">
            {DEV_LOGINS.map((c) => (
              <li key={c.email} className="flex items-center justify-between gap-2">
                <span className="truncate">{c.email}</span>
                <span className="text-fg-faint">{c.password}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}

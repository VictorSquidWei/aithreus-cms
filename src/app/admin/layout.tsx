import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { AppShell } from "@/components/app-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");
  const vertical = await getActiveVertical();
  return (
    <AppShell user={session} vertical={vertical}>
      {children}
    </AppShell>
  );
}

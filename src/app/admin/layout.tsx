import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { AppShell } from "@/components/app-shell";
import type { Viewer } from "@/lib/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?next=/admin");

  const vertical = await getActiveVertical();
  const viewer: Viewer = { role: session.role, clientId: session.clientId };
  const store = getStore();
  const times = store
    .listSites(vertical, viewer)
    .map((s) => s.lastPublishedAt)
    .filter((t): t is string => !!t)
    .sort();
  const lastPublished = times.length ? `${times[times.length - 1].slice(0, 16).replace("T", " ")} UTC` : null;

  return (
    <AppShell user={session} vertical={vertical} lastPublished={lastPublished}>
      {children}
    </AppShell>
  );
}

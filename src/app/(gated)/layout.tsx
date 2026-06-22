import { redirect } from "next/navigation";
import { getSession } from "@/server/session";
import { GatedTopNav } from "@/components/presentation/gated-top-nav";

export default async function GatedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen bg-bg">
      <GatedTopNav user={session} />
      {children}
    </div>
  );
}

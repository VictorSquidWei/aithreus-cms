// Server-only session helpers (use next/headers). specs/00-product/03-auth-and-roles.md.
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";
import type { SessionClaims, Viewer } from "@/lib/types";

export async function getSession(): Promise<SessionClaims | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function getViewer(): Promise<Viewer> {
  const s = await getSession();
  return s ? { role: s.role, clientId: s.clientId } : { role: "public" };
}

export function isInternalRole(role: SessionClaims["role"]): boolean {
  return role === "superadmin" || role === "internal_editor";
}

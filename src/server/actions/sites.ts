"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { canAccessClient } from "@/server/visibility";

export type ActionResult = { ok: true } | { ok: false; error: string };

function normalizeDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export async function createSiteAction(input: { domain: string; status: "live" | "draft" }): Promise<ActionResult> {
  const viewer = await getViewer();
  if (viewer.role === "public") return { ok: false, error: "Not permitted" };
  const vertical = await getActiveVertical();
  const store = getStore();
  const v = await store.getVerticalByKey(vertical);
  if (!v) return { ok: false, error: "Unknown vertical" };

  const domain = normalizeDomain(input.domain);
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) return { ok: false, error: "Enter a valid domain (e.g. example.com)" };

  await store.createSite({ clientId: viewer.clientId, verticalId: v.id, domain, status: input.status, lastPublishedAt: null });
  revalidatePath("/admin/sites");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateSiteAction(
  id: string,
  input: { domain: string; status: "live" | "draft" },
): Promise<ActionResult> {
  const viewer = await getViewer();
  if (viewer.role === "public") return { ok: false, error: "Not permitted" };
  const store = getStore();
  const site = await store.getSite(id);
  if (!site) return { ok: false, error: "Site not found" };
  if (!canAccessClient(viewer, site.clientId)) return { ok: false, error: "Not permitted" };

  const domain = normalizeDomain(input.domain);
  if (!domain) return { ok: false, error: "Domain is required" };
  await store.updateSite(id, { domain, status: input.status });
  revalidatePath("/admin/sites");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteSiteAction(id: string): Promise<ActionResult> {
  const viewer = await getViewer();
  if (viewer.role === "public") return { ok: false, error: "Not permitted" };
  const store = getStore();
  const site = await store.getSite(id);
  if (!site) return { ok: false, error: "Site not found" };
  if (!canAccessClient(viewer, site.clientId)) return { ok: false, error: "Not permitted" };
  await store.deleteSite(id);
  revalidatePath("/admin/sites");
  revalidatePath("/admin");
  return { ok: true };
}

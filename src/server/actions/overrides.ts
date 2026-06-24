"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/server/session";
import { getStore, type DataStore } from "@/server/store";
import { canAccessClient } from "@/server/visibility";
import { isValidHttpUrl } from "@/lib/utils";
import type { Site } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

type Authorized = { ok: false; error: string } | { ok: true; store: DataStore; site: Site };

async function authorizeSite(siteId: string): Promise<Authorized> {
  const viewer = await getViewer();
  if (viewer.role === "public") return { ok: false, error: "Not permitted" };
  const store = getStore();
  const site = await store.getSite(siteId);
  if (!site) return { ok: false, error: "Site not found" };
  if (!canAccessClient(viewer, site.clientId)) return { ok: false, error: "Not permitted" };
  return { ok: true, store, site };
}

export async function upsertOverrideAction(
  siteId: string,
  widgetInstanceId: string,
  operatorId: string,
  url: string,
): Promise<ActionResult> {
  const auth = await authorizeSite(siteId);
  if (!auth.ok) return { ok: false, error: auth.error };
  if (!isValidHttpUrl(url)) return { ok: false, error: "Enter a valid http(s) URL" };
  await auth.store.upsertOverride(siteId, widgetInstanceId, operatorId, url.trim());
  revalidatePath("/admin/links");
  revalidatePath("/admin/sites");
  return { ok: true };
}

export async function resetOverrideAction(
  siteId: string,
  widgetInstanceId: string,
  operatorId: string,
): Promise<ActionResult> {
  const auth = await authorizeSite(siteId);
  if (!auth.ok) return { ok: false, error: auth.error };
  await auth.store.deleteOverride(siteId, widgetInstanceId, operatorId);
  revalidatePath("/admin/links");
  revalidatePath("/admin/sites");
  return { ok: true };
}

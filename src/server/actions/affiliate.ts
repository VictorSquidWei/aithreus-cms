"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/server/session";
import { getStore } from "@/server/store";
import { isValidHttpUrl } from "@/lib/utils";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function clientId(): Promise<string | null> {
  const v = await getViewer();
  return v.role === "public" ? null : v.clientId;
}

function revalidate() {
  revalidatePath("/admin/operators");
  revalidatePath("/admin/links");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin");
}

/** Set the logged-in client's affiliate link for a platform (enables it too). */
export async function upsertAffiliateLinkAction(operatorId: string, affiliateUrl: string): Promise<ActionResult> {
  const cid = await clientId();
  if (!cid) return { ok: false, error: "Not permitted" };
  if (!isValidHttpUrl(affiliateUrl)) return { ok: false, error: "Enter a valid http(s) URL" };
  await getStore().upsertAffiliateLink(cid, operatorId, affiliateUrl.trim());
  revalidate();
  return { ok: true };
}

/** The client's per-operator kill switch. Only toggles a link the client has already configured —
 *  it never creates one (a created link would default to the catalog house URL with no tracking). */
export async function setAffiliateLinkActiveAction(operatorId: string, active: boolean): Promise<ActionResult> {
  const cid = await clientId();
  if (!cid) return { ok: false, error: "Not permitted" };
  const updated = await getStore().setAffiliateLinkActive(cid, operatorId, active);
  if (!updated) return { ok: false, error: "Set a tracking link first" };
  revalidate();
  return { ok: true };
}

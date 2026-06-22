"use server";

import { revalidatePath } from "next/cache";
import { getSession, getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { buildPublishedSnapshot } from "@/server/resolution";
import type { Site, VerticalKey } from "@/lib/types";
import type { DataStore } from "@/server/store";

export interface PublishDiff {
  sitesAffected: number;
  changedLinks: number;
  perSite: { domain: string; changed: number }[];
}

async function context(): Promise<{ store: DataStore; sites: Site[] } | null> {
  const viewer = await getViewer();
  if (viewer.role === "public") return null;
  const vertical = await getActiveVertical();
  const store = getStore();
  return { store, sites: store.listSites(vertical, viewer) };
}

function diffTargets(prev: Record<string, string> | undefined, next: Record<string, string>): number {
  const keys = new Set([...Object.keys(prev ?? {}), ...Object.keys(next)]);
  let changed = 0;
  for (const k of keys) if ((prev ?? {})[k] !== next[k]) changed++;
  return changed;
}

export async function computePublishDiffAction(): Promise<PublishDiff> {
  const ctx = await context();
  if (!ctx) return { sitesAffected: 0, changedLinks: 0, perSite: [] };
  const { store, sites } = ctx;
  let changedLinks = 0;
  const perSite: { domain: string; changed: number }[] = [];
  for (const site of sites) {
    const next = buildPublishedSnapshot(store, site).targets;
    const published = store.getLatestPublished(site.configId);
    const changed = diffTargets(published?.targets, next);
    if (changed > 0 || !published) perSite.push({ domain: site.domain, changed });
    changedLinks += changed;
  }
  return { sitesAffected: perSite.length, changedLinks, perSite };
}

export async function publishAllAction(): Promise<{ ok: true; diff: PublishDiff } | { ok: false; error: string }> {
  const ctx = await context();
  if (!ctx) return { ok: false, error: "Not permitted" };
  const session = await getSession();
  const { store, sites } = ctx;
  const diff = await computePublishDiffAction();
  const now = new Date().toISOString();

  for (const site of sites) {
    const snap = buildPublishedSnapshot(store, site);
    const version = store.nextPublishVersion(site.configId);
    store.putPublished({
      id: `pc_${site.configId}_${version}`,
      siteId: site.id,
      configId: site.configId,
      verticalKey: (store.getVerticalById(site.verticalId)?.key ?? "TT") as VerticalKey,
      payload: snap.payload,
      targets: snap.targets,
      version,
      publishedByUserId: session?.userId ?? "system",
      publishedAt: now,
    });
    store.updateSite(site.id, { lastPublishedAt: now });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/sites");
  revalidatePath("/admin/embed");
  return { ok: true, diff };
}

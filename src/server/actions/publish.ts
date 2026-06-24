"use server";

import { revalidatePath } from "next/cache";
import { getSession, getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import type { DataStore } from "@/server/store";
import { buildPublishedSnapshot, ctaOperators, type PublishedSnapshot } from "@/server/resolution";
import type { Site, VerticalKey } from "@/lib/types";

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
  return { store, sites: await store.listSites(vertical, viewer) };
}

async function snapshotForSite(store: DataStore, site: Site): Promise<{ verticalKey: VerticalKey; snap: PublishedSnapshot }> {
  const vertical = await store.getVerticalById(site.verticalId);
  const verticalKey = (vertical?.key ?? "TT") as VerticalKey;
  const [instances, rawOps, overrides, types] = await Promise.all([
    store.listWidgetInstances(site.id),
    store.rawOperators(verticalKey),
    store.listOverrides(site.id),
    store.listWidgetTypes(verticalKey),
  ]);
  const typeById = new Map(types.map((t) => [t.id, t]));
  const snap = buildPublishedSnapshot({
    site,
    verticalKey,
    instances,
    widgetTypeById: (id) => typeById.get(id),
    activeOps: ctaOperators(rawOps),
    overrides,
  });
  return { verticalKey, snap };
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
    const { snap } = await snapshotForSite(store, site);
    const published = await store.getLatestPublished(site.configId);
    const changed = diffTargets(published?.targets, snap.targets);
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
    const { verticalKey, snap } = await snapshotForSite(store, site);
    const version = await store.nextPublishVersion(site.configId);
    await store.putPublished({
      id: `pc_${site.configId}_${version}`,
      siteId: site.id,
      configId: site.configId,
      verticalKey,
      payload: snap.payload,
      targets: snap.targets,
      version,
      publishedByUserId: session?.userId ?? "system",
      publishedAt: now,
    });
    await store.updateSite(site.id, { lastPublishedAt: now });
  }

  await store.appendAudit({
    ts: now,
    actorId: session?.userId ?? "system",
    actorName: session?.name ?? "System",
    action: "publish",
    summary: `Published ${sites.length} site(s) · ${diff.changedLinks} link change(s)`,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/sites");
  revalidatePath("/admin/embed");
  revalidatePath("/admin/audit");
  return { ok: true, diff };
}

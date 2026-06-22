// Centralized visibility filtering — specs/00-product/02-data-model.md §5, 03-auth-and-roles.md §5.
// Every store read passes results through these helpers with the current Viewer.
import type { Viewer, Operator, Module, Site } from "@/lib/types";

export function isInternal(viewer: Viewer): boolean {
  return viewer.role === "superadmin" || viewer.role === "internal_editor";
}

export function isPublic(viewer: Viewer): boolean {
  return viewer.role === "public";
}

/** Rule 1: internalOnly rows only for internal roles. */
export function visibleOperators(ops: Operator[], viewer: Viewer): Operator[] {
  if (isInternal(viewer)) return ops;
  return ops.filter((o) => !o.internalOnly);
}

/** Runtime/public reads: internalOnly filtered AND inactive excluded (Rules 1 + 2). */
export function publicOperators(ops: Operator[]): Operator[] {
  return ops.filter((o) => !o.internalOnly && o.active);
}

export function visibleModules(mods: Module[], viewer: Viewer): Module[] {
  if (isInternal(viewer)) return mods;
  return mods.filter((m) => !m.internalOnly);
}

/** Rule 4: affiliate_client is scoped to its own clientId. Internal roles see all. */
export function scopeSitesToViewer(sites: Site[], viewer: Viewer): Site[] {
  if (viewer.role === "affiliate_client") return sites.filter((s) => s.clientId === viewer.clientId);
  if (isInternal(viewer)) return sites;
  return []; // public sees no sites
}

export function canAccessClient(viewer: Viewer, clientId: string): boolean {
  if (isInternal(viewer)) return true;
  if (viewer.role === "affiliate_client") return viewer.clientId === clientId;
  return false;
}

/** Whether a viewer may reach internal-only admin areas (content panel, audit). */
export function canManageContent(viewer: Viewer): boolean {
  return isInternal(viewer);
}

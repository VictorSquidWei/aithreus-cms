"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/server/session";
import { getStore } from "@/server/store";
import { slugify } from "@/lib/utils";
import type { SessionClaims } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function requireInternal(): Promise<SessionClaims | null> {
  const session = await getSession();
  if (!session || (session.role !== "superadmin" && session.role !== "internal_editor")) return null;
  return session;
}

async function audit(session: SessionClaims, action: string, summary: string) {
  await getStore().appendAudit({ ts: new Date().toISOString(), actorId: session.userId, actorName: session.name, action, summary });
}

// ── Products ──
export async function updateProductAction(
  id: string,
  input: { tagline: string; whatItDoes: string; status: "live" | "beta" | "planned"; executes: boolean },
): Promise<ActionResult> {
  const session = await requireInternal();
  if (!session) return { ok: false, error: "Not permitted" };
  const store = getStore();
  const p = await store.getProduct(id);
  if (!p) return { ok: false, error: "Product not found" };
  if (!input.tagline.trim()) return { ok: false, error: "Tagline is required" };
  await store.updateProduct(id, {
    tagline: input.tagline.trim(),
    whatItDoes: input.whatItDoes,
    status: input.status,
    executes: input.executes,
  });
  await audit(session, "product.update", `Updated ${p.name}`);
  revalidatePath("/admin/content");
  revalidatePath("/admin/audit");
  revalidatePath(`/products/${p.slug}`);
  revalidatePath("/status");
  return { ok: true };
}

// ── Pages (docs) ──
export async function createPageAction(input: { title: string; slug: string; blocks: string }): Promise<ActionResult> {
  const session = await requireInternal();
  if (!session) return { ok: false, error: "Not permitted" };
  const store = getStore();
  const title = input.title.trim();
  if (!title) return { ok: false, error: "Title is required" };
  const slug = slugify(input.slug || title);
  if (await store.getPageBySlug(slug)) return { ok: false, error: "A page with that slug already exists" };
  await store.createPage({ title, slug, blocks: input.blocks });
  await audit(session, "page.create", `Created doc "${title}"`);
  revalidatePath("/admin/content");
  revalidatePath("/admin/audit");
  revalidatePath("/docs");
  return { ok: true };
}

export async function updatePageAction(id: string, input: { title: string; blocks: string }): Promise<ActionResult> {
  const session = await requireInternal();
  if (!session) return { ok: false, error: "Not permitted" };
  const store = getStore();
  const pg = await store.getPage(id);
  if (!pg) return { ok: false, error: "Page not found" };
  if (!input.title.trim()) return { ok: false, error: "Title is required" };
  await store.updatePage(id, { title: input.title.trim(), blocks: input.blocks });
  await audit(session, "page.update", `Updated doc "${pg.title}"`);
  revalidatePath("/admin/content");
  revalidatePath("/admin/audit");
  revalidatePath("/docs");
  revalidatePath(`/docs/${pg.slug}`);
  return { ok: true };
}

export async function deletePageAction(id: string): Promise<ActionResult> {
  const session = await requireInternal();
  if (!session) return { ok: false, error: "Not permitted" };
  const store = getStore();
  const pg = await store.getPage(id);
  if (!pg) return { ok: false, error: "Page not found" };
  await store.deletePage(id);
  await audit(session, "page.delete", `Deleted doc "${pg.title}"`);
  revalidatePath("/admin/content");
  revalidatePath("/admin/audit");
  revalidatePath("/docs");
  return { ok: true };
}

// ── Changelog ──
export async function createChangelogAction(input: {
  productId: string;
  date: string;
  version: string;
  notes: string;
}): Promise<ActionResult> {
  const session = await requireInternal();
  if (!session) return { ok: false, error: "Not permitted" };
  const store = getStore();
  const p = await store.getProduct(input.productId);
  if (!p) return { ok: false, error: "Choose a product" };
  if (!input.version.trim() || !input.notes.trim()) return { ok: false, error: "Version and notes are required" };
  await store.createChangelog({
    productId: input.productId,
    date: input.date || "2026-06-21",
    version: input.version.trim(),
    notes: input.notes.trim(),
  });
  await audit(session, "changelog.create", `Released ${p.name} ${input.version.trim()}`);
  revalidatePath("/admin/content");
  revalidatePath("/admin/audit");
  revalidatePath(`/products/${p.slug}`);
  return { ok: true };
}

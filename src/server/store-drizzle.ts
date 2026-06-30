// Postgres implementation of the DataStore interface (Drizzle ORM).
// Selected by getStore() when DATABASE_URL is set. Same async shape as InMemoryStore.
import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, type SQL } from "drizzle-orm";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as s from "@/db/schema";
import type { DataStore, EventFilter, SiteCounts } from "@/server/data-store";
import { buildSeed } from "@/server/seed-data";
import { buildPublishedSnapshot, eligibleOperators } from "@/server/resolution";
import { scopeSitesToViewer, visibleOperators } from "@/server/visibility";
import type {
  AffiliateLink,
  AnalyticsEvent,
  AuditEntry,
  Changelog,
  LinkOverride,
  Module,
  Operator,
  Page,
  Product,
  PublishedConfig,
  ResolvedConfig,
  Site,
  VerticalKey,
  Viewer,
  WidgetInstance,
} from "@/lib/types";

export type DB = NodePgDatabase<typeof s>;

const mapOperator = (r: typeof s.operators.$inferSelect): Operator => ({ ...r, estPayout: r.estPayout ?? undefined });

export class DrizzleStore implements DataStore {
  constructor(private db: DB) {}

  // ── seeding / reset ──
  async reset(): Promise<void> {
    const db = this.db;
    const seed = buildSeed();
    // wipe (order doesn't matter — no FK constraints declared)
    await Promise.all([
      db.delete(s.publishedConfigs),
      db.delete(s.events),
      db.delete(s.linkOverrides),
      db.delete(s.affiliateLinks),
      db.delete(s.widgetInstances),
      db.delete(s.widgetTypes),
      db.delete(s.operators),
      db.delete(s.sites),
      db.delete(s.users),
      db.delete(s.clients),
      db.delete(s.verticals),
      db.delete(s.products),
      db.delete(s.modules),
      db.delete(s.strategies),
      db.delete(s.tiers),
      db.delete(s.changelog),
      db.delete(s.statusFeed),
      db.delete(s.pages),
      db.delete(s.auditLog),
    ]);

    if (seed.clients.length) await db.insert(s.clients).values(seed.clients);
    if (seed.users.length) await db.insert(s.users).values(seed.users);
    if (seed.verticals.length) await db.insert(s.verticals).values(seed.verticals);
    if (seed.operators.length) await db.insert(s.operators).values(seed.operators);
    if (seed.sites.length) await db.insert(s.sites).values(seed.sites);
    if (seed.widgetTypes.length) await db.insert(s.widgetTypes).values(seed.widgetTypes);
    if (seed.widgetInstances.length) await db.insert(s.widgetInstances).values(seed.widgetInstances);
    if (seed.overrides.length) await db.insert(s.linkOverrides).values(seed.overrides);
    if (seed.affiliateLinks.length) await db.insert(s.affiliateLinks).values(seed.affiliateLinks);
    if (seed.products.length) await db.insert(s.products).values(seed.products);
    if (seed.modules.length) await db.insert(s.modules).values(seed.modules);
    if (seed.strategies.length) await db.insert(s.strategies).values(seed.strategies);
    if (seed.tiers.length) await db.insert(s.tiers).values(seed.tiers);
    if (seed.changelog.length) await db.insert(s.changelog).values(seed.changelog);
    if (seed.statusFeed.length) await db.insert(s.statusFeed).values(seed.statusFeed);
    if (seed.pages.length)
      await db.insert(s.pages).values(seed.pages.map((p) => ({ ...p, blocks: String(p.blocks) })));
    if (seed.audit.length) await db.insert(s.auditLog).values(seed.audit);

    // events can be numerous — insert in chunks to stay under parameter limits
    for (let i = 0; i < seed.events.length; i += 400) {
      await db.insert(s.events).values(seed.events.slice(i, i + 400));
    }

    // pre-publish live sites
    for (const site of seed.sites.filter((x) => x.status === "live")) {
      const vertical = seed.verticals.find((v) => v.id === site.verticalId);
      const verticalKey = (vertical?.key ?? "TT") as VerticalKey;
      const typeById = new Map(seed.widgetTypes.map((t) => [t.id, t]));
      const snap = buildPublishedSnapshot({
        site,
        verticalKey,
        instances: seed.widgetInstances.filter((w) => w.siteId === site.id),
        widgetTypeById: (id) => typeById.get(id),
        eligible: eligibleOperators(
          seed.operators.filter((o) => o.verticalId === site.verticalId),
          seed.affiliateLinks.filter((l) => l.clientId === site.clientId),
        ),
        overrides: seed.overrides.filter((o) => o.siteId === site.id),
      });
      const at = new Date().toISOString();
      await db.insert(s.publishedConfigs).values({
        id: `pc_${site.configId}_1`,
        siteId: site.id,
        configId: site.configId,
        verticalKey,
        payload: snap.payload,
        targets: snap.targets,
        version: 1,
        publishedByUserId: "seed",
        publishedAt: at,
      });
      await db.update(s.sites).set({ lastPublishedAt: at }).where(eq(s.sites.id, site.id));
    }
  }

  private async verticalIdOf(key: VerticalKey): Promise<string | undefined> {
    const rows = await this.db.select().from(s.verticals).where(eq(s.verticals.key, key));
    return rows[0]?.id;
  }

  // ── identity ──
  async getUserByEmail(email: string) {
    const rows = await this.db.select().from(s.users);
    return rows.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  async getUserById(id: string) {
    return (await this.db.select().from(s.users).where(eq(s.users.id, id)))[0];
  }
  async getClientById(id: string) {
    return (await this.db.select().from(s.clients).where(eq(s.clients.id, id)))[0];
  }

  // ── verticals ──
  async listVerticals() {
    return this.db.select().from(s.verticals);
  }
  async getVerticalByKey(key: VerticalKey) {
    return (await this.db.select().from(s.verticals).where(eq(s.verticals.key, key)))[0];
  }
  async getVerticalById(id: string) {
    return (await this.db.select().from(s.verticals).where(eq(s.verticals.id, id)))[0];
  }

  // ── operators ──
  async listOperators(key: VerticalKey, viewer: Viewer): Promise<Operator[]> {
    const ops = await this.rawOperators(key);
    const sorted = ops.sort((a, b) => a.name.localeCompare(b.name));
    return visibleOperators(sorted, viewer);
  }
  async rawOperators(key: VerticalKey): Promise<Operator[]> {
    const vid = await this.verticalIdOf(key);
    if (!vid) return [];
    const rows = await this.db.select().from(s.operators).where(eq(s.operators.verticalId, vid));
    return rows.map(mapOperator);
  }
  async getOperator(id: string) {
    const r = (await this.db.select().from(s.operators).where(eq(s.operators.id, id)))[0];
    return r ? mapOperator(r) : undefined;
  }
  async createOperator(input: Omit<Operator, "id">): Promise<Operator> {
    const op: Operator = { ...input, id: `op_${randomUUID().slice(0, 8)}` };
    await this.db.insert(s.operators).values(op);
    return op;
  }
  async updateOperator(id: string, patch: Partial<Operator>): Promise<Operator | undefined> {
    await this.db.update(s.operators).set(patch).where(eq(s.operators.id, id));
    return this.getOperator(id);
  }
  async deleteOperator(id: string): Promise<boolean> {
    await this.db.delete(s.operators).where(eq(s.operators.id, id));
    return true;
  }
  async operatorExists(verticalId: string, name: string, exceptId?: string): Promise<boolean> {
    const rows = await this.db.select().from(s.operators).where(eq(s.operators.verticalId, verticalId));
    return rows.some((o) => o.id !== exceptId && o.name.toLowerCase() === name.toLowerCase());
  }

  // ── sites ──
  async listSites(key: VerticalKey, viewer: Viewer): Promise<Site[]> {
    const vid = await this.verticalIdOf(key);
    if (!vid) return [];
    const rows = await this.db.select().from(s.sites).where(eq(s.sites.verticalId, vid));
    return scopeSitesToViewer(rows, viewer).sort((a, b) => a.domain.localeCompare(b.domain));
  }
  async getSite(id: string) {
    return (await this.db.select().from(s.sites).where(eq(s.sites.id, id)))[0];
  }
  async getSiteByConfigId(configId: string) {
    return (await this.db.select().from(s.sites).where(eq(s.sites.configId, configId)))[0];
  }
  async createSite(input: Omit<Site, "id" | "configId"> & { configId?: string }): Promise<Site> {
    const site: Site = {
      ...input,
      id: `st_${randomUUID().slice(0, 8)}`,
      configId: input.configId ?? `site_${randomUUID().slice(0, 10)}`,
      lastPublishedAt: input.lastPublishedAt ?? null,
    };
    await this.db.insert(s.sites).values(site);
    return site;
  }
  async updateSite(id: string, patch: Partial<Site>): Promise<Site | undefined> {
    await this.db.update(s.sites).set(patch).where(eq(s.sites.id, id));
    return this.getSite(id);
  }
  async deleteSite(id: string): Promise<boolean> {
    await this.db.delete(s.widgetInstances).where(eq(s.widgetInstances.siteId, id));
    await this.db.delete(s.linkOverrides).where(eq(s.linkOverrides.siteId, id));
    await this.db.delete(s.sites).where(eq(s.sites.id, id));
    return true;
  }
  async siteCounts(siteId: string): Promise<SiteCounts> {
    const links = (await this.db.select().from(s.widgetInstances).where(eq(s.widgetInstances.siteId, siteId))).length;
    const overrides = (await this.db.select().from(s.linkOverrides).where(eq(s.linkOverrides.siteId, siteId))).length;
    return { pages: 1, links, overrides };
  }

  // ── widget catalog & instances ──
  async listWidgetTypes(key: VerticalKey) {
    const vid = await this.verticalIdOf(key);
    if (!vid) return [];
    return this.db.select().from(s.widgetTypes).where(eq(s.widgetTypes.verticalId, vid));
  }
  async getWidgetType(id: string) {
    return (await this.db.select().from(s.widgetTypes).where(eq(s.widgetTypes.id, id)))[0];
  }
  async listWidgetInstances(siteId: string): Promise<WidgetInstance[]> {
    return this.db.select().from(s.widgetInstances).where(eq(s.widgetInstances.siteId, siteId));
  }
  async createWidgetInstance(siteId: string, widgetTypeId: string): Promise<WidgetInstance> {
    const wi: WidgetInstance = { id: `wi_${randomUUID().slice(0, 8)}`, siteId, widgetTypeId };
    await this.db.insert(s.widgetInstances).values(wi);
    return wi;
  }
  async deleteWidgetInstance(id: string): Promise<boolean> {
    await this.db.delete(s.linkOverrides).where(eq(s.linkOverrides.widgetInstanceId, id));
    await this.db.delete(s.widgetInstances).where(eq(s.widgetInstances.id, id));
    return true;
  }

  // ── overrides ──
  async listOverrides(siteId: string): Promise<LinkOverride[]> {
    return this.db.select().from(s.linkOverrides).where(eq(s.linkOverrides.siteId, siteId));
  }
  async upsertOverride(siteId: string, widgetInstanceId: string, operatorId: string, affiliateUrl: string): Promise<LinkOverride> {
    const existing = (
      await this.db
        .select()
        .from(s.linkOverrides)
        .where(and(eq(s.linkOverrides.siteId, siteId), eq(s.linkOverrides.widgetInstanceId, widgetInstanceId), eq(s.linkOverrides.operatorId, operatorId)))
    )[0];
    if (existing) {
      await this.db.update(s.linkOverrides).set({ affiliateUrl }).where(eq(s.linkOverrides.id, existing.id));
      return { ...existing, affiliateUrl };
    }
    const ov: LinkOverride = { id: `lo_${randomUUID().slice(0, 8)}`, siteId, widgetInstanceId, operatorId, affiliateUrl };
    await this.db.insert(s.linkOverrides).values(ov);
    return ov;
  }
  async deleteOverride(siteId: string, widgetInstanceId: string, operatorId: string): Promise<boolean> {
    await this.db
      .delete(s.linkOverrides)
      .where(and(eq(s.linkOverrides.siteId, siteId), eq(s.linkOverrides.widgetInstanceId, widgetInstanceId), eq(s.linkOverrides.operatorId, operatorId)));
    return true;
  }

  // ── affiliate links (per-client) ──
  async listAffiliateLinks(clientId: string): Promise<AffiliateLink[]> {
    return this.db.select().from(s.affiliateLinks).where(eq(s.affiliateLinks.clientId, clientId));
  }
  async getAffiliateLink(clientId: string, operatorId: string): Promise<AffiliateLink | undefined> {
    return (
      await this.db
        .select()
        .from(s.affiliateLinks)
        .where(and(eq(s.affiliateLinks.clientId, clientId), eq(s.affiliateLinks.operatorId, operatorId)))
    )[0];
  }
  async upsertAffiliateLink(clientId: string, operatorId: string, affiliateUrl: string): Promise<AffiliateLink> {
    const existing = await this.getAffiliateLink(clientId, operatorId);
    const link: AffiliateLink = existing
      ? { ...existing, affiliateUrl, active: true }
      : { id: `al_${randomUUID().slice(0, 8)}`, clientId, operatorId, affiliateUrl, active: true };
    // Atomic upsert keyed on the (clientId, operatorId) unique constraint — two concurrent
    // saves resolve to one row instead of racing the read-then-write into duplicates.
    await this.db
      .insert(s.affiliateLinks)
      .values(link)
      .onConflictDoUpdate({
        target: [s.affiliateLinks.clientId, s.affiliateLinks.operatorId],
        set: { affiliateUrl, active: true },
      });
    return link;
  }
  async setAffiliateLinkActive(clientId: string, operatorId: string, active: boolean): Promise<AffiliateLink | undefined> {
    const existing = await this.getAffiliateLink(clientId, operatorId);
    if (!existing) return undefined;
    await this.db.update(s.affiliateLinks).set({ active }).where(eq(s.affiliateLinks.id, existing.id));
    return { ...existing, active };
  }

  // ── published config ──
  async getLatestPublished(configId: string): Promise<PublishedConfig | undefined> {
    const r = (
      await this.db.select().from(s.publishedConfigs).where(eq(s.publishedConfigs.configId, configId)).orderBy(desc(s.publishedConfigs.version)).limit(1)
    )[0];
    return r ? { ...r, payload: r.payload as ResolvedConfig, targets: r.targets as Record<string, string> } : undefined;
  }
  async putPublished(pc: PublishedConfig): Promise<void> {
    await this.db.insert(s.publishedConfigs).values(pc);
  }
  async nextPublishVersion(configId: string): Promise<number> {
    const r = (
      await this.db.select().from(s.publishedConfigs).where(eq(s.publishedConfigs.configId, configId)).orderBy(desc(s.publishedConfigs.version)).limit(1)
    )[0];
    return (r?.version ?? 0) + 1;
  }

  // ── events ──
  async appendEvent(e: Omit<AnalyticsEvent, "id">): Promise<AnalyticsEvent> {
    const ev: AnalyticsEvent = { ...e, id: `ev_${randomUUID()}` };
    await this.db.insert(s.events).values(ev);
    return ev;
  }
  async listEvents(filter?: EventFilter): Promise<AnalyticsEvent[]> {
    const conds: SQL[] = [];
    if (filter?.type) conds.push(eq(s.events.type, filter.type));
    if (filter?.configId) conds.push(eq(s.events.configId, filter.configId));
    if (filter?.siteId) conds.push(eq(s.events.siteId, filter.siteId));
    if (filter?.widgetInstanceId) conds.push(eq(s.events.widgetInstanceId, filter.widgetInstanceId));
    if (filter?.operatorId) conds.push(eq(s.events.operatorId, filter.operatorId));
    if (filter?.verticalId) conds.push(eq(s.events.verticalId, filter.verticalId));
    const rows = conds.length
      ? await this.db.select().from(s.events).where(and(...conds))
      : await this.db.select().from(s.events);
    return rows.map((r) => ({ ...r, meta: (r.meta ?? null) as Record<string, unknown> | null }));
  }

  // ── content ──
  async listProducts(verticalKey?: VerticalKey): Promise<Product[]> {
    const rows = await this.db.select().from(s.products);
    const vid = verticalKey ? await this.verticalIdOf(verticalKey) : undefined;
    return rows.filter((p) => !vid || p.verticalId === vid).sort((a, b) => a.name.localeCompare(b.name));
  }
  async getProduct(id: string) {
    return (await this.db.select().from(s.products).where(eq(s.products.id, id)))[0];
  }
  async getProductBySlug(slug: string) {
    return (await this.db.select().from(s.products).where(eq(s.products.slug, slug)))[0];
  }
  async updateProduct(id: string, patch: Partial<Product>): Promise<Product | undefined> {
    await this.db.update(s.products).set(patch).where(eq(s.products.id, id));
    return this.getProduct(id);
  }
  async listModules(productId: string): Promise<Module[]> {
    return this.db.select().from(s.modules).where(eq(s.modules.productId, productId));
  }
  async getModule(id: string) {
    return (await this.db.select().from(s.modules).where(eq(s.modules.id, id)))[0];
  }
  async createModule(input: Omit<Module, "id">): Promise<Module> {
    const mo: Module = { ...input, id: `mod_${randomUUID().slice(0, 8)}` };
    await this.db.insert(s.modules).values(mo);
    return mo;
  }
  async updateModule(id: string, patch: Partial<Module>): Promise<Module | undefined> {
    await this.db.update(s.modules).set(patch).where(eq(s.modules.id, id));
    return this.getModule(id);
  }
  async deleteModule(id: string): Promise<boolean> {
    await this.db.delete(s.modules).where(eq(s.modules.id, id));
    return true;
  }
  async listStrategies(productId: string) {
    return this.db.select().from(s.strategies).where(eq(s.strategies.productId, productId));
  }
  async listTiers(productId: string) {
    const rows = await this.db.select().from(s.tiers).where(eq(s.tiers.productId, productId));
    return rows.map((r) => ({ ...r, featureFlags: r.featureFlags as string[] }));
  }
  async listChangelog(productId: string): Promise<Changelog[]> {
    const rows = await this.db.select().from(s.changelog).where(eq(s.changelog.productId, productId));
    return rows.sort((a, b) => b.date.localeCompare(a.date));
  }
  async createChangelog(input: Omit<Changelog, "id">): Promise<Changelog> {
    const cl: Changelog = { ...input, id: `cl_${randomUUID().slice(0, 8)}` };
    await this.db.insert(s.changelog).values(cl);
    return cl;
  }
  async listStatusFeed(productId: string) {
    return this.db.select().from(s.statusFeed).where(eq(s.statusFeed.productId, productId));
  }
  async listPages(): Promise<Page[]> {
    const rows = await this.db.select().from(s.pages).orderBy(asc(s.pages.title));
    return rows as Page[];
  }
  async getPage(id: string) {
    return (await this.db.select().from(s.pages).where(eq(s.pages.id, id)))[0] as Page | undefined;
  }
  async getPageBySlug(slug: string) {
    return (await this.db.select().from(s.pages).where(eq(s.pages.slug, slug)))[0] as Page | undefined;
  }
  async createPage(input: Omit<Page, "id">): Promise<Page> {
    const pg: Page = { ...input, id: `pg_${randomUUID().slice(0, 8)}` };
    await this.db.insert(s.pages).values({ ...pg, blocks: String(pg.blocks) });
    return pg;
  }
  async updatePage(id: string, patch: Partial<Page>): Promise<Page | undefined> {
    const set: Record<string, unknown> = { ...patch };
    if ("blocks" in set) set.blocks = String(set.blocks);
    await this.db.update(s.pages).set(set).where(eq(s.pages.id, id));
    return this.getPage(id);
  }
  async deletePage(id: string): Promise<boolean> {
    await this.db.delete(s.pages).where(eq(s.pages.id, id));
    return true;
  }
  async listAudit() {
    const rows = await this.db.select().from(s.auditLog);
    return rows.sort((a, b) => b.ts.localeCompare(a.ts));
  }
  async appendAudit(entry: Omit<AuditEntry, "id">) {
    const a = { ...entry, id: `au_${randomUUID().slice(0, 8)}` };
    await this.db.insert(s.auditLog).values(a);
    return a;
  }
}

let _store: DrizzleStore | undefined;

export function createDrizzleStore(): DataStore {
  if (!_store) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _store = new DrizzleStore(drizzle(pool, { schema: s }));
  }
  return _store;
}

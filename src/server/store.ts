// Repository interface (async) — specs/00-product/01-architecture.md D4.
// InMemoryStore is the zero-setup default (demo). DrizzleStore (store-drizzle.ts) implements
// the SAME async shape against Postgres and is selected when DATABASE_URL is set.
import { randomUUID } from "node:crypto";
import type {
  AffiliateLink,
  AnalyticsEvent,
  AuditEntry,
  Changelog,
  Client,
  LinkOverride,
  Module,
  Operator,
  Page,
  Product,
  PublishedConfig,
  Site,
  StatusFeed,
  Strategy,
  Tier,
  User,
  Vertical,
  VerticalKey,
  Viewer,
  WidgetInstance,
  WidgetType,
} from "@/lib/types";
import { scopeSitesToViewer, visibleOperators } from "@/server/visibility";
import { buildSeed } from "@/server/seed-data";
import { buildPublishedSnapshot, eligibleOperators } from "@/server/resolution";
import type { DataStore, SiteCounts } from "@/server/data-store";
import { createDrizzleStore } from "@/server/store-drizzle";

export type { DataStore, SiteCounts };

class InMemoryStore implements DataStore {
  private clients = new Map<string, Client>();
  private users = new Map<string, User>();
  private verticals = new Map<string, Vertical>();
  private operators = new Map<string, Operator>();
  private sites = new Map<string, Site>();
  private widgetTypes = new Map<string, WidgetType>();
  private widgetInstances = new Map<string, WidgetInstance>();
  private overrides = new Map<string, LinkOverride>();
  private affiliateLinks = new Map<string, AffiliateLink>();
  private published = new Map<string, PublishedConfig[]>();
  private events: AnalyticsEvent[] = [];
  private products = new Map<string, Product>();
  private modules = new Map<string, Module>();
  private strategies = new Map<string, Strategy>();
  private tiers = new Map<string, Tier>();
  private changelog = new Map<string, Changelog>();
  private statusFeed = new Map<string, StatusFeed>();
  private pages = new Map<string, Page>();
  private auditLog: AuditEntry[] = [];

  constructor() {
    this.loadSeed();
  }

  async reset(): Promise<void> {
    this.loadSeed();
  }

  private loadSeed() {
    const seed = buildSeed();
    const fill = <T extends { id: string }>(map: Map<string, T>, rows: T[]) => {
      map.clear();
      for (const r of rows) map.set(r.id, r);
    };
    fill(this.clients, seed.clients);
    fill(this.users, seed.users);
    fill(this.verticals, seed.verticals);
    fill(this.operators, seed.operators);
    fill(this.sites, seed.sites);
    fill(this.widgetTypes, seed.widgetTypes);
    fill(this.widgetInstances, seed.widgetInstances);
    fill(this.overrides, seed.overrides);
    fill(this.affiliateLinks, seed.affiliateLinks);
    fill(this.products, seed.products);
    fill(this.modules, seed.modules);
    fill(this.strategies, seed.strategies);
    fill(this.tiers, seed.tiers);
    fill(this.changelog, seed.changelog);
    fill(this.statusFeed, seed.statusFeed);
    fill(this.pages, seed.pages);
    this.events = [...seed.events];
    this.auditLog = [...seed.audit];
    this.published.clear();

    // Pre-publish live sites so the runtime + /demo render immediately (seed-time publish).
    for (const site of [...this.sites.values()].filter((s) => s.status === "live")) {
      const vertical = [...this.verticals.values()].find((v) => v.id === site.verticalId);
      const verticalKey = (vertical?.key ?? "TT") as VerticalKey;
      const snap = buildPublishedSnapshot({
        site,
        verticalKey,
        instances: [...this.widgetInstances.values()].filter((w) => w.siteId === site.id),
        widgetTypeById: (id) => this.widgetTypes.get(id),
        eligible: eligibleOperators(
          [...this.operators.values()].filter((o) => o.verticalId === site.verticalId),
          [...this.affiliateLinks.values()].filter((l) => l.clientId === site.clientId),
        ),
        overrides: [...this.overrides.values()].filter((o) => o.siteId === site.id),
      });
      const at = new Date().toISOString();
      this.published.set(site.configId, [
        { id: `pc_${site.configId}_1`, siteId: site.id, configId: site.configId, verticalKey, payload: snap.payload, targets: snap.targets, version: 1, publishedByUserId: "seed", publishedAt: at },
      ]);
      site.lastPublishedAt = at;
    }
  }

  private verticalIdOf(key: VerticalKey): string | undefined {
    return [...this.verticals.values()].find((v) => v.key === key)?.id;
  }

  // ── identity ──
  async getUserByEmail(email: string) {
    return [...this.users.values()].find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  async getUserById(id: string) {
    return this.users.get(id);
  }
  async getClientById(id: string) {
    return this.clients.get(id);
  }

  // ── verticals ──
  async listVerticals() {
    return [...this.verticals.values()];
  }
  async getVerticalByKey(key: VerticalKey) {
    return [...this.verticals.values()].find((v) => v.key === key);
  }
  async getVerticalById(id: string) {
    return this.verticals.get(id);
  }

  // ── operators ──
  async listOperators(key: VerticalKey, viewer: Viewer): Promise<Operator[]> {
    const vid = this.verticalIdOf(key);
    const rows = [...this.operators.values()].filter((o) => o.verticalId === vid).sort((a, b) => a.name.localeCompare(b.name));
    return visibleOperators(rows, viewer);
  }
  async rawOperators(key: VerticalKey): Promise<Operator[]> {
    const vid = this.verticalIdOf(key);
    return [...this.operators.values()].filter((o) => o.verticalId === vid);
  }
  async getOperator(id: string) {
    return this.operators.get(id);
  }
  async createOperator(input: Omit<Operator, "id">): Promise<Operator> {
    const op: Operator = { ...input, id: `op_${randomUUID().slice(0, 8)}` };
    this.operators.set(op.id, op);
    return op;
  }
  async updateOperator(id: string, patch: Partial<Operator>): Promise<Operator | undefined> {
    const cur = this.operators.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id };
    this.operators.set(id, next);
    return next;
  }
  async deleteOperator(id: string): Promise<boolean> {
    return this.operators.delete(id);
  }
  async operatorExists(verticalId: string, name: string, exceptId?: string): Promise<boolean> {
    return [...this.operators.values()].some(
      (o) => o.id !== exceptId && o.verticalId === verticalId && o.name.toLowerCase() === name.toLowerCase(),
    );
  }

  // ── sites ──
  async listSites(key: VerticalKey, viewer: Viewer): Promise<Site[]> {
    const vid = this.verticalIdOf(key);
    const rows = [...this.sites.values()].filter((s) => s.verticalId === vid);
    return scopeSitesToViewer(rows, viewer).sort((a, b) => a.domain.localeCompare(b.domain));
  }
  async getSite(id: string) {
    return this.sites.get(id);
  }
  async getSiteByConfigId(configId: string) {
    return [...this.sites.values()].find((s) => s.configId === configId);
  }
  async createSite(input: Omit<Site, "id" | "configId"> & { configId?: string }): Promise<Site> {
    const site: Site = {
      ...input,
      id: `st_${randomUUID().slice(0, 8)}`,
      configId: input.configId ?? `site_${randomUUID().slice(0, 10)}`,
      lastPublishedAt: input.lastPublishedAt ?? null,
    };
    this.sites.set(site.id, site);
    return site;
  }
  async updateSite(id: string, patch: Partial<Site>): Promise<Site | undefined> {
    const cur = this.sites.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id };
    this.sites.set(id, next);
    return next;
  }
  async deleteSite(id: string): Promise<boolean> {
    for (const wi of [...this.widgetInstances.values()].filter((w) => w.siteId === id)) this.widgetInstances.delete(wi.id);
    for (const ov of [...this.overrides.values()].filter((o) => o.siteId === id)) this.overrides.delete(ov.id);
    return this.sites.delete(id);
  }
  async siteCounts(siteId: string): Promise<SiteCounts> {
    const links = [...this.widgetInstances.values()].filter((w) => w.siteId === siteId).length;
    const overrides = [...this.overrides.values()].filter((o) => o.siteId === siteId).length;
    return { pages: 1, links, overrides };
  }

  // ── widget catalog & instances ──
  async listWidgetTypes(key: VerticalKey): Promise<WidgetType[]> {
    const vid = this.verticalIdOf(key);
    return [...this.widgetTypes.values()].filter((w) => w.verticalId === vid);
  }
  async getWidgetType(id: string) {
    return this.widgetTypes.get(id);
  }
  async listWidgetInstances(siteId: string): Promise<WidgetInstance[]> {
    return [...this.widgetInstances.values()].filter((w) => w.siteId === siteId);
  }
  async createWidgetInstance(siteId: string, widgetTypeId: string): Promise<WidgetInstance> {
    const wi: WidgetInstance = { id: `wi_${randomUUID().slice(0, 8)}`, siteId, widgetTypeId };
    this.widgetInstances.set(wi.id, wi);
    return wi;
  }
  async deleteWidgetInstance(id: string): Promise<boolean> {
    for (const ov of [...this.overrides.values()].filter((o) => o.widgetInstanceId === id)) this.overrides.delete(ov.id);
    return this.widgetInstances.delete(id);
  }

  // ── overrides ──
  async listOverrides(siteId: string): Promise<LinkOverride[]> {
    return [...this.overrides.values()].filter((o) => o.siteId === siteId);
  }
  async upsertOverride(siteId: string, widgetInstanceId: string, operatorId: string, affiliateUrl: string): Promise<LinkOverride> {
    const existing = [...this.overrides.values()].find(
      (o) => o.siteId === siteId && o.widgetInstanceId === widgetInstanceId && o.operatorId === operatorId,
    );
    if (existing) {
      const next = { ...existing, affiliateUrl };
      this.overrides.set(existing.id, next);
      return next;
    }
    const ov: LinkOverride = { id: `lo_${randomUUID().slice(0, 8)}`, siteId, widgetInstanceId, operatorId, affiliateUrl };
    this.overrides.set(ov.id, ov);
    return ov;
  }
  async deleteOverride(siteId: string, widgetInstanceId: string, operatorId: string): Promise<boolean> {
    const existing = [...this.overrides.values()].find(
      (o) => o.siteId === siteId && o.widgetInstanceId === widgetInstanceId && o.operatorId === operatorId,
    );
    return existing ? this.overrides.delete(existing.id) : false;
  }

  // ── affiliate links (per-client) ──
  async listAffiliateLinks(clientId: string): Promise<AffiliateLink[]> {
    return [...this.affiliateLinks.values()].filter((l) => l.clientId === clientId);
  }
  async getAffiliateLink(clientId: string, operatorId: string): Promise<AffiliateLink | undefined> {
    return [...this.affiliateLinks.values()].find((l) => l.clientId === clientId && l.operatorId === operatorId);
  }
  async upsertAffiliateLink(clientId: string, operatorId: string, affiliateUrl: string): Promise<AffiliateLink> {
    const existing = [...this.affiliateLinks.values()].find((l) => l.clientId === clientId && l.operatorId === operatorId);
    if (existing) {
      const next = { ...existing, affiliateUrl, active: true };
      this.affiliateLinks.set(existing.id, next);
      return next;
    }
    const link: AffiliateLink = {
      id: `al_${randomUUID().slice(0, 8)}`,
      clientId,
      operatorId,
      affiliateUrl,
      active: true,
    };
    this.affiliateLinks.set(link.id, link);
    return link;
  }
  async setAffiliateLinkActive(clientId: string, operatorId: string, active: boolean): Promise<AffiliateLink | undefined> {
    const existing = [...this.affiliateLinks.values()].find((l) => l.clientId === clientId && l.operatorId === operatorId);
    if (!existing) return undefined;
    const next = { ...existing, active };
    this.affiliateLinks.set(existing.id, next);
    return next;
  }

  // ── published config ──
  async getLatestPublished(configId: string): Promise<PublishedConfig | undefined> {
    const versions = this.published.get(configId);
    return versions && versions.length ? versions[versions.length - 1] : undefined;
  }
  async putPublished(pc: PublishedConfig): Promise<void> {
    const arr = this.published.get(pc.configId) ?? [];
    arr.push(pc);
    this.published.set(pc.configId, arr);
  }
  async nextPublishVersion(configId: string): Promise<number> {
    const versions = this.published.get(configId);
    return (versions && versions.length ? versions[versions.length - 1].version : 0) + 1;
  }

  // ── events ──
  async appendEvent(e: Omit<AnalyticsEvent, "id">): Promise<AnalyticsEvent> {
    const ev: AnalyticsEvent = { ...e, id: `ev_${randomUUID()}` };
    this.events.push(ev);
    return ev;
  }
  async listEvents(filter?: Partial<Pick<AnalyticsEvent, "configId" | "siteId" | "widgetInstanceId" | "operatorId" | "verticalId" | "type">>): Promise<AnalyticsEvent[]> {
    if (!filter) return this.events;
    return this.events.filter((e) =>
      Object.entries(filter).every(([k, v]) => v == null || (e as unknown as Record<string, unknown>)[k] === v),
    );
  }

  // ── content (Layer A / B1) ──
  async listProducts(verticalKey?: VerticalKey): Promise<Product[]> {
    const vid = verticalKey ? this.verticalIdOf(verticalKey) : undefined;
    return [...this.products.values()].filter((p) => !vid || p.verticalId === vid).sort((a, b) => a.name.localeCompare(b.name));
  }
  async getProduct(id: string) {
    return this.products.get(id);
  }
  async getProductBySlug(slug: string) {
    return [...this.products.values()].find((p) => p.slug === slug);
  }
  async updateProduct(id: string, patch: Partial<Product>): Promise<Product | undefined> {
    const cur = this.products.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id };
    this.products.set(id, next);
    return next;
  }
  async listModules(productId: string): Promise<Module[]> {
    return [...this.modules.values()].filter((x) => x.productId === productId);
  }
  async getModule(id: string) {
    return this.modules.get(id);
  }
  async createModule(input: Omit<Module, "id">): Promise<Module> {
    const mo: Module = { ...input, id: `mod_${randomUUID().slice(0, 8)}` };
    this.modules.set(mo.id, mo);
    return mo;
  }
  async updateModule(id: string, patch: Partial<Module>): Promise<Module | undefined> {
    const cur = this.modules.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id };
    this.modules.set(id, next);
    return next;
  }
  async deleteModule(id: string): Promise<boolean> {
    return this.modules.delete(id);
  }
  async listStrategies(productId: string): Promise<Strategy[]> {
    return [...this.strategies.values()].filter((x) => x.productId === productId);
  }
  async listTiers(productId: string): Promise<Tier[]> {
    return [...this.tiers.values()].filter((x) => x.productId === productId);
  }
  async listChangelog(productId: string): Promise<Changelog[]> {
    return [...this.changelog.values()].filter((x) => x.productId === productId).sort((a, b) => b.date.localeCompare(a.date));
  }
  async createChangelog(input: Omit<Changelog, "id">): Promise<Changelog> {
    const cl: Changelog = { ...input, id: `cl_${randomUUID().slice(0, 8)}` };
    this.changelog.set(cl.id, cl);
    return cl;
  }
  async listStatusFeed(productId: string): Promise<StatusFeed[]> {
    return [...this.statusFeed.values()].filter((x) => x.productId === productId);
  }
  async listPages(): Promise<Page[]> {
    return [...this.pages.values()].sort((a, b) => a.title.localeCompare(b.title));
  }
  async getPage(id: string) {
    return this.pages.get(id);
  }
  async getPageBySlug(slug: string) {
    return [...this.pages.values()].find((p) => p.slug === slug);
  }
  async createPage(input: Omit<Page, "id">): Promise<Page> {
    const pg: Page = { ...input, id: `pg_${randomUUID().slice(0, 8)}` };
    this.pages.set(pg.id, pg);
    return pg;
  }
  async updatePage(id: string, patch: Partial<Page>): Promise<Page | undefined> {
    const cur = this.pages.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id };
    this.pages.set(id, next);
    return next;
  }
  async deletePage(id: string): Promise<boolean> {
    return this.pages.delete(id);
  }
  async listAudit(): Promise<AuditEntry[]> {
    return [...this.auditLog].sort((a, b) => b.ts.localeCompare(a.ts));
  }
  async appendAudit(entry: Omit<AuditEntry, "id">): Promise<AuditEntry> {
    const a: AuditEntry = { ...entry, id: `au_${randomUUID().slice(0, 8)}` };
    this.auditLog.push(a);
    return a;
  }
}

const g = globalThis as unknown as { __aithreusStore?: DataStore };

export function getStore(): DataStore {
  if (!g.__aithreusStore) {
    g.__aithreusStore = createStore();
  }
  return g.__aithreusStore;
}

function createStore(): DataStore {
  // DATABASE_URL → Postgres via Drizzle; otherwise the in-memory store (zero-setup demo).
  return process.env.DATABASE_URL ? createDrizzleStore() : new InMemoryStore();
}

/** Dev/test only: re-seed the store to a clean state. */
export async function resetStore(): Promise<void> {
  await getStore().reset();
}

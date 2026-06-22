// In-memory DataStore (specs/00-product/01-architecture.md D4). Postgres/Drizzle drops
// in behind the same shape in Phase 7 with zero UI changes. State is cached on globalThis
// so it survives Next HMR / persists for the server-process lifetime — this is what makes
// the §9.14 change→Publish→reload loop work before Postgres exists (D6).
import { randomUUID } from "node:crypto";
import type {
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
import { buildPublishedSnapshot } from "@/server/resolution";

export interface SiteCounts {
  pages: number;
  links: number; // widget instances
  overrides: number;
}

class InMemoryStore {
  clients = new Map<string, Client>();
  users = new Map<string, User>();
  verticals = new Map<string, Vertical>();
  operators = new Map<string, Operator>();
  sites = new Map<string, Site>();
  widgetTypes = new Map<string, WidgetType>();
  widgetInstances = new Map<string, WidgetInstance>();
  overrides = new Map<string, LinkOverride>();
  published = new Map<string, PublishedConfig[]>(); // configId -> versions
  events: AnalyticsEvent[] = [];
  products = new Map<string, Product>();
  modules = new Map<string, Module>();
  strategies = new Map<string, Strategy>();
  tiers = new Map<string, Tier>();
  changelog = new Map<string, Changelog>();
  statusFeed = new Map<string, StatusFeed>();
  pages = new Map<string, Page>();
  audit: AuditEntry[] = [];

  constructor() {
    const seed = buildSeed();
    for (const c of seed.clients) this.clients.set(c.id, c);
    for (const u of seed.users) this.users.set(u.id, u);
    for (const v of seed.verticals) this.verticals.set(v.id, v);
    for (const o of seed.operators) this.operators.set(o.id, o);
    for (const s of seed.sites) this.sites.set(s.id, s);
    for (const w of seed.widgetTypes) this.widgetTypes.set(w.id, w);
    for (const wi of seed.widgetInstances) this.widgetInstances.set(wi.id, wi);
    for (const ov of seed.overrides) this.overrides.set(ov.id, ov);
    this.events = seed.events ?? [];
    for (const p of seed.products) this.products.set(p.id, p);
    for (const x of seed.modules) this.modules.set(x.id, x);
    for (const x of seed.strategies) this.strategies.set(x.id, x);
    for (const x of seed.tiers) this.tiers.set(x.id, x);
    for (const x of seed.changelog) this.changelog.set(x.id, x);
    for (const x of seed.statusFeed) this.statusFeed.set(x.id, x);
    for (const x of seed.pages) this.pages.set(x.id, x);
    this.audit = seed.audit ?? [];

    // Pre-publish live sites so the runtime + /demo render immediately (seed-time publish).
    for (const site of this.sites.values()) {
      if (site.status !== "live") continue;
      const snap = buildPublishedSnapshot(this, site);
      const at = new Date().toISOString();
      this.published.set(site.configId, [
        {
          id: `pc_${site.configId}_1`,
          siteId: site.id,
          configId: site.configId,
          verticalKey: (this.getVerticalById(site.verticalId)?.key ?? "TT") as VerticalKey,
          payload: snap.payload,
          targets: snap.targets,
          version: 1,
          publishedByUserId: "seed",
          publishedAt: at,
        },
      ]);
      site.lastPublishedAt = at;
    }
  }

  // ── identity ────────────────────────────────────────────────────────
  getUserByEmail(email: string) {
    return [...this.users.values()].find((u) => u.email.toLowerCase() === email.toLowerCase());
  }
  getUserById(id: string) {
    return this.users.get(id);
  }
  getClientById(id: string) {
    return this.clients.get(id);
  }

  // ── verticals ───────────────────────────────────────────────────────
  listVerticals() {
    return [...this.verticals.values()];
  }
  getVerticalByKey(key: VerticalKey) {
    return [...this.verticals.values()].find((v) => v.key === key);
  }
  getVerticalById(id: string) {
    return this.verticals.get(id);
  }
  private verticalId(key: VerticalKey) {
    return this.getVerticalByKey(key)?.id;
  }

  // ── operators (admin reads: keep inactive, filter internalOnly by viewer) ──
  listOperators(key: VerticalKey, viewer: Viewer): Operator[] {
    const vid = this.verticalId(key);
    const rows = [...this.operators.values()].filter((o) => o.verticalId === vid);
    rows.sort((a, b) => a.name.localeCompare(b.name));
    return visibleOperators(rows, viewer);
  }
  /** Raw operators for a vertical (no viewer filter) — used by the runtime resolver. */
  rawOperators(key: VerticalKey): Operator[] {
    const vid = this.verticalId(key);
    return [...this.operators.values()].filter((o) => o.verticalId === vid);
  }
  getOperator(id: string) {
    return this.operators.get(id);
  }
  createOperator(input: Omit<Operator, "id">): Operator {
    const op: Operator = { ...input, id: `op_${randomUUID().slice(0, 8)}` };
    this.operators.set(op.id, op);
    return op;
  }
  updateOperator(id: string, patch: Partial<Operator>): Operator | undefined {
    const cur = this.operators.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id };
    this.operators.set(id, next);
    return next;
  }
  deleteOperator(id: string): boolean {
    return this.operators.delete(id);
  }

  // ── sites (scoped to client + vertical) ─────────────────────────────
  listSites(key: VerticalKey, viewer: Viewer): Site[] {
    const vid = this.verticalId(key);
    const rows = [...this.sites.values()].filter((s) => s.verticalId === vid);
    return scopeSitesToViewer(rows, viewer).sort((a, b) => a.domain.localeCompare(b.domain));
  }
  getSite(id: string) {
    return this.sites.get(id);
  }
  getSiteByConfigId(configId: string) {
    return [...this.sites.values()].find((s) => s.configId === configId);
  }
  createSite(input: Omit<Site, "id" | "configId"> & { configId?: string }): Site {
    const site: Site = {
      ...input,
      id: `st_${randomUUID().slice(0, 8)}`,
      configId: input.configId ?? `site_${randomUUID().slice(0, 10)}`,
      lastPublishedAt: input.lastPublishedAt ?? null,
    };
    this.sites.set(site.id, site);
    return site;
  }
  updateSite(id: string, patch: Partial<Site>): Site | undefined {
    const cur = this.sites.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id };
    this.sites.set(id, next);
    return next;
  }
  deleteSite(id: string): boolean {
    // cascade instances + overrides
    for (const wi of [...this.widgetInstances.values()].filter((w) => w.siteId === id)) this.widgetInstances.delete(wi.id);
    for (const ov of [...this.overrides.values()].filter((o) => o.siteId === id)) this.overrides.delete(ov.id);
    return this.sites.delete(id);
  }
  siteCounts(siteId: string): SiteCounts {
    const links = [...this.widgetInstances.values()].filter((w) => w.siteId === siteId).length;
    const overrides = [...this.overrides.values()].filter((o) => o.siteId === siteId).length;
    return { pages: 1, links, overrides }; // pages: v1 is site-level (single logical page)
  }

  // ── widget catalog & instances ──────────────────────────────────────
  listWidgetTypes(key: VerticalKey): WidgetType[] {
    const vid = this.verticalId(key);
    return [...this.widgetTypes.values()].filter((w) => w.verticalId === vid);
  }
  getWidgetType(id: string) {
    return this.widgetTypes.get(id);
  }
  getWidgetTypeByKey(key: string) {
    return [...this.widgetTypes.values()].find((w) => w.key === key);
  }
  listWidgetInstances(siteId: string): WidgetInstance[] {
    return [...this.widgetInstances.values()].filter((w) => w.siteId === siteId);
  }
  getWidgetInstance(id: string) {
    return this.widgetInstances.get(id);
  }
  createWidgetInstance(siteId: string, widgetTypeId: string): WidgetInstance {
    const wi: WidgetInstance = { id: `wi_${randomUUID().slice(0, 8)}`, siteId, widgetTypeId };
    this.widgetInstances.set(wi.id, wi);
    return wi;
  }
  deleteWidgetInstance(id: string): boolean {
    for (const ov of [...this.overrides.values()].filter((o) => o.widgetInstanceId === id)) this.overrides.delete(ov.id);
    return this.widgetInstances.delete(id);
  }

  // ── overrides ───────────────────────────────────────────────────────
  listOverrides(siteId: string): LinkOverride[] {
    return [...this.overrides.values()].filter((o) => o.siteId === siteId);
  }
  findOverride(siteId: string, widgetInstanceId: string, operatorId: string) {
    return [...this.overrides.values()].find(
      (o) => o.siteId === siteId && o.widgetInstanceId === widgetInstanceId && o.operatorId === operatorId,
    );
  }
  upsertOverride(siteId: string, widgetInstanceId: string, operatorId: string, affiliateUrl: string): LinkOverride {
    const existing = this.findOverride(siteId, widgetInstanceId, operatorId);
    if (existing) {
      const next = { ...existing, affiliateUrl };
      this.overrides.set(existing.id, next);
      return next;
    }
    const ov: LinkOverride = { id: `lo_${randomUUID().slice(0, 8)}`, siteId, widgetInstanceId, operatorId, affiliateUrl };
    this.overrides.set(ov.id, ov);
    return ov;
  }
  deleteOverride(siteId: string, widgetInstanceId: string, operatorId: string): boolean {
    const existing = this.findOverride(siteId, widgetInstanceId, operatorId);
    return existing ? this.overrides.delete(existing.id) : false;
  }

  // ── published config (runtime source of truth) ──────────────────────
  getLatestPublished(configId: string): PublishedConfig | undefined {
    const versions = this.published.get(configId);
    return versions && versions.length ? versions[versions.length - 1] : undefined;
  }
  putPublished(pc: PublishedConfig) {
    const arr = this.published.get(pc.configId) ?? [];
    arr.push(pc);
    this.published.set(pc.configId, arr);
  }
  nextPublishVersion(configId: string): number {
    return (this.getLatestPublished(configId)?.version ?? 0) + 1;
  }

  // ── events ──────────────────────────────────────────────────────────
  appendEvent(e: Omit<AnalyticsEvent, "id">): AnalyticsEvent {
    const ev: AnalyticsEvent = { ...e, id: `ev_${randomUUID()}` };
    this.events.push(ev);
    return ev;
  }
  listEvents(filter?: Partial<Pick<AnalyticsEvent, "configId" | "siteId" | "widgetInstanceId" | "operatorId" | "verticalId" | "type">>): AnalyticsEvent[] {
    if (!filter) return this.events;
    return this.events.filter((e) =>
      Object.entries(filter).every(([k, v]) => v == null || (e as unknown as Record<string, unknown>)[k] === v),
    );
  }

  // ── content (Layer A / B1) ──────────────────────────────────────────
  listProducts(verticalKey?: VerticalKey): Product[] {
    const vid = verticalKey ? this.verticalId(verticalKey) : undefined;
    return [...this.products.values()]
      .filter((p) => !vid || p.verticalId === vid)
      .sort((a, b) => a.name.localeCompare(b.name));
  }
  getProduct(id: string) {
    return this.products.get(id);
  }
  getProductBySlug(slug: string) {
    return [...this.products.values()].find((p) => p.slug === slug);
  }
  updateProduct(id: string, patch: Partial<Product>): Product | undefined {
    const cur = this.products.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id };
    this.products.set(id, next);
    return next;
  }

  listModules(productId: string): Module[] {
    return [...this.modules.values()].filter((x) => x.productId === productId);
  }
  getModule(id: string) {
    return this.modules.get(id);
  }
  createModule(input: Omit<Module, "id">): Module {
    const mo: Module = { ...input, id: `mod_${randomUUID().slice(0, 8)}` };
    this.modules.set(mo.id, mo);
    return mo;
  }
  updateModule(id: string, patch: Partial<Module>): Module | undefined {
    const cur = this.modules.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id };
    this.modules.set(id, next);
    return next;
  }
  deleteModule(id: string): boolean {
    return this.modules.delete(id);
  }

  listStrategies(productId: string): Strategy[] {
    return [...this.strategies.values()].filter((x) => x.productId === productId);
  }
  listTiers(productId: string): Tier[] {
    return [...this.tiers.values()].filter((x) => x.productId === productId);
  }

  listChangelog(productId: string): Changelog[] {
    return [...this.changelog.values()]
      .filter((x) => x.productId === productId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }
  createChangelog(input: Omit<Changelog, "id">): Changelog {
    const cl: Changelog = { ...input, id: `cl_${randomUUID().slice(0, 8)}` };
    this.changelog.set(cl.id, cl);
    return cl;
  }

  listStatusFeed(productId: string): StatusFeed[] {
    return [...this.statusFeed.values()].filter((x) => x.productId === productId);
  }

  listPages(): Page[] {
    return [...this.pages.values()].sort((a, b) => a.title.localeCompare(b.title));
  }
  getPage(id: string) {
    return this.pages.get(id);
  }
  getPageBySlug(slug: string) {
    return [...this.pages.values()].find((p) => p.slug === slug);
  }
  createPage(input: Omit<Page, "id">): Page {
    const pg: Page = { ...input, id: `pg_${randomUUID().slice(0, 8)}` };
    this.pages.set(pg.id, pg);
    return pg;
  }
  updatePage(id: string, patch: Partial<Page>): Page | undefined {
    const cur = this.pages.get(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch, id };
    this.pages.set(id, next);
    return next;
  }
  deletePage(id: string): boolean {
    return this.pages.delete(id);
  }

  listAudit(): AuditEntry[] {
    return [...this.audit].sort((a, b) => b.ts.localeCompare(a.ts));
  }
  appendAudit(entry: Omit<AuditEntry, "id">): AuditEntry {
    const a: AuditEntry = { ...entry, id: `au_${randomUUID().slice(0, 8)}` };
    this.audit.push(a);
    return a;
  }
}

export type DataStore = InstanceType<typeof InMemoryStore>;

// Singleton, cached on globalThis to survive HMR and persist process state.
const g = globalThis as unknown as { __aithreusStore?: InMemoryStore };
export function getStore(): DataStore {
  if (!g.__aithreusStore) g.__aithreusStore = new InMemoryStore();
  return g.__aithreusStore;
}

/** Dev/test only: re-seed the store to a clean state. */
export function resetStore(): void {
  g.__aithreusStore = new InMemoryStore();
}

// The async repository interface every screen/server-action depends on.
// Implemented by InMemoryStore (store.ts) and DrizzleStore (store-drizzle.ts).
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

export interface SiteCounts {
  pages: number;
  links: number;
  overrides: number;
}

export type EventFilter = Partial<
  Pick<AnalyticsEvent, "configId" | "siteId" | "widgetInstanceId" | "operatorId" | "verticalId" | "type">
>;

export interface DataStore {
  reset(): Promise<void>;

  // identity
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getClientById(id: string): Promise<Client | undefined>;

  // verticals
  listVerticals(): Promise<Vertical[]>;
  getVerticalByKey(key: VerticalKey): Promise<Vertical | undefined>;
  getVerticalById(id: string): Promise<Vertical | undefined>;

  // operators
  listOperators(key: VerticalKey, viewer: Viewer): Promise<Operator[]>;
  rawOperators(key: VerticalKey): Promise<Operator[]>;
  getOperator(id: string): Promise<Operator | undefined>;
  createOperator(input: Omit<Operator, "id">): Promise<Operator>;
  updateOperator(id: string, patch: Partial<Operator>): Promise<Operator | undefined>;
  deleteOperator(id: string): Promise<boolean>;
  operatorExists(verticalId: string, name: string, exceptId?: string): Promise<boolean>;

  // sites
  listSites(key: VerticalKey, viewer: Viewer): Promise<Site[]>;
  getSite(id: string): Promise<Site | undefined>;
  getSiteByConfigId(configId: string): Promise<Site | undefined>;
  createSite(input: Omit<Site, "id" | "configId"> & { configId?: string }): Promise<Site>;
  updateSite(id: string, patch: Partial<Site>): Promise<Site | undefined>;
  deleteSite(id: string): Promise<boolean>;
  siteCounts(siteId: string): Promise<SiteCounts>;

  // widget catalog & instances
  listWidgetTypes(key: VerticalKey): Promise<WidgetType[]>;
  getWidgetType(id: string): Promise<WidgetType | undefined>;
  listWidgetInstances(siteId: string): Promise<WidgetInstance[]>;
  createWidgetInstance(siteId: string, widgetTypeId: string): Promise<WidgetInstance>;
  deleteWidgetInstance(id: string): Promise<boolean>;

  // overrides
  listOverrides(siteId: string): Promise<LinkOverride[]>;
  upsertOverride(siteId: string, widgetInstanceId: string, operatorId: string, affiliateUrl: string): Promise<LinkOverride>;
  deleteOverride(siteId: string, widgetInstanceId: string, operatorId: string): Promise<boolean>;

  // published config
  getLatestPublished(configId: string): Promise<PublishedConfig | undefined>;
  putPublished(pc: PublishedConfig): Promise<void>;
  nextPublishVersion(configId: string): Promise<number>;

  // events
  appendEvent(e: Omit<AnalyticsEvent, "id">): Promise<AnalyticsEvent>;
  listEvents(filter?: EventFilter): Promise<AnalyticsEvent[]>;

  // content (Layer A / B1)
  listProducts(verticalKey?: VerticalKey): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  updateProduct(id: string, patch: Partial<Product>): Promise<Product | undefined>;
  listModules(productId: string): Promise<Module[]>;
  getModule(id: string): Promise<Module | undefined>;
  createModule(input: Omit<Module, "id">): Promise<Module>;
  updateModule(id: string, patch: Partial<Module>): Promise<Module | undefined>;
  deleteModule(id: string): Promise<boolean>;
  listStrategies(productId: string): Promise<Strategy[]>;
  listTiers(productId: string): Promise<Tier[]>;
  listChangelog(productId: string): Promise<Changelog[]>;
  createChangelog(input: Omit<Changelog, "id">): Promise<Changelog>;
  listStatusFeed(productId: string): Promise<StatusFeed[]>;
  listPages(): Promise<Page[]>;
  getPage(id: string): Promise<Page | undefined>;
  getPageBySlug(slug: string): Promise<Page | undefined>;
  createPage(input: Omit<Page, "id">): Promise<Page>;
  updatePage(id: string, patch: Partial<Page>): Promise<Page | undefined>;
  deletePage(id: string): Promise<boolean>;
  listAudit(): Promise<AuditEntry[]>;
  appendAudit(entry: Omit<AuditEntry, "id">): Promise<AuditEntry>;
}

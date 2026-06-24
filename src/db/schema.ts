// Drizzle/Postgres schema — mirrors specs/00-product/02-data-model.md.
// Date/time columns are stored as ISO strings (text) to match the app's string types 1:1.
// `.$type<>()` pins text/jsonb columns to the domain's string-literal unions so rows map
// directly to the domain types with no casting.
import { boolean, integer, jsonb, pgTable, real, text } from "drizzle-orm/pg-core";
import type { OperatorCategory, ResolvedConfig, Role, VerticalKey } from "@/lib/types";

type ModuleCategory = "data" | "signal" | "calibration" | "execution" | "risk" | "health" | "alerting" | "ui";

export const clients = pgTable("clients", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").$type<"affiliate" | "internal">().notNull(),
  status: text("status").$type<"active" | "paused">().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").$type<Role>().notNull(),
  name: text("name").notNull(),
});

export const verticals = pgTable("verticals", {
  id: text("id").primaryKey(),
  key: text("key").$type<VerticalKey>().notNull(),
  name: text("name").notNull(),
  domain: text("domain").$type<"sports" | "prediction_markets">().notNull(),
  description: text("description").notNull(),
});

export const operators = pgTable("operators", {
  id: text("id").primaryKey(),
  verticalId: text("vertical_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  buttonLabel: text("button_label").notNull(),
  brandColor: text("brand_color").notNull(),
  affiliateUrl: text("affiliate_url").notNull(),
  active: boolean("active").notNull(),
  category: text("category").$type<OperatorCategory>().notNull(),
  role: text("role").notNull(),
  authType: text("auth_type").notNull(),
  integrationStatus: text("integration_status").$type<"live" | "beta" | "planned">().notNull(),
  internalOnly: boolean("internal_only").notNull(),
  estPayout: real("est_payout"),
  logoAssetId: text("logo_asset_id"),
});

export const sites = pgTable("sites", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull(),
  verticalId: text("vertical_id").notNull(),
  domain: text("domain").notNull(),
  status: text("status").$type<"live" | "draft">().notNull(),
  configId: text("config_id").notNull().unique(),
  lastPublishedAt: text("last_published_at"),
});

export const widgetTypes = pgTable("widget_types", {
  id: text("id").primaryKey(),
  verticalId: text("vertical_id").notNull(),
  key: text("key").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ctaMode: text("cta_mode").$type<"single" | "multi">().notNull(),
  ctaRendering: text("cta_rendering").$type<"fixed_slot" | "per_row" | "per_market">().notNull(),
  sampleDataJson: jsonb("sample_data_json"),
  thumbnailAssetId: text("thumbnail_asset_id"),
});

export const widgetInstances = pgTable("widget_instances", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull(),
  widgetTypeId: text("widget_type_id").notNull(),
});

export const linkOverrides = pgTable("link_overrides", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull(),
  widgetInstanceId: text("widget_instance_id").notNull(),
  operatorId: text("operator_id").notNull(),
  affiliateUrl: text("affiliate_url").notNull(),
});

export const publishedConfigs = pgTable("published_configs", {
  id: text("id").primaryKey(),
  siteId: text("site_id").notNull(),
  configId: text("config_id").notNull(),
  verticalKey: text("vertical_key").$type<VerticalKey>().notNull(),
  payload: jsonb("payload").$type<ResolvedConfig>().notNull(),
  targets: jsonb("targets").$type<Record<string, string>>().notNull(),
  version: integer("version").notNull(),
  publishedByUserId: text("published_by_user_id").notNull(),
  publishedAt: text("published_at").notNull(),
});

export const events = pgTable("events", {
  id: text("id").primaryKey(),
  type: text("type").$type<"impression" | "click" | "conversion">().notNull(),
  configId: text("config_id").notNull(),
  siteId: text("site_id").notNull(),
  widgetInstanceId: text("widget_instance_id").notNull(),
  operatorId: text("operator_id").notNull(),
  verticalId: text("vertical_id").notNull(),
  ts: text("ts").notNull(),
  anonId: text("anon_id").notNull(),
  ua: text("ua"),
  referer: text("referer"),
  meta: jsonb("meta").$type<Record<string, unknown>>(),
});

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  verticalId: text("vertical_id").notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  type: text("type").$type<"terminal" | "bot">().notNull(),
  executes: boolean("executes").notNull(),
  holdsFunds: boolean("holds_funds").notNull(),
  holdsCredentials: boolean("holds_credentials").notNull(),
  tagline: text("tagline").notNull(),
  whatItDoes: text("what_it_does").notNull(),
  status: text("status").$type<"live" | "beta" | "planned">().notNull(),
  heroAssetId: text("hero_asset_id"),
});

export const modules = pgTable("modules", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  summary: text("summary").notNull(),
  category: text("category").$type<ModuleCategory>().notNull(),
  detail: text("detail").notNull(),
  internalOnly: boolean("internal_only").notNull(),
});

export const strategies = pgTable("strategies", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  venue: text("venue").notNull(),
  status: text("status").notNull(),
});

export const tiers = pgTable("tiers", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  name: text("name").notNull(),
  featureFlags: jsonb("feature_flags").$type<string[]>().notNull(),
});

export const changelog = pgTable("changelog", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  date: text("date").notNull(),
  version: text("version").notNull(),
  notes: text("notes").notNull(),
});

export const statusFeed = pgTable("status_feed", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull(),
  metricKey: text("metric_key").notNull(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const pages = pgTable("pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  blocks: text("blocks").notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  ts: text("ts").notNull(),
  actorId: text("actor_id").notNull(),
  actorName: text("actor_name").notNull(),
  action: text("action").notNull(),
  summary: text("summary").notNull(),
});

// Domain model — specs/00-product/02-data-model.md. Storage-agnostic (in-memory now, Drizzle later).

export type Role = "superadmin" | "internal_editor" | "affiliate_client";
export type VerticalKey = "TT" | "VNX";

export type Viewer = { role: Role; clientId: string } | { role: "public" };

export interface SessionClaims {
  userId: string;
  role: Role;
  clientId: string;
  name: string;
  email: string;
}

// ── Tenancy & identity ────────────────────────────────────────────────
export interface Client {
  id: string;
  name: string;
  type: "affiliate" | "internal";
  status: "active" | "paused";
}

export interface User {
  id: string;
  clientId: string;
  email: string;
  passwordHash: string;
  role: Role;
  name: string;
}

// ── Product switch ────────────────────────────────────────────────────
export interface Vertical {
  id: string;
  key: VerticalKey;
  name: string;
  domain: "sports" | "prediction_markets";
  description: string;
}

// ── Operator ≡ Integration (one table, two readers) ───────────────────
export type OperatorCategory =
  | "data"
  | "execution"
  | "odds"
  | "reference"
  | "econ"
  | "weather"
  | "notification"
  | "metrics";

export interface Operator {
  id: string;
  verticalId: string;
  name: string;
  slug: string;
  // Link CMS facet (CMS-2 Step 1)
  buttonLabel: string;
  brandColor: string; // hex
  affiliateUrl: string; // default in the resolution chain
  active: boolean; // global kill switch
  // Integration facet (Handoff §5)
  category: OperatorCategory;
  role: string;
  authType: string;
  integrationStatus: "live" | "beta" | "planned";
  internalOnly: boolean;
  estPayout?: number; // synthetic est revenue per conversion
  logoAssetId?: string | null; // Phase-2 branding seam
}

// ── Site & embed ──────────────────────────────────────────────────────
export interface Site {
  id: string;
  clientId: string;
  verticalId: string;
  domain: string;
  status: "live" | "draft";
  configId: string; // unique; baked into embed snippets
  lastPublishedAt?: string | null;
}

// ── Widget catalog & instances ────────────────────────────────────────
export type CtaMode = "single" | "multi";
export type CtaRendering = "fixed_slot" | "per_row" | "per_market";

export interface WidgetType {
  id: string;
  verticalId: string;
  key: string;
  name: string;
  description: string;
  ctaMode: CtaMode;
  ctaRendering: CtaRendering;
  sampleDataJson: unknown;
  thumbnailAssetId?: string | null;
}

export interface WidgetInstance {
  id: string;
  siteId: string;
  widgetTypeId: string;
  // page-scope reserved (Phase 2)
}

// ── Overrides ─────────────────────────────────────────────────────────
export interface LinkOverride {
  id: string;
  siteId: string;
  widgetInstanceId: string;
  operatorId: string;
  affiliateUrl: string;
  // scheduledStart/End reserved (Phase 2)
}

// ── Published config (Publish output; runtime source of truth) ────────
export interface ResolvedCta {
  operatorId: string;
  label: string;
  color: string;
  href: string; // tracking redirect, never raw affiliate URL
}
export interface ResolvedWidget {
  widgetInstanceId: string;
  widgetTypeKey: string;
  ctaMode: CtaMode;
  ctaRendering: CtaRendering;
  sampleDataJson: unknown;
  ctas: ResolvedCta[];
}
export interface ResolvedConfig {
  configId: string;
  vertical: VerticalKey;
  theme?: Record<string, unknown>;
  operators: Array<{ id: string; name: string; buttonLabel: string; brandColor: string; active: true }>;
  widgets: Record<string, ResolvedWidget>;
}
export interface PublishedConfig {
  id: string;
  siteId: string;
  configId: string;
  verticalKey: VerticalKey;
  payload: ResolvedConfig; // client-safe (no raw affiliate URLs)
  targets: Record<string, string>; // server-only: `${widgetInstanceId}:${operatorId}` -> resolved affiliate URL (for the redirect)
  version: number;
  publishedByUserId: string;
  publishedAt: string;
}

// ── Analytics ─────────────────────────────────────────────────────────
export type EventType = "impression" | "click" | "conversion";
export interface AnalyticsEvent {
  id: string;
  type: EventType;
  configId: string;
  siteId: string;
  widgetInstanceId: string;
  operatorId: string;
  verticalId: string;
  ts: string;
  anonId: string;
  ua?: string | null;
  referer?: string | null;
  meta?: Record<string, unknown> | null;
}

// ── Presentation content ──────────────────────────────────────────────
export interface Product {
  id: string;
  verticalId: string;
  name: string;
  slug: string;
  type: "terminal" | "bot";
  executes: boolean;
  holdsFunds: boolean;
  holdsCredentials: boolean;
  tagline: string;
  whatItDoes: string;
  status: "live" | "beta" | "planned";
  heroAssetId?: string | null;
}
export interface Module {
  id: string;
  productId: string;
  name: string;
  summary: string;
  category: "data" | "signal" | "calibration" | "execution" | "risk" | "health" | "alerting" | "ui";
  detail: string;
  internalOnly: boolean;
}
export interface Strategy {
  id: string;
  productId: string;
  name: string;
  description: string;
  venue: string;
  status: string;
}
export interface Tier {
  id: string;
  productId: string;
  name: string;
  featureFlags: string[];
}
export interface Page {
  id: string;
  slug: string;
  title: string;
  blocks: unknown;
}
export interface Changelog {
  id: string;
  productId: string;
  date: string;
  version: string;
  notes: string;
}
export interface StatusFeed {
  id: string;
  productId: string;
  metricKey: string;
  value: string;
  updatedAt: string;
}
export interface MediaAsset {
  id: string;
  url: string;
  type: string;
  alt: string;
}

// Working state across the admin (auto-save semantics): edits write directly to the
// tables above; PublishedConfig is only written by the Publish action (§08).

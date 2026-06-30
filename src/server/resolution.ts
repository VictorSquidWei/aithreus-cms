// The canonical link-resolution algorithm — specs/10-link-cms/09-affiliate-links.md §3
// (revises Report §4.6 to a per-client model). PURE functions over plain data so they work
// identically for the in-memory and Drizzle backends and run synchronously at seed time.
import type {
  AffiliateLink,
  LinkOverride,
  Operator,
  ResolvedConfig,
  ResolvedCta,
  ResolvedWidget,
  Site,
  VerticalKey,
  WidgetInstance,
  WidgetType,
} from "@/lib/types";

export type LinkState = "INHERITED" | "CUSTOM";

/** A catalog operator a specific client can render CTAs for, carrying the client's link URL. */
export interface EligibleOperator {
  operator: Operator;
  clientUrl: string;
}

export interface ResolvedSlot {
  operator: Operator;
  state: LinkState;
  resolvedUrl: string;
}

/**
 * Operators eligible for a client's widgets: catalog operator must be active + non-internalOnly,
 * AND the client must have an ACTIVE affiliate link for it. The link URL is the client's default.
 * (Spec 09 §3 — the per-client kill switch is AffiliateLink.active.)
 */
export function eligibleOperators(operators: Operator[], affiliateLinks: AffiliateLink[]): EligibleOperator[] {
  const linkByOp = new Map(affiliateLinks.map((l) => [l.operatorId, l]));
  const out: EligibleOperator[] = [];
  for (const op of operators) {
    if (op.internalOnly || !op.active) continue;
    const link = linkByOp.get(op.id);
    if (!link || !link.active) continue;
    out.push({ operator: op, clientUrl: link.affiliateUrl });
  }
  return out.sort((a, b) => a.operator.name.localeCompare(b.operator.name));
}

/** single → first eligible operator; multi → one slot per eligible operator (data-driven). */
export function slotsForWidget(eligible: EligibleOperator[], type: WidgetType): EligibleOperator[] {
  return type.ctaMode === "multi" ? eligible : eligible.slice(0, 1);
}

function overrideMap(overrides: LinkOverride[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const o of overrides) m.set(`${o.widgetInstanceId}:${o.operatorId}`, o.affiliateUrl);
  return m;
}

export interface ResolvedWidgetAdmin {
  instance: WidgetInstance;
  type: WidgetType;
  rows: ResolvedSlot[];
}

export interface ResolveArgs {
  site: Site;
  verticalKey: VerticalKey;
  instances: WidgetInstance[];
  widgetTypeById: (id: string) => WidgetType | undefined;
  eligible: EligibleOperator[]; // from eligibleOperators(catalog, client's links)
  overrides: LinkOverride[];
}

/** Admin view (Edit Links): per widget instance, per-operator resolved rows. */
export function resolveWidgetsForSiteAdmin(args: Omit<ResolveArgs, "site" | "verticalKey">): ResolvedWidgetAdmin[] {
  const om = overrideMap(args.overrides);
  const out: ResolvedWidgetAdmin[] = [];
  for (const instance of args.instances) {
    const type = args.widgetTypeById(instance.widgetTypeId);
    if (!type) continue;
    const rows = slotsForWidget(args.eligible, type).map(({ operator, clientUrl }): ResolvedSlot => {
      const custom = om.get(`${instance.id}:${operator.id}`);
      return { operator, state: custom ? "CUSTOM" : "INHERITED", resolvedUrl: custom ?? clientUrl };
    });
    out.push({ instance, type, rows });
  }
  return out;
}

export interface PublishedSnapshot {
  payload: ResolvedConfig; // client-safe (no raw URLs)
  targets: Record<string, string>; // server-only: `${wid}:${opId}` -> affiliate URL (redirect resolves these)
}

/** Build the published runtime snapshot for a site. CTA hrefs are tracking redirects. */
export function buildPublishedSnapshot(args: ResolveArgs): PublishedSnapshot {
  const om = overrideMap(args.overrides);
  const widgets: Record<string, ResolvedWidget> = {};
  const targets: Record<string, string> = {};

  for (const instance of args.instances) {
    const type = args.widgetTypeById(instance.widgetTypeId);
    if (!type) continue;
    const ctas: ResolvedCta[] = slotsForWidget(args.eligible, type).map(({ operator, clientUrl }) => {
      const url = om.get(`${instance.id}:${operator.id}`) ?? clientUrl;
      targets[`${instance.id}:${operator.id}`] = url;
      return { operatorId: operator.id, label: operator.buttonLabel, color: operator.brandColor, href: `/r/${args.site.configId}/${instance.id}/${operator.id}` };
    });
    widgets[instance.id] = {
      widgetInstanceId: instance.id,
      widgetTypeKey: type.key,
      ctaMode: type.ctaMode,
      ctaRendering: type.ctaRendering,
      sampleDataJson: type.sampleDataJson,
      ctas,
    };
  }

  const payload: ResolvedConfig = {
    configId: args.site.configId,
    vertical: args.verticalKey,
    operators: args.eligible.map(({ operator }) => ({
      id: operator.id,
      name: operator.name,
      buttonLabel: operator.buttonLabel,
      brandColor: operator.brandColor,
      active: true as const,
    })),
    widgets,
  };
  return { payload, targets };
}

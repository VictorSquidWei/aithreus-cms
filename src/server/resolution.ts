// The canonical link-resolution algorithm — specs/10-link-cms/04-edit-links.md §2 (Report §4.6).
// PURE functions over plain data (no store dependency) so they work identically for the
// in-memory and Drizzle backends, and can run synchronously at seed time.
import type {
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
import { publicOperators } from "@/server/visibility";

export type LinkState = "INHERITED" | "CUSTOM";

export interface ResolvedSlot {
  operator: Operator;
  state: LinkState;
  resolvedUrl: string;
  active: boolean;
}

/** Active, non-internalOnly operators for a vertical, name-sorted — these get CTA slots. */
export function ctaOperators(operators: Operator[]): Operator[] {
  return publicOperators(operators).sort((a, b) => a.name.localeCompare(b.name));
}

/** single → first active operator; multi → all active (data-driven, CMS-2 §3). */
export function slotOperatorsForWidget(activeOps: Operator[], type: WidgetType): Operator[] {
  return type.ctaMode === "multi" ? activeOps : activeOps.slice(0, 1);
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
  activeOps: Operator[]; // already passed through ctaOperators()
  overrides: LinkOverride[];
}

/** Admin view (Edit Links): per widget instance, per-operator resolved rows. */
export function resolveWidgetsForSiteAdmin(args: Omit<ResolveArgs, "site" | "verticalKey">): ResolvedWidgetAdmin[] {
  const om = overrideMap(args.overrides);
  const out: ResolvedWidgetAdmin[] = [];
  for (const instance of args.instances) {
    const type = args.widgetTypeById(instance.widgetTypeId);
    if (!type) continue;
    const rows = slotOperatorsForWidget(args.activeOps, type).map((op): ResolvedSlot => {
      const custom = om.get(`${instance.id}:${op.id}`);
      return { operator: op, state: custom ? "CUSTOM" : "INHERITED", resolvedUrl: custom ?? op.affiliateUrl, active: op.active };
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
    const ctas: ResolvedCta[] = slotOperatorsForWidget(args.activeOps, type).map((op) => {
      const url = om.get(`${instance.id}:${op.id}`) ?? op.affiliateUrl;
      targets[`${instance.id}:${op.id}`] = url;
      return { operatorId: op.id, label: op.buttonLabel, color: op.brandColor, href: `/r/${args.site.configId}/${instance.id}/${op.id}` };
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
    operators: args.activeOps.map((o) => ({
      id: o.id,
      name: o.name,
      buttonLabel: o.buttonLabel,
      brandColor: o.brandColor,
      active: true as const,
    })),
    widgets,
  };
  return { payload, targets };
}

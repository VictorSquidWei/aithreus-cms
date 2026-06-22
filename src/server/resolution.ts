// The canonical link-resolution algorithm — specs/10-link-cms/04-edit-links.md §2 (Report §4.6).
// Shared by Edit Links (admin), Publish, the config endpoint, and the redirect.
import type {
  Operator,
  ResolvedCta,
  ResolvedConfig,
  ResolvedWidget,
  Site,
  VerticalKey,
  WidgetInstance,
  WidgetType,
} from "@/lib/types";
import type { DataStore } from "@/server/store";
import { publicOperators } from "@/server/visibility";

export type LinkState = "INHERITED" | "CUSTOM";

export interface ResolvedSlot {
  operator: Operator;
  state: LinkState;
  resolvedUrl: string;
  active: boolean;
}

/** Active, non-internalOnly operators for a vertical, name-sorted. These get CTA slots. */
export function ctaOperators(store: DataStore, vertical: VerticalKey): Operator[] {
  return publicOperators(store.rawOperators(vertical)).sort((a, b) => a.name.localeCompare(b.name));
}

/** Step 2/3 of the algorithm: override → CUSTOM, else operator default → INHERITED. */
export function resolveSlot(
  store: DataStore,
  site: Site,
  widgetInstanceId: string,
  operator: Operator,
): { state: LinkState; url: string } {
  const override = store.findOverride(site.id, widgetInstanceId, operator.id);
  if (override) return { state: "CUSTOM", url: override.affiliateUrl };
  return { state: "INHERITED", url: operator.affiliateUrl };
}

/** Which operators get a slot for a widget: single → first active; multi → all active (data-driven). */
export function slotOperatorsForWidget(activeOps: Operator[], type: WidgetType): Operator[] {
  return type.ctaMode === "multi" ? activeOps : activeOps.slice(0, 1);
}

export interface ResolvedWidgetAdmin {
  instance: WidgetInstance;
  type: WidgetType;
  rows: ResolvedSlot[];
}

/** Admin view (Edit Links): every widget instance on a site with per-operator resolved rows. */
export function resolveWidgetsForSiteAdmin(store: DataStore, site: Site): ResolvedWidgetAdmin[] {
  const vertical = store.getVerticalById(site.verticalId)?.key as VerticalKey;
  const activeOps = ctaOperators(store, vertical);
  return store.listWidgetInstances(site.id).map((instance) => {
    const type = store.getWidgetType(instance.widgetTypeId)!;
    const ops = slotOperatorsForWidget(activeOps, type);
    const rows = ops.map((op): ResolvedSlot => {
      const r = resolveSlot(store, site, instance.id, op);
      return { operator: op, state: r.state, resolvedUrl: r.url, active: op.active };
    });
    return { instance, type, rows };
  });
}

export interface PublishedSnapshot {
  payload: ResolvedConfig; // served to the client (no raw URLs)
  targets: Record<string, string>; // server-only: `${wid}:${opId}` -> affiliate URL (redirect resolves these)
}

/** Build the published runtime snapshot for a site. CTA hrefs are tracking redirects. */
export function buildPublishedSnapshot(store: DataStore, site: Site): PublishedSnapshot {
  const vertical = store.getVerticalById(site.verticalId)?.key as VerticalKey;
  const activeOps = ctaOperators(store, vertical);
  const widgets: Record<string, ResolvedWidget> = {};
  const targets: Record<string, string> = {};

  for (const instance of store.listWidgetInstances(site.id)) {
    const type = store.getWidgetType(instance.widgetTypeId);
    if (!type) continue;
    const ops = slotOperatorsForWidget(activeOps, type);
    const ctas: ResolvedCta[] = ops.map((op) => {
      const { url } = resolveSlot(store, site, instance.id, op);
      targets[`${instance.id}:${op.id}`] = url;
      return {
        operatorId: op.id,
        label: op.buttonLabel,
        color: op.brandColor,
        href: `/r/${site.configId}/${instance.id}/${op.id}`,
      };
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
    configId: site.configId,
    vertical,
    operators: activeOps.map((o) => ({
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

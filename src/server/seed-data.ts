// Seed fixtures — specs/00-product/02-data-model.md §7. Stable IDs so cross-refs and the
// demo configId ('site_dimers_tt') are deterministic. Passwords are dev-only (see README).
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { buildContent } from "@/server/seed-content";
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
  Site,
  StatusFeed,
  Strategy,
  Tier,
  User,
  Vertical,
  WidgetInstance,
  WidgetType,
} from "@/lib/types";

const hash = (pw: string) => bcrypt.hashSync(pw, 10);

export const DEV_CREDENTIALS = [
  { email: "super@aithreus.internal", password: "super123", role: "superadmin" },
  { email: "editor@aithreus.internal", password: "editor123", role: "internal_editor" },
  { email: "client@dimers.com", password: "client123", role: "affiliate_client" },
] as const;

export interface Seed {
  clients: Client[];
  users: User[];
  verticals: Vertical[];
  operators: Operator[];
  sites: Site[];
  widgetTypes: WidgetType[];
  widgetInstances: WidgetInstance[];
  overrides: LinkOverride[];
  affiliateLinks: AffiliateLink[];
  events: AnalyticsEvent[];
  products: Product[];
  modules: Module[];
  strategies: Strategy[];
  tiers: Tier[];
  changelog: Changelog[];
  statusFeed: StatusFeed[];
  pages: Page[];
  audit: AuditEntry[];
}

export function buildSeed(): Seed {
  const verticals: Vertical[] = [
    { id: "v_tt", key: "TT", name: "TT (Sports)", domain: "sports", description: "Multi-sportsbook analytics, edges, and calibrated sizing." },
    { id: "v_vnx", key: "VNX", name: "VNX (Prediction Markets)", domain: "prediction_markets", description: "Polymarket/Kalshi prediction-market analytics and edges." },
  ];

  const clients: Client[] = [
    { id: "cl_aithreus", name: "Aithreus", type: "internal", status: "active" },
    { id: "cl_dimers", name: "Dimers", type: "affiliate", status: "active" },
    { id: "cl_catena", name: "Catena Media", type: "affiliate", status: "active" },
  ];

  const users: User[] = [
    { id: "u_super", clientId: "cl_aithreus", email: "super@aithreus.internal", role: "superadmin", name: "Sam Super", passwordHash: hash("super123") },
    { id: "u_editor", clientId: "cl_aithreus", email: "editor@aithreus.internal", role: "internal_editor", name: "Eddie Editor", passwordHash: hash("editor123") },
    { id: "u_client", clientId: "cl_dimers", email: "client@dimers.com", role: "affiliate_client", name: "Dana Dimers", passwordHash: hash("client123") },
  ];

  const operators: Operator[] = [
    // ── TT (sports) ──
    op("op_dk", "v_tt", "DraftKings", "Bet on DraftKings", "#53d337", "https://draftkings.example/aff?c=base", true, "odds", "Sportsbook odds + execution", "apiKey", "live", false, 120),
    op("op_fd", "v_tt", "FanDuel", "Bet on FanDuel", "#1493ff", "https://fanduel.example/aff?c=base", true, "odds", "Sportsbook odds + execution", "apiKey", "live", false, 110),
    op("op_mgm", "v_tt", "BetMGM", "Bet on BetMGM", "#c5a572", "https://betmgm.example/aff?c=base", true, "odds", "Sportsbook odds + execution", "apiKey", "live", false, 100),
    op("op_caesars", "v_tt", "Caesars", "Bet on Caesars", "#1a7a4c", "https://caesars.example/aff?c=base", true, "odds", "Sportsbook odds + execution", "apiKey", "live", false, 95),
    op("op_pinnacle", "v_tt", "Pinnacle", "Line at Pinnacle", "#e23b3b", "https://pinnacle.example/aff?c=base", true, "reference", "Sharp-line reference", "apiKey", "live", false, 130),
    op("op_oddsapi", "v_tt", "The Odds API", "Consensus odds", "#8b5cf6", "https://the-odds-api.example", false, "data", "Consensus odds feed", "apiKey", "live", false, undefined),
    op("op_stake", "v_tt", "Stake.com", "Play on Stake", "#1a9bf0", "https://stake.example/internal", true, "execution", "Execution venue (internal handling)", "none", "live", true, undefined),
    op("op_betrivers", "v_tt", "BetRivers", "Bet on BetRivers", "#13294b", "https://betrivers.example/aff?c=base", false, "odds", "Sportsbook odds", "apiKey", "live", false, 80),
    // ── VNX (prediction markets) ──
    op("op_poly", "v_vnx", "Polymarket", "Trade on Polymarket", "#1652f0", "https://polymarket.example/aff?c=base", true, "execution", "Market data + execution", "EIP-712/HMAC", "live", false, 60),
    op("op_kalshi", "v_vnx", "Kalshi", "Trade on Kalshi", "#00d09c", "https://kalshi.example/aff?c=base", true, "execution", "Market data + execution", "RSA-PSS", "live", false, 55),
    op("op_calcx", "v_vnx", "CalcX", "Open CalcX", "#f59e0b", "https://calcx.example/aff?c=base", true, "data", "Pricing & analytics", "apiKey", "beta", false, 40),
    op("op_predictit", "v_vnx", "PredictIt", "Trade on PredictIt", "#d9472b", "https://predictit.example/aff?c=base", false, "execution", "Prediction-market venue", "apiKey", "live", false, 45),
  ];

  const widgetTypes: WidgetType[] = [
    // TT
    wt("wt_tt_prob", "v_tt", "probability_widget", "Probability Widget", "Calibrated win probability + edge for a single matchup.", "single", "fixed_slot", {
      event: "Lakers vs Celtics", model_prob: 0.58, market_prob: 0.54, edge: 0.04,
    }),
    wt("wt_tt_line", "v_tt", "line_movement_chart", "Line Movement Chart", "How the line moved from open to now.", "single", "fixed_slot", {
      market: "NBA Spread", open: -3.5, now: -5.5, series: [-3.5, -4, -4.5, -5, -5.5],
    }),
    wt("wt_tt_injury", "v_tt", "injury_impact_ticker", "Injury Impact Ticker", "Live injury news with modeled win-prob deltas.", "single", "fixed_slot", {
      items: [{ player: "A. Davis", status: "OUT", delta: -0.06 }, { player: "J. Tatum", status: "GTD", delta: -0.02 }],
    }),
    wt("wt_tt_odds", "v_tt", "odds_comparison_table", "Odds Comparison Table", "Best price across every book — one CTA per book.", "multi", "per_row", {
      market: "NBA Moneyline — Lakers",
      rows: [{ book: "DraftKings", price: -110 }, { book: "FanDuel", price: -105 }, { book: "BetMGM", price: -115 }, { book: "Caesars", price: -108 }, { book: "Pinnacle", price: -103 }],
    }),
    wt("wt_tt_props", "v_tt", "player_projection_suite", "Player Projection Suite", "Player props vs model projections — CTA per book.", "multi", "per_row", {
      player: "L. James", projections: [{ stat: "PTS", proj: 26.4, line: 24.5 }, { stat: "AST", proj: 7.8, line: 7.5 }],
    }),
    // VNX
    wt("wt_vnx_whale", "v_vnx", "whale_tracker", "Whale Tracker", "Track a whale's positions — CTA per operator they trade.", "multi", "per_row", {
      whale: "0xA1…f9", positions: [{ market: "Election 2028", side: "YES", size: 250000 }, { market: "Fed cut in Sept", side: "NO", size: 80000 }],
    }),
    wt("wt_vnx_prob", "v_vnx", "probability_widget_vnx", "Probability Widget", "Calibrated probability for a single prediction market.", "single", "fixed_slot", {
      market: "Fed cuts in September", model_prob: 0.62, market_prob: 0.58, edge: 0.04,
    }),
    wt("wt_vnx_odds", "v_vnx", "odds_comparison_table_vnx", "Market Comparison Table", "Price across prediction-market venues — CTA per venue.", "multi", "per_row", {
      market: "Fed cuts in September — YES",
      rows: [{ venue: "Polymarket", price: 0.58 }, { venue: "Kalshi", price: 0.6 }, { venue: "CalcX", price: 0.57 }],
    }),
  ];

  const sites: Site[] = [
    { id: "st_dimers_tt", clientId: "cl_dimers", verticalId: "v_tt", domain: "dimers.com", status: "live", configId: "site_dimers_tt", lastPublishedAt: null },
    { id: "st_dimers_vnx", clientId: "cl_dimers", verticalId: "v_vnx", domain: "predictions.dimers.com", status: "draft", configId: "site_dimers_vnx", lastPublishedAt: null },
    { id: "st_catena_tt", clientId: "cl_catena", verticalId: "v_tt", domain: "catena-demo.com", status: "live", configId: "site_catena_tt", lastPublishedAt: null },
  ];

  const widgetInstances: WidgetInstance[] = [
    { id: "wi_dimers_odds", siteId: "st_dimers_tt", widgetTypeId: "wt_tt_odds" },
    { id: "wi_dimers_prob", siteId: "st_dimers_tt", widgetTypeId: "wt_tt_prob" },
    { id: "wi_dimers_line", siteId: "st_dimers_tt", widgetTypeId: "wt_tt_line" },
    { id: "wi_dimers_whale", siteId: "st_dimers_vnx", widgetTypeId: "wt_vnx_whale" },
    { id: "wi_catena_odds", siteId: "st_catena_tt", widgetTypeId: "wt_tt_odds" },
  ];

  // One CUSTOM override so Edit-links shows both INHERITED and CUSTOM out of the box.
  const overrides: LinkOverride[] = [
    { id: "lo_dimers_dk", siteId: "st_dimers_tt", widgetInstanceId: "wi_dimers_odds", operatorId: "op_dk", affiliateUrl: "https://draftkings.example/aff?c=dimers&w=odds" },
  ];

  // Per-client affiliate links — each publisher's own tracking link per platform (spec 09).
  const affiliateLinks: AffiliateLink[] = [];
  const al = (tag: string, clientId: string, operatorId: string, url: string) =>
    affiliateLinks.push({ id: `al_${tag}_${operatorId.replace("op_", "")}`, clientId, operatorId, affiliateUrl: url, active: true });
  // Dimers (the demo publisher) — their own tracking IDs
  al("dimers", "cl_dimers", "op_dk", "https://draftkings.example/aff?b=dimers-7741");
  al("dimers", "cl_dimers", "op_fd", "https://fanduel.example/aff?b=dimers-7741");
  al("dimers", "cl_dimers", "op_mgm", "https://betmgm.example/aff?b=dimers-7741");
  al("dimers", "cl_dimers", "op_caesars", "https://caesars.example/aff?b=dimers-7741");
  al("dimers", "cl_dimers", "op_pinnacle", "https://pinnacle.example/aff?b=dimers-7741");
  al("dimers", "cl_dimers", "op_poly", "https://polymarket.example/aff?b=dimers-7741");
  al("dimers", "cl_dimers", "op_kalshi", "https://kalshi.example/aff?b=dimers-7741");
  al("dimers", "cl_dimers", "op_calcx", "https://calcx.example/aff?b=dimers-7741");
  // Catena (a different publisher) — different tracking IDs prove per-client isolation
  al("catena", "cl_catena", "op_dk", "https://draftkings.example/aff?b=catena-3310");
  al("catena", "cl_catena", "op_fd", "https://fanduel.example/aff?b=catena-3310");
  al("catena", "cl_catena", "op_mgm", "https://betmgm.example/aff?b=catena-3310");
  // Aithreus internal — a populated workspace for the superadmin/internal demo
  al("aith", "cl_aithreus", "op_dk", "https://draftkings.example/aff?b=aithreus");
  al("aith", "cl_aithreus", "op_fd", "https://fanduel.example/aff?b=aithreus");
  al("aith", "cl_aithreus", "op_mgm", "https://betmgm.example/aff?b=aithreus");
  al("aith", "cl_aithreus", "op_caesars", "https://caesars.example/aff?b=aithreus");
  al("aith", "cl_aithreus", "op_pinnacle", "https://pinnacle.example/aff?b=aithreus");
  al("aith", "cl_aithreus", "op_poly", "https://polymarket.example/aff?b=aithreus");
  al("aith", "cl_aithreus", "op_kalshi", "https://kalshi.example/aff?b=aithreus");
  al("aith", "cl_aithreus", "op_calcx", "https://calcx.example/aff?b=aithreus");

  return {
    clients,
    users,
    verticals,
    operators,
    sites,
    widgetTypes,
    widgetInstances,
    overrides,
    affiliateLinks,
    events: generateEvents(sites, widgetInstances, operators),
    ...buildContent(),
  };
}

// ── synthetic analytics (14 days × site × widget × active operator) ──
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateEvents(sites: Site[], instances: WidgetInstance[], operators: Operator[]): AnalyticsEvent[] {
  const rng = mulberry32(1337);
  const DAY = 86_400_000;
  const now = Date.now();
  const startOfToday = Math.floor(now / DAY) * DAY; // midnight UTC — anchor buckets to calendar days
  const out: AnalyticsEvent[] = [];

  const ev = (
    type: AnalyticsEvent["type"],
    site: Site,
    wi: WidgetInstance,
    op: Operator,
    ts: number,
    meta?: Record<string, unknown>,
  ): AnalyticsEvent => ({
    id: `ev_${randomUUID()}`,
    type,
    configId: site.configId,
    siteId: site.id,
    widgetInstanceId: wi.id,
    operatorId: op.id,
    verticalId: site.verticalId,
    ts: new Date(ts).toISOString(),
    anonId: `anon_${Math.floor(ts % 100000)}`,
    ua: null,
    referer: null,
    meta: meta ?? null,
  });

  for (const site of sites) {
    const wis = instances.filter((w) => w.siteId === site.id);
    const ops = operators.filter((o) => o.verticalId === site.verticalId && o.active && !o.internalOnly);
    for (const wi of wis) {
      for (const op of ops) {
        for (let day = 13; day >= 0; day--) {
          // Keep every event inside its own calendar day [dayStart, dayStart+DAY) so the chart spans
          // exactly the last 14 days with no partial bucket spilling into "tomorrow".
          const dayStart = startOfToday - day * DAY;
          const dayEnd = dayStart + DAY - 1;
          const impressions = 12 + Math.floor(rng() * 18);
          for (let i = 0; i < impressions; i++) out.push(ev("impression", site, wi, op, dayStart + Math.floor(rng() * DAY)));
          const clicks = Math.round(impressions * (0.06 + rng() * 0.06));
          for (let i = 0; i < clicks; i++) {
            const ts = dayStart + Math.floor(rng() * DAY);
            out.push(ev("click", site, wi, op, ts));
            // ~12% of clicks convert — per-click so totals don't round to zero
            if (rng() < 0.12) out.push(ev("conversion", site, wi, op, Math.min(ts + 60_000, dayEnd), { value: op.estPayout ?? 50 }));
          }
        }
      }
    }
  }
  return out;
}

// ── tiny builders to keep the fixture readable ──
function op(
  id: string,
  verticalId: string,
  name: string,
  buttonLabel: string,
  brandColor: string,
  affiliateUrl: string,
  active: boolean,
  category: Operator["category"],
  role: string,
  authType: string,
  integrationStatus: Operator["integrationStatus"],
  internalOnly: boolean,
  estPayout?: number,
): Operator {
  return {
    id,
    verticalId,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    buttonLabel,
    brandColor,
    affiliateUrl,
    active,
    category,
    role,
    authType,
    integrationStatus,
    internalOnly,
    estPayout,
    logoAssetId: null,
  };
}

function wt(
  id: string,
  verticalId: string,
  key: string,
  name: string,
  description: string,
  ctaMode: WidgetType["ctaMode"],
  ctaRendering: WidgetType["ctaRendering"],
  sampleDataJson: unknown,
): WidgetType {
  return { id, verticalId, key, name, description, ctaMode, ctaRendering, sampleDataJson, thumbnailAssetId: null };
}

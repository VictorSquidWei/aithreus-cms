// Presentation + content seed (Layer A / B1) — specs/00-product/02-data-model.md §3.9.
// Representative demo content for product pages, integrations, status, docs, and audit.
import type { AuditEntry, Changelog, Module, Page, Product, StatusFeed, Strategy, Tier } from "@/lib/types";

export interface ContentSeed {
  products: Product[];
  modules: Module[];
  strategies: Strategy[];
  tiers: Tier[];
  changelog: Changelog[];
  statusFeed: StatusFeed[];
  pages: Page[];
  audit: AuditEntry[];
}

export function buildContent(): ContentSeed {
  const products: Product[] = [
    {
      id: "p_vnx_term",
      verticalId: "v_vnx",
      name: "VNX-Terminal",
      slug: "vnx-terminal",
      type: "terminal",
      executes: false,
      holdsFunds: false,
      holdsCredentials: false,
      tagline: "Prediction-market analytics that finds your edge — then deep-links you out to trade it.",
      whatItDoes:
        "VNX-Terminal ingests prediction-market data across Polymarket and Kalshi, computes a calibrated probability and an edge versus the market price, tells you how to size with Kelly, recommends the venue, and deep-links you out to place the trade yourself.\n\nIt never executes, holds funds, or holds credentials — it analyzes and hands you off.",
      status: "live",
      heroAssetId: null,
    },
    {
      id: "p_vnx_bot",
      verticalId: "v_vnx",
      name: "VNX-Bot",
      slug: "vnx-bot",
      type: "bot",
      executes: true,
      holdsFunds: true,
      holdsCredentials: true,
      tagline: "Autonomous execution on Polymarket + Kalshi via official APIs.",
      whatItDoes:
        "VNX-Bot runs the full signal-and-calibration loop autonomously: market discovery, calibrated pricing, risk-aware sizing, and live execution on Polymarket and Kalshi through official APIs.\n\n~21 components wired by an orchestrator in dependency order, with a 9-component health monitor and crash recovery that restores positions and risk state.",
      status: "live",
      heroAssetId: null,
    },
    {
      id: "p_tt_term",
      verticalId: "v_tt",
      name: "TT-Terminal",
      slug: "tt-terminal",
      type: "terminal",
      executes: false,
      holdsFunds: false,
      holdsCredentials: false,
      tagline: "Multi-sportsbook edges anchored to a sharp reference line.",
      whatItDoes:
        "TT-Terminal surfaces edges across multiple sportsbooks, anchored to a sharp reference line (Pinnacle-style), shows calibrated probabilities and fractional-Kelly sizing, and leaves placement to you.\n\nSports-specific signals include weather edge, opener/limit-window timing, late-line-value timing, and skill-vs-luck variance decomposition.",
      status: "live",
      heroAssetId: null,
    },
    {
      id: "p_tt_bot",
      verticalId: "v_tt",
      name: "TT-Bot",
      slug: "tt-bot",
      type: "bot",
      executes: true,
      holdsFunds: true,
      holdsCredentials: true,
      tagline: "Calibrated sports predictions → fractional-Kelly sizing → autonomous execution.",
      whatItDoes:
        "TT-Bot runs a prediction pipeline — feature engineering, base models (XGBoost / LSTM / Bayesian state-space), an ensemble stacker, and isotonic + conformal calibration — into a calibrated prediction object carrying probability, confidence bounds, and Brier/ECE metrics, then sizes with fractional-Kelly under a drawdown breaker and executes.",
      status: "beta",
      heroAssetId: null,
    },
  ];

  const m = (id: string, productId: string, name: string, category: Module["category"], summary: string, internalOnly = false): Module => ({
    id,
    productId,
    name,
    category,
    summary,
    detail: summary,
    internalOnly,
  });

  const modules: Module[] = [
    // VNX-Terminal
    m("mod_vt_1", "p_vnx_term", "Market discovery", "data", "Scans prediction markets across venues for tradable opportunities."),
    m("mod_vt_2", "p_vnx_term", "Edge calculation", "signal", "edge_score ≈ |AI probability − market price|, liquidity-adjusted."),
    m("mod_vt_3", "p_vnx_term", "Calibration tracking", "calibration", "Personal Brier score, calibration curve, and closing-line value."),
    m("mod_vt_4", "p_vnx_term", "Position sizing", "risk", "Kelly-based sizing calculator."),
    m("mod_vt_5", "p_vnx_term", "Execution plan", "execution", "Venue recommendation + deep-link out (no execution)."),
    m("mod_vt_6", "p_vnx_term", "Knowledge / RAG", "data", "Retrieval + knowledge-graph grounding for resolution context."),
    // VNX-Bot
    m("mod_vb_1", "p_vnx_bot", "Exchange Layer", "execution", "EIP-712 auth, HMAC-SHA256 L2 headers, WebSocket channels, rate limiter."),
    m("mod_vb_2", "p_vnx_bot", "Market Data Engine", "data", "Local orderbook, 3-tier midpoint fallback, sequence validation, REST resync."),
    m("mod_vb_3", "p_vnx_bot", "Execution Engine", "execution", "Batch orders, dynamic tick size, FOK rules, maker protection, reconciliation."),
    m("mod_vb_4", "p_vnx_bot", "Risk Engine", "risk", "Per-market/event/total exposure limits, daily loss limit, emergency stop."),
    m("mod_vb_5", "p_vnx_bot", "Strategy Engine", "signal", "Fee-aware market-making, inventory skew, adverse-selection detection."),
    m("mod_vb_6", "p_vnx_bot", "Health System", "health", "9-component monitor, 10-step startup, clock sync, crash recovery."),
    // TT-Terminal
    m("mod_tt_1", "p_tt_term", "Multi-sportsbook edge discovery", "signal", "Edges across books, anchored to a sharp reference line."),
    m("mod_tt_2", "p_tt_term", "Calibration core", "calibration", "Per-trader Brier, conformal intervals, calibration error metrics."),
    m("mod_tt_3", "p_tt_term", "Fractional-Kelly sizing", "risk", "Risk-aware sizing with caps."),
    m("mod_tt_4", "p_tt_term", "Sports signals", "signal", "Weather edge, opener/limit timing, late-line-value, variance decomposition."),
    m("mod_tt_5", "p_tt_term", "Closing-line-value tracking", "calibration", "CLV as the differentiating performance metric."),
    // TT-Bot (one internalOnly venue module — filtered from public reads)
    m("mod_tb_1", "p_tt_bot", "Prediction pipeline", "signal", "Feature engineering → base models → ensemble stacker."),
    m("mod_tb_2", "p_tt_bot", "Calibration", "calibration", "Isotonic + conformal interval; Brier/ECE metrics."),
    m("mod_tb_3", "p_tt_bot", "Sizing & risk", "risk", "Fractional-Kelly with caps and a drawdown breaker."),
    m("mod_tb_4", "p_tt_bot", "Trading orchestrator", "execution", "Coordinates prediction → sizing → execution."),
    m("mod_tb_5", "p_tt_bot", "Venue operational handling", "execution", "Venue-specific execution handling.", true),
  ];

  const s = (id: string, productId: string, name: string, venue: string, description: string): Strategy => ({
    id,
    productId,
    name,
    venue,
    description,
    status: "live",
  });
  const strategies: Strategy[] = [
    s("str_vb_1", "p_vnx_bot", "Market-making", "Polymarket", "Fee-aware quoting with inventory skew and toxicity detection."),
    s("str_vb_2", "p_vnx_bot", "Economic-data", "Kalshi", "FedWatch / FRED-driven positioning."),
    s("str_vb_3", "p_vnx_bot", "Weather", "Kalshi", "NOAA / NWS weather signal."),
    s("str_vb_4", "p_vnx_bot", "Contrarian tail-risk", "Polymarket", "Fade crowded tails when calibration disagrees."),
    s("str_tb_1", "p_tt_bot", "Ensemble prediction", "Stake.com", "Stacked XGBoost / LSTM / Bayesian predictions, calibrated."),
    s("str_tb_2", "p_tt_bot", "Late-line-value", "Stake.com", "Time entries to capture closing-line value."),
  ];

  const tiers: Tier[] = [
    { id: "tier_vt_1", productId: "p_vnx_term", name: "Pro", featureFlags: ["calibration", "alerting", "rag"] },
    { id: "tier_vt_2", productId: "p_vnx_term", name: "Team", featureFlags: ["calibration", "alerting", "rag", "multi-seat", "api"] },
    { id: "tier_tt_1", productId: "p_tt_term", name: "Pro", featureFlags: ["clv", "weather", "alerting"] },
  ];

  const c = (id: string, productId: string, date: string, version: string, notes: string): Changelog => ({
    id,
    productId,
    date,
    version,
    notes,
  });
  const changelog: Changelog[] = [
    c("cl_vt_1", "p_vnx_term", "2026-06-10", "v2.4.0", "Added closing-line-value tracking and a recalibrated edge model."),
    c("cl_vt_2", "p_vnx_term", "2026-05-22", "v2.3.1", "RAG resolution-context grounding for ambiguous markets."),
    c("cl_vb_1", "p_vnx_bot", "2026-06-08", "v1.9.0", "Crash recovery now restores risk state alongside positions."),
    c("cl_tt_1", "p_tt_term", "2026-06-12", "v1.6.0", "Weather-edge signal for outdoor markets."),
    c("cl_tb_1", "p_tt_bot", "2026-06-01", "v0.8.0", "Conformal intervals added to the prediction object."),
  ];

  const sf = (id: string, productId: string, metricKey: string, value: string): StatusFeed => ({
    id,
    productId,
    metricKey,
    value,
    updatedAt: "2026-06-21T09:00:00.000Z",
  });
  const statusFeed: StatusFeed[] = [
    sf("st_vt_up", "p_vnx_term", "Uptime (30d)", "99.95%"),
    sf("st_vt_sig", "p_vnx_term", "Signals / day", "2,418"),
    sf("st_vt_brier", "p_vnx_term", "Brier score", "0.182"),
    sf("st_vb_up", "p_vnx_bot", "Uptime (30d)", "99.91%"),
    sf("st_vb_pnl", "p_vnx_bot", "30d CLV", "+3.1%"),
    sf("st_tt_up", "p_tt_term", "Uptime (30d)", "99.97%"),
    sf("st_tt_brier", "p_tt_term", "Brier score", "0.171"),
    sf("st_tb_up", "p_tt_bot", "Uptime (30d)", "99.40%"),
    // 9-component health for the bots (HealthIndicatorBar)
    ...["Exchange Layer", "Market Data", "Execution", "Risk Engine", "Strategy", "Discovery", "Health", "Alerts", "Orchestrator"].map((name, i) =>
      sf(`hb_vb_${i}`, "p_vnx_bot", `health:${name}`, i === 5 ? "degraded" : "ok"),
    ),
    ...["Prediction", "Calibration", "Sizing", "Risk", "Execution", "Data Feed", "Health", "Alerts", "Orchestrator"].map((name, i) =>
      sf(`hb_tb_${i}`, "p_tt_bot", `health:${name}`, i === 4 ? "degraded" : "ok"),
    ),
  ];

  const pages: Page[] = [
    {
      id: "pg_start",
      slug: "getting-started",
      title: "Getting started",
      blocks:
        "Aithreus pairs a signal-and-calibration engine with an affiliate Link CMS.\n\nTerminals analyze and deep-link you out to trade; bots execute autonomously. Every product ships embeddable widgets whose operator links are managed centrally in the Link CMS.\n\nStart by exploring the **Portfolio**, then open the **Link CMS** to manage operators, sites, and widget links.",
    },
    {
      id: "pg_calib",
      slug: "calibration",
      title: "Calibration explained",
      blocks:
        "A calibrated probability means that of all the times we say 60%, the event happens ~60% of the time.\n\nWe track calibration with the **Brier score**, **ECE**, and **closing-line value (CLV)** — the differentiating performance metric across both verticals. Conformal intervals give honest confidence bounds.",
    },
    {
      id: "pg_embed",
      slug: "embedding-widgets",
      title: "Embedding widgets",
      blocks:
        "Paste the snippet from **Step 4 · Embed code** once per widget instance. After that, every link change you make in the CMS goes live after **Publish** — with no change to the embed code and no redeploy.\n\nThe widget loads its config at runtime by `configId`, and each operator CTA resolves its URL through the inheritance chain.",
    },
  ];

  const audit: AuditEntry[] = [
    { id: "au_1", ts: "2026-06-20T14:12:00.000Z", actorId: "u_super", actorName: "Sam Super", action: "publish", summary: "Published 2 sites · 4 link changes" },
    { id: "au_2", ts: "2026-06-19T10:05:00.000Z", actorId: "u_editor", actorName: "Eddie Editor", action: "product.update", summary: "Updated VNX-Terminal tagline" },
  ];

  return { products, modules, strategies, tiers, changelog, statusFeed, pages, audit };
}

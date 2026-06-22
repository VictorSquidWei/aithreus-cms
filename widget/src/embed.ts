// Aithreus embeddable widget runtime — framework-free IIFE. specs/20-runtime/03-embed-widget.md
// Scans .aithreus-widget nodes, fetches the published config once per configId, and renders
// each widget's sample-data viz + data-driven operator CTAs into a Shadow DOM (style-isolated).
(function () {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  type Cta = { operatorId: string; label: string; color: string; href: string };
  type Widget = { widgetInstanceId: string; widgetTypeKey: string; ctaMode: string; sampleDataJson: unknown; ctas: Cta[] };
  type Config = { configId: string; vertical: string; widgets: Record<string, Widget> };

  const base = apiBase();
  const nodes = Array.prototype.slice.call(document.querySelectorAll(".aithreus-widget")) as HTMLElement[];
  if (!nodes.length) return;

  const groups: Record<string, HTMLElement[]> = {};
  nodes.forEach(function (n) {
    const cid = n.getAttribute("data-config-id");
    if (!cid) return;
    (groups[cid] = groups[cid] || []).push(n);
  });

  Object.keys(groups).forEach(function (configId) {
    fetch(base + "/api/embed/config/" + encodeURIComponent(configId))
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (config: Config | null) {
        if (config) groups[configId].forEach(function (el) { render(el, config); });
      })
      .catch(function () {});
  });

  function apiBase(): string {
    try {
      const s = document.querySelector('script[src*="/widget/"]') as HTMLScriptElement | null;
      if (s && s.src) return new URL(s.src).origin;
    } catch (e) { /* ignore */ }
    return window.location.origin;
  }

  function esc(s: unknown): string {
    return String(s).replace(/[&<>"]/g, function (c) {
      return c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;";
    });
  }

  function readable(hex: string): string {
    let c = hex.replace("#", "");
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    const r = parseInt(c.substr(0, 2), 16) / 255;
    const g = parseInt(c.substr(2, 2), 16) / 255;
    const b = parseInt(c.substr(4, 2), 16) / 255;
    const lin = function (v: number) { return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    const L = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
    return L > 0.45 ? "#000" : "#fff";
  }

  function humanize(key: string): string {
    return key.replace(/_/g, " ").replace(/\b\w/g, function (m) { return m.toUpperCase(); });
  }

  function sampleViz(w: Widget): string {
    const d = (w.sampleDataJson || {}) as Record<string, unknown>;
    if (w.widgetTypeKey.indexOf("probability_widget") === 0) {
      const pct = Math.round((Number(d.model_prob) || 0) * 100);
      const edge = Math.round((Number(d.edge) || 0) * 100);
      return '<div style="font-size:26px;font-weight:600">' + pct + "%</div>" +
        '<div style="color:#2bd17e;font-size:12px">edge +' + edge + "%</div>";
    }
    if (w.widgetTypeKey.indexOf("odds_comparison_table") === 0) {
      const rows = (((d.rows as unknown[]) || []).slice(0, 4)) as Record<string, unknown>[];
      const body = rows.map(function (r) {
        return '<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0">' +
          '<span style="color:#95a0b5">' + esc(r.book || r.venue || "") + "</span>" +
          '<span style="font-variant-numeric:tabular-nums">' + esc(r.price) + "</span></div>";
      }).join("");
      return '<div style="color:#5e6a82;font-size:11px;margin-bottom:4px">' + esc(d.market || "") + "</div>" + body;
    }
    const entries = Object.keys(d).slice(0, 2).map(function (k) {
      const v = d[k];
      return '<div style="display:flex;justify-content:space-between;font-size:12px">' +
        '<span style="color:#5e6a82">' + esc(k) + "</span><span>" + esc(typeof v === "object" ? "…" : v) + "</span></div>";
    }).join("");
    return entries || '<div style="color:#5e6a82;font-size:12px">Live widget</div>';
  }

  function render(el: HTMLElement, config: Config) {
    const wid = el.getAttribute("data-widget") || "";
    const w = config.widgets[wid];
    const root = el.shadowRoot || el.attachShadow({ mode: "open" });
    if (!w) {
      root.innerHTML = "";
      return;
    }

    const ctas = w.ctas.length
      ? w.ctas.map(function (c) {
          return '<a href="' + base + esc(c.href) + '" data-op="' + esc(c.operatorId) +
            '" style="display:inline-flex;align-items:center;text-decoration:none;border-radius:6px;padding:6px 10px;font-size:12px;font-weight:600;background:' +
            esc(c.color) + ";color:" + readable(c.color) + '">' + esc(c.label) + "</a>";
        }).join("")
      : '<span style="color:#5e6a82;font-size:12px">No operators available</span>';

    root.innerHTML =
      "<style>:host{display:block;contain:content}*{box-sizing:border-box;font-family:ui-sans-serif,system-ui,'Segoe UI',Roboto,sans-serif}" +
      ".aw{border:1px solid #232b3a;background:#10141d;color:#e8ecf4;border-radius:10px;padding:14px;max-width:440px}" +
      ".aw-hd{font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:#5e6a82;margin-bottom:8px}" +
      ".aw-cta{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}.aw-ft{margin-top:10px;font-size:10px;color:#5e6a82}</style>" +
      '<div class="aw" data-testid="aithreus-rendered-widget">' +
      '<div class="aw-hd">' + esc(humanize(w.widgetTypeKey)) + "</div>" +
      "<div>" + sampleViz(w) + "</div>" +
      '<div class="aw-cta">' + ctas + "</div>" +
      '<div class="aw-ft">Powered by Aithreus</div></div>';

    w.ctas.forEach(function (c) { beacon(config.configId, wid, c.operatorId); });
  }

  function beacon(configId: string, widgetInstanceId: string, operatorId: string) {
    try {
      fetch(base + "/api/embed/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "impression", configId, widgetInstanceId, operatorId }),
        keepalive: true,
      }).catch(function () {});
    } catch (e) { /* ignore */ }
  }
})();

import Script from "next/script";

export const metadata = { title: "Demo client site" };

// A fake external affiliate page (styled unlike the Aithreus app) that embeds real widgets
// via the pasted snippet only. specs/20-runtime/04-demo-client-site.md.
const CONFIG_ID = "site_dimers_tt";

const page: React.CSSProperties = {
  minHeight: "100vh",
  background: "#f3f4f6",
  color: "#111827",
  fontFamily: "Georgia, 'Times New Roman', serif",
};
const wrap: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: "40px 20px" };

export default function DemoClientSite() {
  return (
    <main style={page} data-testid="demo-client-site">
      <div style={wrap}>
        <div style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "#9ca3af" }}>
          Dimers Daily · Sponsored
        </div>
        <h1 style={{ fontSize: 34, margin: "6px 0 4px", lineHeight: 1.15 }}>Lakers vs Celtics: where the edge is tonight</h1>
        <div style={{ color: "#6b7280", fontSize: 14, marginBottom: 24 }}>By the Dimers model desk · 8 min read</div>

        <p style={{ fontSize: 17, lineHeight: 1.7 }}>
          Our model makes the Lakers a slight favorite tonight, and the number hasn&apos;t fully caught up across the
          market. Here&apos;s the live odds comparison — grab the best price:
        </p>

        {/* ── Aithreus widget (pasted snippet) ── */}
        <div style={{ margin: "20px 0" }}>
          <div className="aithreus-widget" data-config-id={CONFIG_ID} data-widget="wi_dimers_odds" data-theme="dark" data-testid="demo-widget-odds" />
        </div>

        <p style={{ fontSize: 17, lineHeight: 1.7 }}>
          The calibrated win probability still implies value at the current line:
        </p>

        <div style={{ margin: "20px 0" }}>
          <div className="aithreus-widget" data-config-id={CONFIG_ID} data-widget="wi_dimers_prob" data-theme="dark" data-testid="demo-widget-prob" />
        </div>

        <p style={{ fontSize: 13, color: "#6b7280", marginTop: 28, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
          This is a mock external page. The two widgets above are rendered <strong>only</strong> by the pasted Aithreus
          snippet — their operator links are managed in the CMS and update after Publish, with no change to this page.
        </p>
      </div>

      <Script src="/widget/v1/embed.js" strategy="afterInteractive" />
    </main>
  );
}

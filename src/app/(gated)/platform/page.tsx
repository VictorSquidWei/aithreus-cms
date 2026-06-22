import { PageContainer, PageHeader } from "@/components/page-container";
import { CalibrationStat } from "@/components/presentation/calibration-stat";
import { RichContentBlock } from "@/components/presentation/rich-content-block";

export const metadata = { title: "Platform" };

const PIPELINE = ["Data", "Features", "Model(s)", "Calibrated probability + CI", "Edge vs market", "Fractional-Kelly sizing"];

const SHARED = [
  { title: "Calibration core", body: "Brier, ECE, conformal intervals, and closing-line value — shared primitives across both verticals." },
  { title: "Auth", body: "Session-token auth with hashed credentials (the VNX-Bot pattern), extended with roles." },
  { title: "Telemetry", body: "Prometheus-style metrics across products, surfaced as Status and health." },
  { title: "Alerting", body: "Local / email / Slack / webhook dispatch with configurable triggers." },
  { title: "Config + versioning", body: "YAML/UI-driven config with version history." },
  { title: "Infrastructure", body: "AWS, eu-west-1 (Dublin)." },
];

export default function PlatformPage() {
  return (
    <PageContainer>
      <PageHeader title="The platform" subtitle="One signal-and-calibration engine under all four products." />

      <RichContentBlock
        text={
          "Every Aithreus product sits on the same backbone: data flows into features, into one or more models, into a **calibrated probability with a confidence interval**, into an edge versus the market price, into risk-aware sizing.\n\nSame engine, vertical-specific front ends — terminals analyze and deep-link out; bots execute."
        }
        className="max-w-2xl"
      />

      <div className="my-6 flex flex-wrap items-center gap-2">
        {PIPELINE.map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            <span className="rounded border border-border bg-surface-1 px-3 py-1.5 text-sm text-fg">{p}</span>
            {i < PIPELINE.length - 1 && <span className="text-fg-faint">→</span>}
          </div>
        ))}
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <CalibrationStat label="Brier score" value="0.176" sub="lower is better" />
        <CalibrationStat label="ECE" value="1.8%" sub="expected calibration error" />
        <CalibrationStat label="CLV (30d)" value="+2.9%" sub="closing-line value" />
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-fg-faint">Shared primitives</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {SHARED.map((s) => (
          <div key={s.title} className="rounded-lg border border-border bg-surface-1 p-3">
            <div className="text-sm font-medium text-fg">{s.title}</div>
            <p className="mt-1 text-xs text-fg-muted">{s.body}</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

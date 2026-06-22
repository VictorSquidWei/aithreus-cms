import { cn, getReadableText } from "@/lib/utils";

export interface PreviewCta {
  name: string;
  label: string;
  color: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function SampleViz({ typeKey, sample }: { typeKey: string; sample: unknown }) {
  const d = (sample ?? {}) as Record<string, any>;

  if (typeKey.startsWith("probability_widget")) {
    const pct = Math.round((d.model_prob ?? 0) * 100);
    return (
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-fg-faint">{d.event ?? d.market ?? "Market"}</div>
          <div className="nums text-3xl font-semibold text-fg">{pct}%</div>
          <div className="text-xs text-positive">edge +{Math.round((d.edge ?? 0) * 100)}%</div>
        </div>
        <div className="h-12 w-24 rounded bg-surface-3" />
      </div>
    );
  }

  if (typeKey.startsWith("odds_comparison_table")) {
    const rows: any[] = d.rows ?? [];
    return (
      <div>
        <div className="mb-1 text-xs text-fg-faint">{d.market ?? "Market"}</div>
        <div className="flex flex-col gap-1">
          {rows.slice(0, 4).map((r, i) => (
            <div key={i} className="flex justify-between rounded bg-surface-2 px-2 py-1 text-xs">
              <span className="text-fg-muted">{r.book ?? r.venue}</span>
              <span className="nums font-mono text-fg">{r.price}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (typeKey === "line_movement_chart") {
    const series: number[] = d.series ?? [];
    const max = Math.max(...series.map(Math.abs), 1);
    return (
      <div>
        <div className="mb-1 text-xs text-fg-faint">{d.market ?? "Line"}</div>
        <div className="flex h-12 items-end gap-1">
          {series.map((v, i) => (
            <div key={i} className="flex-1 rounded-t bg-accent" style={{ height: `${(Math.abs(v) / max) * 100}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (typeKey === "whale_tracker") {
    const pos: any[] = d.positions ?? [];
    return (
      <div>
        <div className="mb-1 text-xs text-fg-faint">Whale {d.whale}</div>
        {pos.slice(0, 3).map((p, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-fg-muted">{p.market}</span>
            <span className="font-mono text-fg">
              {p.side} · ${Intl.NumberFormat("en-US", { notation: "compact" }).format(p.size)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  // generic fallback
  return (
    <div className="flex flex-col gap-1">
      {Object.entries(d)
        .slice(0, 3)
        .map(([k, v]) => (
          <div key={k} className="flex justify-between text-xs">
            <span className="text-fg-faint">{k}</span>
            <span className="font-mono text-fg-muted">{typeof v === "object" ? "…" : String(v)}</span>
          </div>
        ))}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export function WidgetPreviewFrame({
  typeKey,
  ctaMode,
  sample,
  ctas,
}: {
  typeKey: string;
  ctaMode: "single" | "multi";
  sample: unknown;
  ctas: PreviewCta[];
}) {
  return (
    <div className="rounded-lg border border-border bg-bg p-3" data-testid="widget-preview">
      <div className="min-h-[80px]">
        <SampleViz typeKey={typeKey} sample={sample} />
      </div>
      <div className={cn("mt-3 flex flex-wrap gap-1.5", ctaMode === "single" && "justify-center")}>
        {ctas.length === 0 ? (
          <span className="text-xs text-fg-faint">No active operators — turn one on in Step 1.</span>
        ) : (
          ctas.map((c) => (
            <span
              key={c.name}
              data-testid={`preview-cta-${c.name}`}
              className="inline-flex items-center rounded px-2.5 py-1 text-xs font-semibold"
              style={{ background: c.color, color: getReadableText(c.color) }}
            >
              {c.label}
            </span>
          ))
        )}
      </div>
    </div>
  );
}

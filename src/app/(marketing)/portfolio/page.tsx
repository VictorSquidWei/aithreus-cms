import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer, PageHeader } from "@/components/page-container";

export const metadata = { title: "Portfolio" };

type Cell = { vertical: "VNX" | "TT"; name: string; executes: boolean; tagline: string };

const ROWS: { label: string; sub: string; cells: Cell[] }[] = [
  {
    label: "Terminal",
    sub: "read-only analytics · deep-links out",
    cells: [
      { vertical: "VNX", name: "VNX-Terminal", executes: false, tagline: "Polymarket / Kalshi analytics — calibrated edge, Kelly sizing, venue deep-link." },
      { vertical: "TT", name: "TT-Terminal", executes: false, tagline: "Multi-sportsbook edges anchored to a sharp reference line, with CLV tracking." },
    ],
  },
  {
    label: "Bot",
    sub: "autonomous execution",
    cells: [
      { vertical: "VNX", name: "VNX-Bot", executes: true, tagline: "Executes on Polymarket + Kalshi via official APIs; market-making + multi-strategy." },
      { vertical: "TT", name: "TT-Bot", executes: true, tagline: "Calibrated sports predictions → fractional-Kelly sizing → autonomous execution." },
    ],
  },
];

export default function PortfolioPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Product portfolio"
        subtitle="Two verticals × two product types, on one signal-and-calibration engine."
      />
      <div className="flex flex-col gap-6">
        {ROWS.map((row) => (
          <div key={row.label}>
            <div className="mb-2 flex items-baseline gap-2">
              <h2 className="text-sm font-semibold text-fg">{row.label}</h2>
              <span className="text-xs text-fg-faint">{row.sub}</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {row.cells.map((c) => (
                <Card key={c.name} data-testid={`product-${c.name.toLowerCase()}`}>
                  <CardContent>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-accent">{c.vertical}</span>
                      {c.executes ? (
                        <Badge variant="warning">Executes autonomously</Badge>
                      ) : (
                        <Badge variant="positive">Read-only · no funds/keys</Badge>
                      )}
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-fg">{c.name}</h3>
                    <p className="mt-1 text-sm text-fg-muted">{c.tagline}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-xs text-fg-faint">Product detail, integrations, and status require sign-in.</p>
    </PageContainer>
  );
}

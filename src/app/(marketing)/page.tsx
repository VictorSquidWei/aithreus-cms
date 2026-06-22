import Link from "next/link";
import { ArrowRight, GitBranch, LayoutGrid, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const VALUE_PROPS = [
  {
    icon: LayoutGrid,
    title: "Two layers, one property",
    body: "A gated product-marketing site and the flagship affiliate Link CMS share one design system, one auth, one data model.",
  },
  {
    icon: GitBranch,
    title: "Operator ≡ Integration",
    body: "The integrations that power our terminals are the same operators clients promote in widgets — modeled once, read two ways.",
  },
  {
    icon: Radio,
    title: "Links that change without redeploy",
    body: "Clients embed a widget once. Every link change in the CMS goes live on their site after Publish — no re-embed, no redeploy.",
  },
];

export default function LandingPage() {
  return (
    <main>
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 sm:pt-24">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface-1 px-3 py-1 font-mono text-xs text-accent">
            signal · calibration · edge
          </div>
          <h1 className="text-4xl font-semibold leading-[1.1] tracking-tight text-fg sm:text-5xl">
            Calibrated probability, real edge, and the link CMS that ships it.
          </h1>
          <p className="mt-5 max-w-2xl text-base text-fg-muted sm:text-lg">
            Aithreus turns market data into calibrated probabilities and edges across prediction markets (VNX) and
            sports (TT) — then manages every affiliate link on every embedded widget from one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="md">
              <Link href="/login" data-testid="cta-login">
                Log in <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="md">
              <Link href="/portfolio" data-testid="cta-portfolio">
                View portfolio
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {VALUE_PROPS.map((v) => {
            const Icon = v.icon;
            return (
              <Card key={v.title}>
                <CardContent>
                  <Icon size={20} className="text-accent" />
                  <h3 className="mt-3 text-sm font-semibold text-fg">{v.title}</h3>
                  <p className="mt-1.5 text-sm text-fg-muted">{v.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}

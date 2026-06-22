import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product, VerticalKey } from "@/lib/types";
import { ExecutionPostureBadge } from "./execution-posture-badge";
import { StatusPill } from "./status-pill";

export function ProductCard({ product, verticalKey }: { product: Product; verticalKey: VerticalKey }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      data-testid={`product-card-${product.slug}`}
      className="group rounded-lg border border-border bg-surface-1 p-4 transition-colors hover:border-border-strong"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-xs text-accent">{verticalKey}</span>
        <StatusPill status={product.status} />
      </div>
      <h3 className="mt-2 flex items-center gap-1 text-base font-semibold text-fg">
        {product.name}
        <ArrowRight size={15} className="opacity-0 transition-opacity group-hover:opacity-100" />
      </h3>
      <p className="mt-1 text-sm text-fg-muted">{product.tagline}</p>
      <div className="mt-3">
        <ExecutionPostureBadge executes={product.executes} />
      </div>
    </Link>
  );
}

"use client";

import * as React from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { StatusPill } from "@/components/presentation/status-pill";
import { deletePageAction } from "@/server/actions/content";
import type { Page, Product } from "@/lib/types";
import { ProductEditDialog } from "./product-edit-dialog";
import { PageEditDialog } from "./page-edit-dialog";
import { ChangelogAddDialog } from "./changelog-add-dialog";

export function ContentManager({ products, pages }: { products: Product[]; pages: Page[] }) {
  const { toast } = useToast();
  const [pending, start] = React.useTransition();

  function delPage(p: Page) {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    start(async () => {
      const r = await deletePageAction(p.id);
      toast(r.ok ? `Deleted ${p.title}` : r.error, r.ok ? "default" : "error");
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-fg">Products</h2>
          <ChangelogAddDialog
            products={products.map((p) => ({ id: p.id, name: p.name }))}
            trigger={
              <Button size="sm" variant="subtle" data-testid="changelog-new">
                <Plus size={14} /> Add release
              </Button>
            }
          />
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm" data-testid="content-products">
            <thead className="bg-surface-2 text-xs text-fg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Product</th>
                <th className="px-3 py-2 text-left font-medium">Tagline</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-border" data-testid={`content-product-${p.slug}`}>
                  <td className="px-3 py-2 font-medium text-fg">{p.name}</td>
                  <td className="max-w-md truncate px-3 py-2 text-fg-muted">{p.tagline}</td>
                  <td className="px-3 py-2">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <ProductEditDialog
                      product={p}
                      trigger={
                        <Button size="icon" variant="ghost" aria-label={`Edit ${p.name}`} data-testid={`content-edit-${p.slug}`}>
                          <Pencil size={15} />
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-fg">Docs</h2>
          <PageEditDialog
            trigger={
              <Button size="sm" data-testid="page-new">
                <Plus size={14} /> New doc
              </Button>
            }
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2" data-testid="content-pages">
          {pages.map((pg) => (
            <div
              key={pg.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface-1 p-3"
              data-testid={`content-page-${pg.slug}`}
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-fg">{pg.title}</div>
                <div className="font-mono text-xs text-fg-faint">/{pg.slug}</div>
              </div>
              <div className="flex gap-1">
                <PageEditDialog
                  page={pg}
                  trigger={
                    <Button size="icon" variant="ghost" aria-label={`Edit ${pg.title}`}>
                      <Pencil size={15} />
                    </Button>
                  }
                />
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label={`Delete ${pg.title}`}
                  onClick={() => delPage(pg)}
                  disabled={pending}
                  data-testid={`page-delete-${pg.slug}`}
                >
                  <Trash2 size={15} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

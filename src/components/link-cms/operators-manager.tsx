"use client";

import * as React from "react";
import { Pencil, Plug, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { deleteOperatorAction } from "@/server/actions/operators";
import { truncateMiddle } from "@/lib/utils";
import type { Operator } from "@/lib/types";
import { OperatorForm } from "./operator-form";
import { ActiveToggle } from "./active-toggle";

export function OperatorsManager({ operators }: { operators: Operator[] }) {
  const { toast } = useToast();
  const [pending, start] = React.useTransition();

  function del(op: Operator) {
    if (!window.confirm(`Delete ${op.name}? This removes it from the catalog.`)) return;
    start(async () => {
      const r = await deleteOperatorAction(op.id);
      toast(r.ok ? `Deleted ${op.name}` : r.error, r.ok ? "default" : "error");
    });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-fg-muted">
          The source of truth. Every widget defaults to these URLs unless overridden in Step 3.
        </p>
        <OperatorForm
          trigger={
            <Button data-testid="operator-new">
              <Plus size={16} /> New operator
            </Button>
          }
        />
      </div>

      {operators.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-14 text-center">
          <Plug size={22} className="text-fg-faint" />
          <div>
            <p className="text-sm text-fg">No operators yet</p>
            <p className="text-xs text-fg-muted">Add your first affiliate deal to start building widgets.</p>
          </div>
          <OperatorForm
            trigger={
              <Button size="sm" data-testid="operator-new-empty">
                <Plus size={15} /> Add operator
              </Button>
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm" data-testid="operators-table">
            <thead className="bg-surface-2 text-xs text-fg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Operator</th>
                <th className="px-3 py-2 text-left font-medium">Button label</th>
                <th className="px-3 py-2 text-left font-medium">Color</th>
                <th className="px-3 py-2 text-left font-medium">Affiliate URL</th>
                <th className="px-3 py-2 text-left font-medium">Active</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {operators.map((op) => (
                <tr key={op.id} data-testid={`operator-row-${op.id}`} className="border-t border-border">
                  <td className="px-3 py-2 font-medium text-fg">
                    {op.name}
                    {op.internalOnly && <span className="ml-2 text-[10px] font-semibold text-warning">internal</span>}
                  </td>
                  <td className="px-3 py-2 text-fg-muted">{op.buttonLabel}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-4 w-4 rounded border border-border" style={{ background: op.brandColor }} />
                      <span className="font-mono text-xs text-fg-faint">{op.brandColor}</span>
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-fg-faint">{truncateMiddle(op.affiliateUrl, 36)}</td>
                  <td className="px-3 py-2">
                    <ActiveToggle id={op.id} active={op.active} label={op.name} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <OperatorForm
                        operator={op}
                        trigger={
                          <Button size="icon" variant="ghost" aria-label={`Edit ${op.name}`}>
                            <Pencil size={15} />
                          </Button>
                        }
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label={`Delete ${op.name}`}
                        onClick={() => del(op)}
                        disabled={pending}
                        data-testid={`operator-delete-${op.id}`}
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

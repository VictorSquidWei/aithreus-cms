"use client";

import { Plug, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AffiliateLink, Operator } from "@/lib/types";
import { OperatorForm } from "./operator-form";
import { AffiliateLinkRow } from "./affiliate-link-row";

export function OperatorsManager({ rows }: { rows: { operator: Operator; link?: AffiliateLink }[] }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs text-fg-muted">
          Set the affiliate link (with <span className="text-fg">your</span> tracking ID) for each platform you promote.
          Every widget uses these unless overridden in Step 3.
        </p>
        <OperatorForm
          trigger={
            <Button data-testid="operator-new">
              <Plus size={16} /> Add platform
            </Button>
          }
        />
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-14 text-center">
          <Plug size={22} className="text-fg-faint" />
          <div>
            <p className="text-sm text-fg">No platforms yet</p>
            <p className="text-xs text-fg-muted">Add a platform, then set your affiliate link.</p>
          </div>
          <OperatorForm
            trigger={
              <Button size="sm" data-testid="operator-new-empty">
                <Plus size={15} /> Add platform
              </Button>
            }
          />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm" data-testid="operators-table">
            <thead className="bg-surface-2 text-xs text-fg-muted">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Platform</th>
                <th className="px-3 py-2 text-left font-medium">Your affiliate URL</th>
                <th className="px-3 py-2 text-left font-medium">Active</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ operator, link }) => (
                <AffiliateLinkRow key={operator.id} operator={operator} link={link} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

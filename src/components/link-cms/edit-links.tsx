"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { OverrideRow, type OverrideRowData } from "./override-row";

export interface WidgetBlock {
  instanceId: string;
  typeName: string;
  typeKey: string;
  ctaMode: "single" | "multi";
  rows: OverrideRowData[];
}

export function EditLinks({
  sites,
  selectedSiteId,
  widgets,
}: {
  sites: { id: string; domain: string }[];
  selectedSiteId: string | null;
  widgets: WidgetBlock[];
}) {
  const router = useRouter();

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-fg-muted">Site</span>
          <Select
            data-testid="site-picker"
            value={selectedSiteId ?? ""}
            onChange={(e) => router.push(`/admin/links?site=${e.target.value}`)}
          >
            <option value="" disabled>
              Choose a site…
            </option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.domain}
              </option>
            ))}
          </Select>
        </div>
        <span className="flex items-center gap-1 text-xs text-fg-faint">
          Page: All pages
          <span className="rounded border border-border px-1">Phase 2</span>
        </span>
      </div>

      {!selectedSiteId ? (
        <Empty text="Pick a site to see its widgets and link states." />
      ) : widgets.length === 0 ? (
        <Empty text="This site has no widgets yet — add one from the Widget Gallery." />
      ) : (
        <div className="flex flex-col gap-4">
          {widgets.map((w) => (
            <div key={w.instanceId} data-testid={`widget-block-${w.instanceId}`} className="rounded-lg border border-border">
              <div className="flex items-center justify-between border-b border-border bg-surface-2 px-3 py-2">
                <span className="flex items-center gap-2 text-sm font-medium text-fg">
                  <Link2 size={15} className="text-fg-muted" />
                  {w.typeName}
                </span>
                <Badge variant={w.ctaMode === "multi" ? "accent" : "muted"}>
                  {w.ctaMode === "multi" ? "multi-CTA" : "single-CTA"}
                </Badge>
              </div>
              <div className="divide-y divide-border">
                {w.rows.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-fg-faint">No active operators — turn one on in Step 1.</p>
                ) : (
                  w.rows.map((r) => (
                    <OverrideRow key={r.operatorId} siteId={selectedSiteId} widgetInstanceId={w.instanceId} row={r} />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-fg-muted">{text}</div>
  );
}

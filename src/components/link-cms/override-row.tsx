"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { resetOverrideAction, upsertOverrideAction } from "@/server/actions/overrides";
import { LinkStateBadge } from "./link-state-badge";
import type { LinkState } from "@/server/resolution";

export interface OverrideRowData {
  operatorId: string;
  operatorName: string;
  brandColor: string;
  state: LinkState;
  resolvedUrl: string;
}

export function OverrideRow({
  siteId,
  widgetInstanceId,
  row,
}: {
  siteId: string;
  widgetInstanceId: string;
  row: OverrideRowData;
}) {
  const { toast } = useToast();
  const [pending, start] = React.useTransition();
  const [url, setUrl] = React.useState(row.resolvedUrl);
  React.useEffect(() => setUrl(row.resolvedUrl), [row.resolvedUrl, row.state]);

  function save() {
    if (url.trim() === row.resolvedUrl) return; // unchanged
    start(async () => {
      const r = await upsertOverrideAction(siteId, widgetInstanceId, row.operatorId, url);
      toast(r.ok ? `${row.operatorName} override saved` : r.error, r.ok ? "default" : "error");
    });
  }

  function reset() {
    start(async () => {
      const r = await resetOverrideAction(siteId, widgetInstanceId, row.operatorId);
      toast(r.ok ? `${row.operatorName} reset to inherited` : r.error, r.ok ? "default" : "error");
    });
  }

  return (
    <div
      data-testid={`override-row-${widgetInstanceId}-${row.operatorId}`}
      className="flex flex-wrap items-center gap-2 px-3 py-2"
    >
      <span className="flex w-36 shrink-0 items-center gap-2 text-sm text-fg">
        <span className="h-3 w-3 shrink-0 rounded" style={{ background: row.brandColor }} />
        <span className="truncate">{row.operatorName}</span>
      </span>
      <span data-testid={`override-state-${widgetInstanceId}-${row.operatorId}`}>
        <LinkStateBadge state={row.state} />
      </span>
      <Input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onBlur={save}
        className="min-w-[200px] flex-1 font-mono text-xs"
        data-testid={`override-input-${widgetInstanceId}-${row.operatorId}`}
        spellCheck={false}
      />
      {row.state === "CUSTOM" && (
        <Button
          size="sm"
          variant="ghost"
          onClick={reset}
          disabled={pending}
          data-testid={`override-reset-${widgetInstanceId}-${row.operatorId}`}
        >
          Reset
        </Button>
      )}
    </div>
  );
}

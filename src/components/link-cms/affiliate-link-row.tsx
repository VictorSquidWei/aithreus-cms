"use client";

import * as React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { setAffiliateLinkActiveAction, upsertAffiliateLinkAction } from "@/server/actions/affiliate";
import { deleteOperatorAction } from "@/server/actions/operators";
import type { AffiliateLink, Operator } from "@/lib/types";
import { OperatorForm } from "./operator-form";

export function AffiliateLinkRow({ operator, link }: { operator: Operator; link?: AffiliateLink }) {
  const { toast } = useToast();
  const [pending, start] = React.useTransition();
  const [url, setUrl] = React.useState(link?.affiliateUrl ?? "");
  const [active, setActive] = React.useState(link?.active ?? false);
  React.useEffect(() => {
    setUrl(link?.affiliateUrl ?? "");
    setActive(link?.active ?? false);
  }, [link?.affiliateUrl, link?.active]);

  function saveUrl() {
    const v = url.trim();
    if (!v || v === (link?.affiliateUrl ?? "")) return;
    start(async () => {
      const r = await upsertAffiliateLinkAction(operator.id, v);
      if (!r.ok) {
        toast(r.error, "error");
        setUrl(link?.affiliateUrl ?? "");
      } else {
        setActive(true);
        toast(`${operator.name} link saved`);
      }
    });
  }

  function toggle(next: boolean) {
    setActive(next);
    start(async () => {
      const r = await setAffiliateLinkActiveAction(operator.id, next);
      if (!r.ok) {
        setActive(!next);
        toast(r.error, "error");
      } else {
        toast(`${operator.name} ${next ? "enabled" : "disabled"}`);
      }
    });
  }

  function del() {
    if (!window.confirm(`Remove ${operator.name} from the catalog?`)) return;
    start(async () => {
      const r = await deleteOperatorAction(operator.id);
      toast(r.ok ? `Removed ${operator.name}` : r.error, r.ok ? "default" : "error");
    });
  }

  return (
    <tr data-testid={`operator-row-${operator.id}`} className="border-t border-border transition-colors hover:bg-surface-2/40">
      <td className="px-3 py-2.5">
        <span className="inline-flex items-center gap-2.5">
          <span
            className="h-6 w-6 shrink-0 rounded-md ring-1 ring-inset ring-white/10 shadow-sm"
            style={{ background: operator.brandColor }}
          />
          <span className="font-medium text-fg">{operator.name}</span>
          {operator.internalOnly && (
            <span className="rounded-sm bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning">
              internal
            </span>
          )}
          {!operator.active && <span className="text-[10px] text-fg-faint">(catalog off)</span>}
          {operator.active && !operator.internalOnly && !link && (
            <span className="text-[10px] text-fg-faint">not set</span>
          )}
        </span>
      </td>
      <td className="px-3 py-2.5">
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={saveUrl}
          placeholder={operator.affiliateUrl || "https://… your tracking link"}
          className="min-w-[220px] font-mono text-xs"
          data-testid={`affiliate-url-${operator.id}`}
          spellCheck={false}
        />
      </td>
      <td className="px-3 py-2.5">
        <Switch
          checked={active}
          onCheckedChange={toggle}
          disabled={pending || !link}
          aria-label={`Toggle ${operator.name}`}
          title={!link ? "Set a tracking link first" : undefined}
          data-testid={`operator-active-${operator.id}`}
        />
      </td>
      <td className="px-3 py-2.5">
        <div className="flex justify-end gap-1">
          <OperatorForm
            operator={operator}
            trigger={
              <Button size="icon" variant="ghost" aria-label={`Edit ${operator.name}`}>
                <Pencil size={15} />
              </Button>
            }
          />
          <Button
            size="icon"
            variant="ghost"
            aria-label={`Delete ${operator.name}`}
            onClick={del}
            disabled={pending}
            data-testid={`operator-delete-${operator.id}`}
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </td>
    </tr>
  );
}

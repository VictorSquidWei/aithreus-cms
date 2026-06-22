"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { computePublishDiffAction, publishAllAction, type PublishDiff } from "@/server/actions/publish";

export function PublishBar({ lastPublished }: { lastPublished: string | null }) {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [diff, setDiff] = React.useState<PublishDiff | null>(null);
  const [pending, start] = React.useTransition();

  function openDialog() {
    setDiff(null);
    setOpen(true);
    start(async () => setDiff(await computePublishDiffAction()));
  }

  function publish() {
    start(async () => {
      const r = await publishAllAction();
      if (r.ok) {
        toast(`Published · ${r.diff.changedLinks} link change(s) live`);
        setOpen(false);
        router.refresh();
      } else {
        toast(r.error, "error");
      }
    });
  }

  return (
    <footer
      data-testid="publish-bar"
      className="sticky bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-surface-2 px-4 py-2"
    >
      <span className="text-xs text-fg-muted">
        Working changes auto-save. <span className="text-fg-faint">Last published: {lastPublished ?? "—"}</span>
      </span>
      <Button size="sm" onClick={openDialog} data-testid="publish-open">
        <Rocket size={14} /> Publish to live widgets
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish to live widgets</DialogTitle>
          </DialogHeader>
          {!diff ? (
            <p className="text-sm text-fg-muted">Computing changes…</p>
          ) : (
            <div className="text-sm">
              <p className="text-fg-muted">
                <span className="nums font-semibold text-fg">{diff.changedLinks}</span> link change(s) across{" "}
                <span className="nums font-semibold text-fg">{diff.sitesAffected}</span> site(s) since last publish.
              </p>
              <ul className="mt-3 flex flex-col gap-1">
                {diff.perSite.length === 0 ? (
                  <li className="text-xs text-fg-faint">No changes — re-publishing current state.</li>
                ) : (
                  diff.perSite.map((s) => (
                    <li
                      key={s.domain}
                      className="flex items-center justify-between rounded border border-border bg-surface-1 px-2 py-1"
                    >
                      <span className="font-mono text-xs text-fg">{s.domain}</span>
                      <span className="text-xs text-fg-muted">{s.changed} change(s)</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={publish} disabled={pending} data-testid="publish-confirm">
              {pending ? "Publishing…" : "Publish"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}

"use client";

import * as React from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createSiteAction, updateSiteAction } from "@/server/actions/sites";
import type { Site } from "@/lib/types";

export function SiteForm({ site, trigger }: { site?: Site; trigger: React.ReactNode }) {
  const editing = !!site;
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [domain, setDomain] = React.useState(site?.domain ?? "");
  const [status, setStatus] = React.useState<"live" | "draft">(site?.status ?? "draft");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = editing ? await updateSiteAction(site!.id, { domain, status }) : await createSiteAction({ domain, status });
      if (!r.ok) setError(r.error);
      else {
        toast(editing ? "Site updated" : "Site created");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent data-testid="site-form">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit site" : "New site"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label>Domain</Label>
            <Input
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="font-mono"
              data-testid="site-field-domain"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label>Status</Label>
            <Select value={status} onChange={(e) => setStatus(e.target.value as "live" | "draft")} data-testid="site-field-status">
              <option value="draft">Draft</option>
              <option value="live">Live</option>
            </Select>
          </div>
          {error && (
            <p className="text-sm text-negative" data-testid="site-form-error">
              {error}
            </p>
          )}
          <div className="mt-1 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending} data-testid="site-save">
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

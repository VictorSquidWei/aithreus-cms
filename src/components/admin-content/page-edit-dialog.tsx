"use client";

import * as React from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createPageAction, updatePageAction } from "@/server/actions/content";
import type { Page } from "@/lib/types";

export function PageEditDialog({ page, trigger }: { page?: Page; trigger: React.ReactNode }) {
  const editing = !!page;
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState(page?.title ?? "");
  const [slug, setSlug] = React.useState(page?.slug ?? "");
  const [body, setBody] = React.useState(typeof page?.blocks === "string" ? page.blocks : "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = editing
        ? await updatePageAction(page!.id, { title, blocks: body })
        : await createPageAction({ title, slug, blocks: body });
      if (!r.ok) setError(r.error);
      else {
        toast(editing ? "Doc updated" : "Doc created");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent data-testid="page-edit-form" className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit doc" : "New doc"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} data-testid="page-field-title" />
          </div>
          {!editing && (
            <div className="flex flex-col gap-1">
              <Label>Slug (optional)</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto from title" className="font-mono" data-testid="page-field-slug" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <Label>Body (markdown: **bold**, - bullets)</Label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="rounded border border-border bg-surface-1 p-2 font-mono text-xs text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              data-testid="page-field-body"
            />
          </div>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending} data-testid="page-save">
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

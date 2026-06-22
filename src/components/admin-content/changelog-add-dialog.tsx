"use client";

import * as React from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createChangelogAction } from "@/server/actions/content";

export function ChangelogAddDialog({ products, trigger }: { products: { id: string; name: string }[]; trigger: React.ReactNode }) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [productId, setProductId] = React.useState(products[0]?.id ?? "");
  const [version, setVersion] = React.useState("");
  const [date, setDate] = React.useState("2026-06-21");
  const [notes, setNotes] = React.useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await createChangelogAction({ productId, date, version, notes });
      if (!r.ok) setError(r.error);
      else {
        toast("Release added");
        setOpen(false);
        setVersion("");
        setNotes("");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent data-testid="changelog-form">
        <DialogHeader>
          <DialogTitle>Add release</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label>Product</Label>
            <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1">
              <Label>Version</Label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v1.0.0" className="font-mono" data-testid="changelog-field-version" />
            </div>
            <div className="flex flex-col gap-1">
              <Label>Date</Label>
              <Input value={date} onChange={(e) => setDate(e.target.value)} className="font-mono" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label>Notes</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="changelog-field-notes" />
          </div>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending} data-testid="changelog-save">
              {pending ? "Saving…" : "Add release"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

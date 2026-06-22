"use client";

import * as React from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { updateProductAction } from "@/server/actions/content";
import type { Product } from "@/lib/types";

export function ProductEditDialog({ product, trigger }: { product: Product; trigger: React.ReactNode }) {
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [tagline, setTagline] = React.useState(product.tagline);
  const [whatItDoes, setWhatItDoes] = React.useState(product.whatItDoes);
  const [status, setStatus] = React.useState<Product["status"]>(product.status);
  const [executes, setExecutes] = React.useState(product.executes);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await updateProductAction(product.id, { tagline, whatItDoes, status, executes });
      if (!r.ok) setError(r.error);
      else {
        toast("Product updated");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent data-testid="product-edit-form">
        <DialogHeader>
          <DialogTitle>Edit {product.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <Label>Tagline</Label>
            <Input value={tagline} onChange={(e) => setTagline(e.target.value)} data-testid="product-field-tagline" />
          </div>
          <div className="flex flex-col gap-1">
            <Label>What it does</Label>
            <textarea
              value={whatItDoes}
              onChange={(e) => setWhatItDoes(e.target.value)}
              rows={6}
              className="rounded border border-border bg-surface-1 p-2 font-mono text-xs text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
              data-testid="product-field-body"
            />
          </div>
          <div className="flex items-end gap-4">
            <div className="flex flex-col gap-1">
              <Label>Status</Label>
              <Select value={status} onChange={(e) => setStatus(e.target.value as Product["status"])}>
                <option value="live">live</option>
                <option value="beta">beta</option>
                <option value="planned">planned</option>
              </Select>
            </div>
            <label className="flex items-center gap-2 pb-1.5 text-sm text-fg">
              <Switch checked={executes} onCheckedChange={setExecutes} /> Executes
            </label>
          </div>
          {error && <p className="text-sm text-negative">{error}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending} data-testid="product-save">
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

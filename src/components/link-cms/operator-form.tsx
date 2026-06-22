"use client";

import * as React from "react";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { createOperatorAction, updateOperatorAction, type OperatorInput } from "@/server/actions/operators";
import type { Operator } from "@/lib/types";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function OperatorForm({ operator, trigger }: { operator?: Operator; trigger: React.ReactNode }) {
  const editing = !!operator;
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);
  const [pending, start] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<OperatorInput>({
    name: operator?.name ?? "",
    buttonLabel: operator?.buttonLabel ?? "",
    brandColor: operator?.brandColor ?? "#1FD1E6",
    affiliateUrl: operator?.affiliateUrl ?? "https://",
    active: operator?.active ?? true,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = editing ? await updateOperatorAction(operator!.id, form) : await createOperatorAction(form);
      if (!r.ok) setError(r.error);
      else {
        toast(editing ? "Operator updated" : "Operator created");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent data-testid="operator-form">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit operator" : "New operator"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <Field label="Operator name">
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="operator-field-name" />
          </Field>
          <Field label="Button label">
            <Input
              value={form.buttonLabel}
              onChange={(e) => setForm({ ...form, buttonLabel: e.target.value })}
              placeholder="Trade on …"
              data-testid="operator-field-label"
            />
          </Field>
          <Field label="Brand color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.brandColor}
                onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                className="h-9 w-12 shrink-0 rounded border border-border bg-surface-1"
                aria-label="Brand color picker"
              />
              <Input
                value={form.brandColor}
                onChange={(e) => setForm({ ...form, brandColor: e.target.value })}
                className="font-mono"
                data-testid="operator-field-color"
              />
            </div>
          </Field>
          <Field label="Affiliate URL">
            <Input
              value={form.affiliateUrl}
              onChange={(e) => setForm({ ...form, affiliateUrl: e.target.value })}
              className="font-mono"
              data-testid="operator-field-url"
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-fg">
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            Active
          </label>
          {error && (
            <p className="text-sm text-negative" data-testid="operator-form-error">
              {error}
            </p>
          )}
          <div className="mt-1 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={pending} data-testid="operator-save">
              {pending ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

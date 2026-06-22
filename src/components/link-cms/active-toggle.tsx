"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { setOperatorActiveAction } from "@/server/actions/operators";

export function ActiveToggle({ id, active, label }: { id: string; active: boolean; label: string }) {
  const { toast } = useToast();
  const [pending, start] = React.useTransition();
  const [checked, setChecked] = React.useState(active);
  React.useEffect(() => setChecked(active), [active]);

  function onChange(v: boolean) {
    setChecked(v);
    start(async () => {
      const r = await setOperatorActiveAction(id, v);
      if (!r.ok) {
        setChecked(!v);
        toast(r.error, "error");
      } else {
        toast(`${label} ${v ? "activated" : "turned off"}`);
      }
    });
  }

  return (
    <Switch
      checked={checked}
      onCheckedChange={onChange}
      disabled={pending}
      data-testid={`operator-active-${id}`}
      aria-label={`Toggle ${label}`}
    />
  );
}

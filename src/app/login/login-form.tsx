"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="flex flex-col gap-4" data-testid="login-form">
      <input type="hidden" name="next" value={next} />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required data-testid="login-email" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required data-testid="login-password" />
      </div>
      {state.error && (
        <p className="text-sm text-negative" data-testid="login-error">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} data-testid="login-submit" className="justify-center">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { getStore } from "@/server/store";
import { SESSION_COOKIE, cookieOptions, signSession } from "@/lib/auth";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");

  const user = getStore().getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return { error: "Invalid email or password" };
  }

  const token = await signSession({
    userId: user.id,
    role: user.role,
    clientId: user.clientId,
    name: user.name,
    email: user.email,
  });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions());

  redirect(next.startsWith("/") ? next : "/admin");
}

export async function logoutAction(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/login");
}

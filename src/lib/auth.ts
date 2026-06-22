// Session primitives — specs/00-product/03-auth-and-roles.md §3.
// jose-only (no node:crypto / bcrypt) so this module is edge-safe for middleware.
import { SignJWT, jwtVerify } from "jose";
import type { Role, SessionClaims } from "@/lib/types";

export const SESSION_COOKIE = "aithreus_session";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function secret(): Uint8Array {
  // Dev fallback keeps the app runnable without a .env; set AUTH_SECRET in any real env.
  return new TextEncoder().encode(process.env.AUTH_SECRET || "dev-insecure-secret-change-me-please-0001");
}

export async function signSession(claims: SessionClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifySession(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      userId: String(payload.userId),
      role: payload.role as Role,
      clientId: String(payload.clientId),
      name: String(payload.name),
      email: String(payload.email),
    };
  } catch {
    return null;
  }
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
  };
}

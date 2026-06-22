// Route guards — specs/00-product/03-auth-and-roles.md §4. Edge runtime (jose verify only).
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/auth";

const PUBLIC_EXACT = new Set(["/", "/portfolio", "/login", "/403"]);
const INTERNAL_ONLY_PREFIXES = ["/admin/content", "/admin/audit", "/admin/users"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return (
    pathname.startsWith("/api/embed") ||
    pathname.startsWith("/api/dev") ||
    pathname.startsWith("/r/") ||
    pathname.startsWith("/widget") ||
    pathname.startsWith("/demo") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/favicon")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const claims = token ? await verifySession(token) : null;

  if (!claims) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  const internal = claims.role === "superadmin" || claims.role === "internal_editor";
  if (INTERNAL_ONLY_PREFIXES.some((p) => pathname.startsWith(p)) && !internal) {
    const url = req.nextUrl.clone();
    url.pathname = "/403";
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.js$).*)"],
};

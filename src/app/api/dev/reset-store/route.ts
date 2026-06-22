import { NextResponse } from "next/server";
import { resetStore } from "@/server/store";

// Dev/test-only: re-seed the in-memory store. Disabled in production.
export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ ok: false, error: "disabled in production" }, { status: 403 });
  }
  resetStore();
  return NextResponse.json({ ok: true });
}

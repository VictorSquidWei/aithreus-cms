import { NextResponse } from "next/server";
import { getStore } from "@/server/store";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// GET /api/embed/config/:configId → latest published, resolved, active-only config (no raw URLs).
export async function GET(_req: Request, { params }: { params: Promise<{ configId: string }> }) {
  const { configId } = await params;
  const pub = await getStore().getLatestPublished(configId);
  if (!pub) {
    return NextResponse.json({ error: "not found or not published" }, { status: 404, headers: CORS });
  }
  return NextResponse.json(pub.payload, {
    // Prototype: no-store guarantees the §9.14 loop on reload. Production: short s-maxage + revalidate-on-publish.
    headers: { ...CORS, "Cache-Control": "no-store" },
  });
}

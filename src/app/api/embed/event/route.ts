import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/server/store";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// POST /api/embed/event { type:'impression', configId, widgetInstanceId, operatorId }
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const type = String(body.type ?? "");
  const configId = String(body.configId ?? "");
  const widgetInstanceId = String(body.widgetInstanceId ?? "");
  const operatorId = String(body.operatorId ?? "");

  if (type !== "impression" || !configId || !widgetInstanceId || !operatorId) {
    return new NextResponse(null, { status: 400, headers: CORS });
  }

  const store = getStore();
  const site = await store.getSiteByConfigId(configId);
  if (site) {
    await store.appendEvent({
      type: "impression",
      configId,
      siteId: site.id,
      widgetInstanceId,
      operatorId,
      verticalId: site.verticalId,
      ts: new Date().toISOString(),
      anonId: `anon_${Math.floor(Math.random() * 1e9)}`,
      ua: req.headers.get("user-agent"),
      referer: req.headers.get("referer"),
      meta: null,
    });
  }
  return new NextResponse(null, { status: 204, headers: CORS });
}

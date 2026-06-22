import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/server/store";

// Operator S2S conversion postback — DOCUMENTED STUB (Report §11). Real operator integrations
// are out of scope; conversions are otherwise simulated synthetically in the seed.
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const configId = String(body.configId ?? "");
  const widgetInstanceId = String(body.widgetInstanceId ?? "");
  const operatorId = String(body.operatorId ?? "");
  if (!configId || !widgetInstanceId || !operatorId) {
    return new NextResponse(null, { status: 400, headers: CORS });
  }

  const store = getStore();
  const site = store.getSiteByConfigId(configId);
  if (site) {
    const value = typeof body.value === "number" ? body.value : (store.getOperator(operatorId)?.estPayout ?? 50);
    store.appendEvent({
      type: "conversion",
      configId,
      siteId: site.id,
      widgetInstanceId,
      operatorId,
      verticalId: site.verticalId,
      ts: new Date().toISOString(),
      anonId: `anon_${Math.floor(Math.random() * 1e9)}`,
      ua: req.headers.get("user-agent"),
      referer: req.headers.get("referer"),
      meta: { value },
    });
  }
  return new NextResponse(null, { status: 204, headers: CORS });
}

import { NextResponse, type NextRequest } from "next/server";
import { getStore } from "@/server/store";

// GET /r/:configId/:widgetInstanceId/:operatorId → log click, then 302 to the resolved affiliate URL.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ configId: string; wid: string; operatorId: string }> },
) {
  const { configId, wid, operatorId } = await params;
  const store = getStore();
  const pub = await store.getLatestPublished(configId);
  const target = pub?.targets[`${wid}:${operatorId}`];

  const site = await store.getSiteByConfigId(configId);
  if (site) {
    await store.appendEvent({
      type: "click",
      configId,
      siteId: site.id,
      widgetInstanceId: wid,
      operatorId,
      verticalId: site.verticalId,
      ts: new Date().toISOString(),
      anonId: req.cookies.get("aithreus_anon")?.value ?? `anon_${Math.floor(Math.random() * 1e9)}`,
      ua: req.headers.get("user-agent"),
      referer: req.headers.get("referer"),
      meta: null,
    });
  }

  if (!target) return new NextResponse("Link not found", { status: 404 });
  return NextResponse.redirect(target, 302);
}

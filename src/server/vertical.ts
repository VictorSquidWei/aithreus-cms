import { cookies } from "next/headers";
import type { VerticalKey } from "@/lib/types";

export const VERTICAL_COOKIE = "aithreus_vertical";

/** Active product-switch vertical (cookie source of truth; default TT). IA §3. */
export async function getActiveVertical(): Promise<VerticalKey> {
  const v = (await cookies()).get(VERTICAL_COOKIE)?.value;
  return v === "VNX" ? "VNX" : "TT";
}

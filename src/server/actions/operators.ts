"use server";

import { revalidatePath } from "next/cache";
import { getViewer } from "@/server/session";
import { getActiveVertical } from "@/server/vertical";
import { getStore } from "@/server/store";
import { isInternal } from "@/server/visibility";
import { isValidHexColor, isValidHttpUrl, slugify } from "@/lib/utils";
import type { OperatorCategory, Viewer } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; error: string };

export interface OperatorInput {
  name: string;
  buttonLabel: string;
  brandColor: string;
  affiliateUrl: string;
  active: boolean;
}

async function requireUser(): Promise<Viewer> {
  const viewer = await getViewer();
  if (viewer.role === "public") throw new Error("UNAUTHENTICATED");
  return viewer;
}

function validate(input: OperatorInput): string | null {
  if (!input.name.trim()) return "Operator name is required";
  if (!input.buttonLabel.trim()) return "Button label is required";
  if (!isValidHexColor(input.brandColor)) return "Brand color must be a hex value (e.g. #1FD1E6)";
  if (!isValidHttpUrl(input.affiliateUrl)) return "Affiliate URL must be a valid http(s) URL";
  return null;
}

export async function createOperatorAction(input: OperatorInput): Promise<ActionResult> {
  await requireUser();
  const vertical = await getActiveVertical();
  const store = getStore();
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const v = store.getVerticalByKey(vertical);
  if (!v) return { ok: false, error: "Unknown vertical" };
  const dup = store.rawOperators(vertical).some((o) => o.name.toLowerCase() === input.name.trim().toLowerCase());
  if (dup) return { ok: false, error: "An operator with that name already exists in this vertical" };

  const defaultCategory: OperatorCategory = vertical === "VNX" ? "execution" : "odds";
  store.createOperator({
    verticalId: v.id,
    name: input.name.trim(),
    slug: slugify(input.name),
    buttonLabel: input.buttonLabel.trim(),
    brandColor: input.brandColor,
    affiliateUrl: input.affiliateUrl.trim(),
    active: input.active,
    category: defaultCategory,
    role: "Affiliate operator",
    authType: "apiKey",
    integrationStatus: "live",
    internalOnly: false,
    estPayout: 50,
    logoAssetId: null,
  });
  revalidatePath("/admin/operators");
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateOperatorAction(id: string, input: OperatorInput): Promise<ActionResult> {
  const viewer = await requireUser();
  const store = getStore();
  const op = store.getOperator(id);
  if (!op) return { ok: false, error: "Operator not found" };
  if (op.internalOnly && !isInternal(viewer)) return { ok: false, error: "Not permitted" };
  const err = validate(input);
  if (err) return { ok: false, error: err };

  const dup = [...store.operators.values()].some(
    (o) => o.id !== id && o.verticalId === op.verticalId && o.name.toLowerCase() === input.name.trim().toLowerCase(),
  );
  if (dup) return { ok: false, error: "An operator with that name already exists in this vertical" };

  store.updateOperator(id, {
    name: input.name.trim(),
    slug: slugify(input.name),
    buttonLabel: input.buttonLabel.trim(),
    brandColor: input.brandColor,
    affiliateUrl: input.affiliateUrl.trim(),
    active: input.active,
  });
  revalidatePath("/admin/operators");
  revalidatePath("/admin");
  return { ok: true };
}

export async function setOperatorActiveAction(id: string, active: boolean): Promise<ActionResult> {
  const viewer = await requireUser();
  const store = getStore();
  const op = store.getOperator(id);
  if (!op) return { ok: false, error: "Operator not found" };
  if (op.internalOnly && !isInternal(viewer)) return { ok: false, error: "Not permitted" };
  store.updateOperator(id, { active });
  revalidatePath("/admin/operators");
  revalidatePath("/admin");
  return { ok: true };
}

export async function deleteOperatorAction(id: string): Promise<ActionResult> {
  const viewer = await requireUser();
  const store = getStore();
  const op = store.getOperator(id);
  if (!op) return { ok: false, error: "Operator not found" };
  if (op.internalOnly && !isInternal(viewer)) return { ok: false, error: "Not permitted" };
  store.deleteOperator(id);
  revalidatePath("/admin/operators");
  revalidatePath("/admin");
  return { ok: true };
}

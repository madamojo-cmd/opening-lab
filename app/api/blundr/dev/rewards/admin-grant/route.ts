import { NextRequest, NextResponse } from "next/server";

import { resolveBlundrDeveloperAccess } from "@/lib/blundr/backend/devAccess";
import { grantAdminReward, type AdminRewardGrantType } from "@/lib/blundr/rewards/adminRewardGrantService";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function isGrantType(value: unknown): value is AdminRewardGrantType {
  return value === "repertoire_points" || value === "opening_fragment" || value === "choice_token" || value === "epic_bonus";
}

async function readBody(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const access = await resolveBlundrDeveloperAccess(request);
  if (!access.allowed || !access.user?.isAdmin) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "developer_access_denied",
          message: access.reason,
        },
      },
      { status: access.allowed ? 403 : 401 },
    );
  }

  const body = await readBody(request);
  const targetUserId = normalizeText(body.targetUserId);
  const targetEmail = normalizeText(body.targetEmail) || null;
  const grantType = body.grantType;
  const amount = Number(body.amount);
  const reason = normalizeText(body.reason);
  const idempotencyKey = normalizeText(body.idempotencyKey) || undefined;

  if (!targetUserId) {
    return NextResponse.json({ ok: false, error: { code: "missing_target", message: "Target user id is required." } }, { status: 400 });
  }
  if (!isGrantType(grantType)) {
    return NextResponse.json({ ok: false, error: { code: "invalid_grant_type", message: "Grant type is invalid." } }, { status: 400 });
  }
  if (!reason) {
    return NextResponse.json({ ok: false, error: { code: "missing_reason", message: "A reason is required." } }, { status: 400 });
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ ok: false, error: { code: "invalid_amount", message: "Amount must be greater than zero." } }, { status: 400 });
  }

  const result = await grantAdminReward({
    adminUser: access.user,
    targetUserId,
    targetEmail,
    grantType,
    amount,
    reason,
    idempotencyKey,
  });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    result,
  });
}

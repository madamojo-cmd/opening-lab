import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import {
  loadFreeActiveOpeningPolicy,
  saveFreeActiveOpeningSelection,
} from "@/lib/blundr/commercial/activeOpenings.server";
import {
  readCommercialBillingEnvironment,
  resolveCommercialAccess,
} from "@/lib/blundr/commercial/commercialAccess.server";
import { loadDurableRepertoireProgress } from "@/lib/blundr/repertoire/durableRepertoireProgress.server";

export const dynamic = "force-dynamic";

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? Array.from(
        new Set(value.map((item) => String(item ?? "").trim()).filter(Boolean)),
      )
    : [];
}

async function authenticatedUser(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  return user?.isAuthenticated ? user : null;
}

export async function GET(request: Request) {
  const user = await authenticatedUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const access = await resolveCommercialAccess({ userId: user.userId });
  const progress = await loadDurableRepertoireProgress({
    userId: user.userId,
    accessToken: user.accessToken ?? null,
  });
  const policy = await loadFreeActiveOpeningPolicy({
    userId: user.userId,
    environment: readCommercialBillingEnvironment(),
    unlockedOpeningIds: progress.unlockedOpeningIds,
    access,
  });
  return NextResponse.json({
    ok: true,
    data: {
      plan: access.plan,
      unlockedOpeningIds: progress.unlockedOpeningIds,
      activeOpeningIds: policy.activeOpeningIds
        ? Array.from(policy.activeOpeningIds)
        : progress.unlockedOpeningIds,
      selectionRequired: policy.selectionRequired,
    },
  });
}

export async function POST(request: Request) {
  const user = await authenticatedUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const body = (await request.json().catch(() => null)) as {
    activeOpeningIds?: unknown;
  } | null;
  const activeOpeningIds = strings(body?.activeOpeningIds);
  const access = await resolveCommercialAccess({ userId: user.userId });
  const progress = await loadDurableRepertoireProgress({
    userId: user.userId,
    accessToken: user.accessToken ?? null,
  });
  const saved = await saveFreeActiveOpeningSelection({
    userId: user.userId,
    environment: readCommercialBillingEnvironment(),
    unlockedOpeningIds: progress.unlockedOpeningIds,
    selectedOpeningIds: activeOpeningIds,
    access,
  });
  if (!saved.ok) {
    return NextResponse.json(
      {
        error: saved.error,
        message: "Choose exactly three unlocked openings for Free training.",
      },
      { status: 422 },
    );
  }
  return NextResponse.json({ ok: true });
}

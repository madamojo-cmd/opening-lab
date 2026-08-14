import { NextResponse } from "next/server";

import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import {
  readOwnedTrainingPreferences,
  updateOwnedTrainingPreferences,
} from "@/lib/blundr/accounts/trainingPreferences.server";
import { validateTrainingPreferencesPatch } from "@/lib/blundr/accounts/trainingPreferences";

export const dynamic = "force-dynamic";

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
  try {
    return NextResponse.json({
      ok: true,
      data: await readOwnedTrainingPreferences(user),
    });
  } catch {
    return NextResponse.json(
      {
        error: "training_preferences_unavailable",
        message: "Training preferences could not be loaded.",
      },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const user = await authenticatedUser(request);
  if (!user)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const validation = validateTrainingPreferencesPatch(
    await request.json().catch(() => null),
  );
  if (validation.ok === false)
    return NextResponse.json(
      { error: validation.code, message: validation.message },
      { status: 422 },
    );
  try {
    return NextResponse.json({
      ok: true,
      data: await updateOwnedTrainingPreferences(user, validation.patch),
    });
  } catch {
    return NextResponse.json(
      {
        error: "training_preferences_unavailable",
        message: "Training preferences could not be saved.",
      },
      { status: 503 },
    );
  }
}

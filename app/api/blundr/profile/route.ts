import { NextResponse } from "next/server";
import { getCurrentBlundrUser } from "@/lib/blundr/accounts/accountSession";
import {
  claimBlundrUsername,
  readBlundrProfile,
} from "@/lib/blundr/profile/profileRepository.server";
import { validateBlundrUsername } from "@/lib/blundr/profile/profileTypes";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  if (!user?.isAuthenticated)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  return NextResponse.json(await readBlundrProfile(user.userId));
}

export async function PATCH(request: Request) {
  const user = await getCurrentBlundrUser({
    request,
    allowLocalFallback: false,
  });
  if (!user?.isAuthenticated)
    return NextResponse.json(
      { error: "authentication_required" },
      { status: 401 },
    );
  const body = (await request.json().catch(() => null)) as {
    username?: unknown;
  } | null;
  const validation = validateBlundrUsername(body?.username);
  if (validation.ok === false)
    return NextResponse.json(
      { error: validation.code, message: validation.message },
      { status: 422 },
    );
  try {
    const result = await claimBlundrUsername(
      user.userId,
      validation.username,
      validation.normalizedUsername,
    );
    if ("conflict" in result)
      return NextResponse.json(
        {
          error: "username_unavailable",
          message: "That username is unavailable.",
        },
        { status: 409 },
      );
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: "persistence_unavailable",
        message: "The username could not be saved. Try again.",
      },
      { status: 503 },
    );
  }
}

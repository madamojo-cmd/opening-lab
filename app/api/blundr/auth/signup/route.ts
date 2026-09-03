import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readBlundrBackendEnv } from "@/lib/blundr/backend/backendEnv";
import {
  normalizeAppNext,
  normalizeMarketingSource,
} from "@/lib/blundr/routing/appRouteSafety";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    email?: unknown;
    password?: unknown;
    ageConfirmed?: unknown;
    source?: unknown;
    next?: unknown;
  } | null;
  const email = String(body?.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body?.password ?? "");
  if (!body?.ageConfirmed)
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "age_confirmation_required",
          message: "Confirm that you meet Blundr’s 16+ launch age requirement.",
        },
      },
      { status: 422 },
    );
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8)
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "invalid_signup",
          message:
            "Enter a valid email and a password of at least 8 characters.",
        },
      },
      { status: 422 },
    );
  const env = readBlundrBackendEnv();
  if (!env.supabaseUrl || !env.supabaseAnonKey)
    return NextResponse.json(
      { ok: false, error: { code: "auth_unavailable" } },
      { status: 503 },
    );
  const client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const next = normalizeAppNext(body?.next);
  const source = normalizeMarketingSource(body?.source);
  const redirectTo = new URL("/auth/callback", request.url);
  redirectTo.searchParams.set("next", next);
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo.toString(),
      data: {
        age_16_terms_confirmed: true,
        age_16_confirmed: true,
        age_13_confirmed: true,
        signup_source: source,
      },
    },
  });
  if (error || !data.user)
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "signup_failed",
          message: "We couldn’t create your account. Try again.",
        },
      },
      { status: 400 },
    );
  return NextResponse.json({
    ok: true,
    data: { requiresEmailConfirmation: !data.session, next },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { readBlundrBackendEnv } from "@/lib/blundr/backend/backendEnv";
import {
  normalizeAppNext,
  normalizeMarketingSource,
} from "@/lib/blundr/routing/appRouteSafety";
import { BLUNDR_CURRENT_LEGAL_DOCUMENTS } from "@/lib/blundr/legal/legalConsent";
import { recordCurrentLegalAcceptances } from "@/lib/blundr/legal/legalConsent.server";

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
        accepted_terms_version: BLUNDR_CURRENT_LEGAL_DOCUMENTS.terms,
        accepted_privacy_version: BLUNDR_CURRENT_LEGAL_DOCUMENTS.privacy,
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
  try {
    await recordCurrentLegalAcceptances({
      userId: data.user.id,
      context: "signup",
      locale: request.headers.get("accept-language"),
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "legal_acceptance_persistence_failed",
          message:
            "We created your account, but could not record the current legal acknowledgement. Contact support before continuing.",
        },
      },
      { status: 503 },
    );
  }
  return NextResponse.json({
    ok: true,
    data: { requiresEmailConfirmation: !data.session, next },
  });
}

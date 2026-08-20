"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

import {
  BLUNDR_BRAND_ASSETS,
  BLUNDR_TEMPO_ASSETS,
} from "@/lib/blundr/assets/blundrAssetManifest";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { createBlundrSupabaseBrowserClient } from "@/lib/blundr/backend/supabaseBrowserClient";
import { normalizeAppNext } from "@/lib/blundr/routing/appRouteSafety";
import { completePasswordResetForOnboarding } from "@/lib/blundr/onboarding/onboardingAuth";
import { PasswordField } from "./PasswordField";

type SessionState = "loading" | "ready" | "invalid";

const REQUIREMENTS = [
  "At least 8 characters",
  "Match both password fields exactly",
];

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = useMemo(
    () => normalizeAppNext(params.get("next"), "/login"),
    [params],
  );
  const [sessionState, setSessionState] = useState<SessionState>("loading");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const client = createBlundrSupabaseBrowserClient();
    if (!client) {
      setSessionState("invalid");
      return;
    }

    let active = true;
    let settled = false;
    const failTimer = window.setTimeout(() => {
      if (active && !settled) {
        settled = true;
        setSessionState("invalid");
      }
    }, 1200);

    const markReady = () => {
      if (!active || settled) return;
      settled = true;
      window.clearTimeout(failTimer);
      setSessionState("ready");
    };

    const markInvalid = () => {
      if (!active || settled) return;
      settled = true;
      window.clearTimeout(failTimer);
      setSessionState("invalid");
    };

    void client.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        if (data.session?.user) {
          markReady();
          return;
        }
        markInvalid();
      })
      .catch(() => {
        if (active) markInvalid();
      });

    const subscription = client.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session?.user) {
        markReady();
      }
    });

    return () => {
      active = false;
      window.clearTimeout(failTimer);
      subscription.data.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);
    setError(null);

    if (newPassword.length < 8) {
      setBusy(false);
      setError("Use at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setBusy(false);
      setError("The passwords do not match.");
      return;
    }

    const result = await completePasswordResetForOnboarding(newPassword);
    setBusy(false);
    if (!result.ok) {
      setError(result.message);
      if (
        result.code === "recovery_session_invalid" ||
        result.code === "auth_unavailable"
      ) {
        setSessionState("invalid");
      }
      return;
    }

    setMessage(result.message);
    router.replace(`/login?passwordReset=1&next=${encodeURIComponent(next)}`);
  };

  if (sessionState === "loading") {
    return (
      <ResetAuthShell tone="loading">
        <section>
          <h1 className="text-3xl font-black">Reset your password</h1>
          <p className="mt-3 text-stone-700" role="status">
            Checking your recovery link…
          </p>
        </section>
      </ResetAuthShell>
    );
  }

  if (sessionState === "invalid") {
    return (
      <ResetAuthShell tone="invalid">
        <section>
          <Link
            className="inline-flex w-fit items-center rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-green-800 shadow-sm outline-none transition hover:border-green-300 focus-visible:ring-2 focus-visible:ring-green-300"
            href="/login"
          >
            Return to login
          </Link>
          <h1 className="mt-6 text-3xl font-black">Reset your password</h1>
          <p className="mt-3 text-stone-700">
            This reset link is invalid or expired. Request another email to
            continue.
          </p>
          <div className="mt-4 rounded-[22px] border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            <div className="font-black uppercase tracking-[0.18em] text-stone-500">
              Password requirements
            </div>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {REQUIREMENTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-green-800 px-4 font-bold text-white shadow-[0_14px_30px_rgba(22,101,52,0.22)]"
              href={`/forgot-password?next=${encodeURIComponent(next)}`}
            >
              Request another email
            </Link>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 font-bold text-stone-700 shadow-sm"
              href={`/login?next=${encodeURIComponent(next)}`}
            >
              Return to login
            </Link>
          </div>
        </section>
      </ResetAuthShell>
    );
  }

  return (
    <ResetAuthShell tone="ready">
      <section>
        <Link
          className="inline-flex w-fit items-center rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-green-800 shadow-sm outline-none transition hover:border-green-300 focus-visible:ring-2 focus-visible:ring-green-300"
          href="/login"
        >
          Return to login
        </Link>
        <h1 className="mt-6 text-3xl font-black">Reset your password</h1>
        <p className="mt-2 text-stone-600">
          Choose a new password for your Blundr account. This does not reset
          your onboarding, profile, repertoire, progress, rewards, or seen
          lines.
        </p>
        <div className="mt-4 rounded-[22px] border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
          <div className="font-black uppercase tracking-[0.18em] text-stone-500">
            Password requirements
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {REQUIREMENTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <form className="mt-6 space-y-4" onSubmit={submit}>
          <PasswordField
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="Choose a new password"
          />
          <PasswordField
            label="Confirm new password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            minLength={8}
            required
            placeholder="Repeat the new password"
          />
          <button
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green-800 px-4 font-bold text-white shadow-[0_14px_30px_rgba(22,101,52,0.22)] transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={busy}
          >
            <span>{busy ? "Updating password…" : "Update password"}</span>
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </form>

        {message ? (
          <p className="mt-4 rounded-[22px] border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-900">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-[22px] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link
            className="font-bold text-green-800"
            href={`/forgot-password?next=${encodeURIComponent(next)}`}
          >
            Request another email
          </Link>
          <Link
            className="font-semibold text-stone-600"
            href={`/login?next=${encodeURIComponent(next)}`}
          >
            Return to login
          </Link>
        </div>
      </section>
    </ResetAuthShell>
  );
}

function ResetAuthShell({
  tone,
  children,
}: {
  tone: "loading" | "invalid" | "ready";
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-6 text-stone-950 sm:px-6 lg:py-10">
      <section className="mx-auto grid max-w-[950px] overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(31,41,55,0.13)] md:grid-cols-[1fr_1fr]">
        <ResetBrandPanel tone={tone} />
        <section className="flex min-h-[490px] flex-col justify-center p-[34px]">
          {children}
        </section>
      </section>
    </main>
  );
}

function ResetBrandPanel({ tone }: { tone: "loading" | "invalid" | "ready" }) {
  const tempoAsset =
    tone === "invalid"
      ? BLUNDR_TEMPO_ASSETS.sad
      : tone === "loading"
        ? BLUNDR_TEMPO_ASSETS.thinking
        : BLUNDR_TEMPO_ASSETS.success;

  return (
    <aside className="relative flex min-h-[490px] flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#0f5132_0%,#16864d_56%,#77c861_100%)] p-[34px] text-white">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full border border-white/20" />
      <div className="absolute bottom-20 left-8 h-24 w-24 rounded-full border border-white/15" />
      <div className="relative z-10">
        <div className="inline-flex rounded-2xl bg-white/94 px-4 py-3 shadow-sm">
          <BlundrAssetImage
            asset={BLUNDR_BRAND_ASSETS.logoWordmark}
            alt="Blundr"
            variant="brandWordmark"
            priority
            className="max-w-[8.5rem]"
          />
        </div>
        <div className="mt-10 max-w-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-green-100">
            Secure reset
          </p>
          <p className="mt-4 text-4xl font-black leading-[1.02] tracking-tight">
            {tone === "invalid"
              ? "That recovery link needs a refresh."
              : "Choose a new password for the same account."}
          </p>
          <p className="mt-4 text-sm font-medium leading-6 text-green-50/90">
            Password changes do not clear onboarding, repertoire, progress, or
            rewards.
          </p>
        </div>
      </div>
      <div className="relative z-10 flex items-end justify-between gap-4">
        <div className="rounded-[22px] border border-white/20 bg-white/12 p-4 text-sm leading-6 text-green-50 shadow-sm backdrop-blur">
          Recovery only continues after the browser has a valid Supabase
          recovery session.
        </div>
        <BlundrAssetImage
          asset={tempoAsset}
          alt="Tempo"
          variant="tempoHero"
          className="hidden !h-32 !w-32 !rounded-[22px] bg-white/14 !p-1 sm:inline-flex"
        />
      </div>
    </aside>
  );
}

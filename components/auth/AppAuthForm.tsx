"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

import {
  BLUNDR_BRAND_ASSETS,
  BLUNDR_TEMPO_ASSETS,
} from "@/lib/blundr/assets/blundrAssetManifest";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { signInForOnboarding } from "@/lib/blundr/onboarding/onboardingAuth";
import { resolveAppAuthNextTarget } from "@/lib/blundr/routing/appRouteSafety";
import { PasswordField } from "./PasswordField";

export function AppAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const next = resolveAppAuthNextTarget(mode, params.get("next"));
  const source = params.get("source") ?? "direct";
  const passwordResetSuccess = params.get("passwordReset") === "1";

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setMessage(null);

    if (mode === "signup") {
      const response = await fetch("/api/blundr/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ageConfirmed,
          source,
          next,
        }),
      });
      const payload = (await response.json().catch(() => null)) as {
        ok?: boolean;
        error?: { message?: string };
        data?: { requiresEmailConfirmation?: boolean };
      } | null;
      setBusy(false);
      if (!response.ok || !payload?.ok) {
        setMessage(
          payload?.error?.message ?? "We couldn’t create your account.",
        );
        return;
      }
      setMessage(
        payload.data?.requiresEmailConfirmation
          ? "Check your email to confirm your account, then sign in."
          : "Your account is ready. Sign in to continue.",
      );
      return;
    }

    const result = await signInForOnboarding(email, password);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    router.replace(next);
  };

  return (
    <main className="min-h-screen bg-[#f5f5f2] px-4 py-8 text-stone-950 sm:px-6 lg:py-[120px]">
      <section className="mx-auto grid max-w-[948px] overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(31,41,55,0.13)] md:grid-cols-[1fr_1fr]">
        <AuthBrandPanel mode={mode} />
        <section className="flex min-h-[490px] flex-col justify-center p-[34px]">
          <Link
            className="inline-flex w-fit items-center rounded-full bg-green-50 px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-green-800 outline-none transition hover:bg-green-100 focus-visible:ring-2 focus-visible:ring-green-300"
            href="/"
          >
            Account
          </Link>
          <h1 className="mt-6 text-3xl font-black">
            {mode === "signup" ? "Start training free" : "Welcome back"}
          </h1>
          <p className="mt-2 text-stone-600">
            {mode === "signup"
              ? "Create your account before choosing your first training plan."
              : "Sign in to load your durable repertoire, Daily deck and progress."}
          </p>

          {passwordResetSuccess ? (
            <div
              className="mt-4 rounded-[22px] border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-900"
              role="status"
            >
              Your password was updated. Sign in with the new password.
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={submit}>
            <label className="block font-semibold">
              Email
              <input
                className="mt-2 min-h-12 w-full rounded-2xl border border-stone-200 bg-[#fbfbf8] px-4 text-sm font-medium text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-green-300 focus:ring-4 focus:ring-green-100"
                value={email}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <div className="space-y-2">
              <PasswordField
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                minLength={8}
                required
              />
              {mode === "login" ? (
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <Link
                    className="font-bold text-green-800 underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                    href={`/forgot-password?next=${encodeURIComponent(next)}`}
                  >
                    Forgot password?
                  </Link>
                  <a
                    className="font-semibold text-stone-600 underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                    href="mailto:support@blundr.io"
                  >
                    Forgot which email you used? Contact support.
                  </a>
                </div>
              ) : null}
            </div>

            {mode === "signup" ? (
              <label className="flex gap-3 text-sm">
                <input
                  className="mt-1"
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(event) => setAgeConfirmed(event.target.checked)}
                  required
                />
                <span>I confirm that I am at least 13 years old.</span>
              </label>
            ) : null}

            <button
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green-800 px-4 font-bold text-white shadow-[0_14px_30px_rgba(22,101,52,0.22)] transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy || (mode === "signup" && !ageConfirmed)}
            >
              <span>
                {busy
                  ? "Please wait…"
                  : mode === "signup"
                    ? "Create account"
                    : "Log in"}
              </span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
            <Link
              className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-stone-200 bg-white px-4 text-sm font-black text-stone-800 shadow-sm transition hover:border-green-200 hover:text-green-800"
              href={
                mode === "signup"
                  ? `/login?next=${encodeURIComponent(next)}`
                  : `/signup?next=${encodeURIComponent(next)}`
              }
            >
              {mode === "signup" ? "Log in" : "Create account"}
            </Link>
          </form>

          {message ? (
            <p
              className="mt-4 text-sm font-semibold text-stone-700"
              role="status"
            >
              {message}
            </p>
          ) : null}

        </section>
      </section>
    </main>
  );
}

function AuthBrandPanel({ mode }: { mode: "login" | "signup" }) {
  return (
    <aside className="relative flex min-h-[490px] flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#185c38_0%,#237849_100%)] p-[34px] text-white">
      <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full border border-white/20" />
      <div className="absolute bottom-20 left-8 h-24 w-24 rounded-full border border-white/15" />
      <div className="relative z-10">
        <div className="inline-flex">
          <BlundrAssetImage
            asset={BLUNDR_BRAND_ASSETS.logoWordmark}
            alt="Blundr"
            variant="brandWordmark"
            priority
            className="max-w-[7rem] brightness-0 invert"
          />
        </div>
        <div className="mt-10 max-w-sm">
          <p className="text-3xl font-black leading-[1.05] tracking-[-0.05em]">
            {mode === "signup"
              ? "Build it. Train it. Keep it."
              : "Learn it. Play it. Keep it."}
          </p>
          <p className="mt-7 max-w-[300px] text-sm font-medium leading-6 text-green-50/90">
            Opening training that prepares you for the move your opponent
            actually plays.
          </p>
        </div>
      </div>
      <div className="relative z-10 flex justify-center">
        <BlundrAssetImage
          asset={
            mode === "signup"
              ? BLUNDR_TEMPO_ASSETS.pointing
              : BLUNDR_TEMPO_ASSETS.coach
          }
          alt="Tempo"
          variant="tempoHero"
          className="hidden !h-40 !w-40 drop-shadow-[0_22px_40px_rgba(0,0,0,0.22)] sm:inline-flex"
        />
      </div>
    </aside>
  );
}

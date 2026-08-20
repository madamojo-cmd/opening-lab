"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";

import {
  BLUNDR_BRAND_ASSETS,
  BLUNDR_TEMPO_ASSETS,
} from "@/lib/blundr/assets/blundrAssetManifest";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { normalizeAppNext } from "@/lib/blundr/routing/appRouteSafety";
import { requestPasswordResetForOnboarding } from "@/lib/blundr/onboarding/onboardingAuth";

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

export function ForgotPasswordForm() {
  const params = useSearchParams();
  const returnTo = useMemo(
    () => normalizeAppNext(params.get("next"), "/login"),
    [params],
  );
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage(null);
    setError(null);

    if (!EMAIL_PATTERN.test(email.trim())) {
      setBusy(false);
      setError("Enter a valid email address.");
      return;
    }

    const redirectUrl = new URL("/auth/callback", window.location.origin);
    redirectUrl.searchParams.set(
      "next",
      `/reset-password?next=${encodeURIComponent(returnTo)}`,
    );

    const result = await requestPasswordResetForOnboarding(
      email,
      redirectUrl.toString(),
    );

    setBusy(false);
    if (result.ok) {
      setMessage(result.message);
      return;
    }
    setError(result.message);
  };

  return (
    <main className="min-h-screen bg-[#f5f7f2] px-4 py-6 text-stone-950 sm:px-6 lg:py-10">
      <section className="mx-auto grid max-w-[950px] overflow-hidden rounded-[22px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(31,41,55,0.13)] md:grid-cols-[1fr_1fr]">
        <ForgotBrandPanel />
        <section className="flex min-h-[490px] flex-col justify-center p-[34px]">
          <Link
            className="inline-flex w-fit items-center rounded-full border border-stone-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-green-800 shadow-sm outline-none transition hover:border-green-300 focus-visible:ring-2 focus-visible:ring-green-300"
            href="/login"
          >
            Back to login
          </Link>
          <h1 className="mt-6 text-3xl font-black">Forgot your password?</h1>
          <p className="mt-2 text-stone-600">
            Enter the email address you use for Blundr. We’ll send a reset link
            if it matches an account.
          </p>
          <form className="mt-6 space-y-4" noValidate onSubmit={submit}>
            <label className="block font-semibold">
              Email
              <input
                className="mt-2 min-h-12 w-full rounded-2xl border border-stone-200 bg-[#fbfbf8] px-4 text-sm font-medium text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-green-300 focus:ring-4 focus:ring-green-100"
                value={email}
                type="email"
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <button
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-green-800 px-4 font-bold text-white shadow-[0_14px_30px_rgba(22,101,52,0.22)] transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy}
            >
              <span>{busy ? "Sending reset link…" : "Send reset link"}</span>
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

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <Link
              className="font-bold text-green-800"
              href={`/login?next=${encodeURIComponent(returnTo)}`}
            >
              Return to login
            </Link>
            <a
              className="font-semibold text-stone-600 underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
              href="mailto:support@blundr.io"
            >
              Forgot which email you used? Contact support.
            </a>
          </div>
        </section>
      </section>
    </main>
  );
}

function ForgotBrandPanel() {
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
            Password recovery
          </p>
          <p className="mt-4 text-4xl font-black leading-[1.02] tracking-tight">
            Reset access without changing your training state.
          </p>
          <p className="mt-4 text-sm font-medium leading-6 text-green-50/90">
            A valid recovery link returns you to the same protected destination.
          </p>
        </div>
      </div>
      <div className="relative z-10 flex items-end justify-between gap-4">
        <div className="rounded-[22px] border border-white/20 bg-white/12 p-4 text-sm leading-6 text-green-50 shadow-sm backdrop-blur">
          We keep reset responses neutral while preserving the account routing
          path.
        </div>
        <BlundrAssetImage
          asset={BLUNDR_TEMPO_ASSETS.thinking}
          alt="Tempo"
          variant="tempoHero"
          className="hidden !h-32 !w-32 !rounded-[22px] bg-white/14 !p-1 sm:inline-flex"
        />
      </div>
    </aside>
  );
}

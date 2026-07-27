"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";

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
    <main className="min-h-screen bg-stone-50 px-4 py-10">
      <section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <Link className="font-black text-green-800" href="/login">
          Back to login
        </Link>
        <h1 className="mt-6 text-3xl font-black">Forgot your password?</h1>
        <p className="mt-2 text-stone-600">
          Enter the email address you use for Blundr. We’ll send a reset link if
          it matches an account.
        </p>
        <form className="mt-6 space-y-4" noValidate onSubmit={submit}>
          <label className="block font-semibold">
            Email
            <input
              className="mt-1 min-h-11 w-full rounded-xl border border-stone-300 px-3"
              value={email}
              type="email"
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <button
            className="min-h-11 w-full rounded-xl bg-green-800 font-bold text-white disabled:opacity-50"
            disabled={busy}
          >
            {busy ? "Sending reset link…" : "Send reset link"}
          </button>
        </form>

        {message ? (
          <p className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-900">
            {message}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
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
    </main>
  );
}

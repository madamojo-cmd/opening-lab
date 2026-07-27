"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

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
    <main className="min-h-screen bg-stone-50 px-4 py-10">
      <section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <Link className="font-black text-green-800" href="/">
          Blundr
        </Link>
        <h1 className="mt-6 text-3xl font-black">
          {mode === "signup" ? "Start training free" : "Welcome back"}
        </h1>
        <p className="mt-2 text-stone-600">
          {mode === "signup"
            ? "Create your account before choosing your first training plan."
            : "Sign in to continue your training."}
        </p>

        {passwordResetSuccess ? (
          <div
            className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-900"
            role="status"
          >
            Your password was updated. Sign in with the new password.
          </div>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={submit}>
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
            className="min-h-11 w-full rounded-xl bg-green-800 font-bold text-white disabled:opacity-50"
            disabled={busy || (mode === "signup" && !ageConfirmed)}
          >
            {busy
              ? "Please wait…"
              : mode === "signup"
                ? "Create account"
                : "Log in"}
          </button>
        </form>

        {message ? (
          <p
            className="mt-4 text-sm font-semibold text-stone-700"
            role="status"
          >
            {message}
          </p>
        ) : null}

        <p className="mt-6 text-sm text-stone-600">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link
                className="font-bold text-green-800"
                href={`/login?next=${encodeURIComponent(next)}`}
              >
                Log in
              </Link>
            </>
          ) : (
            <>
              New to Blundr?{" "}
              <Link
                className="font-bold text-green-800"
                href={`/signup?next=${encodeURIComponent(next)}`}
              >
                Create an account
              </Link>
            </>
          )}
        </p>
      </section>
    </main>
  );
}

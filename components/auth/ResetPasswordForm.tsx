"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
      <main className="min-h-screen bg-stone-50 px-4 py-10">
        <section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black">Reset your password</h1>
          <p className="mt-3 text-stone-700" role="status">
            Checking your recovery link…
          </p>
        </section>
      </main>
    );
  }

  if (sessionState === "invalid") {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-10">
        <section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
          <Link className="font-black text-green-800" href="/login">
            Return to login
          </Link>
          <h1 className="mt-6 text-3xl font-black">Reset your password</h1>
          <p className="mt-3 text-stone-700">
            This reset link is invalid or expired. Request another email to
            continue.
          </p>
          <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
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
              className="inline-flex min-h-11 items-center rounded-xl bg-green-800 px-4 font-bold text-white"
              href={`/forgot-password?next=${encodeURIComponent(next)}`}
            >
              Request another email
            </Link>
            <Link
              className="inline-flex min-h-11 items-center rounded-xl border border-stone-200 px-4 font-bold text-stone-700"
              href={`/login?next=${encodeURIComponent(next)}`}
            >
              Return to login
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-stone-50 px-4 py-10">
      <section className="mx-auto max-w-md rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <Link className="font-black text-green-800" href="/login">
          Return to login
        </Link>
        <h1 className="mt-6 text-3xl font-black">Reset your password</h1>
        <p className="mt-2 text-stone-600">
          Choose a new password for your Blundr account. This does not reset
          your onboarding, profile, repertoire, progress, rewards, or seen
          lines.
        </p>
        <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
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
            className="min-h-11 w-full rounded-xl bg-green-800 font-bold text-white disabled:opacity-50"
            disabled={busy}
          >
            {busy ? "Updating password…" : "Update password"}
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
    </main>
  );
}

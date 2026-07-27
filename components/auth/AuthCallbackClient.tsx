"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { createBlundrSupabaseBrowserClient } from "@/lib/blundr/backend/supabaseBrowserClient";
import { normalizeAppNext } from "@/lib/blundr/routing/appRouteSafety";

const INVALID_MESSAGE =
  "This link is invalid or expired. Request another password reset email.";
const CONFIRMATION_INVALID_MESSAGE =
  "This link is invalid or expired. Request a fresh confirmation link from login.";

export function AuthCallbackClient() {
  const router = useRouter();
  const params = useSearchParams();
  const next = useMemo(
    () => normalizeAppNext(params.get("next"), "/"),
    [params],
  );
  const isRecovery = useMemo(
    () =>
      next.startsWith("/reset-password") ||
      params.get("type") === "recovery" ||
      params.get("flow_type") === "recovery",
    [next, params],
  );
  const [message, setMessage] = useState(
    isRecovery
      ? "Confirming your password recovery link…"
      : "Confirming your account…",
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const client = createBlundrSupabaseBrowserClient();
    if (!client) {
      setFailed(true);
      setMessage(
        "Authentication is temporarily unavailable. Return to login and try again.",
      );
      return;
    }

    let active = true;
    let settled = false;
    const cleanup = () => {
      active = false;
    };

    const succeed = (destination: string) => {
      if (!active || settled) return;
      settled = true;
      router.replace(destination);
    };

    const fail = (text: string) => {
      if (!active || settled) return;
      settled = true;
      setFailed(true);
      setMessage(text);
    };

    const subscription = client.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) return;
      succeed(next);
    });

    void client.auth
      .getSession()
      .then(({ data }) => {
        if (!active || settled) return;
        if (data.session?.user) {
          succeed(next);
          return;
        }
        window.setTimeout(() => {
          if (!active || settled) return;
          fail(isRecovery ? INVALID_MESSAGE : CONFIRMATION_INVALID_MESSAGE);
        }, 900);
      })
      .catch(() => {
        fail(isRecovery ? INVALID_MESSAGE : CONFIRMATION_INVALID_MESSAGE);
      });

    return () => {
      cleanup();
      subscription.data.subscription.unsubscribe();
    };
  }, [isRecovery, next, router]);

  return (
    <div className="mt-3">
      <p className="text-stone-700" role="status">
        {message}
      </p>
      {failed ? (
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <Link
            className="inline-flex min-h-11 items-center rounded-xl bg-green-800 px-4 font-bold text-white"
            href={isRecovery ? "/forgot-password?next=/login" : "/login"}
          >
            {isRecovery
              ? "Request another password reset email"
              : "Return to login"}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

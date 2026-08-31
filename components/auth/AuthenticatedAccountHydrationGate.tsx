"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

import { persistAuthenticatedAccountSnapshot } from "@/lib/blundr/accounts/authenticatedAccountHydration";
import type { UserAccountBootstrap } from "@/lib/blundr/accounts/accountTypes";
import { BLUNDR_ANALYTICS_EVENTS } from "@/lib/blundr/analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "@/lib/blundr/analytics/blundrAnalyticsService";
import { BLUNDR_DAILY_RING_REFRESH_EVENT } from "@/lib/blundr/daily-rings/dailyRingRefreshSignal";
import { useOnboardingAuthSession } from "@/lib/blundr/onboarding/useOnboardingAuthSession";
import { RewardPresentationHost } from "@/components/rewards/RewardPresentationHost";

const EXEMPT_PREFIXES = [
  "/signup",
  "/login",
  "/forgot-password",
  "/auth",
  "/confirm",
  "/reset-password",
  "/onboarding",
  "/privacy",
  "/terms",
  "/acceptable-use",
  "/subscription-terms",
];
const SIGNED_OUT_PUBLIC_PATHS = ["/"];
export const ACCOUNT_BOOTSTRAP_TIMEOUT_MS = 8_000;

export function AuthenticatedAccountHydrationGate({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const auth = useOnboardingAuthSession();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const exempt = EXEMPT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const signedOutPublicPath = SIGNED_OUT_PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (exempt) {
      setState("ready");
      return;
    }
    if (signedOutPublicPath && auth.status !== "authenticated") {
      setState("ready");
      return;
    }
    if (
      auth.status !== "authenticated" ||
      !auth.session?.accessToken ||
      !auth.session.userId
    ) {
      setState("loading");
      return;
    }
    let active = true;
    const startedAt = performance.now();
    setState("loading");
    void fetch("/api/blundr/account/bootstrap", {
      method: "POST",
      headers: {
        authorization: `Bearer ${auth.session.accessToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(ACCOUNT_BOOTSTRAP_TIMEOUT_MS),
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as {
          ok?: boolean;
          data?: UserAccountBootstrap;
        } | null;
        if (!active) return;
        if (!response.ok || !payload?.ok || !payload.data) {
          trackBlundrAnalyticsEvent(
            BLUNDR_ANALYTICS_EVENTS.AUTH_HYDRATION_FAILED,
            {
              attempt: attempt + 1,
              durationMs: Math.round(performance.now() - startedAt),
              pathClass: "protected",
              reason: `bootstrap_${response.status}`,
            },
          );
          setState("error");
          return;
        }
        const persisted = persistAuthenticatedAccountSnapshot(
          auth.session?.userId ?? "",
          payload.data,
        );
        if (!persisted.ok) {
          trackBlundrAnalyticsEvent(
            BLUNDR_ANALYTICS_EVENTS.AUTH_HYDRATION_FAILED,
            {
              attempt: attempt + 1,
              durationMs: Math.round(performance.now() - startedAt),
              pathClass: "protected",
              reason: "snapshot_persistence_failed",
            },
          );
          setState("error");
          return;
        }
        window.dispatchEvent(new Event(BLUNDR_DAILY_RING_REFRESH_EVENT));
        trackBlundrAnalyticsEvent(
          BLUNDR_ANALYTICS_EVENTS.AUTH_HYDRATION_COMPLETED,
          {
            attempt: attempt + 1,
            durationMs: Math.round(performance.now() - startedAt),
            pathClass: "protected",
            reason: "ready",
          },
        );
        setState("ready");
      })
      .catch((error: unknown) => {
        if (active) {
          trackBlundrAnalyticsEvent(
            BLUNDR_ANALYTICS_EVENTS.AUTH_HYDRATION_FAILED,
            {
              attempt: attempt + 1,
              durationMs: Math.round(performance.now() - startedAt),
              pathClass: "protected",
              reason:
                error instanceof Error && error.name === "TimeoutError"
                  ? "bootstrap_timeout"
                  : "bootstrap_network_error",
            },
          );
          setState("error");
        }
      });
    return () => {
      active = false;
    };
  }, [
    attempt,
    auth.session?.accessToken,
    auth.session?.userId,
    auth.status,
    exempt,
    signedOutPublicPath,
  ]);

  useEffect(() => {
    if (!exempt && !signedOutPublicPath && auth.status === "signed_out") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [auth.status, exempt, pathname, router, signedOutPublicPath]);

  if (exempt) return <>{children}</>;
  if (signedOutPublicPath && auth.status !== "authenticated")
    return <>{children}</>;
  if (auth.status === "signed_out") {
    return (
      <main className="min-h-screen bg-stone-50 p-6">
        <p className="text-sm text-stone-700" role="status">
          Redirecting to sign in.
        </p>
      </main>
    );
  }
  if (state === "ready" && auth.status === "authenticated")
    return (
      <>
        {children}
        <RewardPresentationHost />
      </>
    );
  if (state === "error") {
    return (
      <main className="min-h-screen bg-stone-50 p-6">
        <section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-black">
            We couldn’t load your training account
          </h1>
          <p className="mt-2 text-sm text-stone-700">
            Training stays unavailable until your authenticated progress is
            confirmed.
          </p>
          <button
            type="button"
            className="mt-5 min-h-11 rounded-xl bg-green-800 px-4 font-semibold text-white"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Try again
          </button>
        </section>
      </main>
    );
  }
  return <main className="min-h-screen bg-stone-50" aria-busy="true" />;
}

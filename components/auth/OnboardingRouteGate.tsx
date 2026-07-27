"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import { useOnboardingAuthSession } from "@/lib/blundr/onboarding/useOnboardingAuthSession";
import { isOnboardingV11Enabled } from "@/lib/blundr/onboarding/onboardingV11Flag";
import type { OnboardingV11State } from "@/lib/blundr/onboarding/onboardingV11Contract";

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

export function OnboardingRouteGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const auth = useOnboardingAuthSession();
  const [checked, setChecked] = useState(false);
  const [requestVersion, setRequestVersion] = useState(0);
  const [loadError, setLoadError] = useState(false);
  const exempt = EXEMPT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  useEffect(() => {
    if (!isOnboardingV11Enabled() || exempt) {
      setChecked(true);
      return;
    }
    if (auth.status === "signed_out") {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (auth.status !== "authenticated") return;
    let active = true;
    setLoadError(false);
    setChecked(false);
    void authenticatedApiFetch<{ ok: true; data: OnboardingV11State }>(
      "/api/blundr/onboarding/v11",
      { cache: "no-store" },
    )
      .then((response) => {
        if (!active) return;
        const state = response.data;
        if (!state.completed) router.replace(`/onboarding/${state.step}`);
        else setChecked(true);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });
    return () => {
      active = false;
    };
  }, [auth.status, exempt, pathname, requestVersion, router]);
  if (isOnboardingV11Enabled() && !exempt && auth.status === "loading")
    return <main className="min-h-screen bg-stone-50" aria-busy="true" />;
  if (
    isOnboardingV11Enabled() &&
    !exempt &&
    auth.status === "authenticated" &&
    loadError
  ) {
    return (
      <main className="min-h-screen bg-stone-50 p-6">
        <section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-xl font-black">We couldn’t check your setup</h1>
          <p className="mt-2 text-sm text-stone-700">
            Your training remains protected until we can confirm your onboarding
            progress.
          </p>
          <button
            className="mt-5 min-h-11 rounded-xl bg-green-800 px-4 font-semibold text-white"
            onClick={() => setRequestVersion((version) => version + 1)}
          >
            Try again
          </button>
        </section>
      </main>
    );
  }
  if (
    isOnboardingV11Enabled() &&
    !exempt &&
    auth.status === "authenticated" &&
    !checked
  )
    return <main className="min-h-screen bg-stone-50" aria-busy="true" />;
  return <>{children}</>;
}

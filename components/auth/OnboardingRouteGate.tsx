"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import { useOnboardingAuthSession } from "@/lib/blundr/onboarding/useOnboardingAuthSession";
import { isOnboardingV11Enabled } from "@/lib/blundr/onboarding/onboardingV11Flag";
import type { OnboardingV11State } from "@/lib/blundr/onboarding/onboardingV11Contract";

const EXEMPT_PREFIXES = ["/signup", "/login", "/auth", "/confirm", "/reset-password", "/onboarding", "/privacy", "/terms", "/acceptable-use", "/subscription-terms"];

export function OnboardingRouteGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const auth = useOnboardingAuthSession();
  const [checked, setChecked] = useState(false);
  const exempt = EXEMPT_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  useEffect(() => {
    if (!isOnboardingV11Enabled() || exempt || auth.status !== "authenticated") { setChecked(true); return; }
    let active = true;
    void authenticatedApiFetch<{ ok: true; data: OnboardingV11State }>("/api/blundr/onboarding/v11", { cache: "no-store" })
      .then((response) => {
        if (!active) return;
        const state = response.data;
        if (!state.completed) router.replace(`/onboarding/${state.step}`);
        else setChecked(true);
      })
      .catch(() => { if (active) setChecked(true); });
    return () => { active = false; };
  }, [auth.status, exempt, pathname, router]);
  if (isOnboardingV11Enabled() && !exempt && auth.status === "loading") return <main className="min-h-screen bg-stone-50" aria-busy="true" />;
  if (isOnboardingV11Enabled() && !exempt && auth.status === "authenticated" && !checked) return <main className="min-h-screen bg-stone-50" aria-busy="true" />;
  return <>{children}</>;
}

"use client";

import { useEffect, useState } from "react";
import {
  getOnboardingAuthSession,
  subscribeToOnboardingAuth,
} from "./onboardingAuth";
import type { OnboardingAuthSession } from "./onboardingTypes";

export const ONBOARDING_AUTH_HYDRATION_TIMEOUT_MS = 3_000;

export type OnboardingAuthState = {
  status: "loading" | "authenticated" | "signed_out";
  session: OnboardingAuthSession | null;
  hydrationError: "initialization_failed" | "initialization_timed_out" | null;
};

export function useOnboardingAuthSession(): OnboardingAuthState {
  const [state, setState] = useState<OnboardingAuthState>({
    status: "loading",
    session: null,
    hydrationError: null,
  });
  useEffect(() => {
    let active = true;
    let receivedAuthEvent = false;
    const settle = (
      session: OnboardingAuthSession | null,
      hydrationError: OnboardingAuthState["hydrationError"] = null,
    ) => {
      if (!active) return;
      setState({
        status: session ? "authenticated" : "signed_out",
        session,
        hydrationError,
      });
    };
    const timeout = window.setTimeout(() => {
      settle(null, "initialization_timed_out");
    }, ONBOARDING_AUTH_HYDRATION_TIMEOUT_MS);
    const unsubscribe = subscribeToOnboardingAuth((session) => {
      receivedAuthEvent = true;
      window.clearTimeout(timeout);
      settle(session);
    });
    void getOnboardingAuthSession()
      .then((session) => {
        if (receivedAuthEvent) return;
        window.clearTimeout(timeout);
        settle(session);
      })
      .catch(() => {
        if (receivedAuthEvent) return;
        window.clearTimeout(timeout);
        settle(null, "initialization_failed");
      });
    return () => {
      active = false;
      window.clearTimeout(timeout);
      unsubscribe();
    };
  }, []);
  return state;
}

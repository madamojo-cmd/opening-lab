"use client";

import { useEffect, useState } from "react";
import {
  getOnboardingAuthSession,
  subscribeToOnboardingAuth,
} from "./onboardingAuth";
import type { OnboardingAuthSession } from "./onboardingTypes";

export type OnboardingAuthState = {
  status: "loading" | "authenticated" | "signed_out";
  session: OnboardingAuthSession | null;
};

export function useOnboardingAuthSession(): OnboardingAuthState {
  const [state, setState] = useState<OnboardingAuthState>({
    status: "loading",
    session: null,
  });
  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeToOnboardingAuth((session) => {
      if (active)
        setState({ status: session ? "authenticated" : "signed_out", session });
    });
    void getOnboardingAuthSession().then((session) => {
      if (active)
        setState({ status: session ? "authenticated" : "signed_out", session });
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);
  return state;
}

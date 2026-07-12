"use client";

import { useEffect, useState } from "react";
import { AdminGate } from "./AdminGate";
import { RewardsDebugPanel } from "./RewardsDebugPanel";
import { getOnboardingAuthSession } from "@/lib/blundr/onboarding/onboardingAuth";
import type { CurrentBlundrUser } from "@/lib/blundr/accounts/accountTypes";
import type { RewardsPersistenceTarget } from "@/lib/blundr/rewards/rewardTargetModel";

type DevAccessResponse = {
  ok: boolean;
  allowed: boolean;
  reason: string;
  user: CurrentBlundrUser | null;
  target: RewardsPersistenceTarget;
};

type AccessState =
  | { status: "loading"; payload: null; error: string | null }
  | { status: "ready"; payload: DevAccessResponse; error: string | null }
  | { status: "blocked"; payload: DevAccessResponse | null; error: string | null };

export function RewardsAccessShell() {
  const [state, setState] = useState<AccessState>({ status: "loading", payload: null, error: null });

  useEffect(() => {
    let cancelled = false;

    async function resolveAccess() {
      const session = await getOnboardingAuthSession().catch(() => null);
      const response = await fetch("/api/blundr/dev/access", {
        method: "GET",
        headers: session?.accessToken ? { authorization: `Bearer ${session.accessToken}` } : undefined,
        cache: "no-store",
      });
      const payload = (await response.json().catch(() => null)) as DevAccessResponse | null;
      if (cancelled) return;

      if (!response.ok || !payload?.target) {
        setState({
          status: "blocked",
          payload,
          error: payload?.reason || "Developer access is unavailable.",
        });
        return;
      }

      if (payload.target.isAuthenticatedShared) {
        await import("@/lib/blundr/accounts/accountHydration")
          .then(({ hydrateSharedAccountBootstrap }) => hydrateSharedAccountBootstrap())
          .catch(() => undefined);
      }

      setState({
        status: payload.allowed ? "ready" : "blocked",
        payload,
        error: payload.allowed ? null : payload.reason,
      });
    }

    void resolveAccess();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <section className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Developer tools</div>
        <h1 className="mt-2 text-lg font-black text-stone-950">Checking rewards access</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">Resolving the current authenticated test account.</p>
      </section>
    );
  }

  if (!state.payload || !state.payload.allowed) {
    return (
      <AdminGate allowed={false} reason={state.error || state.payload?.reason || "Developer access is unavailable."}>
        <></>
      </AdminGate>
    );
  }

  const { payload } = state;
  const user = payload.user;
  return (
    <AdminGate allowed={true} reason={payload.reason}>
      <RewardsDebugPanel
        userId={user?.userId ?? "unknown"}
        mode={user?.mode ?? "local_demo"}
        email={user?.email ?? null}
        target={payload.target}
      />
    </AdminGate>
  );
}

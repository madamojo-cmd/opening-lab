"use client";

import { useEffect, useState } from "react";
import {
  authenticatedApiFetch,
  AuthenticatedApiError,
} from "@/lib/blundr/api/authenticatedApiClient";
import type { MasteryMapReadModel } from "@/lib/blundr/masteryMap";
import { OpeningDetailPage } from "./OpeningDetailPage";
import { useOnboardingAuthSession } from "@/lib/blundr/onboarding/useOnboardingAuthSession";

export function OpeningDetailRouteClient({ openingId }: { openingId: string }) {
  const [model, setModel] = useState<MasteryMapReadModel | null>(null);
  const [message, setMessage] = useState("Loading opening intelligence.");
  const auth = useOnboardingAuthSession();
  useEffect(() => {
    if (auth.status === "loading") {
      setMessage("Checking your account session.");
      return;
    }
    if (auth.status === "signed_out") {
      setMessage("Sign in to view this opening's Mastery Map.");
      return;
    }
    let active = true;
    void authenticatedApiFetch<MasteryMapReadModel>(
      `/api/blundr/repertoire/openings/${encodeURIComponent(openingId)}/insights`,
      { cache: "no-store" },
    )
      .then((next) => {
        if (active) setModel(next);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setMessage(
          error instanceof AuthenticatedApiError &&
            error.code === "authentication_required"
            ? "Sign in to view this opening's Mastery Map."
            : error instanceof AuthenticatedApiError && error.status === 403
              ? "Unlock this opening in your Repertoire to view its Mastery Map."
              : error instanceof AuthenticatedApiError && error.status === 404
                ? "This opening is not available."
                : "Opening intelligence is temporarily unavailable.",
        );
      });
    return () => {
      active = false;
    };
  }, [auth.status, openingId]);
  if (model) return <OpeningDetailPage model={model} />;
  return (
    <main className="min-h-screen bg-[#f7f7f4] p-4 text-stone-900 sm:p-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
        <p role="status" className="text-sm font-semibold text-stone-600">
          {message}
        </p>
      </div>
    </main>
  );
}

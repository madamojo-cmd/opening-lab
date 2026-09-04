"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import type { CommercialAccess } from "@/lib/blundr/commercial/commercialAccess";

export function BillingResultPage({ mode }: { mode: "success" | "cancel" }) {
  const [access, setAccess] = useState<CommercialAccess | null>(null);
  const [loading, setLoading] = useState(mode === "success");

  async function refresh() {
    setLoading(true);
    try {
      const response = await authenticatedApiFetch<{
        ok: true;
        data: CommercialAccess;
      }>("/api/blundr/billing/status", { cache: "no-store" });
      setAccess(response.data);
    } catch {
      setAccess(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (mode === "success") void refresh();
  }, [mode]);

  return (
    <main className="min-h-screen bg-[#f6f3eb] px-4 py-10 text-stone-950">
      <section className="mx-auto max-w-2xl rounded-lg border border-stone-200 bg-white p-6 shadow-xl">
        <p className="text-xs font-black uppercase text-green-700">
          Billing
        </p>
        <h1 className="mt-3 text-3xl font-black">
          {mode === "success"
            ? "Subscription confirmation is being processed."
            : "Checkout was canceled."}
        </h1>
        <p className="mt-3 text-sm leading-6 text-stone-600" role="status">
          {mode === "success"
            ? access?.plan === "pro"
              ? "Your trusted Pro entitlement is active."
              : "Blundr is waiting for provider reconciliation before showing Pro as active."
            : "No subscription change was made. You can keep training free or choose a Pro plan again."}
        </p>
        {mode === "success" ? (
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-green-800 px-4 text-sm font-black text-white disabled:opacity-60"
          >
            <RefreshCw size={16} aria-hidden="true" />
            {loading ? "Checking..." : "Check status"}
          </button>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3 text-sm font-black">
          <Link className="text-green-800 underline" href="/settings#billing">
            Settings -&gt; Billing
          </Link>
          <Link className="text-green-800 underline" href="/onboarding/plan">
            Plan selection
          </Link>
        </div>
      </section>
    </main>
  );
}

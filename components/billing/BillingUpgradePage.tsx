"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CreditCard, Loader2, RefreshCw } from "lucide-react";

import { PaywallPlanSelection } from "@/components/billing/PaywallPlanSelection";
import { authenticatedApiFetch } from "@/lib/blundr/api/authenticatedApiClient";
import type { CommercialAccess } from "@/lib/blundr/commercial/commercialAccess";

export function BillingUpgradePage() {
  const [selected, setSelected] = useState<"" | "pro_monthly" | "pro_annual">(
    "",
  );
  const [access, setAccess] = useState<CommercialAccess | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function loadStatus() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await authenticatedApiFetch<{
        ok: true;
        data: CommercialAccess;
      }>("/api/blundr/billing/status", { cache: "no-store" });
      setAccess(response.data);
    } catch {
      setMessage(
        "Billing status could not be loaded. Try again from Settings.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function openBillingPortal() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await authenticatedApiFetch<{
        ok: true;
        data: { url: string };
      }>("/api/blundr/billing/portal", {
        method: "POST",
        body: JSON.stringify({}),
        cache: "no-store",
      });
      window.location.assign(response.data.url);
    } catch {
      setMessage("Billing portal could not be opened.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void loadStatus();
  }, []);

  const proActive = access?.plan === "pro" && access.entitlementActive === true;

  return (
    <main className="min-h-screen bg-[#f6f3eb] px-4 py-10 text-stone-950">
      <section className="mx-auto max-w-3xl rounded-lg border border-stone-200 bg-white p-6 shadow-xl">
        <p className="text-xs font-black uppercase text-green-700">Billing</p>
        <h1 className="mt-3 text-3xl font-black">Upgrade to Blundr Pro.</h1>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          Choose Monthly or Annual, review the current server-generated offer,
          and acknowledge the seven-day trial terms before Checkout.
        </p>

        {loading ? (
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-sm font-black text-stone-700">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Checking billing status
          </div>
        ) : proActive ? (
          <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <h2 className="text-lg font-black text-stone-950">
              Blundr Pro is already active.
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Manage your provider-confirmed subscription from Settings Billing.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={() => void openBillingPortal()}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-green-800 px-3 text-sm font-black text-white disabled:opacity-60"
              >
                <CreditCard size={16} aria-hidden="true" />
                {busy ? "Opening..." : "Manage billing"}
              </button>
              <Link
                href="/settings#billing"
                className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-3 text-sm font-black text-stone-800"
              >
                Return to Settings -&gt; Billing
              </Link>
            </div>
          </div>
        ) : access ? (
          <div className="mt-6">
            <PaywallPlanSelection
              mode="upgrade"
              selected={selected}
              onSelect={(value) => {
                if (value !== "free") setSelected(value);
              }}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={() => void loadStatus()}
            className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-lg border border-stone-300 px-3 text-sm font-black text-stone-800"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Retry billing status
          </button>
        )}

        {message ? (
          <p role="alert" className="mt-4 text-sm font-bold text-red-700">
            {message}
          </p>
        ) : null}
      </section>
    </main>
  );
}

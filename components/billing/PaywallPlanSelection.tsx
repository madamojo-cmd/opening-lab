"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Loader2 } from "lucide-react";

import {
  authenticatedApiFetch,
  AuthenticatedApiError,
} from "@/lib/blundr/api/authenticatedApiClient";
import type { BillingPlan } from "@/lib/blundr/billing/billingConfig";

type PaidOffer = {
  id: string;
  plan: BillingPlan;
  trialEligible: boolean;
  trialDays: number;
  disclosure: string;
  acknowledgement: string;
};

type PaywallPlanSelectionProps = {
  selected: string;
  onSelect: (value: "free" | "pro_monthly" | "pro_annual") => void;
};

const FREE_FEATURES = [
  "up to 3 active openings",
  "unlimited training in active openings",
  "5 Daily cards daily",
  "5 Review positions daily",
  "rings, streaks, rewards",
  "basic progress/repertoire tracking",
] as const;

const PRO_FEATURES = [
  "unlimited active repertoire",
  "Daily target up to 99",
  "unlimited Review Queue",
  "full mastery and weak-area insights",
  "full progress and next-action views",
] as const;

function planFromSelection(selected: string): BillingPlan | null {
  if (selected === "pro_monthly") return "monthly";
  if (selected === "pro_annual") return "annual";
  return null;
}

export function PaywallPlanSelection({
  selected,
  onSelect,
}: PaywallPlanSelectionProps) {
  const [offer, setOffer] = useState<PaidOffer | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const paidPlan = planFromSelection(selected);

  useEffect(() => {
    let cancelled = false;
    setOffer(null);
    setAcknowledged(false);
    setMessage(null);
    if (!paidPlan) return;
    setBusy(true);
    authenticatedApiFetch<{ ok: true; data: PaidOffer }>(
      "/api/blundr/billing/offer",
      {
        method: "POST",
        body: JSON.stringify({ plan: paidPlan }),
        cache: "no-store",
      },
    )
      .then((response) => {
        if (!cancelled) setOffer(response.data);
      })
      .catch(() => {
        if (!cancelled)
          setMessage("The current billing offer could not be loaded.");
      })
      .finally(() => {
        if (!cancelled) setBusy(false);
      });
    return () => {
      cancelled = true;
    };
  }, [paidPlan]);

  async function startCheckout() {
    if (!paidPlan || !offer || !acknowledged) return;
    setBusy(true);
    setMessage(null);
    try {
      await authenticatedApiFetch<{ ok: true }>(
        "/api/blundr/billing/offer/accept",
        {
          method: "POST",
          body: JSON.stringify({ offerId: offer.id, plan: paidPlan }),
          cache: "no-store",
        },
      );
      const response = await authenticatedApiFetch<{
        ok: true;
        data: { url: string };
      }>("/api/blundr/billing/checkout", {
        method: "POST",
        body: JSON.stringify({ plan: paidPlan }),
        cache: "no-store",
      });
      window.location.assign(response.data.url);
    } catch (error) {
      setMessage(
        error instanceof AuthenticatedApiError && error.status === 409
          ? "The billing offer expired. Review the current terms and try again."
          : "Checkout could not be started. Try again from this page.",
      );
      setAcknowledged(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <PlanCard
          active={selected === "free"}
          title="Blundr Free"
          price="$0"
          cta="Continue with Free"
          features={FREE_FEATURES}
          onClick={() => onSelect("free")}
        />
        <div className="rounded-lg border border-stone-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-2xl font-black text-stone-950">
                Blundr Pro
              </div>
              <p className="mt-1 text-sm font-black text-green-800">
                7 days free for eligible users
              </p>
            </div>
          </div>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-stone-600">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex gap-2">
                <Check size={16} className="mt-1 shrink-0 text-green-700" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <PriceOption
              active={selected === "pro_monthly"}
              label="Monthly"
              price="$9.99/month after trial"
              onClick={() => onSelect("pro_monthly")}
            />
            <PriceOption
              active={selected === "pro_annual"}
              label="Annual"
              badge="Best value"
              price="$69.99/year after trial"
              detail="Save 42%"
              onClick={() => onSelect("pro_annual")}
            />
          </div>
        </div>
      </div>
      {paidPlan ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold leading-6 text-amber-950">
            {busy && !offer ? "Loading current offer..." : offer?.disclosure}
          </p>
          {offer ? (
            <>
              <label className="mt-3 flex items-start gap-3 text-sm leading-6 text-amber-950">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  className="mt-1 h-5 w-5 rounded border-amber-400 text-green-800"
                />
                <span>{offer.acknowledgement}</span>
              </label>
              <p className="mt-3 text-sm leading-6 text-amber-900">
                Card required. One introductory trial per eligible customer.
                Manage or cancel anytime in Settings -&gt; Billing.
              </p>
              <button
                type="button"
                disabled={!acknowledged || busy}
                onClick={() => void startCheckout()}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-green-800 px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                ) : (
                  <CreditCard size={16} aria-hidden="true" />
                )}
                {offer.trialEligible
                  ? "Start 7-day Pro trial - $0 today"
                  : `Continue to Checkout - ${paidPlan === "monthly" ? "$9.99/month" : "$69.99/year"}`}
              </button>
            </>
          ) : null}
        </div>
      ) : null}
      {message ? (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">
          {message}
        </p>
      ) : null}
    </div>
  );
}

function PlanCard({
  active,
  title,
  price,
  cta,
  features,
  onClick,
}: {
  active: boolean;
  title: string;
  price: string;
  cta: string;
  features: readonly string[];
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg border p-5 text-left transition ${active ? "border-green-800 bg-green-50" : "border-stone-200 bg-white"}`}
    >
      <span className="block text-2xl font-black text-stone-950">{title}</span>
      <span className="mt-1 block text-sm font-black text-green-800">{price}</span>
      <span className="mt-4 block space-y-2 text-sm leading-6 text-stone-600">
        {features.map((feature) => (
          <span key={feature} className="flex gap-2">
            <Check size={16} className="mt-1 shrink-0 text-green-700" />
            <span>{feature}</span>
          </span>
        ))}
      </span>
      <span className="mt-5 inline-flex min-h-10 items-center rounded-lg bg-white px-3 text-sm font-black text-green-800 ring-1 ring-green-200">
        {cta}
      </span>
    </button>
  );
}

function PriceOption({
  active,
  label,
  price,
  badge,
  detail,
  onClick,
}: {
  active: boolean;
  label: string;
  price: string;
  badge?: string;
  detail?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-lg border p-4 text-left ${active ? "border-green-800 bg-green-50" : "border-stone-200 bg-white"}`}
    >
      <span className="flex items-center justify-between gap-2 text-sm font-black text-stone-950">
        {label}
        {badge ? (
          <span className="rounded bg-green-800 px-2 py-1 text-xs text-white">
            {badge}
          </span>
        ) : null}
      </span>
      <span className="mt-2 block text-sm text-stone-600">{price}</span>
      {detail ? (
        <span className="mt-1 block text-sm font-black text-green-800">
          {detail}
        </span>
      ) : null}
    </button>
  );
}

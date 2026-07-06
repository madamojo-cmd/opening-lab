"use client";

import { LockKeyhole, Mail, Sparkles } from "lucide-react";
import { BLUNDR_EMPTY_STATE_ASSETS, BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import type { OnboardingAccountChoice, OnboardingAuthMode } from "@/lib/blundr/onboarding/onboardingTypes";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import { OnboardingButtonRow } from "./OnboardingButtonRow";
import { OnboardingFeatureRow } from "./OnboardingFeatureRow";
import { OnboardingShell } from "./OnboardingShell";
import { ONBOARDING_COPY } from "@/lib/blundr/onboarding/onboardingCopy";

type AccountSaveProgressScreenProps = {
  stepIndex: number;
  stepCount: number;
  accountChoice: OnboardingAccountChoice;
  authMode?: OnboardingAuthMode;
  email: string;
  password: string;
  authAvailable: boolean;
  authMessage?: string | null;
  authError?: string | null;
  needsEmailConfirmation?: boolean;
  onSelectAccountChoice: (choice: OnboardingAccountChoice) => void;
  onSelectAuthMode: (mode: OnboardingAuthMode) => void;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmitAuth: () => void;
  onContinueLocalDemo: () => void;
  onBack: () => void;
  busy?: boolean;
};

export function AccountSaveProgressScreen({
  stepIndex,
  stepCount,
  accountChoice,
  authMode = "sign_in",
  email,
  password,
  authAvailable,
  authMessage,
  authError,
  needsEmailConfirmation,
  onSelectAccountChoice,
  onSelectAuthMode,
  onEmailChange,
  onPasswordChange,
  onSubmitAuth,
  onContinueLocalDemo,
  onBack,
  busy = false,
}: AccountSaveProgressScreenProps) {
  const submitLabel = authMode === "sign_up" ? "Create account" : "Sign in";

  return (
    <OnboardingShell
      title={ONBOARDING_COPY.account.title}
      copy={ONBOARDING_COPY.account.copy}
      tempoCopy={ONBOARDING_COPY.account.tempoCopy}
      stepIndex={stepIndex}
      stepCount={stepCount}
      onBack={onBack}
      footer={<OnboardingButtonRow primaryLabel="Continue in local demo" onPrimary={onContinueLocalDemo} primaryDisabled={busy} primaryTone="dark" secondaryLabel={accountChoice === "account" ? "Keep account mode" : undefined} onSecondary={accountChoice === "account" ? () => onSelectAccountChoice("account") : undefined} secondaryDisabled={busy} />}
    >
      <div className="grid gap-3">
        <OnboardingFeatureRow label="Save your repertoire" description="Keep your starter pack, opening progress, and review loop across sessions." icon={<Sparkles size={16} />} />
        <OnboardingFeatureRow label="Email/password sign in" description="Use Supabase Auth for a minimal authenticated flow during development." icon={<LockKeyhole size={16} />} />
        <OnboardingFeatureRow label="Local demo fallback" description="Continue without credentials if auth is unavailable or you want to stay local." icon={<Mail size={16} />} />
      </div>

      <div className="rounded-[1.75rem] border border-stone-200 bg-stone-50 p-4">
        <div className="grid gap-2 sm:grid-cols-3">
          {[
            { id: "local_demo", label: "Continue in local demo" },
            { id: "sign_in", label: "Sign in with email/password" },
            { id: "sign_up", label: "Create account with email/password" },
          ].map((option) => {
            const active = option.id === "local_demo" ? accountChoice === "local_demo" : accountChoice === "account" && authMode === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  if (option.id === "local_demo") {
                    onSelectAccountChoice("local_demo");
                    return;
                  }
                  onSelectAccountChoice("account");
                  onSelectAuthMode(option.id === "sign_in" ? "sign_in" : "sign_up");
                }}
                className={`rounded-2xl border px-4 py-3 text-left text-sm font-black shadow-sm ${
                  active ? "border-green-300 bg-green-50 text-stone-950" : "border-stone-200 bg-white text-stone-700"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-4 space-y-4">
          {accountChoice === "account" ? (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onSelectAuthMode("sign_in")}
                  className={`rounded-full px-4 py-2 text-sm font-black ${authMode === "sign_in" ? "bg-green-700 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => onSelectAuthMode("sign_up")}
                  className={`rounded-full px-4 py-2 text-sm font-black ${authMode === "sign_up" ? "bg-green-700 text-white" : "bg-white text-stone-700 ring-1 ring-stone-200"}`}
                >
                  Create account
                </button>
              </div>

              <div className="grid gap-3">
                <label className="grid gap-2 text-sm font-bold text-stone-700">
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder="adamconnor00@gmail.com"
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-950 shadow-sm outline-none ring-0 placeholder:text-stone-400 focus:border-green-300"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-stone-700">
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => onPasswordChange(event.target.value)}
                    placeholder="Choose a password"
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-950 shadow-sm outline-none ring-0 placeholder:text-stone-400 focus:border-green-300"
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={onSubmitAuth}
                disabled={busy || !authAvailable || !email.trim() || !password.trim()}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLabel}
              </button>

              {!authAvailable ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <BlundrAssetImage
                      asset={BLUNDR_EMPTY_STATE_ASSETS.offlineLocalDemo}
                      alt="Local demo fallback"
                      variant="emptyState"
                      className="mx-auto sm:mx-0 sm:shrink-0"
                    />
                    <div>
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">Supabase unavailable</div>
                      <p className="mt-2">Continue in local demo to keep going without auth credentials.</p>
                    </div>
                  </div>
                </div>
              ) : null}

              {authMessage ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-900">{authMessage}</div>
              ) : null}

              {needsEmailConfirmation ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-900">
                  Check your email to confirm your account, then sign in again.
                </div>
              ) : null}

            </>
          ) : (
            <div className="rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-600">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <BlundrAssetImage
                  asset={BLUNDR_EMPTY_STATE_ASSETS.offlineLocalDemo}
                  alt="Local demo fallback"
                  variant="emptyState"
                  className="mx-auto sm:mx-0 sm:shrink-0"
                />
                <div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Local demo</div>
                  <p className="mt-2">
                    Continue in local demo to save progress on this device without Supabase credentials.
                  </p>
                  <p className="mt-2 text-xs font-semibold text-stone-500">
                    Tempo keeps your setup moving even when auth is unavailable.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {authError ? (
        <div className="rounded-[1.75rem] border border-red-200 bg-red-50 p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <BlundrAssetImage
              asset={BLUNDR_TEMPO_ASSETS.sad}
              alt="Tempo sad"
              variant="tempoInline"
              className="mx-auto sm:mx-0 sm:shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-red-700">Auth failed</div>
              <p className="mt-2 text-sm leading-6 text-red-900">{authError}</p>
            </div>
          </div>
        </div>
      ) : null}
    </OnboardingShell>
  );
}

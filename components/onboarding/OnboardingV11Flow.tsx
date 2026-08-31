"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authenticatedApiFetch, AuthenticatedApiError } from "@/lib/blundr/api/authenticatedApiClient";
import { getAllStarterPacks } from "@/lib/blundr/onboarding/starterPacks";
import { useOnboardingAuthSession } from "@/lib/blundr/onboarding/useOnboardingAuthSession";
import { getCompletedOnboardingRedirectDestination } from "@/lib/blundr/onboarding/onboardingRouting";
import {
  ONBOARDING_V11_STEPS,
  getOnboardingV11PaceGoals,
  type OnboardingPriority,
  type OnboardingV11Pace,
  type OnboardingV11State,
  type OnboardingV11Step,
} from "@/lib/blundr/onboarding/onboardingV11Contract";

const LEVELS = [
  ["u800", "Beginner", "New to opening theory", "Under 800"],
  ["800-1200", "Improver", "Learning the fundamentals", "800-1200"],
  ["1200-1600", "Club", "Know a few openings", "1200-1600"],
  ["1600-2000", "Advanced", "Solid opening knowledge", "1600-2000"],
  ["2000-plus", "Expert", "Sharp and theory-deep", "2000+"],
] as const;

const PRIORITIES: Array<[OnboardingPriority, string, string]> = [
  ["remember_openings", "Remember my openings", "Turn studied moves into recall."],
  ["build_repertoire", "Build a repertoire", "Start with a focused White and Black pair."],
  ["post_opening_plans", "Know what comes next", "Practice decisions after the line changes."],
  ["review_mistakes", "Review my misses", "Bring weak positions back until they stick."],
  ["prepare_for_games", "Prepare for real games", "Train positions you can actually reach."],
];

const PACES: Array<[OnboardingV11Pace, string, string]> = [
  ["light", "Light", "A short daily touch."],
  ["standard", "Standard", "The balanced Blundr routine."],
  ["focused", "Focused", "More reps when you have time to push."],
];

function apiData<T>(value: T): T extends { data: infer Data } ? Data : never {
  return (value as { data: unknown }).data as never;
}

function titleForStep(step: OnboardingV11Step): string {
  return {
    welcome: "Build a repertoire you actually remember.",
    level: "Set your chess experience.",
    priorities: "Choose what you want to improve.",
    "starter-pack": "Pick your starter repertoire.",
    "training-mode": "Choose your training style.",
    pace: "Set your daily practice target.",
    "line-changes": "When the line changes, keep playing.",
    review: "Missed moves come back.",
    ready: "Your trainer is ready.",
  }[step];
}

function subtitleForStep(step: OnboardingV11Step): string {
  return {
    welcome: "Blundr teaches opening positions and decisions, not just memorized sequences.",
    level: "Your level helps Blundr choose the right amount of guidance.",
    priorities: "Pick the training outcomes that matter most right now.",
    "starter-pack": "This becomes the first version of your personal trainer.",
    "training-mode": "Assisted teaches the idea. Plain asks you to recall it.",
    pace: "Tempo, Battery, and Daily Blundr form the daily practice loop.",
    "line-changes": "Your opponent can choose another continuation. Blundr keeps teaching from the position.",
    review: "Moves you miss return to Review so they can be practiced again.",
    ready: "Start with a real opening session, then let Review bring back what needs work.",
  }[step];
}

export function OnboardingV11Flow({ requestedStep }: { requestedStep?: string }) {
  const auth = useOnboardingAuthSession();
  const router = useRouter();
  const [state, setState] = useState<OnboardingV11State | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<unknown>(undefined);

  const requested = ONBOARDING_V11_STEPS.includes(requestedStep as OnboardingV11Step) ? (requestedStep as OnboardingV11Step) : null;
  const activeStep = state?.completed ? "ready" : state?.step ?? requested ?? "welcome";
  const stepIndex = Math.max(0, ONBOARDING_V11_STEPS.indexOf(activeStep));

  const load = async () => {
    setError(null);
    try {
      const response = await authenticatedApiFetch<{ ok: true; data: OnboardingV11State }>("/api/blundr/onboarding/v11", { cache: "no-store" });
      const next = apiData(response);
      setState(next);
      setSelected(valueForStep(next, next.step));
      if (!next.completed && requested && requested !== next.step) router.replace(`/onboarding/${next.step}`);
    } catch (cause) {
      setError(cause instanceof AuthenticatedApiError && cause.status === 401 ? "Your session has ended. Sign in to continue setup." : "We couldn't load your saved setup. Try again.");
    }
  };

  useEffect(() => {
    if (auth.status === "authenticated") void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.status]);

  useEffect(() => {
    if (auth.status !== "authenticated" || !state?.completed) return;
    router.replace(getCompletedOnboardingRedirectDestination());
  }, [auth.status, router, state?.completed]);

  const save = async (step: OnboardingV11Step, value?: unknown) => {
    setBusy(true);
    setError(null);
    try {
      const response = await authenticatedApiFetch<{ ok: true; data: OnboardingV11State }>("/api/blundr/onboarding/v11", {
        method: "PATCH",
        body: JSON.stringify({
          step,
          value,
          ageConfirmed: step === "welcome" ? value === true : undefined,
        }),
      });
      const next = apiData(response);
      setState(next);
      setSelected(valueForStep(next, next.step));
      router.replace(`/onboarding/${next.step}`);
    } catch {
      setError("That choice could not be saved. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const complete = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await authenticatedApiFetch<{ ok: true; data: OnboardingV11State }>("/api/blundr/onboarding/v11/complete", { method: "POST" });
      const next = apiData(response);
      setState(next);
      startTraining(next);
    } catch {
      setError("We couldn't verify your starter repertoire. Your choices are saved; try again.");
    } finally {
      setBusy(false);
    }
  };

  const startTraining = (nextState = state) => {
    const pack = nextState?.starterPackId ? getAllStarterPacks().find((item) => item.id === nextState.starterPackId) : null;
    router.push(`/train${pack ? `?openingId=${encodeURIComponent(pack.whiteOpeningId)}` : ""}`);
  };

  const content = useMemo(() => {
    if (!state) return null;
    if (activeStep === "welcome") {
      return (
        <div className="space-y-5">
          <div className="rounded-3xl border border-green-200 bg-green-50 p-5">
            <h2 className="text-lg font-black text-stone-950">Opening study should survive real games.</h2>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              Learn the move, understand the position, and keep training when your opponent leaves the line.
            </p>
          </div>
          <label className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-sm leading-6 text-stone-700">
            <input
              type="checkbox"
              className="mt-1 h-5 w-5 rounded border-stone-300 text-green-800"
              checked={selected === true || state.ageConfirmed}
              disabled={state.ageConfirmed}
              onChange={(event) => setSelected(event.target.checked)}
              required
            />
            <span>
              I agree to the <Link className="font-black text-green-800 underline" href="/terms">Terms of Service</Link> and{" "}
              <Link className="font-black text-green-800 underline" href="/privacy">Privacy Policy</Link>, and I confirm that I meet Blundr&rsquo;s minimum age requirement.
            </span>
          </label>
        </div>
      );
    }
    if (activeStep === "level") return <ChoiceList value={selected} onChange={setSelected} choices={LEVELS.map(([id, label, description, range]) => [id, `${label} · ${range}`, description])} single />;
    if (activeStep === "priorities") return <ChoiceList value={selected ?? state.priorities} onChange={setSelected} choices={PRIORITIES}/>;
    if (activeStep === "starter-pack") return <ChoiceList value={selected} onChange={setSelected} choices={getAllStarterPacks().map((pack) => [pack.id, pack.displayName, `${pack.whiteOpeningName} as White · ${pack.blackOpeningName} as Black`])} single />;
    if (activeStep === "training-mode") return <ChoiceList value={selected ?? state.trainingMode ?? "assisted"} onChange={setSelected} choices={[["assisted", "Assisted", "Get move cues and a short explanation while learning."], ["plain", "Plain", "Find the move from memory before feedback appears."]]} single />;
    if (activeStep === "pace") return <ChoiceList value={selected ?? state.pace ?? "standard"} onChange={setSelected} choices={PACES.map(([id, label, description]) => { const goals = getOnboardingV11PaceGoals(id); return [id, label, `${description} ${goals.tempo} Tempo · ${goals.battery} Battery · ${goals.daily} Daily Blundr`]; })} single />;
    if (activeStep === "line-changes") return <ExplainerCards items={[["Opponent choices", "Your opponent may choose a different continuation than the one you studied."], ["Position first", "Blundr keeps the training focused on the position and the decision in front of you."], ["Keep playing", "Continuation practice helps you stay comfortable after preparation ends."]]} />;
    if (activeStep === "review") return <ExplainerCards items={[["Missed moves return", "Review brings back positions you missed so weak spots turn into remembered moves."], ["Retry matters", "You can try again, reveal the answer, and continue once the move is clear."], ["Daily loop", "Review connects back into the same daily practice habit."]]} />;
    return <PlanSummary state={state}/>;
  }, [activeStep, selected, state]);

  if (auth.status === "loading") return <OnboardingFrame title="Checking your session"><p role="status">Loading your account.</p></OnboardingFrame>;
  if (auth.status === "signed_out") return <OnboardingFrame title="Sign in to continue"><p>Your setup belongs to your Blundr account.</p><Link className="mt-6 inline-flex min-h-11 items-center rounded-lg bg-green-800 px-4 font-bold text-white" href={`/login?next=${encodeURIComponent(`/onboarding/${requested ?? "welcome"}`)}`}>Log in</Link></OnboardingFrame>;
  if (auth.status === "authenticated" && state?.completed) return <OnboardingFrame title="Redirecting to training"><p role="status">Your setup is complete. Taking you back to Blundr.</p></OnboardingFrame>;

  return (
    <OnboardingFrame title={titleForStep(activeStep)} subtitle={subtitleForStep(activeStep)} progress={`${stepIndex + 1} of ${ONBOARDING_V11_STEPS.length}`}>
      {content}
      {error ? <p role="alert" className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">{error}</p> : null}
      <div className="mt-8 flex gap-3">
        {stepIndex > 0 && activeStep !== "ready" ? <button className="min-h-11 rounded-lg border border-stone-300 px-4 font-semibold text-stone-800" disabled={busy} onClick={() => router.push(`/onboarding/${ONBOARDING_V11_STEPS[stepIndex - 1]}`)}>Back</button> : null}
        <button className="min-h-11 flex-1 rounded-lg bg-green-800 px-4 font-bold text-white disabled:opacity-50" disabled={busy || disabled(activeStep, selected, state)} onClick={() => activeStep === "ready" ? void complete() : void save(activeStep, selected)}>
          {busy ? "Saving..." : actionFor(activeStep)}
        </button>
      </div>
    </OnboardingFrame>
  );
}

function valueForStep(state: OnboardingV11State, step: OnboardingV11Step): unknown {
  if (step === "welcome") return state.ageConfirmed ? true : undefined;
  if (step === "level") return state.step === "level" ? undefined : state.ratingBandId;
  if (step === "priorities") return state.priorities;
  if (step === "starter-pack") return state.starterPackId;
  if (step === "training-mode") return state.trainingMode ?? "assisted";
  if (step === "pace") return state.pace ?? "standard";
  return undefined;
}

function disabled(step: OnboardingV11Step, value: unknown, state: OnboardingV11State | null) {
  if (step === "welcome") return !state?.ageConfirmed && value !== true;
  if (step === "level" || step === "starter-pack" || step === "training-mode" || step === "pace") return !value;
  if (step === "priorities") return !Array.isArray(value ?? state?.priorities) || (value as unknown[]).length === 0;
  return false;
}

function actionFor(step: OnboardingV11Step) {
  return step === "welcome" ? "Continue" : step === "ready" ? "Start training" : "Continue";
}

function OnboardingFrame({ title, subtitle, progress, children }: { title: string; subtitle?: string; progress?: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#f6f3eb] px-4 py-8 text-stone-950 sm:px-6">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg bg-[#091a13] p-8 text-white shadow-2xl sm:p-10">
          <div className="text-sm font-black text-green-300">Blundr</div>
          {progress ? <p className="mt-8 text-xs font-black uppercase tracking-[0.16em] text-amber-300">{progress}</p> : null}
          <h1 className="mt-4 text-4xl font-black leading-none tracking-tight sm:text-6xl">{title}</h1>
          {subtitle ? <p className="mt-5 max-w-xl text-base leading-7 text-white/70">{subtitle}</p> : null}
        </div>
        <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-xl sm:p-8">
          {children}
        </div>
      </section>
    </main>
  );
}

function ExplainerCards({ items }: { items: Array<readonly [string, string]> }) {
  return <div className="grid gap-3">{items.map(([title, body]) => <InfoCard key={title} title={title} body={body} />)}</div>;
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return <div className="rounded-2xl border border-stone-200 bg-[#fbfaf6] p-4"><h2 className="font-black text-stone-950">{title}</h2><p className="mt-1 text-sm leading-6 text-stone-600">{body}</p></div>;
}

function ChoiceList({ value, onChange, choices, single = false }: { value: unknown; onChange: (value: unknown) => void; choices: Array<readonly [string, string, string]>; single?: boolean }) {
  const values = Array.isArray(value) ? value : [];
  return <div className="grid gap-3">{choices.map(([id, label, description]) => { const selected = single ? value === id : values.includes(id); return <button type="button" key={id} aria-pressed={selected} onClick={() => onChange(single ? id : selected ? values.filter((item) => item !== id) : [...values, id])} className={`min-h-11 rounded-2xl border p-4 text-left transition ${selected ? "border-green-800 bg-green-50 shadow-sm" : "border-stone-200 bg-white hover:border-green-200"}`}><span className="block font-black text-stone-950">{label}</span>{description ? <span className="mt-1 block text-sm leading-6 text-stone-600">{description}</span> : null}</button>; })}</div>;
}

function PlanSummary({ state }: { state: OnboardingV11State }) {
  const pack = state.starterPackId ? getAllStarterPacks().find((item) => item.id === state.starterPackId) : null;
  const pace = state.pace ? getOnboardingV11PaceGoals(state.pace) : null;
  return (
    <div className="space-y-4">
      <dl className="grid gap-3 text-sm">
        <SummaryRow label="Experience" value={state.ratingBandId ?? "Not set"} />
        <SummaryRow label="Starter repertoire" value={pack ? `${pack.whiteOpeningName} + ${pack.blackOpeningName}` : "Not set"} />
        <SummaryRow label="Training style" value={state.trainingMode === "plain" ? "Plain recall" : "Assisted learning"} />
        <SummaryRow label="Daily target" value={pace ? `${pace.tempo} Tempo · ${pace.battery} Battery · ${pace.daily} Daily Blundr` : "Not set"} />
      </dl>
      <p className="rounded-2xl bg-green-50 p-4 text-sm leading-6 text-green-950">
        Your first session starts in Train. After that, missed moves can return through Review.
      </p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-stone-200 p-4"><dt className="text-xs font-black uppercase tracking-[0.14em] text-stone-500">{label}</dt><dd className="mt-1 font-black text-stone-950">{value}</dd></div>;
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authenticatedApiFetch, AuthenticatedApiError } from "@/lib/blundr/api/authenticatedApiClient";
import { getAllStarterPacks } from "@/lib/blundr/onboarding/starterPacks";
import { useOnboardingAuthSession } from "@/lib/blundr/onboarding/useOnboardingAuthSession";
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
  ["800-1200", "Improver", "Learning the fundamentals", "800–1200"],
  ["1200-1600", "Club", "Know a few openings", "1200–1600"],
  ["1600-2000", "Advanced", "Solid opening knowledge", "1600–2000"],
  ["2000-plus", "Expert", "Sharp and theory-deep", "2000+"],
] as const;

const PRIORITIES: Array<[OnboardingPriority, string]> = [
  ["remember_openings", "Stop forgetting openings"],
  ["build_repertoire", "Build a complete repertoire"],
  ["post_opening_plans", "Know what to do after the opening"],
  ["review_mistakes", "Review mistakes every day"],
  ["prepare_for_games", "Prepare for games"],
];

const PACES: Array<[OnboardingV11Pace, string]> = [
  ["light", "Light"],
  ["standard", "Standard"],
  ["focused", "Focused"],
];

function apiData<T>(value: T): T extends { data: infer Data } ? Data : never {
  return (value as { data: unknown }).data as never;
}

function titleForStep(step: OnboardingV11Step): string {
  return {
    welcome: "Build a repertoire you actually remember",
    level: "What level should Tempo train you at?",
    priorities: "What should Blundr help with?",
    "training-loop": "Your daily training loop",
    pace: "Choose your daily pace",
    "starter-pack": "Choose your starter pack",
    "training-mode": "Train with help, then from memory",
    plan: "Your Blundr plan is ready",
    ready: "Time to train. No excuses!",
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
      setError(cause instanceof AuthenticatedApiError && cause.status === 401 ? "Your session has ended. Sign in to continue setup." : "We couldn’t load your saved setup. Try again.");
    }
  };

  useEffect(() => {
    if (auth.status === "authenticated") void load();
  }, [auth.status]);

  const save = async (step: OnboardingV11Step, value?: unknown) => {
    setBusy(true);
    setError(null);
    try {
      const response = await authenticatedApiFetch<{ ok: true; data: OnboardingV11State }>("/api/blundr/onboarding/v11", {
        method: "PATCH",
        body: JSON.stringify({ step, value }),
      });
      const next = apiData(response);
      setState(next);
      setSelected(valueForStep(next, next.step));
      router.replace(`/onboarding/${next.step}`);
    } catch (cause) {
      setError(cause instanceof AuthenticatedApiError ? "That choice could not be saved. Try again." : "That choice could not be saved. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const complete = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await authenticatedApiFetch<{ ok: true; data: OnboardingV11State }>("/api/blundr/onboarding/v11/complete", { method: "POST" });
      setState(apiData(response));
      router.replace("/onboarding/ready");
    } catch {
      setError("We couldn’t verify your starter repertoire. Your choices are saved; try again.");
    } finally {
      setBusy(false);
    }
  };

  const startTempo = () => {
    const pack = state?.starterPackId ? getAllStarterPacks().find((item) => item.id === state.starterPackId) : null;
    router.push(`/train${pack ? `?openingId=${encodeURIComponent(pack.whiteOpeningId)}` : ""}`);
  };

  const content = useMemo(() => {
    if (!state) return null;
    if (activeStep === "welcome") return <p>Guided reps, memory recall, real continuations, and daily review — all in one habit.</p>;
    if (activeStep === "level") return <ChoiceList value={selected} onChange={setSelected} choices={LEVELS.map(([id, label, description, range]) => [id, `${label} · ${range}`, description])} single />;
    if (activeStep === "priorities") return <ChoiceList value={selected ?? state.priorities} onChange={setSelected} choices={PRIORITIES.map(([id, label]) => [id, label, ""])}/>;
    if (activeStep === "training-loop") return <div className="space-y-3 text-sm"><InfoCard title="Tempo" body="Train your opening rhythm."/><InfoCard title="Battery" body="Play after the book ends."/><InfoCard title="Daily Blundr" body="Review what needs to stick."/><p>Close all three rings every day to keep your full streak alive.</p></div>;
    if (activeStep === "pace") return <ChoiceList value={selected ?? state.pace ?? "standard"} onChange={setSelected} choices={PACES.map(([id, label]) => { const goals = getOnboardingV11PaceGoals(id); return [id, label, `${goals.tempo} Tempo reps · ${goals.battery} Battery · ${goals.daily} Daily Blundr`]; })} single />;
    if (activeStep === "starter-pack") return <ChoiceList value={selected} onChange={setSelected} choices={getAllStarterPacks().map((pack) => [pack.id, pack.displayName, `${pack.whiteOpeningName} as White · ${pack.blackOpeningName} as Black`])} single />;
    if (activeStep === "training-mode") return <ChoiceList value={selected ?? state.trainingMode ?? "assisted"} onChange={setSelected} choices={[["assisted", "Assisted", "Move cues and opening purpose before play."], ["plain", "Plain", "Recall each move from memory before commitment."]]} single />;
    if (activeStep === "plan") return <PlanSummary state={state}/>;
    return <p>Tempo is ready. Your first opening rep is waiting.</p>;
  }, [activeStep, selected, state]);

  if (auth.status === "loading") return <OnboardingFrame title="Checking your session"><p role="status">Loading your account.</p></OnboardingFrame>;
  if (auth.status === "signed_out") return <OnboardingFrame title="Sign in to continue"><p>Your setup belongs to your Blundr account.</p><Link className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-green-800 px-4 font-bold text-white" href={`/login?next=${encodeURIComponent(`/onboarding/${requested ?? "welcome"}`)}`}>Log in</Link></OnboardingFrame>;
  return <OnboardingFrame title={titleForStep(activeStep)} progress={activeStep === "welcome" ? undefined : `${stepIndex + 1} of ${ONBOARDING_V11_STEPS.length}`}>
    {content}
    {error ? <p role="alert" className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
    <div className="mt-8 flex gap-3">
      {stepIndex > 0 && activeStep !== "ready" ? <button className="min-h-11 rounded-xl border px-4 font-semibold" disabled={busy} onClick={() => router.push(`/onboarding/${ONBOARDING_V11_STEPS[stepIndex - 1]}`)}>Back</button> : null}
      <button className="min-h-11 flex-1 rounded-xl bg-green-800 px-4 font-bold text-white disabled:opacity-50" disabled={busy || disabled(activeStep, selected, state)} onClick={() => activeStep === "plan" ? void complete() : activeStep === "ready" ? startTempo() : void save(activeStep, selected)}>{busy ? "Saving…" : actionFor(activeStep)}</button>
    </div>
  </OnboardingFrame>;
}

function valueForStep(state: OnboardingV11State, step: OnboardingV11Step): unknown {
  if (step === "level") return state.ratingBandId;
  if (step === "priorities") return state.priorities;
  if (step === "pace") return state.pace ?? "standard";
  if (step === "starter-pack") return state.starterPackId;
  if (step === "training-mode") return state.trainingMode ?? "assisted";
  return undefined;
}
function disabled(step: OnboardingV11Step, value: unknown, state: OnboardingV11State | null) { return (step === "level" || step === "starter-pack" || step === "training-mode" || step === "pace") && !value || step === "priorities" && (!Array.isArray(value ?? state?.priorities) || (value as unknown[]).length === 0); }
function actionFor(step: OnboardingV11Step) { return step === "welcome" ? "Start" : step === "training-loop" ? "Set my goals" : step === "plan" ? "Confirm my plan" : step === "ready" ? "Start first Tempo rep" : "Continue"; }
function OnboardingFrame({ title, progress, children }: { title: string; progress?: string; children: ReactNode }) { return <main className="min-h-screen bg-stone-50 px-4 py-8 text-stone-950 sm:px-6"><section className="mx-auto max-w-[32.5rem] rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"><div className="text-sm font-black text-green-800">Blundr</div>{progress ? <p className="mt-4 text-xs font-bold tracking-wide text-stone-500">{progress}</p> : null}<h1 className="mt-4 text-3xl font-black tracking-tight">{title}</h1><div className="mt-5 text-base leading-7 text-stone-700">{children}</div></section></main>; }
function InfoCard({ title, body }: { title: string; body: string }) { return <div className="rounded-2xl border border-stone-200 p-4"><h2 className="font-bold">{title}</h2><p>{body}</p></div>; }
function ChoiceList({ value, onChange, choices, single = false }: { value: unknown; onChange: (value: unknown) => void; choices: Array<readonly [string, string, string]>; single?: boolean }) { const values = Array.isArray(value) ? value : []; return <div className="space-y-3">{choices.map(([id, label, description]) => { const selected = single ? value === id : values.includes(id); return <button type="button" key={id} aria-pressed={selected} onClick={() => onChange(single ? id : selected ? values.filter((item) => item !== id) : [...values, id])} className={`min-h-11 w-full rounded-2xl border p-4 text-left ${selected ? "border-green-800 bg-green-50" : "border-stone-200 bg-white"}`}><span className="block font-bold">{label}</span>{description ? <span className="mt-1 block text-sm text-stone-600">{description}</span> : null}</button>; })}</div>; }
function PlanSummary({ state }: { state: OnboardingV11State }) { const pack = state.starterPackId ? getAllStarterPacks().find((item) => item.id === state.starterPackId) : null; return <dl className="space-y-3 rounded-2xl border border-stone-200 p-4 text-sm"><div><dt className="font-bold">Level</dt><dd>{state.ratingBandId ?? "Not set"}</dd></div><div><dt className="font-bold">Priorities</dt><dd>{state.priorities.join(", ") || "Not set"}</dd></div><div><dt className="font-bold">Daily pace</dt><dd>{state.pace ?? "Not set"}</dd></div><div><dt className="font-bold">Starter pack</dt><dd>{pack?.displayName ?? "Not set"}</dd></div><div><dt className="font-bold">Training mode</dt><dd>{state.trainingMode ?? "Not set"}</dd></div></dl>; }

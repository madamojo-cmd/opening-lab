"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { BLUNDR_ANALYTICS_EVENTS } from "@/lib/blundr/analytics/blundrAnalyticsEvents";
import { trackBlundrAnalyticsEvent } from "@/lib/blundr/analytics/blundrAnalyticsService";
import { createDefaultDailyRetentionProgress, createDefaultRewardHistory, createDefaultStreakRecord } from "@/lib/blundr/accounts/accountDefaults";
import type { DailyRetentionProgress, StreakRecord, UserRepertoire, UserRewardHistory, UserTrainingProfile } from "@/lib/blundr/accounts/accountTypes";
import { getLocalAccountCurrentUserId, getLocalDailyRetentionProgress, getLocalRewardHistory, getLocalStreakRecord, getLocalTrainingProfile, getLocalUserRepertoire, setLocalAccountCurrentUserId, upsertLocalDailyRetentionProgress, upsertLocalRewardHistory, upsertLocalStreakRecord, upsertLocalTrainingProfile, upsertLocalUserRepertoire } from "@/lib/blundr/accounts/localAccountStorage";
import { AccountSaveProgressScreen } from "@/components/onboarding/AccountSaveProgressScreen";
import { DailyGoalSelector } from "@/components/onboarding/DailyGoalSelector";
import { EloBandSelector } from "@/components/onboarding/EloBandSelector";
import { ModeComparisonCard } from "@/components/onboarding/ModeComparisonCard";
import { OnboardingButtonRow } from "@/components/onboarding/OnboardingButtonRow";
import { OnboardingShell } from "@/components/onboarding/OnboardingShell";
import { OnboardingStartTrainingScreen } from "@/components/onboarding/OnboardingStartTrainingScreen";
import { RealGameDataCard } from "@/components/onboarding/RealGameDataCard";
import { StageComparisonCard } from "@/components/onboarding/StageComparisonCard";
import { StarterPackSelector } from "@/components/onboarding/StarterPackSelector";
import { WelcomeOnboardingScreen } from "@/components/onboarding/WelcomeOnboardingScreen";
import { ONBOARDING_COPY } from "@/lib/blundr/onboarding/onboardingCopy";
import { getOnboardingAuthSession, isOnboardingAuthAvailable, signInForOnboarding, signUpForOnboarding } from "@/lib/blundr/onboarding/onboardingAuth";
import { getDefaultDailyGoalPreset, getDailyGoalPresetById } from "@/lib/blundr/onboarding/dailyGoalPresets";
import { getFirstStarterPackTrainingTarget, getPostOnboardingDestination } from "@/lib/blundr/onboarding/onboardingRouting";
import { advanceOnboardingStep, buildRepertoireFromOnboarding, buildTrainingProfileFromOnboarding, createDefaultOnboardingState, getOnboardingStateStepCount, goBackOnboardingStep, normalizeOnboardingState, readLocalOnboardingState, selectDailyGoalPreset, selectOnboardingAccountChoice, selectOnboardingRatingBand, selectPreferredTrainingMode, selectStarterPack, writeLocalOnboardingState } from "@/lib/blundr/onboarding/onboardingState";
import { getRatingBandById, getRatingBandLabel, getRatingBandTrainingDescription, getDefaultRatingBand } from "@/lib/blundr/onboarding/ratingBand";
import { getStarterPackById, getStarterPackOpeningIds, getDefaultStarterPack } from "@/lib/blundr/onboarding/starterPacks";
import { getOnboardingStepIndex } from "@/lib/blundr/onboarding/onboardingSteps";
import type { BlundrOnboardingState } from "@/lib/blundr/onboarding/onboardingTypes";

type BootstrapSnapshot = {
  userId: string;
  profile: UserTrainingProfile;
  repertoire: UserRepertoire;
  streakRecord: StreakRecord;
  rewardHistory: UserRewardHistory;
  dailyRetentionProgress: DailyRetentionProgress;
};

type CompletionSnapshot = {
  userId: string;
  email: string | null;
  profile: UserTrainingProfile;
  repertoire: UserRepertoire;
  destination: string;
};

const DEFAULT_TEST_EMAIL = "adamconnor00@gmail.com";
const LOCAL_DEMO_USER_ID = "local-demo-user";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

function getErrorMessage(error: unknown, fallback = "Something went wrong. Try again or continue in local demo."): string {
  const message = normalizeText(typeof error === "string" ? error : (error as { message?: unknown })?.message);
  return message || fallback;
}

function getRouteErrorMessage(body: unknown, fallback: string): string {
  return normalizeText((body as { error?: { message?: unknown } } | null)?.error?.message) || fallback;
}

function isBootstrapError(value: BootstrapSnapshot | { ok: false; message: string }): value is { ok: false; message: string } {
  return Boolean(value && typeof value === "object" && "ok" in value && (value as { ok?: unknown }).ok === false);
}

function isCompletionError(value: CompletionSnapshot | { ok: false; message: string }): value is { ok: false; message: string } {
  return Boolean(value && typeof value === "object" && "ok" in value && (value as { ok?: unknown }).ok === false);
}

function buildFallbackBootstrapSnapshot(state: BlundrOnboardingState, userId: string, onboardingCompleted = false): BootstrapSnapshot {
  const now = new Date().toISOString();
  const normalizedUserId = normalizeText(userId) || LOCAL_DEMO_USER_ID;
  const normalizedState = normalizeOnboardingState({
    ...state,
    onboardingCompleted,
    authenticatedUserId: onboardingCompleted ? normalizedUserId : state.authenticatedUserId,
    updatedAt: now,
  });
  const profile = buildTrainingProfileFromOnboarding(normalizedState, normalizedUserId);
  const repertoire = buildRepertoireFromOnboarding(normalizedState, normalizedUserId);
  const localDate = now.slice(0, 10);
  return {
    userId: normalizedUserId,
    profile,
    repertoire,
    streakRecord: createDefaultStreakRecord(normalizedUserId, now),
    rewardHistory: createDefaultRewardHistory(normalizedUserId, now),
    dailyRetentionProgress: createDefaultDailyRetentionProgress(normalizedUserId, localDate, {
      dailyTempoGoal: profile.dailyTempoGoal,
      dailyBatteryGoal: profile.dailyBatteryGoal,
      dailyBlundrGoal: profile.dailyBlundrGoal,
    }, now),
  };
}

function applyBootstrapSnapshotToLocalStorage(snapshot: BootstrapSnapshot): void {
  const userId = setLocalAccountCurrentUserId(snapshot.userId);
  upsertLocalTrainingProfile({ ...snapshot.profile, userId });
  upsertLocalUserRepertoire({ ...snapshot.repertoire, userId });
  upsertLocalStreakRecord({ ...snapshot.streakRecord, userId });
  upsertLocalRewardHistory({ ...snapshot.rewardHistory, userId });
  upsertLocalDailyRetentionProgress({ ...snapshot.dailyRetentionProgress, userId });
}

function applyCompletionSnapshotToLocalStorage(snapshot: CompletionSnapshot): void {
  const userId = setLocalAccountCurrentUserId(snapshot.userId);
  upsertLocalTrainingProfile({ ...snapshot.profile, userId });
  upsertLocalUserRepertoire({ ...snapshot.repertoire, userId });

  if (!getLocalStreakRecord(userId)) {
    upsertLocalStreakRecord(createDefaultStreakRecord(userId, snapshot.profile.updatedAt));
  }
  if (!getLocalRewardHistory(userId)) {
    upsertLocalRewardHistory(createDefaultRewardHistory(userId, snapshot.profile.updatedAt));
  }
  const localDate = snapshot.profile.updatedAt.slice(0, 10) || new Date().toISOString().slice(0, 10);
  if (!getLocalDailyRetentionProgress(userId, localDate)) {
    upsertLocalDailyRetentionProgress(createDefaultDailyRetentionProgress(userId, localDate, {
      dailyTempoGoal: snapshot.profile.dailyTempoGoal,
      dailyBatteryGoal: snapshot.profile.dailyBatteryGoal,
      dailyBlundrGoal: snapshot.profile.dailyBlundrGoal,
    }, snapshot.profile.updatedAt));
  }
}

async function readJsonBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchBootstrapSnapshot(accessToken?: string | null): Promise<BootstrapSnapshot | { ok: false; message: string }> {
  try {
    const response = await fetch("/api/blundr/account/bootstrap", {
      method: "POST",
      headers: accessToken ? { authorization: `Bearer ${accessToken}` } : undefined,
      cache: "no-store",
    });
    const body = await readJsonBody(response);
    if (!response.ok || !body || typeof body !== "object" || Array.isArray(body) || !(body as { ok?: unknown }).ok) {
      return { ok: false, message: getRouteErrorMessage(body, "Could not bootstrap your account.") };
    }
    const data = (body as { data?: unknown }).data;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, message: "Could not bootstrap your account." };
    }
    return {
      userId: normalizeText((data as { user?: { userId?: unknown } }).user?.userId) || LOCAL_DEMO_USER_ID,
      profile: (data as { profile: UserTrainingProfile }).profile,
      repertoire: (data as { repertoire: UserRepertoire }).repertoire,
      streakRecord: (data as { streakRecord: StreakRecord }).streakRecord,
      rewardHistory: (data as { rewardHistory: UserRewardHistory }).rewardHistory,
      dailyRetentionProgress: (data as { dailyRetentionProgress: DailyRetentionProgress }).dailyRetentionProgress,
    };
  } catch {
    return { ok: false, message: "Could not bootstrap your account." };
  }
}

async function fetchCompletionSnapshot(state: ReturnType<typeof normalizeOnboardingState>, accessToken?: string | null): Promise<CompletionSnapshot | { ok: false; message: string }> {
  try {
    const response = await fetch("/api/blundr/onboarding/complete", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
      cache: "no-store",
      body: JSON.stringify({ state }),
    });
    const body = await readJsonBody(response);
    if (!response.ok || !body || typeof body !== "object" || Array.isArray(body) || !(body as { ok?: unknown }).ok) {
      return { ok: false, message: getRouteErrorMessage(body, "Could not complete onboarding.") };
    }
    const data = (body as { data?: unknown }).data;
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { ok: false, message: "Could not complete onboarding." };
    }
    return {
      userId: normalizeText((data as { userId?: unknown }).userId) || state.authenticatedUserId || LOCAL_DEMO_USER_ID,
      email: normalizeText((data as { email?: unknown }).email) || null,
      profile: (data as { profile: UserTrainingProfile }).profile,
      repertoire: (data as { repertoire: UserRepertoire }).repertoire,
      destination: normalizeText((data as { destination?: unknown }).destination) || "/",
    };
  } catch {
    return { ok: false, message: "Could not complete onboarding." };
  }
}

function buildFinalSummary(state: BlundrOnboardingState): ReactNode {
  const ratingBand = getRatingBandById(state.ratingBandId) ?? getDefaultRatingBand();
  const starterPack = getStarterPackById(state.selectedStarterPackId) ?? getDefaultStarterPack();
  const dailyGoalPreset = getDailyGoalPresetById(state.dailyGoalPresetId) ?? getDefaultDailyGoalPreset();
  const starterPackOpenings = getStarterPackOpeningIds(starterPack.id);
  const openingTarget = getFirstStarterPackTrainingTarget(
    buildRepertoireFromOnboarding(state, state.authenticatedUserId || LOCAL_DEMO_USER_ID),
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Starter pack</div>
        <div className="mt-2 text-lg font-black text-stone-950">{starterPack.displayName}</div>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          {starterPack.whiteOpeningName} as White and {starterPack.blackOpeningName} as Black.
        </p>
        <div className="mt-3 text-xs font-semibold text-stone-500">
          First route target: <span className="font-black text-stone-700">{openingTarget ?? starterPackOpenings.whiteOpeningId}</span>
        </div>
      </div>
      <div className="rounded-[1.5rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Training profile</div>
        <div className="mt-2 text-sm font-black text-stone-950">{getRatingBandLabel(ratingBand.id)}</div>
        <p className="mt-1 text-sm leading-6 text-stone-600">{getRatingBandTrainingDescription(ratingBand.id)}</p>
        <p className="mt-3 text-sm leading-6 text-stone-600">
          {dailyGoalPreset.label} goals: {state.dailyTempoGoal} Tempo, {state.dailyBatteryGoal} Battery, {state.dailyBlundrGoal} Daily Blundr.
        </p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const startedRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [state, setState] = useState<ReturnType<typeof normalizeOnboardingState> | null>(null);
  const [authEmail, setAuthEmail] = useState(DEFAULT_TEST_EMAIL);
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [completionBusy, setCompletionBusy] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  useEffect(() => {
    const savedState = readLocalOnboardingState() ?? createDefaultOnboardingState();
    setState(savedState);
    setAuthEmail(savedState.authenticatedEmail ?? DEFAULT_TEST_EMAIL);
    setAuthPassword("");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !state) return;
    writeLocalOnboardingState(state);
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated || !state) return;
    if (startedRef.current) return;
    startedRef.current = true;
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.ONBOARDING_STARTED, {
      stepId: state.stepId,
      accountChoice: state.accountChoice,
    });
  }, [hydrated, state]);

  useEffect(() => {
    if (!hydrated || !state) return;
    const currentUserId = getLocalAccountCurrentUserId();
    const profile = getLocalTrainingProfile(currentUserId);
    const repertoire = getLocalUserRepertoire(currentUserId);
    if (profile?.onboardingCompleted) {
      router.replace(getPostOnboardingDestination(profile, repertoire));
      return;
    }
    if (!state.onboardingCompleted) return;

    const finalState = normalizeOnboardingState({ ...state, onboardingCompleted: true });
    const completedProfile = buildTrainingProfileFromOnboarding(finalState, currentUserId);
    const completedRepertoire = buildRepertoireFromOnboarding(finalState, currentUserId);
    applyCompletionSnapshotToLocalStorage({
      userId: currentUserId,
      email: null,
      profile: completedProfile,
      repertoire: completedRepertoire,
      destination: getPostOnboardingDestination(completedProfile, completedRepertoire),
    });
    router.replace(getPostOnboardingDestination(completedProfile, completedRepertoire));
  }, [hydrated, router, state]);

  const stepCount = getOnboardingStateStepCount();
  const stepIndex = state ? getOnboardingStepIndex(state.stepId) + 1 : 1;
  const currentState = state ?? createDefaultOnboardingState();
  const selectedRatingBand = getRatingBandById(currentState.ratingBandId) ?? getDefaultRatingBand();
  const selectedStarterPack = getStarterPackById(currentState.selectedStarterPackId) ?? getDefaultStarterPack();
  const authAvailable = isOnboardingAuthAvailable();

  const updateState = (updater: (value: ReturnType<typeof normalizeOnboardingState>) => ReturnType<typeof normalizeOnboardingState>) => {
    setState((current) => {
      if (!current) return current;
      const next = updater(current);
      return normalizeOnboardingState(next);
    });
  };

  const goBack = () => {
    setAuthError(null);
    setAuthMessage(null);
    setCompletionError(null);
    updateState(goBackOnboardingStep);
  };

  const goNext = () => {
    setAuthError(null);
    setAuthMessage(null);
    setCompletionError(null);
    updateState(advanceOnboardingStep);
  };

  const handleSelectAccountChoice = (choice: "account" | "local_demo") => {
    setAuthError(null);
    setAuthMessage(null);
    setNeedsEmailConfirmation(false);
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.ACCOUNT_SAVE_PROGRESS_SELECTED, { choice });
    updateState((current) => {
      const next = selectOnboardingAccountChoice(current, choice);
      return choice === "local_demo"
        ? normalizeOnboardingState({ ...next, authMode: undefined, authenticatedUserId: undefined, authenticatedEmail: undefined })
        : normalizeOnboardingState({ ...next, authMode: next.authMode ?? "sign_in" });
    });
  };

  const handleSelectAuthMode = (mode: "sign_in" | "sign_up") => {
    setAuthError(null);
    setAuthMessage(null);
    setNeedsEmailConfirmation(false);
    updateState((current) => normalizeOnboardingState({ ...current, accountChoice: "account", authMode: mode, authenticatedEmail: authEmail.trim() || current.authenticatedEmail || DEFAULT_TEST_EMAIL }));
  };

  const handleEmailChange = (value: string) => {
    setAuthEmail(value);
    updateState((current) => normalizeOnboardingState({ ...current, authenticatedEmail: value }));
  };

  const handlePasswordChange = (value: string) => {
    setAuthPassword(value);
  };

  const handleSelectRatingBand = (bandId: string, ratingSource: "manual" | "default" = "manual") => {
    setAuthError(null);
    setAuthMessage(null);
    setCompletionError(null);
    const source = ratingSource === "default" ? "default" : "manual";
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.ELO_SELECTED, { ratingBandId: bandId, ratingSource: source });
    updateState((current) => selectOnboardingRatingBand(current, bandId, source));
  };

  const handleSelectStarterPack = (starterPackId: string) => {
    setCompletionError(null);
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.STARTER_PACK_SELECTED, { starterPackId });
    updateState((current) => selectStarterPack(current, starterPackId));
  };

  const handleSelectDailyGoals = (presetId: string) => {
    setCompletionError(null);
    trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.DAILY_GOALS_SELECTED, { presetId });
    updateState((current) => selectDailyGoalPreset(current, presetId));
  };

  const handleSelectTrainingMode = (mode: "assisted" | "plain") => {
    setCompletionError(null);
    updateState((current) => selectPreferredTrainingMode(current, mode));
  };

  const saveBootstrapSnapshot = (snapshot: BootstrapSnapshot) => {
    applyBootstrapSnapshotToLocalStorage(snapshot);
    setAuthMessage(snapshot.profile.onboardingCompleted ? "Your account is ready." : "Progress saved. Continue onboarding.");
  };

  const continueInLocalDemo = async () => {
    if (!state) return;
    setAuthBusy(true);
    setAuthError(null);
    setAuthMessage(null);
    setNeedsEmailConfirmation(false);
    try {
      const response = await fetchBootstrapSnapshot(null);
      if (isBootstrapError(response)) {
        const fallback = buildFallbackBootstrapSnapshot(state, LOCAL_DEMO_USER_ID, false);
        applyBootstrapSnapshotToLocalStorage(fallback);
        saveBootstrapSnapshot(fallback);
      } else if (response.userId !== LOCAL_DEMO_USER_ID) {
        const fallback = buildFallbackBootstrapSnapshot(state, LOCAL_DEMO_USER_ID, false);
        applyBootstrapSnapshotToLocalStorage(fallback);
        saveBootstrapSnapshot(fallback);
      } else {
        saveBootstrapSnapshot(response);
      }
      setAuthPassword("");
      updateState((current) => normalizeOnboardingState({ ...current, accountChoice: "local_demo", authMode: undefined, authenticatedUserId: LOCAL_DEMO_USER_ID, authenticatedEmail: undefined }));
      updateState(advanceOnboardingStep);
    } finally {
      setAuthBusy(false);
    }
  };

  const submitOnboardingAuth = async () => {
    if (!state) return;
    setAuthBusy(true);
    setCompletionError(null);
    setAuthError(null);
    setAuthMessage(null);
    setNeedsEmailConfirmation(false);

    try {
      const normalizedEmail = authEmail.trim().toLowerCase();
      const normalizedPassword = authPassword.trim();
      const result = state.authMode === "sign_up"
        ? await signUpForOnboarding(normalizedEmail, normalizedPassword)
        : await signInForOnboarding(normalizedEmail, normalizedPassword);

      if (!result.ok) {
        setAuthError(result.message);
        return;
      }

      setAuthMessage(result.needsEmailConfirmation ? result.message ?? "Check your email to confirm your account, then sign in again." : "Signed in. Saving your progress now.");
      setNeedsEmailConfirmation(Boolean(result.needsEmailConfirmation));
      if (result.needsEmailConfirmation) {
        updateState((current) => normalizeOnboardingState({ ...current, accountChoice: "account", authMode: "sign_up", authenticatedEmail: normalizedEmail }));
        setAuthPassword("");
        return;
      }

      const session = await getOnboardingAuthSession();
      if (!session) {
        setAuthError("Authentication succeeded, but the session is unavailable.");
        return;
      }

      const bootstrap = await fetchBootstrapSnapshot(session.accessToken);
      if (isBootstrapError(bootstrap)) {
        setAuthError(bootstrap.message);
        return;
      }

      applyBootstrapSnapshotToLocalStorage(bootstrap);
      updateState((current) => normalizeOnboardingState({
        ...current,
        accountChoice: "account",
        authMode: current.authMode ?? "sign_in",
        authenticatedUserId: session.userId,
        authenticatedEmail: session.email || normalizedEmail,
      }));
      setAuthPassword("");
      updateState(advanceOnboardingStep);
    } catch (error) {
      setAuthError(getErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  };

  const completeOnboarding = async () => {
    if (!state) return;
    setCompletionBusy(true);
    setCompletionError(null);
    setAuthError(null);
    setAuthMessage(null);
    try {
      const finalState = normalizeOnboardingState({ ...state, onboardingCompleted: true });
      const session = state.accountChoice === "account" ? await getOnboardingAuthSession() : null;
      const result = await fetchCompletionSnapshot(finalState, session?.accessToken ?? null);

      if (isCompletionError(result)) {
        if (state.accountChoice !== "local_demo") {
          setCompletionError(result.message);
          return;
        }
        const fallback = buildFallbackBootstrapSnapshot(finalState, LOCAL_DEMO_USER_ID, true);
        const completionSnapshot: CompletionSnapshot = {
          userId: fallback.userId,
          email: null,
          profile: { ...fallback.profile, onboardingCompleted: true },
          repertoire: fallback.repertoire,
          destination: getPostOnboardingDestination(fallback.profile, fallback.repertoire),
        };
        applyCompletionSnapshotToLocalStorage(completionSnapshot);
        trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
          userId: completionSnapshot.userId,
          accountChoice: state.accountChoice,
          starterPackId: completionSnapshot.profile.selectedStarterPackId,
        });
        updateState((current) => normalizeOnboardingState({ ...current, onboardingCompleted: true }));
        router.replace(completionSnapshot.destination);
        return;
      }

      if (state.accountChoice === "local_demo" && result.userId !== LOCAL_DEMO_USER_ID) {
        const fallback = buildFallbackBootstrapSnapshot(finalState, LOCAL_DEMO_USER_ID, true);
        const completionSnapshot: CompletionSnapshot = {
          userId: fallback.userId,
          email: null,
          profile: { ...fallback.profile, onboardingCompleted: true },
          repertoire: fallback.repertoire,
          destination: getPostOnboardingDestination(fallback.profile, fallback.repertoire),
        };
        applyCompletionSnapshotToLocalStorage(completionSnapshot);
        trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
          userId: completionSnapshot.userId,
          accountChoice: state.accountChoice,
          starterPackId: completionSnapshot.profile.selectedStarterPackId,
        });
        updateState((current) => normalizeOnboardingState({ ...current, onboardingCompleted: true }));
        router.replace(completionSnapshot.destination);
        return;
      }

      applyCompletionSnapshotToLocalStorage(result);
      trackBlundrAnalyticsEvent(BLUNDR_ANALYTICS_EVENTS.ONBOARDING_COMPLETED, {
        userId: result.userId,
        accountChoice: state.accountChoice,
        starterPackId: result.profile.selectedStarterPackId,
      });
      updateState((current) => normalizeOnboardingState({
        ...current,
        onboardingCompleted: true,
        authenticatedUserId: result.userId,
        authenticatedEmail: result.email ?? current.authenticatedEmail,
      }));
      router.replace(result.destination);
    } catch (error) {
      setCompletionError(getErrorMessage(error, "Could not complete onboarding."));
    } finally {
      setCompletionBusy(false);
    }
  };

  if (!hydrated || !state) {
    return (
      <main className="min-h-screen bg-[#f7f7f4] text-stone-950">
        <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
          <div className="w-full rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-700 text-white shadow-sm">
                <Loader2 className="animate-spin" size={20} />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Blundr onboarding</div>
                <h1 className="text-2xl font-black tracking-tight">Loading your setup</h1>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-stone-600">
              Restoring your local onboarding state and account profile.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const sharedStepProps = {
    stepIndex,
    stepCount,
  };

  if (state.stepId === "welcome") {
    return (
      <WelcomeOnboardingScreen
        {...sharedStepProps}
        onNext={goNext}
      />
    );
  }

  if (state.stepId === "account") {
    return (
      <AccountSaveProgressScreen
        {...sharedStepProps}
        accountChoice={state.accountChoice}
        authMode={state.authMode ?? "sign_in"}
        email={authEmail}
        password={authPassword}
        authAvailable={authAvailable}
        authMessage={authMessage}
        authError={authError}
        needsEmailConfirmation={needsEmailConfirmation}
        onSelectAccountChoice={handleSelectAccountChoice}
        onSelectAuthMode={handleSelectAuthMode}
        onEmailChange={handleEmailChange}
        onPasswordChange={handlePasswordChange}
        onSubmitAuth={submitOnboardingAuth}
        onContinueLocalDemo={continueInLocalDemo}
        onBack={goBack}
        busy={authBusy}
      />
    );
  }

  if (state.stepId === "rating") {
    return (
      <OnboardingShell
        title={ONBOARDING_COPY.rating.title}
        copy={ONBOARDING_COPY.rating.copy}
        tempoCopy={ONBOARDING_COPY.rating.tempoCopy}
        {...sharedStepProps}
        onBack={goBack}
        footer={<OnboardingButtonRow primaryLabel="Continue" onPrimary={goNext} backLabel="Back" onBack={goBack} />}
      >
        <EloBandSelector
          selectedBandId={state.ratingBandId}
          onSelectBand={(bandId) => handleSelectRatingBand(bandId, "manual")}
          onUnsure={() => handleSelectRatingBand("1200-1600", "default")}
        />
      </OnboardingShell>
    );
  }

  if (state.stepId === "starter_pack") {
    return (
      <OnboardingShell
        title={ONBOARDING_COPY.starter_pack.title}
        copy={ONBOARDING_COPY.starter_pack.copy}
        tempoCopy={ONBOARDING_COPY.starter_pack.tempoCopy}
        {...sharedStepProps}
        onBack={goBack}
        footer={<OnboardingButtonRow primaryLabel="Continue" onPrimary={goNext} backLabel="Back" onBack={goBack} />}
      >
        <StarterPackSelector
          selectedStarterPackId={state.selectedStarterPackId}
          onSelectStarterPack={handleSelectStarterPack}
        />
      </OnboardingShell>
    );
  }

  if (state.stepId === "daily_goals") {
    return (
      <OnboardingShell
        title={ONBOARDING_COPY.daily_goals.title}
        copy={ONBOARDING_COPY.daily_goals.copy}
        tempoCopy={ONBOARDING_COPY.daily_goals.tempoCopy}
        {...sharedStepProps}
        onBack={goBack}
        footer={<OnboardingButtonRow primaryLabel="Continue" onPrimary={goNext} backLabel="Back" onBack={goBack} />}
      >
        <DailyGoalSelector
          selectedPresetId={state.dailyGoalPresetId}
          onSelectPreset={handleSelectDailyGoals}
        />
      </OnboardingShell>
    );
  }

  if (state.stepId === "real_game_data") {
    return (
      <OnboardingShell
        title={ONBOARDING_COPY.real_game_data.title}
        copy={ONBOARDING_COPY.real_game_data.copy}
        tempoCopy={ONBOARDING_COPY.real_game_data.tempoCopy}
        {...sharedStepProps}
        onBack={goBack}
        footer={<OnboardingButtonRow primaryLabel="Continue" onPrimary={goNext} backLabel="Back" onBack={goBack} />}
      >
        <RealGameDataCard
          ratingBandLabel={getRatingBandLabel(selectedRatingBand.id)}
          ratingBandDescription={getRatingBandTrainingDescription(selectedRatingBand.id)}
          exampleReplies={[
            `${selectedStarterPack.whiteOpeningName} reply ideas`,
            `${selectedStarterPack.blackOpeningName} reply ideas`,
            "Common principled ...Nf6 and ...c5 plans",
          ]}
          tempoCopy={ONBOARDING_COPY.real_game_data.tempoCopy}
          boardLabel={`${selectedStarterPack.displayName} preview`}
          boardBody={`Blundr trains you against the kinds of replies that appear in ${selectedStarterPack.displayName.toLowerCase()}.`}
        />
      </OnboardingShell>
    );
  }

  if (state.stepId === "opening_continuation") {
    return (
      <OnboardingShell
        title={ONBOARDING_COPY.opening_continuation.title}
        copy={ONBOARDING_COPY.opening_continuation.copy}
        tempoCopy={ONBOARDING_COPY.opening_continuation.tempoCopy}
        {...sharedStepProps}
        onBack={goBack}
        footer={<OnboardingButtonRow primaryLabel="Continue" onPrimary={goNext} backLabel="Back" onBack={goBack} />}
      >
        <StageComparisonCard
          openingStageCopy="Strict book moves, common replies, and opening ideas."
          continuationStageCopy="Play from the final opening position against Tempo and practice the plans that follow."
        />
        <div className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Your starter pack</div>
          <div className="mt-2 text-lg font-black text-stone-950">{selectedStarterPack.displayName}</div>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            White: {selectedStarterPack.whiteOpeningName}
            <br />
            Black: {selectedStarterPack.blackOpeningName}
          </p>
        </div>
      </OnboardingShell>
    );
  }

  if (state.stepId === "training_modes") {
    return (
      <OnboardingShell
        title={ONBOARDING_COPY.training_modes.title}
        copy={ONBOARDING_COPY.training_modes.copy}
        tempoCopy={ONBOARDING_COPY.training_modes.tempoCopy}
        {...sharedStepProps}
        onBack={goBack}
        footer={<OnboardingButtonRow primaryLabel="Continue" onPrimary={goNext} backLabel="Back" onBack={goBack} />}
      >
        <ModeComparisonCard
          title="Practice modes"
          rows={[
            {
              label: "Assisted View",
              description: "Visual cues appear before the move so you can learn the line faster.",
              accent: state.preferredTrainingMode === "assisted" ? "green" : "stone",
            },
            {
              label: "Plain View",
              description: "No cues. You recall the move without help.",
              accent: state.preferredTrainingMode === "plain" ? "green" : "stone",
            },
            {
              label: "Daily Blundr",
              description: "Missed moves and weak ideas return as short adaptive reviews.",
              accent: "stone",
            },
          ]}
        />
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleSelectTrainingMode("assisted")}
            className={classNames(
              "rounded-[1.5rem] border p-4 text-left shadow-sm",
              state.preferredTrainingMode === "assisted" ? "border-green-300 bg-green-50 ring-2 ring-green-200" : "border-stone-200 bg-white",
            )}
          >
            <div className="text-sm font-black text-stone-950">Assisted</div>
            <p className="mt-1 text-sm leading-6 text-stone-600">See visual cues before the move.</p>
          </button>
          <button
            type="button"
            onClick={() => handleSelectTrainingMode("plain")}
            className={classNames(
              "rounded-[1.5rem] border p-4 text-left shadow-sm",
              state.preferredTrainingMode === "plain" ? "border-green-300 bg-green-50 ring-2 ring-green-200" : "border-stone-200 bg-white",
            )}
          >
            <div className="text-sm font-black text-stone-950">Plain</div>
            <p className="mt-1 text-sm leading-6 text-stone-600">No cues, just recall.</p>
          </button>
        </div>
      </OnboardingShell>
    );
  }

  if (state.stepId === "start_training") {
    return (
      <OnboardingStartTrainingScreen
        {...sharedStepProps}
        onBack={goBack}
        onStartTraining={completeOnboarding}
        summary={
          <div className="space-y-3">
            {buildFinalSummary(currentState)}
            {completionError ? (
              <div className="rounded-[1.5rem] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
                {completionError}
              </div>
            ) : null}
            {completionBusy ? (
              <div className="flex items-center gap-2 rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                <Loader2 className="animate-spin" size={16} />
                Saving your profile and repertoire.
              </div>
            ) : null}
          </div>
        }
      />
    );
  }

  return (
    <OnboardingShell
      title={ONBOARDING_COPY.welcome.title}
      copy={ONBOARDING_COPY.welcome.copy}
      tempoCopy={ONBOARDING_COPY.welcome.tempoCopy}
      {...sharedStepProps}
      footer={<OnboardingButtonRow primaryLabel="Get Started" onPrimary={goNext} />}
    >
      <div className="rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-green-700">
          <CheckCircle2 size={14} />
          Welcome
        </div>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Choose a starter pack, set your level, and build a Daily Blundr habit that survives refreshes.
        </p>
      </div>
    </OnboardingShell>
  );
}

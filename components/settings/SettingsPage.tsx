"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Cloud,
  CreditCard,
  LogOut,
  Shield,
  SlidersHorizontal,
} from "lucide-react";

import { BLUNDR_TEMPO_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import {
  BLUNDR_SETTINGS_BOARD_PIECE_OPTIONS,
  BLUNDR_SETTINGS_BOARD_THEME_OPTIONS,
  BLUNDR_SETTINGS_SECTION_IDS,
  type BlundrSettingsSectionId,
} from "@/lib/blundr/settings/settingsNavigation";
import {
  buildAccountSettingsSnapshot,
  loadBlundrSettingsAuthSession,
  signOutBlundrAccount,
} from "@/lib/blundr/settings/accountSettingsState";
import { BLUNDR_LOCAL_DEMO_USER_ID } from "@/lib/blundr/persistence/persistenceKeys";
import {
  resetLocalAccountState,
  upsertLocalTrainingProfile,
} from "@/lib/blundr/accounts/localAccountStorage";
import { writeLocalBoardPreferences } from "@/lib/blundr/board/boardPreferenceService";
import type { BlundrBoardPreferences } from "@/lib/blundr/board/boardThemeTypes";
import type {
  OnboardingAuthMode,
  OnboardingAuthSession,
} from "@/lib/blundr/onboarding/onboardingTypes";
import type { UserTrainingProfile } from "@/lib/blundr/accounts/accountTypes";
import type { TrainingPreferencesPatch } from "@/lib/blundr/accounts/trainingPreferences";
import { getAllRatingBands } from "@/lib/blundr/onboarding/ratingBand";
import {
  signInForOnboarding,
  signUpForOnboarding,
} from "@/lib/blundr/onboarding/onboardingAuth";
import { PasswordField } from "@/components/auth/PasswordField";
import { BlundrAssetImage } from "@/components/assets/BlundrAssetImage";
import {
  authenticatedApiFetch,
  AuthenticatedApiError,
} from "@/lib/blundr/api/authenticatedApiClient";
import {
  validateBlundrUsername,
  type BlundrProfilePublic,
} from "@/lib/blundr/profile/profileTypes";
import type { CommercialAccess } from "@/lib/blundr/commercial/commercialAccess";
import styles from "./SettingsPage.module.css";

type SettingsPageProps = {
  homeHref?: string;
  className?: string;
};

type SectionProps = {
  id: string;
  title: string;
  copy: string;
  active: boolean;
  children: React.ReactNode;
};

type SectionLink = {
  id: BlundrSettingsSectionId;
  label: string;
};

const SETTINGS_SECTION_LINKS: readonly SectionLink[] = [
  { id: "account", label: "Account" },
  { id: "training_preferences", label: "Training preferences" },
  { id: "daily_goals", label: "Daily goals" },
  { id: "visual_teaching_aids", label: "Visual & teaching aids" },
  { id: "billing", label: "Billing" },
  { id: "privacy", label: "Privacy" },
  { id: "account_management", label: "Account management" },
] as const;

function isSettingsSectionId(value: string): value is BlundrSettingsSectionId {
  return BLUNDR_SETTINGS_SECTION_IDS.includes(
    value as BlundrSettingsSectionId,
  );
}

function classNames(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

function nowIso(): string {
  return new Date().toISOString();
}

function formatDateTime(value: string | null): string {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatBillingStatus(status: CommercialAccess | null): string {
  if (!status) return "Current plan: Free. Upgrade is available when you are ready.";
  if (status.plan === "free" && status.expiresAt) {
    return "Current plan: Free. Your previous Pro access has expired; your learning history and queued Review items remain saved.";
  }
  if (status.plan === "free") {
    return "Current plan: Free. You can train unlimited within your active openings, with 5 Daily cards and 5 Review completions per day.";
  }
  if (status.trialStatus === "active") {
    return `Current plan: Blundr Pro trial. Trial ends ${formatDateTime(status.expiresAt ?? status.currentPeriodEndAt)}.${status.cancelAtPeriodEnd ? " Cancellation is scheduled at period end." : ""}`;
  }
  return `Current plan: Blundr Pro.${status.cancelAtPeriodEnd ? " Cancellation is scheduled; access continues until the provider-confirmed expiration." : " Renews automatically until canceled."} ${status.currentPeriodEndAt ? `Next billing date: ${formatDateTime(status.currentPeriodEndAt)}.` : ""}`;
}

function Section({ id, title, copy, active, children }: SectionProps) {
  return (
    <section
      id={id}
      className={classNames(
        styles.settingPanel,
        !active && styles.settingPanelHidden,
      )}
      aria-hidden={!active}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
            {title}
          </div>
          <p className="mt-2 text-sm leading-6 text-stone-600">{copy}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PillButton({
  active,
  label,
  onClick,
  description,
  disabled = false,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={classNames(
        "rounded-2xl border px-3 py-3 text-left shadow-sm transition",
        disabled && "cursor-not-allowed opacity-60",
        active
          ? "border-green-300 bg-green-50 text-stone-950"
          : "border-stone-200 bg-white text-stone-700",
      )}
    >
      <div className="text-sm font-black">{label}</div>
      {description ? (
        <p className="mt-1 text-xs leading-5 text-stone-500">{description}</p>
      ) : null}
    </button>
  );
}

function saveBoardPreferences(
  preferences: BlundrBoardPreferences,
  authSession: OnboardingAuthSession | null,
): void {
  if (typeof window === "undefined") return;
  writeLocalBoardPreferences(preferences, window.localStorage);
  if (authSession) {
    void fetch("/api/blundr/account/sync-local", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        userId: authSession.userId,
        boardPreferences: preferences,
      }),
      cache: "no-store",
    }).catch(() => {
      // Local demo stays authoritative if sync is unavailable.
    });
  }
}

export function SettingsPage({ className }: SettingsPageProps) {
  const [authSession, setAuthSession] = useState<OnboardingAuthSession | null>(
    null,
  );
  const [snapshot, setSnapshot] = useState(() =>
    buildAccountSettingsSnapshot(),
  );
  const [authMode, setAuthMode] = useState<OnboardingAuthMode>("sign_in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [profileBusy, setProfileBusy] = useState(false);
  const [ratingBandId, setRatingBandId] = useState(
    snapshot.profile.ratingBandId,
  );
  const [trainingGoalTempo, setTrainingGoalTempo] = useState(
    snapshot.profile.dailyTempoGoal,
  );
  const [trainingGoalBattery, setTrainingGoalBattery] = useState(
    snapshot.profile.dailyBatteryGoal,
  );
  const [trainingGoalBlundrCards, setTrainingGoalBlundrCards] = useState(
    snapshot.profile.dailyBlundrCardGoal,
  );
  const [preferredTrainingMode, setPreferredTrainingMode] = useState(
    snapshot.profile.preferredTrainingMode,
  );
  const [tacticalHighlightsEnabled, setTacticalHighlightsEnabled] = useState(
    snapshot.profile.tacticalHighlightsEnabled,
  );
  const [selectedStarterPackId, setSelectedStarterPackId] = useState(
    snapshot.profile.selectedStarterPackId ?? "classical_attacker",
  );
  const [boardPreferences, setBoardPreferences] = useState(
    snapshot.boardPreferences,
  );
  const [blundrUsername, setBlundrUsername] = useState<string | null>(null);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [usernameBusy, setUsernameBusy] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState<string | null>(null);
  const [billingStatus, setBillingStatus] = useState<CommercialAccess | null>(
    null,
  );
  const [billingBusy, setBillingBusy] = useState(false);
  const [billingMessage, setBillingMessage] = useState<string | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [activeSectionId, setActiveSectionId] =
    useState<BlundrSettingsSectionId>("account");

  const isAuthenticated = authResolved && Boolean(authSession);
  const isLocalDemo = authResolved && !authSession;
  const usernameValidation = useMemo(
    () => validateBlundrUsername(usernameDraft),
    [usernameDraft],
  );
  const usernameChanged =
    usernameValidation.ok &&
    usernameValidation.username !== (blundrUsername ?? "");
  const accountLabel = !authResolved
    ? "Checking your account session…"
    : authSession
      ? blundrUsername
        ? `Signed in as @${blundrUsername}`
        : "Choose a username"
      : snapshot.accountStatusLabel;

  useEffect(() => {
    let cancelled = false;
    void loadBlundrSettingsAuthSession().then((session) => {
      if (cancelled) return;
      setAuthSession(session);
      setAuthResolved(true);
      const nextSnapshot = buildAccountSettingsSnapshot({
        authSession: session,
        storage: typeof window === "undefined" ? null : window.localStorage,
      });
      setSnapshot(nextSnapshot);
      setTrainingGoalTempo(nextSnapshot.profile.dailyTempoGoal);
      setTrainingGoalBattery(nextSnapshot.profile.dailyBatteryGoal);
      setTrainingGoalBlundrCards(nextSnapshot.profile.dailyBlundrCardGoal);
      setPreferredTrainingMode(nextSnapshot.profile.preferredTrainingMode);
      setTacticalHighlightsEnabled(nextSnapshot.profile.tacticalHighlightsEnabled);
      setRatingBandId(nextSnapshot.profile.ratingBandId);
      setSelectedStarterPackId(
        nextSnapshot.profile.selectedStarterPackId ?? "classical_attacker",
      );
      setBoardPreferences(nextSnapshot.boardPreferences);
      if (session) {
        void authenticatedApiFetch<{
          ok: true;
          data: UserTrainingProfile;
        }>("/api/blundr/account/preferences", { cache: "no-store" })
          .then((response) => {
            if (!cancelled) applyProfile(response.data);
          })
          .catch(() => {
            if (!cancelled)
              setStatusMessage(
                "Your training preferences could not be loaded. Try refreshing.",
              );
          });
        void authenticatedApiFetch<BlundrProfilePublic>("/api/blundr/profile", {
          cache: "no-store",
        })
          .then((profile) => {
            if (!cancelled) {
              setBlundrUsername(profile.username);
              setUsernameDraft(profile.username ?? "");
            }
          })
          .catch(() => {
            if (!cancelled)
              setUsernameMessage(
                "Your username could not be loaded. Try refreshing.",
              );
          });
        void loadBillingStatus();
      } else {
        setBlundrUsername(null);
        setUsernameDraft("");
        setBillingStatus(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleStorage = () => {
      const nextSnapshot = buildAccountSettingsSnapshot({
        authSession,
        storage: window.localStorage,
      });
      setSnapshot(nextSnapshot);
      setBoardPreferences(nextSnapshot.boardPreferences);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [authSession]);

  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash.slice(1);
      setActiveSectionId(
        isSettingsSectionId(hash) ? hash : BLUNDR_SETTINGS_SECTION_IDS[0],
      );
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("popstate", syncFromHash);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("popstate", syncFromHash);
    };
  }, []);

  const activeSectionIndex = SETTINGS_SECTION_LINKS.findIndex(
    (section) => section.id === activeSectionId,
  );

  function selectSection(sectionId: BlundrSettingsSectionId) {
    setActiveSectionId(sectionId);
    if (typeof window === "undefined") return;
    const { pathname, search } = window.location;
    window.history.pushState(null, "", `${pathname}${search}#${sectionId}`);
  }

  function refreshSnapshot(nextSession = authSession) {
    const nextSnapshot = buildAccountSettingsSnapshot({
      authSession: nextSession,
      storage: typeof window === "undefined" ? null : window.localStorage,
    });
    setSnapshot(nextSnapshot);
    setBoardPreferences(nextSnapshot.boardPreferences);
    setTrainingGoalTempo(nextSnapshot.profile.dailyTempoGoal);
    setTrainingGoalBattery(nextSnapshot.profile.dailyBatteryGoal);
    setTrainingGoalBlundrCards(nextSnapshot.profile.dailyBlundrCardGoal);
    setPreferredTrainingMode(nextSnapshot.profile.preferredTrainingMode);
    setTacticalHighlightsEnabled(nextSnapshot.profile.tacticalHighlightsEnabled);
    setRatingBandId(nextSnapshot.profile.ratingBandId);
    setSelectedStarterPackId(
      nextSnapshot.profile.selectedStarterPackId ?? "classical_attacker",
    );
  }

  function formatDailyGoalSummary(profile: UserTrainingProfile): string {
    return `${profile.dailyTempoGoal} Tempo \u00b7 ${profile.dailyBatteryGoal} Battery \u00b7 ${profile.dailyBlundrCardGoal} Daily cards`;
  }

  function applyProfile(profile: UserTrainingProfile) {
    const nextProfile = upsertLocalTrainingProfile(profile);
    setSnapshot((previous) => ({
      ...previous,
      profile: nextProfile,
      dailyGoalSummary: formatDailyGoalSummary(nextProfile),
    }));
    setRatingBandId(nextProfile.ratingBandId);
    setTrainingGoalTempo(nextProfile.dailyTempoGoal);
    setTrainingGoalBattery(nextProfile.dailyBatteryGoal);
    setTrainingGoalBlundrCards(nextProfile.dailyBlundrCardGoal);
    setPreferredTrainingMode(nextProfile.preferredTrainingMode);
    setTacticalHighlightsEnabled(nextProfile.tacticalHighlightsEnabled);
  }

  async function saveProfilePatch(patch: TrainingPreferencesPatch) {
    if (authSession) {
      setProfileBusy(true);
      setStatusMessage(null);
      try {
        const response = await authenticatedApiFetch<{
          ok: true;
          data: UserTrainingProfile;
          effective?: { dailyBlundrCardGoal?: "today" | "next_local_day" };
        }>("/api/blundr/account/preferences", {
          method: "PATCH",
          body: JSON.stringify({
            ...patch,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        });
        applyProfile(response.data);
        setStatusMessage(
          response.effective?.dailyBlundrCardGoal === "next_local_day"
            ? "Saved for tomorrow."
            : "Saved training preferences to your account.",
        );
      } catch (error) {
        setRatingBandId(snapshot.profile.ratingBandId);
        setTrainingGoalTempo(snapshot.profile.dailyTempoGoal);
        setTrainingGoalBattery(snapshot.profile.dailyBatteryGoal);
        setTrainingGoalBlundrCards(snapshot.profile.dailyBlundrCardGoal);
        setPreferredTrainingMode(snapshot.profile.preferredTrainingMode);
        setTacticalHighlightsEnabled(snapshot.profile.tacticalHighlightsEnabled);
        setStatusMessage(
          error instanceof AuthenticatedApiError
            ? error.message
            : "Training preferences could not be saved. Try again.",
        );
      } finally {
        setProfileBusy(false);
      }
      return;
    }
    const nextProfile = upsertLocalTrainingProfile({
      ...snapshot.profile,
      ...patch,
      userId: snapshot.currentUserId,
      updatedAt: nowIso(),
    });
    setSnapshot((previous) => ({
      ...previous,
      profile: nextProfile,
      dailyGoalSummary: formatDailyGoalSummary(nextProfile),
    }));
    setTacticalHighlightsEnabled(nextProfile.tacticalHighlightsEnabled);
    setStatusMessage("Saved local training preferences.");
  }

  function saveBoardPatch(patch: Partial<BlundrBoardPreferences>) {
    const nextBoardPreferences: BlundrBoardPreferences = {
      ...boardPreferences,
      ...patch,
      updatedAt: nowIso(),
    };
    setBoardPreferences(nextBoardPreferences);
    saveBoardPreferences(nextBoardPreferences, authSession);
    refreshSnapshot(authSession);
    setStatusMessage("Saved board preferences.");
  }

  async function handleSubmitAuth() {
    setAuthBusy(true);
    setAuthError(null);
    setAuthMessage(null);
    try {
      const result =
        authMode === "sign_up"
          ? await signUpForOnboarding(email, password)
          : await signInForOnboarding(email, password);
      if (!result.ok) {
        setAuthError(result.message);
        return;
      }
      const nextSession = await loadBlundrSettingsAuthSession();
      setAuthSession(nextSession);
      refreshSnapshot(nextSession);
      setAuthMessage(result.message ?? `Signed in as ${result.email}.`);
      try {
        const profile = await authenticatedApiFetch<BlundrProfilePublic>(
          "/api/blundr/profile",
          { cache: "no-store" },
        );
        setBlundrUsername(profile.username);
        setUsernameDraft(profile.username ?? "");
      } catch {
        setUsernameMessage(
          "Choose a Blundr username below to finish account setup.",
        );
      }
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleSignOut() {
    setAuthBusy(true);
    setAuthError(null);
    setAuthMessage(null);
    try {
      const result = await signOutBlundrAccount();
      setAuthSession(null);
      setBlundrUsername(null);
      setUsernameDraft("");
      refreshSnapshot(null);
      setAuthMessage(result.message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function saveBlundrUsername() {
    if (usernameValidation.ok === false) {
      setUsernameMessage(usernameValidation.message);
      return;
    }
    if (usernameValidation.username === (blundrUsername ?? "")) return;
    setUsernameBusy(true);
    setUsernameMessage(null);
    try {
      const profile = await authenticatedApiFetch<BlundrProfilePublic>(
        "/api/blundr/profile",
        {
          method: "PATCH",
          body: JSON.stringify({ username: usernameValidation.username }),
        },
      );
      setBlundrUsername(profile.username);
      setUsernameDraft(profile.username ?? "");
      setUsernameMessage("Blundr username saved.");
    } catch (error) {
      setUsernameMessage(
        error instanceof AuthenticatedApiError
          ? error.message
          : "The username could not be saved. Try again.",
      );
    } finally {
      setUsernameBusy(false);
    }
  }

  async function loadBillingStatus() {
    setBillingMessage(null);
    try {
      const response = await authenticatedApiFetch<{
        ok: true;
        data: CommercialAccess;
      }>("/api/blundr/billing/status", { cache: "no-store" });
      setBillingStatus(response.data);
    } catch {
      setBillingMessage("Billing status could not be loaded.");
    }
  }

  async function openBillingPortal() {
    setBillingBusy(true);
    setBillingMessage(null);
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
      setBillingMessage("Billing portal could not be opened.");
    } finally {
      setBillingBusy(false);
    }
  }

  function handleResetLocalData() {
    if (!window.confirm("Reset local demo data on this device?")) return;
    resetLocalAccountState(BLUNDR_LOCAL_DEMO_USER_ID);
    setAuthSession(null);
    refreshSnapshot(null);
    setStatusMessage("Local demo data reset.");
  }

  return (
    <main
      className={classNames(
        styles.settingsShell,
        "min-h-screen text-stone-950",
        className,
      )}
    >
      <div className={styles.settingsFrame}>
        <header className={styles.settingsHero}>
          <div className="flex items-end justify-between gap-6 max-[820px]:flex-col max-[820px]:items-start">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-green-800">
                Settings
              </div>
              <h1 className="mt-3 text-[34px] font-black leading-[1.05] tracking-[-0.05em] text-stone-950 max-[820px]:text-[27px]">
                Account settings.
              </h1>
              <p className="mt-3 max-w-[720px] text-[13px] leading-[1.55] text-stone-600 max-[820px]:text-[11px]">
                Manage your identity, training preferences, and daily goals.
              </p>
            </div>
            <Link href="/profile" className={styles.profileLink}>
              Profile
            </Link>
          </div>
        </header>

        <div className={styles.settingsLayout}>
          <nav className={styles.settingsNav} aria-label="Settings sections">
            <div className={styles.navHeader}>
              <div>
                <div className={styles.navTitle}>Sections</div>
                <div className={styles.navSubtitle}>
                  One active section at a time.
                </div>
              </div>
              <div className={styles.navCounter}>
                {Math.max(activeSectionIndex, 0) + 1}/{SETTINGS_SECTION_LINKS.length}
              </div>
            </div>
            <div className={styles.navList}>
              {SETTINGS_SECTION_LINKS.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => selectSection(section.id)}
                  className={classNames(
                    styles.navChip,
                    activeSectionId === section.id && styles.navChipActive,
                  )}
                  aria-pressed={activeSectionId === section.id}
                >
                  <span>{section.label}</span>
                  {activeSectionId === section.id ? (
                    <CheckCircle2
                      size={14}
                      className={styles.navChipIcon}
                    />
                  ) : null}
                </button>
              ))}
            </div>
            <label className={styles.mobileSelector}>
              <span className={styles.mobileSelectorLabel}>Section</span>
              <div className={styles.mobileSelectorControl}>
                <SlidersHorizontal size={14} className={styles.selectorIcon} />
                <select
                  value={activeSectionId}
                  onChange={(event) =>
                    selectSection(event.target.value as BlundrSettingsSectionId)
                  }
                  className={styles.sectionSelect}
                  aria-label="Select a settings section"
                >
                  {SETTINGS_SECTION_LINKS.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.label}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </nav>

          <div className={styles.settingsPanels}>
            {statusMessage ? (
              <div className={styles.statusMessage}>{statusMessage}</div>
            ) : null}

            <Section
              id="account"
              title="Account"
              copy="Manage your sign-in state and public username."
              active={activeSectionId === "account"}
            >
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
                  <div className="flex items-start gap-3">
                    <BlundrAssetImage
                      asset={BLUNDR_TEMPO_ASSETS.avatar}
                      alt="Blundr avatar"
                      variant="tempoAvatar"
                      className="shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
                        Status
                      </div>
                      <div className="mt-2 text-lg font-black tracking-tight text-stone-950">
                        {accountLabel}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-stone-600">
                        {isAuthenticated
                          ? "Your account is active. Supported preferences and progress can sync across devices."
                          : "Local demo stores progress on this device. Sign in or create an account when you want cross-device sync."}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 ring-1 ring-stone-200">
                          {snapshot.dailyGoalSummary}
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 ring-1 ring-stone-200">
                          {snapshot.boardPreferences.boardThemeId}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!authResolved ? (
                    <div className="mt-4 rounded-2xl bg-white p-4 text-sm font-semibold text-stone-600 ring-1 ring-stone-200">
                      Checking your account session…
                    </div>
                  ) : isAuthenticated ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={authBusy}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white shadow-sm disabled:opacity-60"
                      >
                        <LogOut size={16} />
                        Sign out
                      </button>
                      <Link
                        href="/settings#account_management"
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-stone-700 ring-1 ring-stone-200"
                      >
                        <Shield size={16} />
                        Account management
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">
                        Sign in or create account
                      </div>
                      <div className="mt-3 grid gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setAuthMode("sign_in")}
                            className={classNames(
                              "rounded-2xl px-3 py-3 text-sm font-black",
                              authMode === "sign_in"
                                ? "bg-green-700 text-white"
                                : "bg-stone-100 text-stone-600",
                            )}
                          >
                            Sign in
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthMode("sign_up")}
                            className={classNames(
                              "rounded-2xl px-3 py-3 text-sm font-black",
                              authMode === "sign_up"
                                ? "bg-green-700 text-white"
                                : "bg-stone-100 text-stone-600",
                            )}
                          >
                            Create account
                          </button>
                        </div>
                        <label className="grid gap-2 text-sm font-bold text-stone-700">
                          Email
                          <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-medium text-stone-950 shadow-sm outline-none focus:border-green-300"
                          />
                        </label>
                        <PasswordField
                          label="Password"
                          value={password}
                          onChange={setPassword}
                          placeholder="Choose a password"
                          autoComplete={
                            authMode === "sign_up"
                              ? "new-password"
                              : "current-password"
                          }
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          onClick={handleSubmitAuth}
                          disabled={
                            authBusy || !email.trim() || !password.trim()
                          }
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-black text-white shadow-sm disabled:opacity-60"
                        >
                          {authMode === "sign_up"
                            ? "Create account"
                            : "Sign in"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            resetLocalAccountState(BLUNDR_LOCAL_DEMO_USER_ID);
                            setAuthSession(null);
                            refreshSnapshot(null);
                            setStatusMessage("Kept the local demo active.");
                          }}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-black text-stone-700"
                        >
                          Continue local demo
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                    Current profile
                  </div>
                  <div className="mt-2 text-lg font-black tracking-tight text-stone-950">
                    {snapshot.profile.selectedStarterPackId ??
                      "No starter pack"}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Blundr remembers your starter pack, daily goals, and
                    preferred training mode on this device.
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-stone-600">
                    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                        Blundr username
                      </div>
                      {isAuthenticated ? (
                        <>
                          <div className="mt-1 font-black text-stone-950">
                            {blundrUsername ? `@${blundrUsername}` : "Not set"}
                          </div>
                          <div className="mt-2 flex gap-2">
                            <input
                              aria-label="Blundr username"
                              value={usernameDraft}
                              onChange={(event) => {
                                setUsernameDraft(event.target.value);
                                setUsernameMessage(null);
                              }}
                              placeholder="username"
                              autoCapitalize="none"
                              autoComplete="username"
                              spellCheck={false}
                              aria-invalid={
                                Boolean(usernameDraft.trim()) &&
                                usernameValidation.ok === false
                              }
                              className={classNames(
                                "min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm font-bold outline-none",
                                usernameValidation.ok
                                  ? "border-stone-200 focus:border-green-300"
                                  : "border-red-200 focus:border-red-400",
                              )}
                            />
                            <button
                              type="button"
                              onClick={() => void saveBlundrUsername()}
                              disabled={
                                usernameBusy ||
                                usernameValidation.ok === false ||
                                !usernameChanged
                              }
                              className="rounded-xl bg-stone-950 px-3 py-2 text-xs font-black text-white disabled:opacity-50"
                            >
                              {usernameBusy ? "Saving…" : "Save"}
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="mt-1 font-black text-stone-950">
                          Local demo
                        </div>
                      )}
                      {isAuthenticated ? (
                        <p
                          role="status"
                          className={classNames(
                            "mt-2 text-xs leading-5",
                            usernameValidation.ok
                              ? "text-stone-600"
                              : "text-red-700",
                          )}
                        >
                          {usernameMessage ??
                            (usernameDraft.trim()
                              ? usernameValidation.ok
                                ? usernameChanged
                                  ? "Looks good. Save to claim it."
                                  : "This is already your current username."
                                : "message" in usernameValidation
                                  ? usernameValidation.message
                                  : "Choose a valid username."
                              : blundrUsername
                                ? "Use 3–24 characters: a letter first, then lowercase letters, numbers, or underscores."
                                : "Choose a username to finish account setup.")}
                        </p>
                      ) : null}
                    </div>
                    {isAuthenticated ? (
                      <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200">
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                          Email
                        </div>
                        <div className="mt-1 font-black text-stone-950">
                          {snapshot.email ?? "Private account email"}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {authMessage ? (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-900">
                  {authMessage}
                </div>
              ) : null}
              {authError ? (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
                  {authError}
                </div>
              ) : null}
            </Section>

            <Section
              id="training_preferences"
              title="Training preferences"
              copy="Tune the board and the core training feel."
              active={activeSectionId === "training_preferences"}
            >
              <div className="mb-5 rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                  Rating band
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  This controls the Maia opponent level and rating-adjusted
                  training choices. You can change it whenever your level or
                  preference changes.
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {getAllRatingBands().map((band) => (
                    <PillButton
                      key={band.id}
                      active={ratingBandId === band.id}
                      label={band.label}
                      description={band.trainingDescription}
                      disabled={profileBusy}
                      onClick={() => {
                        const nextBand = band.id;
                        setRatingBandId(nextBand);
                        void saveProfilePatch({ ratingBandId: nextBand });
                      }}
                    />
                  ))}
                </div>
                {profileBusy ? (
                  <p
                    className="mt-3 text-xs font-bold text-stone-500"
                    role="status"
                  >
                    Saving training preferences…
                  </p>
                ) : null}
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                    Board theme
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {BLUNDR_SETTINGS_BOARD_THEME_OPTIONS.map((option) => (
                      <PillButton
                        key={option.id}
                        active={boardPreferences.boardThemeId === option.id}
                        label={option.label}
                        description={option.description}
                        onClick={() =>
                          saveBoardPatch({ boardThemeId: option.id })
                        }
                      />
                    ))}
                  </div>
                  <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                    Piece set
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {BLUNDR_SETTINGS_BOARD_PIECE_OPTIONS.map((option) => (
                      <PillButton
                        key={option.id}
                        active={boardPreferences.pieceSetId === option.id}
                        label={option.label}
                        description={option.description}
                        onClick={() =>
                          saveBoardPatch({ pieceSetId: option.id })
                        }
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() =>
                        saveBoardPatch({
                          showCoordinates: !boardPreferences.showCoordinates,
                        })
                      }
                      className={classNames(
                        "rounded-2xl px-4 py-3 text-sm font-black shadow-sm",
                        boardPreferences.showCoordinates
                          ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                          : "bg-stone-100 text-stone-600",
                      )}
                    >
                      Coordinates{" "}
                      {boardPreferences.showCoordinates ? "On" : "Off"}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        saveBoardPatch({
                          boardOrientation:
                            boardPreferences.boardOrientation === "white"
                              ? "black"
                              : "white",
                        })
                      }
                      className="rounded-2xl bg-stone-100 px-4 py-3 text-sm font-black text-stone-700 shadow-sm"
                    >
                      Orientation{" "}
                      {boardPreferences.boardOrientation === "white"
                        ? "White"
                        : "Black"}
                    </button>
                  </div>
                  <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                      Preferred training mode
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={profileBusy}
                        onClick={() => {
                          setPreferredTrainingMode("assisted");
                          saveProfilePatch({
                            preferredTrainingMode: "assisted",
                          });
                        }}
                        className={classNames(
                          "rounded-2xl px-4 py-3 text-sm font-black",
                          profileBusy && "cursor-not-allowed opacity-60",
                          preferredTrainingMode === "assisted"
                            ? "bg-green-700 text-white"
                            : "bg-white text-stone-700 ring-1 ring-stone-200",
                        )}
                      >
                        Assisted
                      </button>
                      <button
                        type="button"
                        disabled={profileBusy}
                        onClick={() => {
                          setPreferredTrainingMode("plain");
                          saveProfilePatch({ preferredTrainingMode: "plain" });
                        }}
                        className={classNames(
                          "rounded-2xl px-4 py-3 text-sm font-black",
                          profileBusy && "cursor-not-allowed opacity-60",
                          preferredTrainingMode === "plain"
                            ? "bg-green-700 text-white"
                            : "bg-white text-stone-700 ring-1 ring-stone-200",
                        )}
                      >
                        Plain
                      </button>
                    </div>
                    <div className="mt-3 rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-stone-600 ring-1 ring-stone-200">
                      The selected board theme applies across Training, Daily
                      Blundr, Review, and minigame practice.
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            <Section
              id="daily_goals"
              title="Daily goals"
              copy="Keep your targets visible and simple."
              active={activeSectionId === "daily_goals"}
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="grid gap-2 text-sm font-bold text-stone-700">
                  Tempo
                  <input
                    type="number"
                    min={1}
                    max={100}
                    disabled={profileBusy}
                    value={trainingGoalTempo}
                    onChange={(event) => {
                      const value = Math.min(
                        100,
                        Math.max(1, Number(event.target.value) || 1),
                      );
                      setTrainingGoalTempo(value);
                    }}
                    onBlur={() =>
                      void saveProfilePatch({
                        dailyTempoGoal: trainingGoalTempo,
                      })
                    }
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-950 shadow-sm outline-none focus:border-green-300 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-stone-700">
                  Battery
                  <input
                    type="number"
                    min={1}
                    max={100}
                    disabled={profileBusy}
                    value={trainingGoalBattery}
                    onChange={(event) => {
                      const value = Math.min(
                        100,
                        Math.max(1, Number(event.target.value) || 1),
                      );
                      setTrainingGoalBattery(value);
                    }}
                    onBlur={() =>
                      void saveProfilePatch({
                        dailyBatteryGoal: trainingGoalBattery,
                      })
                    }
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-950 shadow-sm outline-none focus:border-green-300 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-stone-700">
                  Daily cards
                  <input
                    type="number"
                    min={1}
                    max={99}
                    disabled={profileBusy}
                    value={trainingGoalBlundrCards}
                    onChange={(event) => {
                      const value = Math.min(
                        99,
                        Math.max(1, Number(event.target.value) || 1),
                      );
                      setTrainingGoalBlundrCards(value);
                    }}
                    onBlur={() =>
                      void saveProfilePatch({
                        dailyBlundrCardGoal: trainingGoalBlundrCards,
                      })
                    }
                    className="rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-black text-stone-950 shadow-sm outline-none focus:border-green-300 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>
              <div className="mt-3 rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
                <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">
                  Current goals
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {snapshot.dailyGoalSummary}
                </p>
              </div>
            </Section>

            <Section
              id="visual_teaching_aids"
              title="Visual & teaching aids"
              copy="Control optional teaching overlays and cues."
              active={activeSectionId === "visual_teaching_aids"}
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
                  <div className="text-sm font-black text-stone-950">
                    Tactical highlights
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Show visual cues when Blundr detects tactical patterns such
                    as forks and pins.
                  </p>
                  <button
                    type="button"
                    disabled={profileBusy}
                    onClick={() => {
                      const next = !tacticalHighlightsEnabled;
                      setTacticalHighlightsEnabled(next);
                      void saveProfilePatch({ tacticalHighlightsEnabled: next });
                    }}
                    className={classNames(
                      "mt-3 inline-flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-black shadow-sm ring-1",
                      profileBusy && "cursor-not-allowed opacity-60",
                      tacticalHighlightsEnabled
                        ? "bg-green-50 text-green-800 ring-green-200"
                        : "bg-white text-stone-700 ring-stone-200",
                    )}
                    aria-pressed={tacticalHighlightsEnabled}
                  >
                    <span>{tacticalHighlightsEnabled ? "On" : "Off"}</span>
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-current/70">
                      {tacticalHighlightsEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </button>
                </div>

                <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
                  <div className="text-sm font-black text-stone-950">
                    Motion and readability
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    The interface respects your system motion and contrast
                    preferences, and adapts layout for smaller screens.
                  </p>
                </div>
              </div>
            </Section>

            <Section
              id="billing"
              title="Billing"
              copy="Manage your Blundr plan from trusted billing state."
              active={activeSectionId === "billing"}
            >
              <div className="rounded-[1.5rem] border border-stone-200 bg-[#fbfcf7] p-4">
                <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                  <CreditCard size={16} className="text-green-700" />
                  {billingStatus?.plan === "pro" ? "Blundr Pro" : "Blundr Free"}
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  {formatBillingStatus(billingStatus)}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {billingStatus?.plan === "pro" || billingStatus?.expiresAt ? (
                    <button
                      type="button"
                      disabled={billingBusy}
                      onClick={() => void openBillingPortal()}
                      className="inline-flex min-h-10 items-center rounded-lg bg-green-800 px-3 text-sm font-black text-white disabled:opacity-60"
                    >
                      {billingBusy ? "Opening..." : "Manage billing"}
                    </button>
                  ) : (
                    <Link
                      href="/onboarding/plan"
                      className="inline-flex min-h-10 items-center rounded-lg bg-green-800 px-3 text-sm font-black text-white"
                    >
                      Upgrade
                    </Link>
                  )}
                  <button
                    type="button"
                    disabled={billingBusy}
                    onClick={() => void loadBillingStatus()}
                    className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 px-3 text-sm font-black text-stone-800 disabled:opacity-60"
                  >
                    Refresh
                  </button>
                  <Link
                    href="/subscription-terms"
                    className="inline-flex min-h-10 items-center text-sm font-black text-green-700 underline underline-offset-4"
                  >
                    Subscription terms
                  </Link>
                </div>
                {billingMessage ? (
                  <p role="alert" className="mt-3 text-sm font-bold text-red-700">
                    {billingMessage}
                  </p>
                ) : null}
              </div>
            </Section>

            <Section
              id="privacy"
              title="Privacy"
              copy="Understand what is stored on this device and in your account."
              active={activeSectionId === "privacy"}
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
                  <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                    <Cloud size={16} className="text-green-700" />
                    Local demo vs account
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {isLocalDemo
                      ? "Local demo stores progress on this device. Sign in when you want cross-device sync."
                      : "Your signed-in account stores preferences and progress in your Blundr account. Local data still stays on this device."}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
                  <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                    <Shield size={16} className="text-green-700" />
                    Policies
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Read how Blundr handles account data, connected providers,
                    and diagnostics.
                  </p>
                  <Link
                    href="/privacy"
                    className="mt-3 inline-flex text-sm font-black text-green-700 underline underline-offset-4"
                  >
                    Read the privacy policy
                  </Link>
                </div>
              </div>
            </Section>

            <Section
              id="account_management"
              title="Account management"
              copy="Manage local demo data and account recovery flows."
              active={activeSectionId === "account_management"}
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
                  <div className="text-sm font-black text-stone-950">
                    Device data
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Reset clears local demo progress on this device. It does not
                    delete your authenticated account data.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetLocalData}
                    disabled={!isLocalDemo}
                    className={classNames(
                      "mt-3 rounded-2xl bg-white px-4 py-3 text-sm font-black text-stone-700 ring-1 ring-stone-200",
                      !isLocalDemo && "cursor-not-allowed opacity-60",
                    )}
                  >
                    Reset local demo data
                  </button>
                </div>
                <div className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
                  <div className="text-sm font-black text-stone-950">
                    Export and deletion
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Data export and account deletion requests follow the policy
                    process for this beta build.
                  </p>
                  <Link
                    href="/privacy"
                    className="mt-3 inline-flex text-sm font-black text-green-700 underline underline-offset-4"
                  >
                    Review privacy policy details
                  </Link>
                </div>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}

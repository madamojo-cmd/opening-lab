"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Cloud,
  ExternalLink,
  Globe,
  Laptop,
  LogOut,
  MoonStar,
  RefreshCw,
  Shield,
  Settings,
  Sparkles,
  SlidersHorizontal,
  UserCircle2,
  WandSparkles,
} from "lucide-react";

import {
  BLUNDR_EMPTY_STATE_ASSETS,
  BLUNDR_TEMPO_ASSETS,
} from "@/lib/blundr/assets/blundrAssetManifest";
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
  getLocalAccountCurrentUserId,
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
import { ConnectedGameDataPanel } from "./gameData/ConnectedGameDataPanel";
import {
  authenticatedApiFetch,
  AuthenticatedApiError,
} from "@/lib/blundr/api/authenticatedApiClient";
import type { BlundrProfilePublic } from "@/lib/blundr/profile/profileTypes";
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
  { id: "connected_game_data", label: "Game data" },
  { id: "subscription", label: "Subscription" },
  { id: "training_preferences", label: "Training" },
  { id: "daily_goals", label: "Daily goals" },
  { id: "display_accessibility", label: "Display" },
  { id: "data_privacy", label: "Privacy" },
  { id: "support_about", label: "Support" },
  { id: "developer_tools", label: "Developer tools" },
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
  const [trainingGoalBlundr, setTrainingGoalBlundr] = useState(
    snapshot.profile.dailyBlundrGoal,
  );
  const [preferredTrainingMode, setPreferredTrainingMode] = useState(
    snapshot.profile.preferredTrainingMode,
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
  const [authResolved, setAuthResolved] = useState(false);
  const [activeSectionId, setActiveSectionId] =
    useState<BlundrSettingsSectionId>("account");

  const isAuthenticated = authResolved && Boolean(authSession);
  const isLocalDemo = authResolved && !authSession;
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
      setTrainingGoalBlundr(nextSnapshot.profile.dailyBlundrGoal);
      setPreferredTrainingMode(nextSnapshot.profile.preferredTrainingMode);
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
      } else {
        setBlundrUsername(null);
        setUsernameDraft("");
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
    setTrainingGoalBlundr(nextSnapshot.profile.dailyBlundrGoal);
    setPreferredTrainingMode(nextSnapshot.profile.preferredTrainingMode);
    setRatingBandId(nextSnapshot.profile.ratingBandId);
    setSelectedStarterPackId(
      nextSnapshot.profile.selectedStarterPackId ?? "classical_attacker",
    );
  }

  function applyProfile(profile: UserTrainingProfile) {
    const nextProfile = upsertLocalTrainingProfile(profile);
    setSnapshot((previous) => ({
      ...previous,
      profile: nextProfile,
      dailyGoalSummary: `${nextProfile.dailyTempoGoal} Tempo, ${nextProfile.dailyBatteryGoal} Battery, ${nextProfile.dailyBlundrGoal} Daily Blundr`,
    }));
    setRatingBandId(nextProfile.ratingBandId);
    setTrainingGoalTempo(nextProfile.dailyTempoGoal);
    setTrainingGoalBattery(nextProfile.dailyBatteryGoal);
    setTrainingGoalBlundr(nextProfile.dailyBlundrGoal);
    setPreferredTrainingMode(nextProfile.preferredTrainingMode);
  }

  async function saveProfilePatch(patch: TrainingPreferencesPatch) {
    if (authSession) {
      setProfileBusy(true);
      setStatusMessage(null);
      try {
        const response = await authenticatedApiFetch<{
          ok: true;
          data: UserTrainingProfile;
        }>("/api/blundr/account/preferences", {
          method: "PATCH",
          body: JSON.stringify({
            ...patch,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        });
        applyProfile(response.data);
        setStatusMessage("Saved training preferences to your account.");
      } catch (error) {
        setRatingBandId(snapshot.profile.ratingBandId);
        setTrainingGoalTempo(snapshot.profile.dailyTempoGoal);
        setTrainingGoalBattery(snapshot.profile.dailyBatteryGoal);
        setTrainingGoalBlundr(snapshot.profile.dailyBlundrGoal);
        setPreferredTrainingMode(snapshot.profile.preferredTrainingMode);
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
      dailyGoalSummary: `${nextProfile.dailyTempoGoal} Tempo, ${nextProfile.dailyBatteryGoal} Battery, ${nextProfile.dailyBlundrGoal} Daily Blundr`,
    }));
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
    setUsernameBusy(true);
    setUsernameMessage(null);
    try {
      const profile = await authenticatedApiFetch<BlundrProfilePublic>(
        "/api/blundr/profile",
        {
          method: "PATCH",
          body: JSON.stringify({ username: usernameDraft }),
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
                Account &amp; training.
              </h1>
              <p className="mt-3 max-w-[720px] text-[13px] leading-[1.55] text-stone-600 max-[820px]:text-[11px]">
                All nine production settings areas, reorganized without
                inventing unwired product behavior.
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
              copy="Keep track of whether Tempo is in local demo or authenticated mode."
              active={activeSectionId === "account"}
            >
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
                  <div className="flex items-start gap-3">
                    <BlundrAssetImage
                      asset={BLUNDR_TEMPO_ASSETS.avatar}
                      alt="Tempo avatar"
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
                          ? "Your cloud account is active. Tempo will keep using authenticated sync where it is configured."
                          : "Local demo keeps working without Supabase credentials. Sign in or create an account when you are ready."}
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
                      <button
                        type="button"
                        onClick={() =>
                          setStatusMessage(
                            "Account deletion comes later. Tempo keeps the local demo safe for now.",
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-stone-700 ring-1 ring-stone-200"
                      >
                        <Shield size={16} />
                        Delete account later
                      </button>
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
                    Tempo remembers your starter pack, daily goals, and
                    preferred training mode on this device.
                  </p>
                  <div className="mt-4 grid gap-2 text-sm text-stone-600">
                    <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200">
                      <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">
                        Blundr username
                      </div>
                      {isAuthenticated ? (
                        <div className="mt-2 flex gap-2">
                          <input
                            aria-label="Blundr username"
                            value={usernameDraft}
                            onChange={(event) =>
                              setUsernameDraft(event.target.value)
                            }
                            placeholder="Choose a username"
                            className="min-w-0 flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => void saveBlundrUsername()}
                            disabled={usernameBusy || !usernameDraft.trim()}
                            className="rounded-xl bg-stone-950 px-3 py-2 text-xs font-black text-white disabled:opacity-50"
                          >
                            {usernameBusy ? "Saving…" : "Save"}
                          </button>
                        </div>
                      ) : (
                        <div className="mt-1 font-black text-stone-950">
                          Local demo
                        </div>
                      )}
                      {usernameMessage ? (
                        <p
                          role="status"
                          className="mt-2 text-xs leading-5 text-stone-600"
                        >
                          {usernameMessage}
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

            <section
              id="connected_game_data"
              className={classNames(
                styles.settingPanel,
                activeSectionId !== "connected_game_data" &&
                  styles.settingPanelHidden,
              )}
              aria-hidden={activeSectionId !== "connected_game_data"}
            >
              <ConnectedGameDataPanel />
            </section>

            <Section
              id="subscription"
              title="Subscription"
              copy="Billing is intentionally not wired in this stage."
              active={activeSectionId === "subscription"}
            >
              <div className="rounded-[1.5rem] border border-stone-200 bg-[#fbfcf7] p-4">
                <div className="text-sm font-black text-stone-950">
                  Blundr Pro billing coming soon on web.
                </div>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Tempo Cache, training, and local demo work without payment
                  logic in Stage 8J.
                </p>
              </div>
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
                  Daily Blundr
                  <input
                    type="number"
                    min={1}
                    max={100}
                    disabled={profileBusy}
                    value={trainingGoalBlundr}
                    onChange={(event) => {
                      const value = Math.min(
                        100,
                        Math.max(1, Number(event.target.value) || 1),
                      );
                      setTrainingGoalBlundr(value);
                    }}
                    onBlur={() =>
                      void saveProfilePatch({
                        dailyBlundrGoal: trainingGoalBlundr,
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
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-stone-500 ring-1 ring-stone-200">
                    Starter pack: {selectedStarterPackId}
                  </span>
                </div>
              </div>
            </Section>

            <Section
              id="display_accessibility"
              title="Display and accessibility"
              copy="Keep the interface readable and calm."
              active={activeSectionId === "display_accessibility"}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
                  <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                    <MoonStar size={16} className="text-green-700" />
                    Reduced motion
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    Tempo respects your system motion settings. Static fallbacks
                    are used automatically for reward animations.
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
                  <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                    <Laptop size={16} className="text-green-700" />
                    Compact mode
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    A compact mode is not wired as a separate preference yet.
                    Tempo keeps the mobile layout tight by default.
                  </p>
                </div>
              </div>
            </Section>

            <Section
              id="data_privacy"
              title="Data and privacy"
              copy="Local demo should feel safe and understandable."
              active={activeSectionId === "data_privacy"}
            >
              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-[1.5rem] bg-[#fbfcf7] p-4 ring-1 ring-stone-200">
                  <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                    <Cloud size={16} className="text-green-700" />
                    Local demo vs account
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    {isLocalDemo
                      ? "Local demo stores progress on this device. Sign in when you want cloud sync."
                      : "Your signed-in account can sync when the backend is configured. Local data still stays on this device."}
                  </p>
                </div>
                <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
                  <div className="flex items-center gap-2 text-sm font-black text-stone-950">
                    <Shield size={16} className="text-green-700" />
                    Device data
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={handleResetLocalData}
                      className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-stone-700 ring-1 ring-stone-200"
                    >
                      Reset local data
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStatusMessage(
                          "Export data is a follow-up item. Tempo keeps the copy simple for now.",
                        )
                      }
                      className="rounded-2xl bg-white px-4 py-3 text-sm font-black text-stone-700 ring-1 ring-stone-200"
                    >
                      Export later
                    </button>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-600">
                    Delete account remains a support flow later. Tempo does not
                    add billing or destructive cloud actions in this stage.
                  </p>
                  <Link
                    href="/privacy"
                    className="mt-3 inline-flex text-sm font-black text-green-700 underline underline-offset-4"
                  >
                    Read the full Privacy Policy
                  </Link>
                </div>
              </div>
            </Section>

            <Section
              id="support_about"
              title="Support and about"
              copy="Keep the about surface lightweight and honest."
              active={activeSectionId === "support_about"}
            >
              <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                <div className="rounded-[1.5rem] bg-stone-50 p-4 ring-1 ring-stone-200">
                  <div className="text-sm font-black text-stone-950">
                    Blundr Stage 8J checkpoint
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    The app is still in pre-paywall polish. Tempo keeps the UI
                    calm while the product moves toward launch QA.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href="/dev/ui-screens"
                    className="inline-flex items-center gap-2 rounded-2xl bg-green-700 px-4 py-3 text-sm font-black text-white shadow-sm"
                  >
                    <Sparkles size={16} />
                    UI studio
                  </Link>
                  <Link
                    href="/dev/admin"
                    className="inline-flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-3 text-sm font-black text-stone-700 shadow-sm"
                  >
                    <Settings size={16} />
                    Dev admin
                  </Link>
                </div>
              </div>
            </Section>

            <Section
              id="developer_tools"
              title="Developer tools"
              copy="Visible only when developer tools are enabled."
              active={activeSectionId === "developer_tools"}
            >
              {snapshot.devToolsEnabled ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link
                    href="/dev/admin"
                    className="rounded-[1.5rem] border border-stone-200 bg-[#fbfcf7] p-4 shadow-sm"
                  >
                    <div className="text-sm font-black text-stone-950">
                      Admin gate
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      Open the gated developer tools page.
                    </p>
                  </Link>
                  <Link
                    href="/api/blundr/dev/game-data-health"
                    className="rounded-[1.5rem] border border-stone-200 bg-[#fbfcf7] p-4 shadow-sm"
                  >
                    <div className="text-sm font-black text-stone-950">
                      Game data health
                    </div>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      Inspect runtime book, repertoire, and minigame health.
                    </p>
                  </Link>
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-stone-200 bg-[#fbfcf7] p-4 shadow-sm">
                  <div className="text-sm font-black text-stone-950">
                    Developer tools disabled
                  </div>
                  <p className="mt-2 text-sm leading-6 text-stone-600">
                    This build keeps developer-only surfaces unavailable.
                  </p>
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </main>
  );
}

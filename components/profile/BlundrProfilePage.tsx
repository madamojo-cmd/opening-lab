"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleUserRound,
  Settings2,
  ShieldCheck,
} from "lucide-react";

import {
  authenticatedApiFetch,
  AuthenticatedApiError,
} from "@/lib/blundr/api/authenticatedApiClient";
import { useOnboardingAuthSession } from "@/lib/blundr/onboarding/useOnboardingAuthSession";
import {
  validateBlundrUsername,
  type BlundrProfilePublic,
} from "@/lib/blundr/profile/profileTypes";
import styles from "./BlundrProfilePage.module.css";

export function BlundrProfilePage() {
  const auth = useOnboardingAuthSession();
  const [profile, setProfile] = useState<BlundrProfilePublic | null>(null);
  const [usernameDraft, setUsernameDraft] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    if (auth.status !== "authenticated") {
      setLoading(auth.status === "loading");
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void authenticatedApiFetch<BlundrProfilePublic>("/api/blundr/profile", {
      cache: "no-store",
    })
      .then((nextProfile) => {
        if (cancelled) return;
        setProfile(nextProfile);
        setUsernameDraft(nextProfile.username ?? "");
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError("Your profile could not be loaded. Try again.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [auth.status, loadAttempt]);

  const usernameValidation = useMemo(
    () => validateBlundrUsername(usernameDraft),
    [usernameDraft],
  );
  const usernameChanged =
    usernameValidation.ok && usernameValidation.username !== profile?.username;

  async function saveUsername() {
    if (!usernameValidation.ok || !usernameChanged) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      const nextProfile = await authenticatedApiFetch<BlundrProfilePublic>(
        "/api/blundr/profile",
        {
          method: "PATCH",
          body: JSON.stringify({ username: usernameValidation.username }),
        },
      );
      setProfile(nextProfile);
      setUsernameDraft(nextProfile.username ?? "");
      setSaveMessage("Blundr username saved.");
    } catch (error) {
      setSaveMessage(
        error instanceof AuthenticatedApiError
          ? error.message
          : "The username could not be saved. Try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (auth.status === "loading" || loading) {
    return (
      <main className={styles.profileShell}>
        <div
          className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm"
          aria-busy="true"
        >
          <div className="h-5 w-28 animate-pulse rounded-full bg-stone-100" />
          <div className="mt-4 h-9 w-52 animate-pulse rounded-2xl bg-stone-100" />
          <p className="mt-4 text-sm text-stone-500">Loading your profile…</p>
        </div>
      </main>
    );
  }

  if (auth.status === "signed_out") {
    return (
      <main className={styles.profileShell}>
        <section className="mx-auto max-w-md rounded-3xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black">Sign in to view your profile</h1>
          <Link
            href="/login?next=%2Fprofile"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-green-800 px-4 font-semibold text-white"
          >
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.profileShell}>
      <div className={styles.profileFrame}>
        <header className={styles.pageHeader}>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.18em] text-green-800">
              Profile
            </div>
            <h1 className="mt-3 text-[34px] font-black leading-[1.05] tracking-[-0.05em] text-stone-950 max-[820px]:text-[27px]">
              Your Blundr identity.
            </h1>
            <p className="mt-3 max-w-[720px] text-[13px] leading-[1.55] text-stone-600 max-[820px]:text-[11px]">
              Public username and private account identity remain clearly
              separated.
            </p>
          </div>
          <Link href="/settings" className={styles.settingsLink}>
            <Settings2 size={17} />
            Settings
          </Link>
        </header>
        <div className={styles.profileGrid}>
          <div className="min-w-0 space-y-4">
            <header className={styles.hero}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 gap-4">
                  <div className={styles.avatar} aria-hidden="true">
                    <CircleUserRound size={30} />
                  </div>
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-green-700">
                      <CircleUserRound size={14} />
                      Profile
                    </div>
                    <h1 className="mt-3 text-3xl font-black tracking-tight">
                      {profile?.username
                        ? `@${profile.username}`
                        : "Choose your name"}
                    </h1>
                    <p className="mt-2 text-sm leading-6 text-stone-600">
                      Your Blundr username is the public identity attached to
                      this training account.
                    </p>
                  </div>
                </div>
                <Link
                  href="/"
                  aria-label="Back to home"
                  className={styles.iconLink}
                >
                  <ArrowLeft size={18} />
                </Link>
              </div>
              {!loadError ? (
                <div className={styles.usernameEditor}>
                  <label
                    htmlFor="blundr-profile-username"
                    className="block text-xs font-black uppercase tracking-[0.18em] text-stone-500"
                  >
                    Username
                  </label>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      id="blundr-profile-username"
                      value={usernameDraft}
                      onChange={(event) => {
                        setUsernameDraft(event.target.value);
                        setSaveMessage(null);
                      }}
                      autoCapitalize="none"
                      autoComplete="username"
                      spellCheck={false}
                      aria-invalid={!usernameValidation.ok}
                      aria-describedby="blundr-profile-username-status"
                      className="min-h-11 min-w-0 flex-1 rounded-xl border border-stone-200 px-3 text-sm font-bold outline-none focus:border-green-700"
                    />
                    <button
                      type="button"
                      onClick={() => void saveUsername()}
                      disabled={
                        saving || !usernameValidation.ok || !usernameChanged
                      }
                      className="min-h-11 rounded-xl bg-green-800 px-4 text-sm font-black text-white shadow-sm disabled:bg-stone-400 disabled:opacity-70"
                    >
                      {saving ? "Saving…" : "Save username"}
                    </button>
                  </div>
                  <div className={styles.usernameStatus}>
                    {saveMessage === "Blundr username saved." ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-green-700">
                        <CheckCircle2 size={14} />
                        Saved
                      </span>
                    ) : null}
                    <p
                      id="blundr-profile-username-status"
                      role="status"
                      className={`text-xs leading-5 ${
                        usernameValidation.ok ? "text-stone-500" : "text-red-700"
                      }`}
                    >
                      {saveMessage ??
                        (usernameValidation.ok
                          ? "3–24 characters · lowercase letters, numbers or underscores."
                          : "message" in usernameValidation
                            ? usernameValidation.message
                            : "Choose a valid username.")}
                    </p>
                  </div>
                </div>
              ) : null}
            </header>

            {loadError ? (
              <section className={styles.panel}>
                <h2 className="text-lg font-black">Profile unavailable</h2>
                <p className="mt-2 text-sm text-stone-600">{loadError}</p>
                <button
                  type="button"
                  onClick={() => setLoadAttempt((value) => value + 1)}
                  className="mt-4 min-h-11 rounded-xl bg-green-800 px-4 font-semibold text-white"
                >
                  Try again
                </button>
              </section>
            ) : null}
          </div>

          <aside className={styles.profileAside}>
            <section className={styles.panel}>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-green-700">
                <ShieldCheck size={15} />
                Private account
              </div>
              <div className="mt-3 text-sm font-black text-stone-950">
                {auth.session?.email || "Private account email"}
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Your email is used for sign-in and account recovery. It is not
                shown as your public Blundr identity.
              </p>
            </section>

            <Link href="/settings" className={styles.settingsLink}>
              <Settings2 size={17} />
              Account and training settings
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

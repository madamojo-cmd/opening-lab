"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { ProfileSummaryCard } from "@/components/profile/ProfileSummaryCard";
import { BlundrCard, BlundrStateCard } from "@/components/blundr/ui";
import { ProfileSettingsIcon } from "@/components/navigation/ProfileSettingsIcon";
import { loadDailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingService";
import { reconcileDailyBlundrRingCompletionForToday } from "@/lib/blundr/daily-rings/dailyRingBlundrReconciliation";
import { BLUNDR_DAILY_RING_REFRESH_EVENT } from "@/lib/blundr/daily-rings/dailyRingRefreshSignal";
import { buildAccountSettingsSnapshot, loadBlundrSettingsAuthSession, type BlundrSettingsAccountSnapshot } from "@/lib/blundr/settings/accountSettingsState";
import { loadRepertoireProgress } from "@/lib/blundr/repertoire/repertoireProgressService";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import { getLocalStreakRecord } from "@/lib/blundr/accounts/localAccountStorage";
import type { StreakRecord } from "@/lib/blundr/accounts/accountTypes";
import type { DailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingTypes";

type ProfileSnapshot = {
  account: BlundrSettingsAccountSnapshot;
  repertoire: RepertoireProgress;
  streak: StreakRecord | null;
};

function loadProfileSnapshot(account: BlundrSettingsAccountSnapshot): ProfileSnapshot {
  return {
    account,
    repertoire: loadRepertoireProgress({ userId: account.currentUserId }),
    streak: getLocalStreakRecord(account.currentUserId),
  };
}

export function ProfilePage() {
  const [snapshot, setSnapshot] = useState<ProfileSnapshot | null>(null);
  const [dailyRingSnapshot, setDailyRingSnapshot] = useState<DailyRingSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const refreshInitialSnapshot = async () => {
      const session = await loadBlundrSettingsAuthSession().catch(() => null);
      const account = buildAccountSettingsSnapshot({
        authSession: session,
        storage: typeof window === "undefined" ? null : window.localStorage,
      });
      try {
        await reconcileDailyBlundrRingCompletionForToday({ userId: account.currentUserId });
      } catch {
        // Profile remains usable even if reconciliation fails.
      }
      if (cancelled) return;
      setSnapshot(loadProfileSnapshot(account));
      setDailyRingSnapshot(loadDailyRingSnapshot({ userId: account.currentUserId, profile: account.profile }));
      setLoading(false);
    };
    void refreshInitialSnapshot();
    if (typeof window === "undefined") return;
    const handleRefresh = () => { void refreshInitialSnapshot(); };
    const handleFocus = () => { void refreshInitialSnapshot(); };
    window.addEventListener("storage", handleRefresh);
    window.addEventListener(BLUNDR_DAILY_RING_REFRESH_EVENT, handleRefresh);
    window.addEventListener("focus", handleFocus);
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void refreshInitialSnapshot();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener(BLUNDR_DAILY_RING_REFRESH_EVENT, handleRefresh);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  if (!snapshot || loading) {
    return (
      <main className="blundr-page-bg min-h-screen px-4 py-5 text-stone-950">
        <div className="mx-auto max-w-md">
          <header className="mb-4 flex items-start justify-between gap-3 rounded-[1.75rem] border border-stone-200 bg-white p-4 shadow-sm">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Profile</div>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-stone-950">Loading your training profile.</h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">Blundr is checking local account and repertoire state.</p>
            </div>
            <ProfileSettingsIcon />
          </header>
          <BlundrStateCard kind="loading" eyebrow="Profile" title="Loading your training profile." copy="Blundr is checking local account and repertoire state." />
        </div>
      </main>
    );
  }

  return (
    <main className="blundr-page-bg min-h-screen px-4 py-5 text-stone-950">
      <div className="mx-auto max-w-md space-y-4 pb-28">
        <BlundrCard as="header">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-green-700">Profile</div>
              <h1 className="mt-2 text-3xl font-black tracking-tight">Your Blundr training profile</h1>
              <p className="mt-2 text-sm leading-6 text-stone-600">Identity, daily plan, streak, repertoire, and account status in one compact place.</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link href="/" className="rounded-2xl bg-stone-100 p-3 text-stone-600 shadow-sm" aria-label="Back to home"><ArrowLeft size={18} /></Link>
              <ProfileSettingsIcon />
            </div>
          </div>
        </BlundrCard>
        <ProfileSummaryCard accountLabel={snapshot.account.accountStatusLabel} email={snapshot.account.email} profile={snapshot.account.profile} repertoire={snapshot.repertoire} streak={snapshot.streak} dailyRingSnapshot={dailyRingSnapshot} />
      </div>
    </main>
  );
}

import { Battery, BookOpen, Check, Cloud, Flame, RotateCcw, Target, UserCircle2, Zap } from "lucide-react";
import { BlundrButton, BlundrCard, BlundrChip, SettingsRow, StatsStrip } from "@/components/blundr/ui";
import type { DailyRingSnapshot } from "@/lib/blundr/daily-rings/dailyRingTypes";
import type { RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import type { UserTrainingProfile } from "@/lib/blundr/accounts/accountTypes";

type ProfileSummaryCardProps = {
  accountLabel: string;
  email?: string | null;
  profile: UserTrainingProfile;
  repertoire: RepertoireProgress;
  streak: { currentStreakDays?: number; longestStreakDays?: number; totalAllRingsClosedDays?: number; currentStreak?: number; longestStreak?: number } | null;
  dailyRingSnapshot?: DailyRingSnapshot | null;
};

export function ProfileSummaryCard({ accountLabel, email, profile, repertoire, streak, dailyRingSnapshot }: ProfileSummaryCardProps) {
  const currentStreak = Math.max(0, Number(streak?.currentStreakDays ?? streak?.currentStreak) || 0);
  const longestStreak = Math.max(0, Number(streak?.longestStreakDays ?? streak?.longestStreak) || 0);
  const allRingDays = Math.max(0, Number(streak?.totalAllRingsClosedDays) || 0);
  const rows = [
    { label: "Tempo", value: dailyRingSnapshot?.tempo ? `${dailyRingSnapshot.tempo.current}/${dailyRingSnapshot.tempo.target} reps` : `0/${profile.dailyTempoGoal} reps`, icon: <Zap size={12} />, done: Boolean(dailyRingSnapshot?.tempo?.complete) },
    { label: "Battery", value: dailyRingSnapshot?.battery ? `${dailyRingSnapshot.battery.current}/${dailyRingSnapshot.battery.target} positions` : `0/${profile.dailyBatteryGoal} positions`, icon: <Battery size={12} />, done: Boolean(dailyRingSnapshot?.battery?.complete) },
    { label: "Blundr", value: dailyRingSnapshot?.blundr ? `${dailyRingSnapshot.blundr.current}/${dailyRingSnapshot.blundr.target} session` : `0/${profile.dailyBlundrGoal} session`, icon: <RotateCcw size={12} />, done: Boolean(dailyRingSnapshot?.blundr?.complete) },
  ];
  return (
    <div className="space-y-3">
      <BlundrCard><div className="flex items-start gap-3"><div className="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-2xl bg-[#ebf5ef] text-[#2e6b4f]"><UserCircle2 size={24} /></div><div className="min-w-0 flex-1"><BlundrChip tone={profile.onboardingCompleted ? "green" : "gold"}>{profile.onboardingCompleted ? "Training profile" : "Setup open"}</BlundrChip><h1 className="mt-2 text-base font-bold text-stone-950">{accountLabel}</h1><p className="mt-1 text-sm leading-6 text-stone-600">{email ? email : "Local demo profile"} keeps your daily plan, starter pack, and board preferences on this device.</p></div></div></BlundrCard>
      <BlundrCard><div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">Your daily plan</div><p className="-mt-1 mb-3 text-xs leading-5 text-stone-500">Close Tempo, Battery, and Blundr to complete today.</p><div className="space-y-2.5">{rows.map((row) => <div key={row.label} className="flex items-center justify-between gap-3"><div className="flex items-center gap-2.5"><div className={row.done ? "flex h-6 w-6 items-center justify-center rounded-full bg-[#ebf5ef] text-[#2e6b4f]" : "flex h-6 w-6 items-center justify-center rounded-full bg-stone-100 text-stone-500"}>{row.icon}</div><span className="text-sm font-medium text-stone-950">{row.label}</span></div><div className="flex items-center gap-2"><span className="text-xs text-stone-500">{row.value}</span>{row.done ? <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2e6b4f] text-white"><Check size={9} strokeWidth={3} /></span> : <span className="h-4 w-4 rounded-full border border-stone-200" />}</div></div>)}</div><BlundrButton href="/train" fullWidth className="mt-4">Continue training</BlundrButton></BlundrCard>
      <BlundrCard><div className="mb-3 flex items-center gap-1.5"><Flame size={13} className="text-[#b8923a]" /><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">Streak</div></div><StatsStrip compact items={[{ label: "Current", value: currentStreak, helper: "days", tone: "gold" }, { label: "Longest", value: longestStreak, helper: "days" }, { label: "All rings", value: allRingDays, helper: "days", tone: "green" }]} /><p className="mt-3 text-xs leading-5 text-stone-500">Keep closing all three rings to build consistency.</p></BlundrCard>
      <BlundrCard><div className="mb-3 flex items-center gap-1.5"><BookOpen size={13} className="text-[#2e6b4f]" /><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">Repertoire</div></div><StatsStrip compact items={[{ label: "Unlocked", value: repertoire.unlockedOpeningIds.length, helper: "openings" }, { label: "Points", value: repertoire.availablePoints, helper: "available" }, { label: "Next", value: repertoire.nextUnlockCost || "Ready", helper: "unlock", tone: "green" }]} /><BlundrButton href="/repertoire" fullWidth variant="secondary" className="mt-4">View repertoire</BlundrButton></BlundrCard>
      <BlundrCard><div className="mb-3 flex items-center gap-1.5"><Target size={13} className="text-[#2e6b4f]" /><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">Training profile</div></div><div className="space-y-2"><SettingsRow label="Chess rating / Elo" value={profile.rawRating ? String(profile.rawRating) : profile.ratingBandId.replace(/_/g, " ")} /><SettingsRow label="Starter pack" value={profile.selectedStarterPackId?.replace(/_/g, " ") ?? "Not chosen"} /><SettingsRow label="Preferred mode" value={profile.preferredTrainingMode?.replace(/_/g, " ") ?? "Assisted first"} /><SettingsRow label="Account status" value={email ? "Signed in" : "Local demo"} /></div><BlundrButton href="/settings?section=training" fullWidth variant="secondary" className="mt-4">Edit training settings</BlundrButton></BlundrCard>
      <BlundrCard><div className="mb-3 flex items-center gap-1.5"><Cloud size={13} className="text-[#2e6b4f]" /><div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">{email ? "Account" : "Save your progress"}</div></div><p className="text-sm leading-6 text-stone-600">{email ? "Signed in and ready to sync progress when account services are available." : "Create an account to keep your repertoire, streaks, and review queue across devices."}</p><BlundrButton href="/settings?section=account" fullWidth variant="secondary" className="mt-4">{email ? "Manage account" : "Create account"}</BlundrButton></BlundrCard>
    </div>
  );
}

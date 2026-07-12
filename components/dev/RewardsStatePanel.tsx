import type { ReactNode } from "react";
import { BookOpen, Clock3, Gift, KeyRound, RefreshCw, ShieldCheck, Target, Trophy } from "lucide-react";
import { BlundrCard, BlundrChip, StatsStrip } from "@/components/blundr/ui";
import type { RewardsDebugSnapshot } from "./rewardsDebugTypes";

type RewardsStatePanelProps = {
  snapshot: RewardsDebugSnapshot;
  onRefresh: () => void;
};

function formatCount(value: number): string {
  return String(Math.max(0, Math.floor(Number(value) || 0)));
}

function lineItems(values: readonly string[]): ReactNode {
  if (!values.length) return <div className="text-sm leading-6 text-stone-500">None yet.</div>;
  return (
    <ul className="space-y-1 text-sm leading-6 text-stone-700">
      {values.map((value, index) => (
        <li key={`${index}:${value}`} className="truncate">
          {value}
        </li>
      ))}
    </ul>
  );
}

export function RewardsStatePanel({ snapshot, onRefresh }: RewardsStatePanelProps) {
  const { daily, repertoire, rewardHistory, rewardInventory, streak } = snapshot;
  const recentRewardGrants = snapshot.recentRewardGrantSummary;
  const recentRewardRolls = snapshot.recentRewardRollSummary;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Current reward state</div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-stone-950">Inventory, points, rings, and streaks</h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm ring-1 ring-stone-200 transition active:scale-[0.985]"
        >
          <RefreshCw size={15} />
          Refresh state
        </button>
      </div>

      <BlundrCard className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <BlundrChip tone="stone" icon={<ShieldCheck size={13} />}>
            {snapshot.userId}
          </BlundrChip>
          <BlundrChip tone="green" icon={<Clock3 size={13} />}>
            {daily.localDate}
          </BlundrChip>
          <BlundrChip tone={snapshot.pendingPopupLabel ? "gold" : "stone"} icon={<Trophy size={13} />}>
            {snapshot.pendingPopupLabel ?? "No pending popup"}
          </BlundrChip>
        </div>

        <StatsStrip
          compact
          items={[
            { label: "Tempo", value: `${daily.tempo.current}/${daily.tempo.target}`, helper: daily.tempo.complete ? "Complete" : "In progress", icon: <BookOpen size={11} />, tone: daily.tempo.complete ? "green" : "stone" },
            { label: "Battery", value: `${daily.battery.current}/${daily.battery.target}`, helper: daily.battery.complete ? "Complete" : "In progress", icon: <Target size={11} />, tone: daily.battery.complete ? "gold" : "stone" },
            { label: "Blundr", value: `${daily.blundr.current}/${daily.blundr.target}`, helper: daily.blundr.complete ? "Complete" : "In progress", icon: <Gift size={11} />, tone: daily.blundr.complete ? "green" : "stone" },
            { label: "Streak", value: streak?.currentStreak ?? 0, helper: `Best ${streak?.longestStreak ?? 0}`, icon: <Trophy size={11} />, tone: "green" },
          ]}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#fbfcf7] p-3 ring-1 ring-stone-100">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Repertoire</div>
            <div className="mt-2 text-sm font-black text-stone-950">{formatCount(repertoire.availablePoints)} points available</div>
            <div className="mt-1 text-sm leading-6 text-stone-600">
              {repertoire.unlockedOpeningIds.length} unlocked • next unlock costs {repertoire.nextUnlockCost}
            </div>
            <div className="mt-2 text-xs font-semibold text-stone-500">
              Lifetime {repertoire.lifetimePoints} • Spent {repertoire.spentPoints}
            </div>
          </div>

          <div className="rounded-2xl bg-[#fbfcf7] p-3 ring-1 ring-stone-100">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Reward inventory</div>
            <div className="mt-2 text-sm font-black text-stone-950">
              {rewardInventory.openingFragments} fragments • {rewardInventory.choiceTokens} tokens
            </div>
            <div className="mt-1 text-sm leading-6 text-stone-600">
              {rewardInventory.availableFragmentUnlockCredits} fragment unlock credit{rewardInventory.availableFragmentUnlockCredits === 1 ? "" : "s"} available.
            </div>
            <div className="mt-2 text-xs font-semibold text-stone-500">
              Applied reward ids {formatCount(snapshot.appliedRewardIdsCount)} • reward rolls {formatCount(snapshot.rewardRolls.length)}
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-3 ring-1 ring-stone-200">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Recent reward grants</div>
            <div className="mt-2">{lineItems(recentRewardGrants)}</div>
          </div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-stone-200">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Recent reward rolls</div>
            <div className="mt-2">{lineItems(recentRewardRolls)}</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-3 ring-1 ring-stone-200">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Daily rings</div>
            <div className="mt-2 space-y-1 text-sm leading-6 text-stone-700">
              <div>Tempo {daily.tempo.current}/{daily.tempo.target} {daily.tempo.complete ? "complete" : "open"}</div>
              <div>Battery {daily.battery.current}/{daily.battery.target} {daily.battery.complete ? "complete" : "open"}</div>
              <div>Blundr {daily.blundr.current}/{daily.blundr.target} {daily.blundr.complete ? "complete" : "open"}</div>
              <div>All rings closed: {daily.allComplete ? "yes" : "no"}</div>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-3 ring-1 ring-stone-200">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Tempo Cache</div>
            <div className="mt-2 space-y-1 text-sm leading-6 text-stone-700">
              <div>State: {snapshot.tempoCacheState}</div>
              <div>Reward history entries: {rewardHistory.appliedRewardIds.length}</div>
              <div>Last random bonus date: {rewardHistory.lastRandomRewardLocalDate ?? "none"}</div>
              <div>Pity counter: {rewardHistory.allRingsDaysSinceRandomReward}</div>
            </div>
          </div>
        </div>
      </BlundrCard>
    </section>
  );
}

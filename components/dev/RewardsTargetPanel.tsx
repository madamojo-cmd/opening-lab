import { Cloud, ShieldCheck, UserCircle2 } from "lucide-react";
import { BlundrCard, BlundrChip } from "@/components/blundr/ui";
import type { RewardsPersistenceTarget } from "@/lib/blundr/rewards/rewardTargetModel";

type RewardsTargetPanelProps = {
  target: RewardsPersistenceTarget;
};

export function RewardsTargetPanel({ target }: RewardsTargetPanelProps) {
  return (
    <section className="space-y-3">
      <div>
        <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Reward target</div>
        <h2 className="mt-1 text-xl font-black tracking-tight text-stone-950">Where rewards will write</h2>
      </div>

      <BlundrCard className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <BlundrChip tone={target.isAuthenticatedShared ? "green" : "stone"} icon={<ShieldCheck size={13} />}>
            {target.targetMode === "authenticatedShared" ? "Authenticated shared" : "Local only"}
          </BlundrChip>
          <BlundrChip tone="stone" icon={<Cloud size={13} />}>
            {target.storageModeSetting}
          </BlundrChip>
          <BlundrChip tone="stone" icon={<Cloud size={13} />}>
            {target.backendMode}
          </BlundrChip>
          <BlundrChip tone="stone" icon={<UserCircle2 size={13} />}>
            {target.currentUserId || "Unknown user"}
          </BlundrChip>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-[#fbfcf7] p-3 ring-1 ring-stone-100">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Target mode</div>
            <div className="mt-2 text-sm font-black text-stone-950">{target.targetMode}</div>
            <p className="mt-1 text-sm leading-6 text-stone-600">{target.confirmation}</p>
          </div>
          <div className="rounded-2xl bg-[#fbfcf7] p-3 ring-1 ring-stone-100">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Remote sync</div>
            <div className="mt-2 text-sm font-black text-stone-950">{target.remoteSyncEnabled ? "Enabled" : "Disabled"}</div>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              {target.currentUserEmail ? `Signed in as ${target.currentUserEmail}` : target.warning}
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-stone-50 p-3 text-sm leading-6 text-stone-600 ring-1 ring-stone-200">
          <div className="font-black uppercase tracking-[0.18em] text-stone-500">Safety note</div>
          <p className="mt-2">{target.isAuthenticatedShared ? target.confirmation : target.warning}</p>
        </div>
      </BlundrCard>
    </section>
  );
}

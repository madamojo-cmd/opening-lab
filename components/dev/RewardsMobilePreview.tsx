import type { ReactNode } from "react";
import { BookOpen, Gift, KeyRound, Trophy } from "lucide-react";
import { BlundrChip, StatsStrip, BlundrStateCard } from "@/components/blundr/ui";
import { RewardRevealCard } from "@/components/rewards/RewardRevealCard";
import { TempoCacheDeckPopup } from "@/components/rewards/popups/TempoCacheDeckPopup";
import { MilestonePopup } from "@/components/rewards/popups/MilestonePopup";
import { adaptRewardGrantToPresentation } from "@/lib/blundr/rewards/rewardPresentationAdapter";
import { BLUNDR_EMPTY_STATE_ASSETS } from "@/lib/blundr/assets/blundrAssetManifest";
import type { RewardRoll } from "@/lib/blundr/accounts/accountTypes";
import type { RewardGrantRecord } from "@/lib/blundr/rewards/rewardTypes";
import type { RewardsDebugSnapshot, RewardsMockGrant, RewardsPreviewKind } from "./rewardsDebugTypes";

type RewardsMobilePreviewProps = {
  snapshot: RewardsDebugSnapshot;
  preview: RewardsPreviewKind;
};

function buildGrantFromRewardType(input: {
  id: string;
  rarity: RewardGrantRecord["rarity"];
  rewardType: string;
  amount: number;
  title: string;
  description: string;
}): RewardsMockGrant {
  return {
    id: input.id,
    rewardId: input.id,
    rewardRollId: input.id,
    trigger: "weekly_cache",
    triggerEventId: input.id,
    rarity: input.rarity,
    rewardType: input.rewardType,
    amount: input.amount,
    displayName: input.title,
    description: input.description,
    pointsApplied: input.rewardType === "unlock_points" ? input.amount : 0,
    applied: true,
    pendingChoice: input.rewardType === "choice_token",
    grantMode: "guaranteed_cache",
    createdAt: new Date().toISOString(),
  };
}

function buildFallbackGrant(snapshot: RewardsDebugSnapshot): RewardsMockGrant {
  const lastRoll = [...snapshot.rewardRolls].reverse().find((roll) => roll.reward) ?? null;
  if (lastRoll?.reward) {
    return buildGrantFromRewardType({
      id: `${lastRoll.id}:grant`,
      rarity: lastRoll.reward.rarity,
      rewardType: lastRoll.reward.rewardType,
      amount: Math.max(0, Number(lastRoll.reward.amount) || 0),
      title: lastRoll.reward.displayName,
      description: lastRoll.reward.description,
    });
  }
  return buildGrantFromRewardType({
    id: "dev-preview:reward",
    rarity: "common",
    rewardType: "unlock_points",
    amount: 10,
    title: "Reward preview",
    description: "A representative reward preview for the QA page.",
  });
}

function previewSummary(snapshot: RewardsDebugSnapshot): ReactNode {
  return (
    <StatsStrip
      compact
      items={[
        { label: "Tempo", value: `${snapshot.daily.tempo.current}/${snapshot.daily.tempo.target}`, icon: <BookOpen size={11} />, tone: snapshot.daily.tempo.complete ? "green" : "stone" },
        { label: "Battery", value: `${snapshot.daily.battery.current}/${snapshot.daily.battery.target}`, icon: <TargetIcon />, tone: snapshot.daily.battery.complete ? "gold" : "stone" },
        { label: "Blundr", value: `${snapshot.daily.blundr.current}/${snapshot.daily.blundr.target}`, icon: <Gift size={11} />, tone: snapshot.daily.blundr.complete ? "green" : "stone" },
      ]}
    />
  );
}

function TargetIcon() {
  return <Trophy size={11} />;
}

export function RewardsMobilePreview({ snapshot, preview }: RewardsMobilePreviewProps) {
  const previewNode = (() => {
    if (preview.kind === "reward") {
      return (
        <div className="h-full w-full overflow-y-auto bg-stone-950/35 p-3">
          <RewardRevealCard
            grant={buildGrantFromRewardType({
              id: `preview:${preview.kind}:${preview.rarity}:${preview.rewardType}`,
              rarity: preview.rarity,
              rewardType: preview.rewardType,
              amount: preview.amount,
              title: preview.title,
              description: preview.description,
            })}
            compact
          />
        </div>
      );
    }

    if (preview.kind === "tempo_cache") {
      return <TempoCacheDeckPopup reward={adaptRewardGrantToPresentation(buildFallbackGrant(snapshot))} reducedMotion={false} onDismiss={() => undefined} />;
    }

    if (preview.kind === "streak") {
      return <MilestonePopup title={preview.title} description={preview.description} onDismiss={() => undefined} />;
    }

  if (preview.kind === "opening_unlock") {
      return (
        <div className="flex h-full w-full items-center justify-center bg-stone-950/35 p-4">
          <BlundrStateCard
            kind="success"
            asset={BLUNDR_EMPTY_STATE_ASSETS.emptyRepertoire}
            eyebrow="Opening unlock"
            title="Opening unlocked"
            copy={preview.description}
            cta={preview.openingId ? { label: `Selected: ${preview.openingId}` } : undefined}
          />
        </div>
      );
    }

    if (preview.kind === "unlock_success") {
      return (
        <div className="flex h-full w-full items-center justify-center bg-stone-950/35 p-4">
          <BlundrStateCard
            kind="success"
            asset={BLUNDR_EMPTY_STATE_ASSETS.emptyRepertoire}
            eyebrow="Unlock success"
            title={preview.openingName}
            copy={`${preview.methodLabel}. ${preview.before.points} → ${preview.after.points} points, ${preview.before.fragments} → ${preview.after.fragments} fragments, ${preview.before.tokens} → ${preview.after.tokens} tokens.`}
            cta={{ label: preview.openingId }}
          />
        </div>
      );
    }

    if (preview.kind === "failure") {
      return (
        <div className="flex h-full w-full items-center justify-center bg-stone-950/35 p-4">
          <BlundrStateCard
            kind="error"
            asset={BLUNDR_EMPTY_STATE_ASSETS.emptyRepertoire}
            eyebrow={preview.code}
            title={preview.title}
            copy={preview.message}
          />
        </div>
      );
    }

    if (preview.kind === "admin_grant") {
      return (
        <div className="flex h-full w-full items-center justify-center bg-stone-950/35 p-4">
          <BlundrStateCard
            kind={preview.success ? "success" : "error"}
            asset={BLUNDR_EMPTY_STATE_ASSETS.emptyRepertoire}
            eyebrow="Admin grant"
            title={preview.success ? preview.title : "Admin grant failed"}
            copy={`${preview.beforeSummary} → ${preview.afterSummary}`}
            cta={{ label: preview.targetUserId }}
          />
        </div>
      );
    }

    const fallbackGrant = buildFallbackGrant(snapshot);
    return (
      <div className="h-full w-full overflow-y-auto bg-stone-950/35 p-3">
        <RewardRevealCard grant={fallbackGrant} compact />
      </div>
    );
  })();

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Mobile preview</div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-stone-950">390px app-frame preview</h2>
        </div>
        <div className="flex items-center gap-2">
          <BlundrChip tone="green" icon={<Gift size={13} />}>
            {snapshot.rewardInventory.openingFragments} fragments
          </BlundrChip>
          <BlundrChip tone="gold" icon={<KeyRound size={13} />}>
            {snapshot.rewardInventory.choiceTokens} tokens
          </BlundrChip>
        </div>
      </div>

      <div
        className="relative w-full max-w-[390px] overflow-hidden rounded-[2rem] border border-stone-200 bg-[#f7f7f4] shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
        style={{ aspectRatio: "390 / 844" }}
      >
        <div className="absolute inset-0 flex flex-col gap-3 p-3">
          {previewSummary(snapshot)}
          <div className="grid grid-cols-3 gap-2 text-[11px] font-semibold text-stone-600">
            <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-stone-200">Streak {snapshot.streak?.currentStreak ?? 0}</div>
            <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-stone-200">Rewards {snapshot.rewardHistory.appliedRewardIds.length}</div>
            <div className="rounded-2xl bg-white px-3 py-2 ring-1 ring-stone-200">Rings {snapshot.daily.allComplete ? "3/3" : "open"}</div>
          </div>
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-[1.5rem] border border-stone-200 bg-white shadow-sm">
            {previewNode}
          </div>
          <div className="rounded-[1.25rem] bg-white px-3 py-3 ring-1 ring-stone-200">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Recent reward card</div>
            <div className="mt-1 text-sm leading-6 text-stone-600">
              {snapshot.recentRewardGrantSummary[0] ?? "No reward grant yet. Use the triggers to add one."}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

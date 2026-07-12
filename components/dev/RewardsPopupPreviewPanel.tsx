import { BlundrButton, BlundrCard, BlundrChip } from "@/components/blundr/ui";
import type { RewardsPreviewKind } from "./rewardsDebugTypes";

type RewardsPopupPreviewPanelProps = {
  selectedOpeningId: string | null;
  currentStreakDays: number;
  onPreview: (previewId: string, preview: RewardsPreviewKind) => void;
  onClearPreview: () => void;
};

const rewardPreviewButtons: Array<{
  id: string;
  label: string;
  preview: RewardsPreviewKind;
}> = [
  {
    id: "reward_popup_common",
    label: "Show Reward Popup: common",
    preview: {
      kind: "reward",
      title: "Common reward",
      rarity: "common",
      rewardType: "unlock_points",
      amount: 10,
      description: "A normal point grant preview.",
    },
  },
  {
    id: "reward_popup_uncommon",
    label: "Show Reward Popup: uncommon",
    preview: {
      kind: "reward",
      title: "Uncommon reward",
      rarity: "uncommon",
      rewardType: "opening_fragment",
      amount: 1,
      description: "Opening fragment added to inventory.",
    },
  },
  {
    id: "reward_popup_rare",
    label: "Show Reward Popup: rare",
    preview: {
      kind: "reward",
      title: "Rare reward",
      rarity: "rare",
      rewardType: "choice_token",
      amount: 1,
      description: "Choice token added to inventory.",
    },
  },
  {
    id: "reward_popup_epic",
    label: "Show Reward Popup: epic",
    preview: {
      kind: "reward",
      title: "Epic reward",
      rarity: "epic",
      rewardType: "unlock_points",
      amount: 100,
      description: "Large repertoire point bonus.",
    },
  },
  {
    id: "opening_fragment_reward",
    label: "Show Opening Fragment Reward",
    preview: {
      kind: "reward",
      title: "Opening Fragment",
      rarity: "uncommon",
      rewardType: "opening_fragment",
      amount: 1,
      description: "Collect 3 to choose a new opening.",
    },
  },
  {
    id: "choice_token_reward",
    label: "Show Choice Token Reward",
    preview: {
      kind: "reward",
      title: "Choice Token",
      rarity: "rare",
      rewardType: "choice_token",
      amount: 1,
      description: "Choose one locked opening to unlock.",
    },
  },
  {
    id: "epic_bonus_reward",
    label: "Show Epic Bonus Reward",
    preview: {
      kind: "reward",
      title: "Epic Bonus",
      rarity: "epic",
      rewardType: "unlock_points",
      amount: 100,
      description: "Epic bonus applied as repertoire points.",
    },
  },
  {
    id: "repertoire_points_reward",
    label: "Show Repertoire Points Reward",
    preview: {
      kind: "reward",
      title: "Repertoire Points",
      rarity: "common",
      rewardType: "unlock_points",
      amount: 25,
      description: "A steady progress grant for training.",
    },
  },
] as const;

const tempoCacheButtons: Array<{
  id: string;
  label: string;
  preview: RewardsPreviewKind;
}> = [
  {
    id: "tempo_cache_closed",
    label: "Show Tempo Cache closed",
    preview: {
      kind: "tempo_cache",
      title: "Tempo Cache closed",
      variant: "C",
      description: "Preview the unopened state.",
    },
  },
  {
    id: "tempo_cache_opening",
    label: "Show Tempo Cache opening",
    preview: {
      kind: "tempo_cache",
      title: "Tempo Cache opening",
      variant: "A",
      description: "Preview the opening state.",
    },
  },
  {
    id: "tempo_cache_opened",
    label: "Show Tempo Cache opened",
    preview: {
      kind: "tempo_cache",
      title: "Tempo Cache opened",
      variant: "B",
      description: "Preview the reward revealed state.",
    },
  },
] as const;

const reviewStateButtons: Array<{
  id: string;
  label: string;
  preview: RewardsPreviewKind;
}> = [
  {
    id: "unlock_success_preview",
    label: "Show Unlock Success",
    preview: {
      kind: "unlock_success",
      title: "Opening unlocked",
      openingId: "preview-opening-id",
      openingName: "Preview opening",
      methodLabel: "Repertoire Points",
      before: { points: 50, fragments: 2, tokens: 1 },
      after: { points: 25, fragments: 2, tokens: 1 },
      description: "Preview the selected opening unlock success state.",
    },
  },
  {
    id: "shared_sync_failed_preview",
    label: "Show Shared Sync Failed",
    preview: {
      kind: "failure",
      title: "Shared reward persistence failed",
      code: "shared_sync_failed",
      message: "Shared reward persistence failed. Please retry.",
    },
  },
  {
    id: "generic_reward_failure_preview",
    label: "Show Generic Reward Failure",
    preview: {
      kind: "failure",
      title: "Reward failed",
      code: "reward_failed",
      message: "The reward action could not be completed.",
    },
  },
  {
    id: "admin_grant_success_preview",
    label: "Show Admin Grant Success",
    preview: {
      kind: "admin_grant",
      title: "Admin grant applied",
      success: true,
      targetUserId: "preview-target-user",
      targetEmail: "target@example.com",
      grantType: "opening_fragment",
      amount: 1,
      reason: "QA preview",
      auditId: "preview-audit-id",
      beforeSummary: "fragments=0, tokens=0",
      afterSummary: "fragments=1, tokens=0",
      description: "Preview a successful admin grant.",
    },
  },
  {
    id: "admin_grant_failure_preview",
    label: "Show Admin Grant Failure",
    preview: {
      kind: "admin_grant",
      title: "Admin grant failed",
      success: false,
      targetUserId: "preview-target-user",
      targetEmail: "target@example.com",
      grantType: "opening_fragment",
      amount: 1,
      reason: "QA preview",
      beforeSummary: "fragments=0, tokens=0",
      afterSummary: "No storage change",
      description: "Preview a failed admin grant.",
    },
  },
] as const;

export function RewardsPopupPreviewPanel({ selectedOpeningId, currentStreakDays, onPreview, onClearPreview }: RewardsPopupPreviewPanelProps) {
  const streakVariant: "A" | "B" | "C" = currentStreakDays >= 7 ? "B" : currentStreakDays > 0 ? "A" : "C";

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Presentation previews</div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-stone-950">Presentation preview only — no reward granted</h2>
        </div>
        <BlundrChip tone="gold">Preview only</BlundrChip>
      </div>

      <BlundrCard className="space-y-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {rewardPreviewButtons.map((button) => (
            <BlundrButton key={button.id} variant="secondary" fullWidth onClick={() => onPreview(button.id, button.preview)}>
              {button.label}
            </BlundrButton>
          ))}
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {tempoCacheButtons.map((button) => (
            <BlundrButton key={button.id} variant="secondary" fullWidth onClick={() => onPreview(button.id, button.preview)}>
              {button.label}
            </BlundrButton>
          ))}
          <BlundrButton
            variant="secondary"
            fullWidth
            onClick={() =>
              onPreview("streak_popup", {
                kind: "streak",
                title: "Streak Popup",
                variant: streakVariant,
                description: currentStreakDays >= 7 ? "Weekly streak preview." : currentStreakDays > 0 ? "Active streak preview." : "Fresh streak preview.",
              })
            }
          >
            Show Streak Popup
          </BlundrButton>
          <BlundrButton
            variant="secondary"
            fullWidth
            disabled={!selectedOpeningId}
            onClick={() =>
              onPreview("opening_unlock_popup", {
                kind: "opening_unlock",
                title: "Opening unlocked",
                description: selectedOpeningId
                  ? `Spend fragments or a choice token to unlock ${selectedOpeningId}.`
                  : "Select a locked opening first.",
                openingId: selectedOpeningId,
              })
            }
          >
            Show Opening Unlock Popup
          </BlundrButton>
          <BlundrButton variant="ghost" fullWidth onClick={onClearPreview}>
            Clear preview
          </BlundrButton>
        </div>
      </BlundrCard>

      <BlundrCard className="space-y-4">
        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Popup review states</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {reviewStateButtons.map((button) => (
            <BlundrButton key={button.id} variant="secondary" fullWidth onClick={() => onPreview(button.id, button.preview)}>
              {button.label}
            </BlundrButton>
          ))}
        </div>
      </BlundrCard>
    </section>
  );
}

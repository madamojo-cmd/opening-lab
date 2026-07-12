import { ArrowRight, Coins, Gift, KeyRound, Sparkles, Target, Trophy } from "lucide-react";
import { BlundrButton, BlundrCard, BlundrChip } from "@/components/blundr/ui";

export type RewardsTriggerButton = {
  id: string;
  label: string;
  description: string;
  tone?: "primary" | "secondary" | "premium" | "ghost";
};

export const REWARD_TRIGGER_BUTTONS: readonly RewardsTriggerButton[] = [
  { id: "tempo_increment", label: "Trigger Tempo increment", description: "Use the real opening-run bridge.", tone: "primary" },
  { id: "tempo_complete", label: "Trigger Tempo complete", description: "Use the real opening-run completion bridge.", tone: "primary" },
  { id: "battery_increment", label: "Trigger Battery increment", description: "Use the real continuation bridge.", tone: "primary" },
  { id: "battery_complete", label: "Trigger Battery complete", description: "Use the real continuation completion bridge.", tone: "primary" },
  { id: "blundr_increment", label: "Trigger Blundr increment", description: "Use the real Daily Blundr bridge.", tone: "primary" },
  { id: "blundr_complete", label: "Trigger Blundr complete", description: "Use the real Daily Blundr completion bridge.", tone: "primary" },
  { id: "all_rings_celebration", label: "Trigger all-three-rings-complete celebration", description: "Run the full all-rings celebration flow.", tone: "premium" },
  { id: "reward_popup_common", label: "Show Reward Popup: common", description: "Preview a common reward reveal.", tone: "secondary" },
  { id: "reward_popup_uncommon", label: "Show Reward Popup: uncommon", description: "Preview an uncommon reward reveal.", tone: "secondary" },
  { id: "reward_popup_rare", label: "Show Reward Popup: rare", description: "Preview a rare reward reveal.", tone: "secondary" },
  { id: "reward_popup_epic", label: "Show Reward Popup: epic", description: "Preview an epic reward reveal.", tone: "premium" },
  { id: "opening_fragment_reward", label: "Show Opening Fragment Reward", description: "Preview the fragment reward card.", tone: "secondary" },
  { id: "choice_token_reward", label: "Show Choice Token Reward", description: "Preview the choice token reward card.", tone: "secondary" },
  { id: "epic_bonus_reward", label: "Show Epic Bonus Reward", description: "Preview the epic bonus reward card.", tone: "premium" },
  { id: "repertoire_points_reward", label: "Show Repertoire Points Reward", description: "Preview a point grant reveal.", tone: "secondary" },
  { id: "opening_unlock_popup", label: "Show Opening Unlock Popup", description: "Preview the opening unlock confirmation.", tone: "secondary" },
  { id: "tempo_cache_closed", label: "Show Tempo Cache closed", description: "Preview the closed Tempo Cache state.", tone: "secondary" },
  { id: "tempo_cache_opening", label: "Show Tempo Cache opening", description: "Preview the opening Tempo Cache state.", tone: "secondary" },
  { id: "tempo_cache_opened", label: "Show Tempo Cache opened", description: "Preview the opened Tempo Cache state.", tone: "secondary" },
  { id: "streak_popup", label: "Show Streak Popup", description: "Preview the streak celebration popup.", tone: "secondary" },
  { id: "grant_small_points", label: "Grant small repertoire points", description: "Add a small point award to repertoire.", tone: "primary" },
  { id: "grant_large_points", label: "Grant large repertoire points", description: "Add a large point award to repertoire.", tone: "premium" },
  { id: "grant_opening_fragment", label: "Grant opening fragment", description: "Add one opening fragment.", tone: "secondary" },
  { id: "grant_3_opening_fragments", label: "Grant 3 opening fragments", description: "Add enough fragments to unlock one opening choice.", tone: "secondary" },
  { id: "grant_6_opening_fragments", label: "Grant 6 opening fragments", description: "Add two opening unlock credits worth of fragments.", tone: "secondary" },
  { id: "grant_choice_token", label: "Grant choice token", description: "Add one choice token.", tone: "secondary" },
  { id: "spend_3_fragments", label: "Spend 3 fragments on selected opening", description: "Unlock the selected locked opening.", tone: "primary" },
  { id: "spend_choice_token", label: "Spend choice token on selected opening", description: "Unlock the selected locked opening with a token.", tone: "primary" },
  { id: "grant_epic_bonus", label: "Grant epic bonus", description: "Apply the large point bonus.", tone: "premium" },
  { id: "unlock_next_opening_with_points", label: "Unlock next opening with points", description: "Use repertoire points to unlock the next locked opening.", tone: "primary" },
  { id: "simulate_opening_run_complete", label: "Simulate opening run complete", description: "Run the real opening completion bridge.", tone: "primary" },
  { id: "simulate_continuation_checkmate", label: "Simulate continuation checkmate", description: "Run the real continuation completion bridge.", tone: "primary" },
  { id: "simulate_daily_blundr_complete", label: "Simulate Daily Blundr complete", description: "Run the real Daily Blundr completion bridge.", tone: "primary" },
  { id: "simulate_review_item_complete", label: "Simulate review item complete", description: "Learning event only. No reward grant in MVP.", tone: "ghost" },
  { id: "simulate_review_deck_complete", label: "Simulate review deck complete", description: "Learning event only. No reward grant in MVP.", tone: "ghost" },
  { id: "simulate_minigame_complete", label: "Simulate minigame complete", description: "Learning event only. No reward grant in MVP.", tone: "ghost" },
] as const;

type RewardsTriggerPanelProps = {
  lockedOpeningIds: readonly string[];
  selectedOpeningId: string | null;
  onSelectOpening: (openingId: string) => void;
  onTrigger: (triggerId: string) => void | Promise<void>;
};

function buttonVariant(tone: RewardsTriggerButton["tone"]): "primary" | "secondary" | "premium" | "ghost" {
  if (tone === "premium") return "premium";
  if (tone === "ghost") return "ghost";
  if (tone === "secondary") return "secondary";
  return "primary";
}

export function RewardsTriggerPanel({ lockedOpeningIds, selectedOpeningId, onSelectOpening, onTrigger }: RewardsTriggerPanelProps) {
  const selectedIsLocked = selectedOpeningId ? lockedOpeningIds.includes(selectedOpeningId) : false;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Trigger panels</div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-stone-950">Rewards, points, and learning events</h2>
        </div>
        <BlundrChip tone="stone" icon={<Sparkles size={13} />}>
          {REWARD_TRIGGER_BUTTONS.length} triggers
        </BlundrChip>
      </div>

      <BlundrCard className="space-y-4">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Opening selector</div>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Choose one locked opening, then spend fragments or a token on that exact opening.
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Locked opening</span>
          <select
            value={selectedOpeningId ?? ""}
            onChange={(event) => onSelectOpening(event.target.value)}
            className="min-h-12 rounded-2xl border border-stone-200 bg-white px-3 py-3 text-sm font-semibold text-stone-900 shadow-sm outline-none transition focus:border-green-300"
          >
            <option value="">Choose a locked opening</option>
            {lockedOpeningIds.map((openingId) => (
              <option key={openingId} value={openingId}>
                {openingId}
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl bg-[#fbfcf7] p-3 text-sm leading-6 text-stone-600 ring-1 ring-stone-100">
          {selectedOpeningId ? (
            <>
              Selected <span className="font-black text-stone-900">{selectedOpeningId}</span>.
              {selectedIsLocked ? " It is eligible for fragment and token unlock tests." : " Pick a locked opening to unlock it."}
            </>
          ) : (
            "Select a locked opening before spending fragments or a choice token."
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {REWARD_TRIGGER_BUTTONS.map((button) => {
            const needsOpening = button.id === "spend_3_fragments" || button.id === "spend_choice_token" || button.id === "opening_unlock_popup";
            const disabled = needsOpening && !selectedOpeningId && button.id !== "opening_unlock_popup";
            return (
              <BlundrButton
                key={button.id}
                variant={buttonVariant(button.tone)}
                size="md"
                fullWidth
                disabled={disabled}
                onClick={() => onTrigger(button.id)}
                iconTrailing={<ArrowRight size={14} />}
                className="justify-between text-left"
              >
                <span className="flex min-w-0 flex-col items-start">
                  <span className="truncate">{button.label}</span>
                  <span className="text-[11px] font-medium normal-case tracking-normal opacity-80">{button.description}</span>
                </span>
              </BlundrButton>
            );
          })}
        </div>
      </BlundrCard>
    </section>
  );
}

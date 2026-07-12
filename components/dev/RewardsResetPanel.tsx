import { AlertTriangle, Trash2 } from "lucide-react";
import { BlundrButton, BlundrCard, BlundrChip } from "@/components/blundr/ui";

export type RewardsResetButton = {
  id: string;
  label: string;
  description: string;
  confirmLabel: string;
};

export const REWARD_RESET_BUTTONS: readonly RewardsResetButton[] = [
  {
    id: "reset_dev_reward_state",
    label: "Dev-only: Reset dev reward state",
    description: "Reset the current local account reward state.",
    confirmLabel: "Reset the dev reward state?",
  },
  {
    id: "reset_daily_rings_only",
    label: "Dev-only: Reset daily rings only",
    description: "Reset the current day's Daily Ring progress.",
    confirmLabel: "Reset only the daily rings?",
  },
  {
    id: "reset_streak_only",
    label: "Dev-only: Reset streak only",
    description: "Reset the streak record back to zero.",
    confirmLabel: "Reset the streak record?",
  },
  {
    id: "reset_reward_history_only",
    label: "Dev-only: Reset reward history only",
    description: "Reset the reward history counters.",
    confirmLabel: "Reset reward history only?",
  },
  {
    id: "reset_tempo_cache_only",
    label: "Dev-only: Reset Tempo Cache only",
    description: "Reset reward history and reward rolls for Tempo Cache QA.",
    confirmLabel: "Reset Tempo Cache state?",
  },
  {
    id: "reset_repertoire_unlock_test_data_only",
    label: "Dev-only: Reset repertoire unlock test data only",
    description: "Reset the local repertoire progress to the starter-pack baseline.",
    confirmLabel: "Reset the repertoire unlock test data?",
  },
  {
    id: "reset_opening_fragments_only",
    label: "Dev-only: Reset opening fragments only",
    description: "Clear the opening fragment inventory.",
    confirmLabel: "Reset opening fragments?",
  },
  {
    id: "reset_choice_tokens_only",
    label: "Dev-only: Reset choice tokens only",
    description: "Clear the choice token inventory.",
    confirmLabel: "Reset choice tokens?",
  },
  {
    id: "reset_learning_events_only",
    label: "Dev-only: Reset learning events only",
    description: "Clear the local learning event cache if present.",
    confirmLabel: "Clear learning events?",
  },
] as const;

type RewardsResetPanelProps = {
  onReset: (resetId: string) => void | Promise<void>;
};

export function RewardsResetPanel({ onReset }: RewardsResetPanelProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.22em] text-stone-500">Reset controls</div>
          <h2 className="mt-1 text-xl font-black tracking-tight text-stone-950">Dev-only local resets</h2>
        </div>
        <BlundrChip tone="red" icon={<AlertTriangle size={13} />}>
          Local only
        </BlundrChip>
      </div>

      <BlundrCard className="space-y-3">
        <div className="rounded-2xl bg-red-50 px-3 py-3 text-sm leading-6 text-red-900 ring-1 ring-red-200">
          Every reset below is dev-only and should only mutate the local test account.
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {REWARD_RESET_BUTTONS.map((button) => (
            <BlundrButton
              key={button.id}
              variant="destructive"
              fullWidth
              iconLeading={<Trash2 size={14} />}
              onClick={() => {
                if (typeof window === "undefined") return;
                if (window.confirm(button.confirmLabel)) {
                  void onReset(button.id);
                }
              }}
            >
              <span className="flex min-w-0 flex-col items-start text-left">
                <span className="truncate">{button.label}</span>
                <span className="text-[11px] font-medium normal-case tracking-normal opacity-80">{button.description}</span>
              </span>
            </BlundrButton>
          ))}
        </div>
      </BlundrCard>
    </section>
  );
}

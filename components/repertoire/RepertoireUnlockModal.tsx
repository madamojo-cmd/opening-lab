"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Coins, Gift, KeyRound, ShieldAlert } from "lucide-react";
import { BlundrButton, BlundrChip, BlundrModal } from "@/components/blundr/ui";
import type { RewardInventoryView } from "@/lib/blundr/rewards/rewardInventoryTypes";
import type { RepertoireOpeningCard, RepertoireProgress } from "@/lib/blundr/repertoire/repertoireTypes";
import { getRepertoireUnlockMethodOptions, getRepertoireUnlockMethodTitle, type RepertoireUnlockMethod } from "@/lib/blundr/repertoire/repertoireUnlockFlow";

export type RepertoireUnlockModalConfirmResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

type RepertoireUnlockModalProps = {
  open: boolean;
  card: RepertoireOpeningCard | null;
  progress: RepertoireProgress;
  inventory: RewardInventoryView;
  onClose: () => void;
  onConfirm: (method: RepertoireUnlockMethod, attemptId: string) => Promise<RepertoireUnlockModalConfirmResult>;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function RepertoireUnlockModal({ open, card, progress, inventory, onClose, onConfirm }: RepertoireUnlockModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<RepertoireUnlockMethod>("repertoire_points");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<RepertoireUnlockModalConfirmResult | null>(null);
  const [attemptKey, setAttemptKey] = useState(() => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);

  const methodOptions = useMemo(() => {
    if (!card) return [];
    return getRepertoireUnlockMethodOptions(card, progress, inventory);
  }, [card, progress, inventory]);

  const selectedOption = methodOptions.find((option) => option.method === selectedMethod) ?? methodOptions[0] ?? null;
  const canConfirm = Boolean(selectedOption?.available && !busy && card);

  useEffect(() => {
    if (!open) return;
    const nextOption = methodOptions.find((option) => option.available) ?? methodOptions[0] ?? null;
    setSelectedMethod(nextOption?.method ?? "repertoire_points");
    setFeedback(null);
    setBusy(false);
    setAttemptKey(`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  }, [open, card?.openingId, methodOptions.length]);

  if (!card) return null;

  async function handleConfirm() {
    if (!selectedOption?.available || busy) return;
    setBusy(true);
    setFeedback(null);
    const result = await onConfirm(selectedOption.method, attemptKey).catch((cause) => {
      const message = cause instanceof Error ? cause.message : "Could not unlock the selected opening.";
      return { ok: false, message };
    });
    setFeedback(result);
    setBusy(false);
    if (!result.ok) {
      setAttemptKey(`${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
    }
  }

  return (
    <BlundrModal
      open={open}
      title={`Unlock ${card.openingName}`}
      description="Choose one resource. Only this selected opening will unlock."
      onClose={onClose}
      size="lg"
      tone="reward"
    >
      <div className="max-h-[88dvh] space-y-4 overflow-y-auto pb-1">
        <div className="sticky top-0 z-10 rounded-[1.25rem] border border-stone-200 bg-[#fbfcf7]/95 p-3 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <BlundrChip tone="stone" icon={<Gift size={13} />}>
              {card.openingName}
            </BlundrChip>
            <BlundrChip tone="stone" icon={<ShieldAlert size={13} />}>
              {card.openingId}
            </BlundrChip>
          </div>
          <p className="mt-2 text-sm leading-6 text-stone-600">This will spend one selected resource and add this opening to your repertoire.</p>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Balance label="Repertoire Points" value={progress.availablePoints} helper={`${progress.availablePoints} available`} icon={<Coins size={14} />} />
          <Balance label="Opening Fragments" value={inventory.openingFragments} helper={`${inventory.openingFragments} fragment${inventory.openingFragments === 1 ? "" : "s"} available`} icon={<Gift size={14} />} />
          <Balance label="Choice Tokens" value={inventory.choiceTokens} helper={`${inventory.choiceTokens} ready`} icon={<KeyRound size={14} />} />
        </div>

        <div className="space-y-3">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Unlock methods</div>
          <div className="grid gap-2">
            {methodOptions.map((option) => (
              <button
                key={option.method}
                type="button"
                    onClick={() => { if (option.available) setSelectedMethod(option.method); }}
                    disabled={!option.available || busy}
                className={[
                  "rounded-[1.35rem] border p-3 text-left transition",
                  selectedMethod === option.method ? "border-green-300 bg-green-50 ring-2 ring-green-200" : "border-stone-200 bg-white hover:border-stone-300",
                  option.available ? "" : "opacity-70",
                ].join(" ")}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-stone-950">{option.label}</div>
                    <div className="mt-1 text-sm leading-6 text-stone-600">{option.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-stone-950">{option.costLabel}</div>
                    <div className="text-xs font-semibold text-stone-500">{option.available ? "Available" : option.disabledReason}</div>
                  </div>
                </div>
                {option.available ? <div className="mt-3 rounded-2xl bg-white/80 px-3 py-2 text-xs font-semibold text-stone-600 ring-1 ring-stone-100">After unlock: {option.after.points} Points{option.method === "opening_fragments" ? ` · ${option.after.fragments} Fragments` : option.method === "choice_token" ? ` · ${option.after.tokens} Choice Token${option.after.tokens === 1 ? "" : "s"}` : ""}</div> : null}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[1.35rem] border border-stone-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-black uppercase tracking-[0.18em] text-stone-500">Selected method</div>
              <div className="mt-1 text-lg font-black text-stone-950">{selectedOption ? getRepertoireUnlockMethodTitle(selectedOption.method) : "Choose a method"}</div>
            </div>
            <div className="text-right text-xs font-semibold text-stone-500">
              {selectedOption?.available ? "Ready to confirm" : selectedOption?.disabledReason ?? "Choose a valid method"}
            </div>
          </div>

          {feedback ? (
            <div className={`mt-4 rounded-2xl px-3 py-3 text-sm leading-6 ring-1 ${feedback.ok ? "bg-green-50 text-green-900 ring-green-200" : "bg-red-50 text-red-900 ring-red-200"}`}>
              {feedback.message}
            </div>
          ) : null}

          <div className="mt-4 rounded-2xl bg-[#fbfcf7] p-3 ring-1 ring-stone-100">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-500">Confirmation</div>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              {selectedOption?.available ? `Unlock ${card.openingName} for ${selectedOption.costLabel}. Only this selected opening will unlock.` : selectedOption?.disabledReason ?? "Choose an available method."}
            </p>
          </div>

          <div className="sticky bottom-0 mt-4 flex items-center gap-2 bg-white/95 pt-2 backdrop-blur">
            <BlundrButton variant="secondary" onClick={onClose} disabled={busy}>
              Cancel
            </BlundrButton>
            <BlundrButton fullWidth onClick={() => void handleConfirm()} disabled={!canConfirm} isLoading={busy}>
              {busy ? "Unlocking..." : selectedOption?.available ? `Unlock for ${selectedOption.costLabel}` : "Choose a method"}
            </BlundrButton>
          </div>
        </div>
      </div>
    </BlundrModal>
  );
}

function Balance({ label, value, helper, icon }: { label: string; value: number; helper: string; icon: ReactNode }) {
  return (
    <div className="rounded-[1.2rem] border border-stone-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-stone-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-2xl font-black text-stone-950">{value}</div>
      <div className="mt-1 text-xs font-semibold text-stone-500">{helper}</div>
    </div>
  );
}

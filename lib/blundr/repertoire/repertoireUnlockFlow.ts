import type { RepertoireOpeningCard, RepertoireProgress } from "./repertoireTypes";
import type { RewardInventoryView } from "../rewards/rewardInventoryTypes";

export type RepertoireUnlockMethod = "repertoire_points" | "opening_fragments" | "choice_token";

export type RepertoireUnlockMethodOption = {
  method: RepertoireUnlockMethod;
  label: string;
  description: string;
  available: boolean;
  disabledReason: string | null;
  costLabel: string;
  before: {
    points: number;
    fragments: number;
    tokens: number;
  };
  after: {
    points: number;
    fragments: number;
    tokens: number;
  };
};

function normalizeNumber(value: unknown): number {
  return Math.max(0, Math.floor(Number(value) || 0));
}

export function getRepertoireUnlockMethodOptions(
  card: RepertoireOpeningCard,
  progress: RepertoireProgress,
  inventory: RewardInventoryView,
): RepertoireUnlockMethodOption[] {
  const pointsCost = Math.max(0, Math.floor(Number(card.pointsCost) || 0));
  const availablePoints = normalizeNumber(progress.availablePoints);
  const fragments = normalizeNumber(inventory.openingFragments);
  const tokens = normalizeNumber(inventory.choiceTokens);

  return [
    {
      method: "repertoire_points",
      label: "Repertoire Points",
      description: "Spend your steady progress currency on this exact opening.",
      available: availablePoints >= pointsCost,
      disabledReason: availablePoints >= pointsCost ? null : `Need ${Math.max(0, pointsCost - availablePoints)} more Repertoire Points`,
      costLabel: `${pointsCost} Repertoire Points`,
      before: { points: availablePoints, fragments, tokens },
      after: { points: Math.max(0, availablePoints - pointsCost), fragments, tokens },
    },
    {
      method: "opening_fragments",
      label: "Opening Fragments",
      description: "Spend exactly 3 fragments to choose this opening.",
      available: fragments >= 3,
      disabledReason: fragments >= 3 ? null : "Need 3 fragments",
      costLabel: "3 Opening Fragments",
      before: { points: availablePoints, fragments, tokens },
      after: { points: availablePoints, fragments: Math.max(0, fragments - 3), tokens },
    },
    {
      method: "choice_token",
      label: "Choice Token",
      description: "Spend 1 choice token to choose this opening immediately.",
      available: tokens >= 1,
      disabledReason: tokens >= 1 ? null : "Need 1 Choice Token",
      costLabel: "1 Choice Token",
      before: { points: availablePoints, fragments, tokens },
      after: { points: availablePoints, fragments, tokens: Math.max(0, tokens - 1) },
    },
  ];
}

export function getRepertoireUnlockMethodTitle(method: RepertoireUnlockMethod): string {
  if (method === "opening_fragments") return "Opening Fragments";
  if (method === "choice_token") return "Choice Token";
  return "Repertoire Points";
}

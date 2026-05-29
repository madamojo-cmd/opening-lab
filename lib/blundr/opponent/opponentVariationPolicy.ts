import type { OpponentChoiceMemory, OpponentVariationContext } from "./opponentVariationMemory";
import { getRecentOpponentChoices } from "./opponentVariationMemory";

export type OpponentBranchCandidate = {
  uci: string;
  san?: string;
  branchKey: string;
  weight: number;
  legal: boolean;
  supported: boolean;
  engineSafe?: boolean;
  severeBlunder?: boolean;
  source?: string;
  pct?: number;
};

export type OpponentVariationSelection = {
  selected: OpponentBranchCandidate;
  opponentVariationApplied: boolean;
  opponentVariationReason: string;
  recentOpponentBranchKeys: string[];
  selectedOpponentBranchKey: string;
  candidateOpponentBranches: Array<{ branchKey: string; uci: string; san?: string; baseWeight: number; adjustedWeight: number }>;
  blockedThirdRepeatBranches: string[];
  fallbackUsed: boolean;
};

export function shouldAvoidOpponentBranch(candidateBranchKey: string, recentMemory: OpponentChoiceMemory[]): {
  avoid: boolean;
  reason: "third_consecutive_repeat" | "allowed_repeat_once" | "no_recent_repeat";
} {
  const recentKeys = recentMemory.slice(0, 2).map((item) => item.branchKey);
  if (recentKeys.length >= 2 && recentKeys[0] === candidateBranchKey && recentKeys[1] === candidateBranchKey) {
    return { avoid: true, reason: "third_consecutive_repeat" };
  }
  if (recentKeys[0] === candidateBranchKey) {
    return { avoid: false, reason: "allowed_repeat_once" };
  }
  return { avoid: false, reason: "no_recent_repeat" };
}

function pickWeighted<T extends { adjustedWeight: number }>(items: T[], rng: () => number): T {
  const total = items.reduce((sum, item) => sum + Math.max(0.0001, item.adjustedWeight), 0);
  if (total <= 0) return items[0];
  let roll = rng() * total;
  for (const item of items) {
    roll -= Math.max(0.0001, item.adjustedWeight);
    if (roll <= 0) return item;
  }
  return items[items.length - 1];
}

export function selectOpponentCandidateWithVariation(input: {
  context: OpponentVariationContext;
  candidates: OpponentBranchCandidate[];
  memory?: OpponentChoiceMemory[];
  rng?: () => number;
}): OpponentVariationSelection | null {
  const rng = input.rng ?? Math.random;
  const allCandidates = input.candidates.filter((candidate) => candidate.legal);
  if (!allCandidates.length) return null;

  const supported = allCandidates.filter((candidate) => candidate.supported && (candidate.engineSafe ?? true) && !candidate.severeBlunder);
  const safePool = supported.length ? supported : allCandidates;
  const fallbackUsed = supported.length === 0;
  const recent = getRecentOpponentChoices(input.context, { limit: 10, fromMemory: input.memory });
  const recentKeys = recent.slice(0, 5).map((item) => item.branchKey);

  const avoidSet = new Set<string>();
  for (const candidate of safePool) {
    const decision = shouldAvoidOpponentBranch(candidate.branchKey, recent);
    if (decision.avoid) avoidSet.add(candidate.branchKey);
  }

  const hasAlternative = safePool.some((candidate) => !avoidSet.has(candidate.branchKey));
  const blockedThirdRepeatBranches = hasAlternative ? Array.from(avoidSet) : [];
  const eligible = hasAlternative ? safePool.filter((candidate) => !avoidSet.has(candidate.branchKey)) : safePool;

  const weightedCandidates = eligible.map((candidate) => {
    const recentCount = recentKeys.filter((key) => key === candidate.branchKey).length;
    const noveltyPenalty = recentCount >= 2 ? 0.35 : recentCount === 1 ? 0.65 : 1;
    return {
      ...candidate,
      adjustedWeight: Math.max(0.0001, candidate.weight * noveltyPenalty),
    };
  });

  const selected = pickWeighted(weightedCandidates, rng);
  const noAlternativeThirdRepeat =
    !hasAlternative &&
    shouldAvoidOpponentBranch(selected.branchKey, recent).avoid;
  const variationReason =
    blockedThirdRepeatBranches.length
      ? `avoided_third_repeat_of:${blockedThirdRepeatBranches.join(",")}`
      : noAlternativeThirdRepeat
        ? "no_supported_alternative"
        : shouldAvoidOpponentBranch(selected.branchKey, recent).reason === "allowed_repeat_once"
          ? "allowed_repeat_not_third_consecutive"
          : "normal_weighted_selection";

  return {
    selected,
    opponentVariationApplied: blockedThirdRepeatBranches.length > 0,
    opponentVariationReason: variationReason,
    recentOpponentBranchKeys: recent.slice(0, 2).map((item) => item.branchKey),
    selectedOpponentBranchKey: selected.branchKey,
    candidateOpponentBranches: weightedCandidates.map((candidate) => ({
      branchKey: candidate.branchKey,
      uci: candidate.uci,
      san: candidate.san,
      baseWeight: candidate.weight,
      adjustedWeight: candidate.adjustedWeight,
    })),
    blockedThirdRepeatBranches,
    fallbackUsed,
  };
}

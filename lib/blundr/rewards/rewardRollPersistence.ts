import type { RewardRoll } from "../accounts/accountTypes";

export function dedupeRewardRollsById(
  rewardRolls: readonly RewardRoll[],
): RewardRoll[] {
  const seen = new Set<string>();
  const unique: RewardRoll[] = [];
  for (const roll of rewardRolls) {
    const id = String(roll.id ?? "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    unique.push(roll);
  }
  return unique;
}

import type { RewardRoll } from "../accounts/accountTypes";

export function dedupeRewardRollsById(rewardRolls: readonly RewardRoll[]): RewardRoll[] {
  const seen = new Set<string>();
  const unique: RewardRoll[] = [];
  for (const roll of rewardRolls) {
    if (seen.has(roll.id)) continue;
    seen.add(roll.id);
    unique.push(roll);
  }
  return unique;
}

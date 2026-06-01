import type { MaiaMoveDistribution, MaiaSkillGradient } from "./liveCoachTypes";

export function analyzeSkillGradients(input: {
  below: MaiaMoveDistribution;
  current: MaiaMoveDistribution;
  above: MaiaMoveDistribution;
  advanced: MaiaMoveDistribution;
}): MaiaSkillGradient[] {
  const moves = new Set<string>([
    ...Object.keys(input.below.moveProbabilities),
    ...Object.keys(input.current.moveProbabilities),
    ...Object.keys(input.above.moveProbabilities),
    ...Object.keys(input.advanced.moveProbabilities),
  ]);

  return Array.from(moves).map((moveUci) => {
    const probabilityBelow = input.below.moveProbabilities[moveUci] ?? 0;
    const probabilityCurrent = input.current.moveProbabilities[moveUci] ?? 0;
    const probabilityAbove = input.above.moveProbabilities[moveUci] ?? 0;
    const probabilityAdvanced = input.advanced.moveProbabilities[moveUci] ?? 0;
    const deltaCurrentToAbove = probabilityAbove - probabilityCurrent;
    const deltaBelowToAdvanced = probabilityAdvanced - probabilityBelow;

    let trend: MaiaSkillGradient["trend"] = "unclear";
    if (probabilityBelow >= 0.2 && probabilityAdvanced < probabilityBelow * 0.6) trend = "beginner_instinct";
    else if (probabilityCurrent >= 0.08 && probabilityAbove >= probabilityCurrent * 1.2) trend = "improver_move";
    else if (probabilityAdvanced >= 0.12 && probabilityCurrent < probabilityAdvanced * 0.7) trend = "advanced_move";
    else if (probabilityCurrent >= 0.1 && probabilityAdvanced < probabilityCurrent * 0.7) trend = "declines_with_skill";
    else if (Math.abs(probabilityBelow - probabilityAdvanced) <= 0.04) trend = "stable_human_move";

    return {
      moveUci,
      probabilityBelow,
      probabilityCurrent,
      probabilityAbove,
      probabilityAdvanced,
      deltaCurrentToAbove,
      deltaBelowToAdvanced,
      trend,
    };
  });
}

import type { CandidateMoveProfile, HumanEngineDivergence } from "./liveCoachTypes";

export function classifyHumanEngineDivergence(profile: CandidateMoveProfile): HumanEngineDivergence {
  if (profile.moveClass === "natural_good") return "aligned_natural_good";
  if (profile.moveClass === "predictable_human_mistake") return "human_temptation_bad";
  if (profile.moveClass === "hard_to_find_good_move") return "engine_move_hard_for_humans";
  if (profile.moveClass === "human_playable_not_best") return "human_move_playable_not_best";
  return "no_clear_signal";
}

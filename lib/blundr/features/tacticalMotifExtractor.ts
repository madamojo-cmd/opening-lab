import type { ParsedBoard } from "../geometry/boardTypes";
import type { TacticalMotifFeatures } from "./advancedFeatureTypes";

export function extractTacticalMotifs(_board: ParsedBoard): TacticalMotifFeatures {
  return {
    verifiedPins: [],
    verifiedForks: [],
    verifiedSkewers: [],
    candidateMotifs: [],
    blockedMotifs: [
      { type: "fork", reason: "deterministic_tactical_motif_detector_deferred_to_v2_8" },
      { type: "pin", reason: "deterministic_tactical_motif_detector_deferred_to_v2_8" },
      { type: "skewer", reason: "deterministic_tactical_motif_detector_deferred_to_v2_8" },
    ],
  };
}

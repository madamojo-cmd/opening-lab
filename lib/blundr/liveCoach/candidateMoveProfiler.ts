import type { CandidateMoveProfile, PositionEvidencePacket } from "./liveCoachTypes";

const HIGH_MAIA = 0.18;
const VERY_HIGH_MAIA = 0.35;
const LOW_MAIA = 0.05;
const SAFE_SET = new Set(["best", "safe", "playable"]);
const BAD_SET = new Set(["mistake", "blunder", "severe_warning"]);

export function profileCandidateMoves(evidence: PositionEvidencePacket): CandidateMoveProfile[] {
  const maia = evidence.maiaSignals?.moveProbabilities ?? {};
  const engineByMove = new Map((evidence.engineSignals?.candidates ?? []).map((c) => [c.moveUci, c]));
  const patternConcepts = new Set((evidence.patternSignals?.connectedConcepts ?? []).map((c) => c.conceptId));

  return evidence.legalMoves.map((move) => {
    const isFocusMove = evidence.focusMove?.moveUci === move.moveUci;
    const maiaProbability = maia[move.moveUci] ?? 0;
    const engine = engineByMove.get(move.moveUci);
    const engineSafety = engine?.safety;
    const safe = engineSafety ? SAFE_SET.has(engineSafety) : false;
    const bad = engineSafety ? BAD_SET.has(engineSafety) : false;
    const patternSupport = patternConcepts.size > 0;

    let moveClass: CandidateMoveProfile["moveClass"] = "unknown";
    if (maiaProbability >= HIGH_MAIA && safe) moveClass = "natural_good";
    else if (maiaProbability >= HIGH_MAIA && bad) moveClass = "predictable_human_mistake";
    else if (maiaProbability <= LOW_MAIA && safe) moveClass = "hard_to_find_good_move";
    else if (safe && evidence.positionFeatures.developmentStatus === "behind") moveClass = "quiet_improvement";
    else if (bad && maiaProbability <= LOW_MAIA) moveClass = "irrelevant_bad_move";
    else if (patternSupport && safe) moveClass = "pattern_transfer_move";
    else if (maiaProbability >= VERY_HIGH_MAIA && engineSafety === "playable") moveClass = "human_playable_not_best";

    const exactRecommendationAllowed = isFocusMove || (safe && !bad && evidence.evidenceStatus !== "stale");
    const explanationConfidence = isFocusMove ? 0.95 : safe ? 0.82 : bad ? 0.62 : 0.48;
    const reviewValue = moveClass === "predictable_human_mistake" || moveClass === "hard_to_find_good_move" ? 0.9 : 0.45;

    return {
      moveUci: move.moveUci,
      moveSan: move.moveSan,
      maiaProbability,
      maiaRank: evidence.maiaSignals?.topMoves.findIndex((m) => m.moveUci === move.moveUci) ?? undefined,
      skillTrend: evidence.maiaSignals?.skillGradients.find((g) => g.moveUci === move.moveUci)?.trend,
      engineSafety,
      engineDeltaCp: engine?.evalDeltaCp,
      bookSupport: evidence.bookStatus === "in_book",
      repertoireSupport: evidence.bookStatus === "in_book" || evidence.bookStatus === "near_book",
      patternSupport,
      featureSupport: [evidence.positionFeatures.centerState, evidence.positionFeatures.kingSafety],
      moveClass: isFocusMove ? "natural_good" : moveClass,
      exactRecommendationAllowed,
      explanationConfidence,
      reviewValue,
    };
  });
}

import { Chess } from "chess.js";
import { rejection } from "@/lib/blundr/daily/core/dailyActivityConformance";
import type {
  DeepMiniGameBuildResult,
  DeepMiniGameScenario,
} from "./deepMiniGameTypes";

export function validateDeepMiniGameScenario(
  scenario: DeepMiniGameScenario,
): DeepMiniGameBuildResult {
  if (
    !scenario.id ||
    !scenario.schemaVersion ||
    !scenario.generatorVersion ||
    !scenario.validatorVersion ||
    !scenario.evidenceVersion
  )
    return rejection(
      "schema_version_mismatch",
      "Deep scenario metadata is incomplete.",
    );
  try {
    new Chess(scenario.startFen);
  } catch {
    return rejection(
      "illegal_move",
      "Deep scenario start position is illegal.",
    );
  }
  if (scenario.solution.userMoves.length < 2)
    return rejection(
      "missing_approved_content",
      "Deep scenarios require multiple user decisions.",
    );
  if (
    scenario.solution.opponentReplies.length >
    scenario.solution.userMoves.length
  )
    return rejection(
      "missing_approved_content",
      "Deep scenarios contain too many opponent replies.",
    );
  if (scenario.generatorVersion === "prepared-engine-catalog-v1") {
    const evidence = scenario.evidence;
    if (
      !evidence ||
      evidence.catalogId !== "blundr-engine-certified-deep-minigames" ||
      evidence.catalogVersion !== "1.0.0" ||
      evidence.engine !== "Stockfish 18 Lite" ||
      evidence.depth !== 8 ||
      evidence.multiPv < 1 ||
      evidence.legalMoveCount < 1 ||
      evidence.pieceCount < 2 ||
      !/^[a-f0-9]{64}$/.test(evidence.checksumSha256)
    )
      return rejection(
        "missing_approved_content",
        "Engine-certified scenario evidence is incomplete.",
      );
  }
  let fen = scenario.startFen;
  const reachedTargets = new Set<string>();
  for (let index = 0; index < scenario.solution.userMoves.length; index += 1) {
    try {
      const chess = new Chess(fen);
      chess.move(scenario.solution.userMoves[index]);
      fen = chess.fen();
      reachedTargets.add(
        scenario.solution.userMoves[index].slice(2, 4).toLowerCase(),
      );
    } catch {
      return rejection("illegal_move", "Deep user sequence is illegal.");
    }
    const reply = scenario.solution.opponentReplies[index];
    if (reply) {
      try {
        const chess = new Chess(fen);
        chess.move(reply);
        fen = chess.fen();
      } catch {
        return rejection("illegal_move", "Deep opponent sequence is illegal.");
      }
    }
  }
  if (
    scenario.solution.requiredTargets?.some(
      (target) => !reachedTargets.has(target.toLowerCase()),
    )
  )
    return rejection(
      "missing_approved_content",
      "Not all ordered targets are reachable in the verified route.",
    );
  return { ok: true, scenario };
}

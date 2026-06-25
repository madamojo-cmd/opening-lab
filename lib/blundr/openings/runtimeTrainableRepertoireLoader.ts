import { Chess } from "chess.js";

import { applyRuntimeUciMove } from "../runtime/uciReplay";
import { normalizeRuntimePlaySequenceUci } from "../runtime/uciNormalization";
import { getStage2OpeningAvailability } from "./openingAvailability";

export type RuntimeTrainableLineData = {
  lineId: string;
  playKey: string;
  playSequenceUci: readonly string[];
  movesSan: readonly string[];
  totalGames: number;
};

export type LoadedRuntimeTrainableRepertoire = {
  id: string;
  name: string;
  color: "white" | "black";
  description: string;
  lines: string[][];
  custom?: false;
  runtimeLineWeights: number[];
};

function buildSanLineFromUciSequence(uciSequence: readonly string[]): string[] {
  const game = new Chess();
  const sanLine: string[] = [];
  for (const uci of normalizeRuntimePlaySequenceUci(uciSequence)) {
    const move = applyRuntimeUciMove(game, uci);
    if (!move) {
      throw new Error(`runtime_trainable_line_invalid_uci:${uci}`);
    }
    sanLine.push(move.san);
  }
  return sanLine;
}

export async function loadRuntimeTrainableRepertoire(openingId: string): Promise<LoadedRuntimeTrainableRepertoire | null> {
  const availability = getStage2OpeningAvailability(openingId);
  if (!availability?.runtimeAvailable) {
    return null;
  }

  const { STAGE2_RUNTIME_TRAINABLE_REPERTOIRE_LINES } = await import("./stage2RuntimeTrainableRepertoires.generated");
  const rawLines = STAGE2_RUNTIME_TRAINABLE_REPERTOIRE_LINES[availability.openingId] as
    | readonly RuntimeTrainableLineData[]
    | undefined;

  if (!rawLines?.length) {
    return null;
  }

  const lines = rawLines.map((line) =>
    line.movesSan.length > 0
      ? line.movesSan.map(String)
      : buildSanLineFromUciSequence(line.playSequenceUci),
  );

  return {
    id: availability.openingId,
    name: availability.displayName,
    color: availability.learnerPerspective,
    description: `Runtime-backed local crawled package line pool for ${availability.displayName}. Fallback-only coaching remains available.`,
    lines,
    custom: false,
    runtimeLineWeights: rawLines.map((line) => Math.max(1, Number(line.totalGames ?? line.playSequenceUci.length) || line.playSequenceUci.length)),
  };
}

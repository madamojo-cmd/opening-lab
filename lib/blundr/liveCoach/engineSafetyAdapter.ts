import type { EngineSignalSet } from "./liveCoachTypes";

const SAFE_CUTOFF = 40;
const PLAYABLE_CUTOFF = 100;
const INACCURACY_CUTOFF = 180;
const MISTAKE_CUTOFF = 300;

function classify(deltaCp?: number, rank?: number): EngineSignalSet["candidates"][number]["safety"] {
  if (rank === 1) return "best";
  if (deltaCp === undefined) return "unknown";
  const abs = Math.abs(deltaCp);
  if (abs <= SAFE_CUTOFF) return "safe";
  if (abs <= PLAYABLE_CUTOFF) return "playable";
  if (abs <= INACCURACY_CUTOFF) return "inaccuracy";
  if (abs <= MISTAKE_CUTOFF) return "mistake";
  return "blunder";
}

export function adaptEngineSafety(input: {
  status: EngineSignalSet["status"];
  bestMoveUci?: string;
  bestMoveSan?: string;
  evalBeforeCp?: number;
  candidates?: Array<{ moveUci: string; moveSan?: string; evalAfterCp?: number; rank?: number }>;
}): EngineSignalSet {
  if (input.status !== "available") {
    return {
      status: input.status,
      evalBeforeCp: input.evalBeforeCp,
      bestMoveUci: input.bestMoveUci,
      bestMoveSan: input.bestMoveSan,
      candidates: [],
    };
  }

  const before = input.evalBeforeCp;
  const candidates = (input.candidates ?? []).map((candidate) => {
    const evalDeltaCp = before !== undefined && candidate.evalAfterCp !== undefined ? candidate.evalAfterCp - before : undefined;
    const safety = classify(evalDeltaCp, candidate.rank);
    return {
      moveUci: candidate.moveUci,
      moveSan: candidate.moveSan,
      evalAfterCp: candidate.evalAfterCp,
      evalDeltaCp,
      rank: candidate.rank,
      safety,
      isTopEngineMove: candidate.rank === 1 || candidate.moveUci === input.bestMoveUci,
    };
  });

  return {
    status: "available",
    evalBeforeCp: before,
    bestMoveUci: input.bestMoveUci,
    bestMoveSan: input.bestMoveSan,
    candidates,
  };
}

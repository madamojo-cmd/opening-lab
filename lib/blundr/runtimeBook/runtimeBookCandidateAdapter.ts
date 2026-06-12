import type { Stage2RuntimeBookMove } from "./runtimeBookTypes";
import type { Stage2RuntimeBookCandidate } from "./runtimeBookTypes";

export function adaptRuntimeBookCandidates(moves: Stage2RuntimeBookMove[]): Stage2RuntimeBookCandidate[] {
  return moves
    .filter((move) => typeof move.moveUci === "string" && move.moveUci.length >= 4)
    .map((move) => ({
      uci: String(move.moveUci),
      san: typeof move.moveSan === "string" && move.moveSan.length > 0 ? move.moveSan : undefined,
      source: "book",
      supported: true,
      runtimeBookSource: "stage2-runtime-book",
      rank: typeof move.rank === "number" ? move.rank : undefined,
      totalGames: typeof move.totalGames === "number" ? move.totalGames : undefined,
      playPct: typeof move.playPct === "number" ? move.playPct : undefined,
      profile: typeof move.profile === "string" ? move.profile : undefined,
      profiles: typeof move.profiles === "string" ? move.profiles : undefined,
      sourceDetail: typeof move.source === "string" ? move.source : undefined,
      sources: typeof move.sources === "string" ? move.sources : undefined,
    }));
}

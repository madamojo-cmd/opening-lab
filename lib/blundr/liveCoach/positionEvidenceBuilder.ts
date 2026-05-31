import { Chess } from "chess.js";
import { normalizeFenForVisualFrame, visualFrameMatches } from "../teaching/overlayLifecycle";
import { extractPositionFeatures } from "./positionFeatureExtractor";
import type { EngineSignalSet, MaiaSignalSet, PatternSignalSet, PositionEvidencePacket, UserMemorySignalSet } from "./liveCoachTypes";

export function buildPositionEvidence(input: {
  frameId: string | number;
  trainerFrameId: string | number;
  fen: string;
  boardFen: string;
  moveHistorySan: string[];
  bookStatus: PositionEvidencePacket["bookStatus"];
  focusMove?: { uci?: string | null } | null;
  maiaSignals?: MaiaSignalSet;
  engineSignals?: EngineSignalSet;
  patternSignals?: PatternSignalSet;
  userMemorySignals?: UserMemorySignalSet;
}): PositionEvidencePacket {
  const normalizedFen = normalizeFenForVisualFrame(input.fen) ?? "";
  const normalizedBoardFen = normalizeFenForVisualFrame(input.boardFen) ?? "";
  const stale = !visualFrameMatches(input.frameId, input.trainerFrameId) || !normalizedFen || normalizedFen !== normalizedBoardFen;
  try {
    const chess = new Chess(input.fen);
    const legalMoves = chess.moves({ verbose: true }).map((move: any) => ({
      moveUci: `${move.from}${move.to}${move.promotion ?? ""}`,
      moveSan: move.san,
      from: move.from,
      to: move.to,
      piece: move.piece,
      isCapture: Boolean(move.captured),
      isCheck: Boolean(move.san?.includes("+")) || Boolean(move.san?.includes("#")),
      promotion: move.promotion,
    }));

    const features = extractPositionFeatures(input.fen);
    const focusMove = input.focusMove?.uci
      ? legalMoves.find((move) => move.moveUci === String(input.focusMove?.uci).trim().toLowerCase())
      : null;
    const phase: PositionEvidencePacket["phase"] = input.moveHistorySan.length <= 8 ? "opening" : input.moveHistorySan.length <= 18 ? "early_middlegame" : input.moveHistorySan.length <= 45 ? "middlegame" : "endgame";

    const evidenceStatus: PositionEvidencePacket["evidenceStatus"] = stale
      ? "stale"
      : input.engineSignals?.status === "pending"
        ? "partial"
        : input.maiaSignals?.status === "unavailable" && input.engineSignals?.status !== "available"
          ? "partial"
          : "ready";

    return {
      frameId: String(input.frameId),
      fen: input.fen,
      normalizedFen,
      sideToMove: chess.turn() as "w" | "b",
      moveHistorySan: input.moveHistorySan,
      phase,
      bookStatus: input.bookStatus,
      legalMoves,
      positionFeatures: features,
      maiaSignals: input.maiaSignals,
      engineSignals: input.engineSignals,
      patternSignals: input.patternSignals,
      userMemorySignals: input.userMemorySignals,
      focusMove: focusMove
        ? {
            moveUci: focusMove.moveUci,
            moveSan: focusMove.moveSan,
            from: focusMove.from,
            to: focusMove.to,
            piece: focusMove.piece,
            isCapture: focusMove.isCapture,
            isCheck: focusMove.isCheck,
            isMate: Boolean(focusMove.moveSan?.includes("#")),
          }
        : null,
      stale,
      evidenceStatus,
    };
  } catch {
    return {
      frameId: String(input.frameId),
      fen: input.fen,
      normalizedFen,
      sideToMove: "w",
      moveHistorySan: input.moveHistorySan,
      phase: "opening",
      bookStatus: input.bookStatus,
      legalMoves: [],
      positionFeatures: extractPositionFeatures(input.fen),
      maiaSignals: input.maiaSignals,
      engineSignals: input.engineSignals,
      patternSignals: input.patternSignals,
      userMemorySignals: input.userMemorySignals,
      focusMove: null,
      stale: true,
      evidenceStatus: "stale",
    };
  }
}

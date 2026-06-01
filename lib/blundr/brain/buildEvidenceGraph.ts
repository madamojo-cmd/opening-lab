/**
 * buildEvidenceGraph.ts
 * v2.7.42 Deterministic Coach Evidence Layer
 *
 * Purely deterministic facts derived from:
 * - CurrentInstructionFrame.target
 * - Board geometry (existing modules)
 * - Basic opening context (no LLM, no Stockfish for this graph)
 *
 * This is the single source of truth that the CoachCompiler must consume.
 */

import type { CurrentInstructionFrame, CurrentInstructionTarget } from "../runtime/currentInstructionFrame";
import { buildBoardTruth } from "./boardTruth/buildBoardTruth";
import { getLegalMoves } from "../geometry/legalMoveUtils";
import { isDevelopmentMove, isCentralControl, isKingSafetyRelevant } from "./providers/moveSemanticsProvider";
import { getBasicOpeningContext } from "./providers/openingContextProvider";

export interface EvidenceGraph {
  frameKey: string;
  targetUci: string | null;
  targetSan: string | null;
  targetPieceType: string | null;
  fenBefore: string;
  legalTarget: boolean;
  from: string | null;
  to: string | null;
  promotion: string | null;
  isCapture: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isCastle: boolean;
  isPromotion: boolean;
  destinationOccupied: boolean;
  development: {
    isDevelopmentMove: boolean;
    developsPiece: boolean;
    improvesActivity: boolean;
  };
  center: {
    isCentralPawnAdvance: boolean;
    controlsCenter: boolean;
  };
  kingSafety: {
    improvesKingSafety: boolean;
    isCastling: boolean;
  };
  openingContext: {
    isBookMove: boolean;
    conceptTags: string[];
  };
  evidenceClaimIds: string[]; // e.g. ["target_development", "is_central_pawn", "pressures_f7"]

  // v2.7.42 Stockfish top-10 evidence (gating only — never overrides target)
  engineAnalysis?: {
    stockfishTop10?: import("../engine/stockfishTop10Gate").StockfishTop10GateResult;
  };

  raw: {
    target: CurrentInstructionTarget | null;
    boardTruth: any;
  };
}

export function buildEvidenceGraph(frame: CurrentInstructionFrame | null): EvidenceGraph {
  const target = frame?.target ?? null;
  const fen = frame?.fen ?? "";

  if (!target || !target.uci) {
    return createEmptyGraph(frame, fen);
  }

  // Deterministic facts from target (already computed in currentInstructionFrame)
  const isCapture = !!target.isCapture || !!target.capture;
  const isCheck = !!target.isCheck || !!target.check;
  const isMate = !!target.isMate || !!target.mate;
  const isPromotion = !!target.isPromotion;
  const isCastle = !!target.isCastle;

  // Board-level facts (lightweight, deterministic)
  let boardTruth: any = {};
  let legalTarget = false;
  let destinationOccupied = false;

  try {
    boardTruth = buildBoardTruth(fen);
    const legalMoves = getLegalMoves(fen);
    legalTarget = legalMoves.some((m: any) => `${m.from}${m.to}${m.promotion || ""}` === target.uci);
    destinationOccupied = !!(boardTruth._rawBoard?.squares?.[target.to]?.piece);
  } catch (e) {
    // Graceful degradation — still produce graph with what we have
  }

  // Move semantics (pure functions, no engines)
  const dev = isDevelopmentMove(target, fen);
  const center = isCentralControl(target);
  const kingSafety = isKingSafetyRelevant(target, fen);

  // Opening context (deterministic book/context only)
  const opening = getBasicOpeningContext(target, fen);

  // Evidence claim IDs — these are the only things the compiler is allowed to use for strong language
  const evidenceClaimIds: string[] = [];
  if (dev.isDevelopmentMove) evidenceClaimIds.push("target_development");
  if (center.isCentralPawnAdvance) evidenceClaimIds.push("is_central_pawn_advance");
  if (center.controlsCenter) evidenceClaimIds.push("controls_center");
  if (kingSafety.improvesKingSafety) evidenceClaimIds.push("improves_king_safety");
  if (isCastle) evidenceClaimIds.push("is_castling");
  if (isCapture) evidenceClaimIds.push("is_capture");
  if (isCheck) evidenceClaimIds.push("gives_check");
  if (isMate) evidenceClaimIds.push("is_checkmate");
  // pressures_f7 and other tactical claims can be added later via boardTruth enrichment

  return {
    frameKey: frame?.instructionFrameKey || frame?.invariantKey || "unknown-frame",
    targetUci: target.uci,
    targetSan: target.san,
    targetPieceType: target.pieceType,
    fenBefore: fen,
    legalTarget,
    from: target.from,
    to: target.to,
    promotion: target.promotion ?? null,
    isCapture,
    isCheck,
    isCheckmate: isMate,
    isCastle,
    isPromotion,
    destinationOccupied,
    development: dev,
    center,
    kingSafety,
    openingContext: opening,
    evidenceClaimIds,
    raw: {
      target,
      boardTruth,
    },
  };
}

function createEmptyGraph(frame: CurrentInstructionFrame | null, fen: string): EvidenceGraph {
  return {
    frameKey: frame?.instructionFrameKey || "no-target",
    targetUci: null,
    targetSan: null,
    targetPieceType: null,
    fenBefore: fen,
    legalTarget: false,
    from: null,
    to: null,
    promotion: null,
    isCapture: false,
    isCheck: false,
    isCheckmate: false,
    isCastle: false,
    isPromotion: false,
    destinationOccupied: false,
    development: { isDevelopmentMove: false, developsPiece: false, improvesActivity: false },
    center: { isCentralPawnAdvance: false, controlsCenter: false },
    kingSafety: { improvesKingSafety: false, isCastling: false },
    openingContext: { isBookMove: false, conceptTags: [] },
    evidenceClaimIds: [],
    raw: { target: null, boardTruth: {} },
  };
}

import { Chess } from "chess.js";

import {
  canClaimBishopPressuresSquare,
  canClaimCenterTension,
  canClaimExactMove,
  canClaimKingSafety,
  canClaimPieceDevelops,
  canClaimPreparesD4,
  canClaimRookSupportsFile,
} from "./boardClaimValidator";
import { extractBoardFacts } from "./boardFactExtractor";
import { normalizeFenForCoach } from "./attackMap";
import type {
  BlockedCoachClaim,
  CoachEvidencePacket,
  EngineSupportPacket,
  MaiaSupportPacket,
  RepertoireSupportPacket,
  VerifiedCoachClaim,
} from "./coachEvidenceTypes";
import { extractMoveFacts } from "./moveFactExtractor";

function buildEngineSupport(enginePreview: unknown, stale: boolean): EngineSupportPacket {
  if (stale) return { status: "stale", safeMoveUcis: [], playableMoveUcis: [], candidateSafetyByUci: {}, source: "none" };
  const pvs = Array.isArray((enginePreview as any)?.pvs) ? (enginePreview as any).pvs : [];
  if (!pvs.length) return { status: "pending", safeMoveUcis: [], playableMoveUcis: [], candidateSafetyByUci: {}, source: "none" };

  const best = pvs[0];
  const bestCp = typeof best?.cp === "number" ? Number(best.cp) : undefined;
  const candidateSafetyByUci: Record<string, "best" | "safe" | "playable" | "unknown" | "bad"> = {};
  const safeMoveUcis: string[] = [];
  const playableMoveUcis: string[] = [];

  for (const line of pvs) {
    if (!line?.uci) continue;
    if (line === best) {
      candidateSafetyByUci[line.uci] = "best";
      safeMoveUcis.push(line.uci);
      continue;
    }
    if (bestCp === undefined || typeof line.cp !== "number") {
      candidateSafetyByUci[line.uci] = "unknown";
      continue;
    }
    const delta = Math.abs(bestCp - Number(line.cp));
    if (delta <= 40) {
      candidateSafetyByUci[line.uci] = "safe";
      safeMoveUcis.push(line.uci);
    } else if (delta <= 100) {
      candidateSafetyByUci[line.uci] = "playable";
      playableMoveUcis.push(line.uci);
    } else {
      candidateSafetyByUci[line.uci] = "bad";
    }
  }

  return {
    status: "ready",
    bestMoveUci: best?.uci,
    bestMoveSan: best?.san,
    safeMoveUcis,
    playableMoveUcis,
    candidateSafetyByUci,
    source: "browser_stockfish",
  };
}

function buildMaiaSupport(maiaRaw: unknown): MaiaSupportPacket {
  const raw = maiaRaw as any;
  // v2.7.38e honesty gate: treat Maia as unavailable unless an explicitly verified live payload exists.
  if (!raw || raw.__verifiedLive !== true || !raw.move_probs) {
    return {
      status: "unavailable",
      source: "none",
      topMoveUcis: [],
      moveProbabilities: {},
    };
  }
  const entries = Object.entries(raw.move_probs as Record<string, number>).filter(([, value]) => Number.isFinite(value));
  entries.sort((a, b) => Number(b[1]) - Number(a[1]));
  return {
    status: "live",
    source: "maia_api",
    topMoveUcis: entries.slice(0, 5).map(([uci]) => uci),
    moveProbabilities: Object.fromEntries(entries),
  };
}

function buildRepertoireSupport(input: {
  expectedMoveUci?: string;
  repertoireMoves?: string[];
  lichessContinuationMoves?: string[];
  bookStatus: CoachEvidencePacket["bookStatus"];
}): RepertoireSupportPacket {
  const rep = (input.repertoireMoves ?? []).filter(Boolean);
  const lichess = (input.lichessContinuationMoves ?? []).filter(Boolean);
  const supportedMoveUcis = Array.from(new Set([...rep, ...lichess]));
  if (input.bookStatus === "in_book" && input.expectedMoveUci) {
    return {
      supported: true,
      source: "book",
      supportedMoveUcis: Array.from(new Set([...supportedMoveUcis, input.expectedMoveUci])),
    };
  }
  if (rep.length) return { supported: true, source: "repertoire", supportedMoveUcis };
  if (lichess.length) return { supported: true, source: "lichess", supportedMoveUcis };
  return { supported: false, source: "none", supportedMoveUcis: [] };
}

function selectedCandidate(input: {
  trainingMode: "restricted" | "continuation";
  expectedMoveUci?: string;
  expectedMoveSan?: string;
  selectedCandidateMoveUci?: string;
  selectedCandidateMoveSan?: string;
  engineSupport: EngineSupportPacket;
  repertoireSupport: RepertoireSupportPacket;
}): { uci?: string; san?: string; reason: string } {
  if (input.trainingMode === "restricted") return { uci: input.expectedMoveUci, san: input.expectedMoveSan, reason: "restricted_expected" };
  if (input.selectedCandidateMoveUci) return { uci: input.selectedCandidateMoveUci, san: input.selectedCandidateMoveSan, reason: "explicit_candidate" };
  if (input.engineSupport.status === "ready" && input.engineSupport.bestMoveUci) return { uci: input.engineSupport.bestMoveUci, san: input.engineSupport.bestMoveSan, reason: "engine_best" };
  const supported = input.repertoireSupport.supportedMoveUcis[0];
  if (supported) return { uci: supported, reason: "supported_continuation" };
  return { reason: "none" };
}

export function buildCoachEvidencePacket(input: {
  frameId: string;
  trainerFrameId?: string;
  fen: string;
  boardFen?: string;
  viewMode: "assisted" | "plain" | "freeplay";
  trainingMode: "restricted" | "continuation";
  bookStatus: "in_book" | "book_complete" | "near_book" | "out_of_book";
  visualRecipe?: unknown;
  trainingContext?: unknown;
  teachingOrchestration?: unknown;
  expectedMoveUci?: string;
  expectedMoveSan?: string;
  selectedCandidateMoveUci?: string;
  selectedCandidateMoveSan?: string;
  enginePreview?: unknown;
  repertoireMoves?: string[];
  lichessContinuationMoves?: string[];
  maiaRaw?: unknown;
  stale?: boolean;
}): CoachEvidencePacket {
  const normalizedFen = normalizeFenForCoach(input.fen);
  const normalizedBoardFen = normalizeFenForCoach(input.boardFen ?? input.fen);
  const stale = Boolean(input.stale || normalizedFen !== normalizedBoardFen || (input.trainerFrameId && String(input.frameId) !== String(input.trainerFrameId)));

  let legalMoveUcis: string[] = [];
  let legalMoveSans: string[] = [];
  let sideToMove: "w" | "b" = "w";
  let legalLoaded = true;
  try {
    const chess = new Chess(input.fen);
    sideToMove = chess.turn() as "w" | "b";
    const legal = chess.moves({ verbose: true }) as any[];
    legalMoveUcis = legal.map((move) => `${move.from}${move.to}${move.promotion ?? ""}`);
    legalMoveSans = legal.map((move) => move.san);
  } catch {
    legalLoaded = false;
  }

  const boardFacts = extractBoardFacts(input.fen);
  const engineSupport = buildEngineSupport(input.enginePreview, stale);
  const maiaSupport = buildMaiaSupport(input.maiaRaw);
  const repertoireSupport = buildRepertoireSupport({
    expectedMoveUci: input.expectedMoveUci,
    repertoireMoves: input.repertoireMoves,
    lichessContinuationMoves: input.lichessContinuationMoves,
    bookStatus: input.bookStatus,
  });

  const selected = selectedCandidate({
    trainingMode: input.trainingMode,
    expectedMoveUci: input.expectedMoveUci,
    expectedMoveSan: input.expectedMoveSan,
    selectedCandidateMoveUci: input.selectedCandidateMoveUci,
    selectedCandidateMoveSan: input.selectedCandidateMoveSan,
    engineSupport,
    repertoireSupport,
  });

  const moveFacts = selected.uci
    ? extractMoveFacts({ fenBefore: input.fen, moveUci: selected.uci, moveSan: selected.san }) ?? undefined
    : undefined;

  const visualRecipeFacts = (input.visualRecipe as any)
    ? {
        conceptId: (input.visualRecipe as any).conceptId,
        patternId: (input.visualRecipe as any).patternId,
        moveUci: (input.visualRecipe as any).moveUci,
        moveSan: (input.visualRecipe as any).moveSan,
        keySquares: (input.visualRecipe as any).learningAnchor?.keySquares ?? [],
        keyPieces: (input.visualRecipe as any).learningAnchor?.keyPieces ?? [],
        validatedVisualTypes: ((input.visualRecipe as any).beats ?? []).flatMap((beat: any) => (beat.primitives ?? []).map((primitive: any) => primitive.type)),
      }
    : undefined;

  const trainingFacts = (input.trainingContext as any)
    ? {
        conceptId: (input.trainingContext as any).cue?.conceptId ?? (input.trainingContext as any).conceptId,
        patternId: (input.trainingContext as any).pattern?.id,
        moveUci: (input.trainingContext as any).cue?.metadata?.moveUci,
        moveSan: (input.trainingContext as any).cue?.metadata?.moveSan,
      }
    : undefined;

  const preExactMoveAllowed = Boolean(
    !stale &&
      selected.uci &&
      legalMoveUcis.includes(selected.uci) &&
      (
        (repertoireSupport.supported && repertoireSupport.supportedMoveUcis.includes(selected.uci)) ||
        (engineSupport.status === "ready" &&
          (engineSupport.bestMoveUci === selected.uci ||
            engineSupport.safeMoveUcis.includes(selected.uci) ||
            engineSupport.playableMoveUcis.includes(selected.uci)))
      ),
  );

  const packet: CoachEvidencePacket = {
    frameId: String(input.frameId),
    trainerFrameId: input.trainerFrameId,
    fenBefore: input.fen,
    normalizedFen,
    sideToMove,
    viewMode: input.viewMode,
    trainingMode: input.trainingMode,
    bookStatus: input.bookStatus,
    stale,
    evidenceStatus: stale
      ? "stale"
      : !legalLoaded
        ? "unavailable"
        : engineSupport.status === "pending"
          ? "pending"
          : engineSupport.status === "ready"
            ? "ready"
            : "partial",
    expectedMoveUci: input.expectedMoveUci,
    expectedMoveSan: input.expectedMoveSan,
    selectedCandidateMoveUci: selected.uci,
    selectedCandidateMoveSan: selected.san,
    legalMoveUcis,
    legalMoveSans,
    moveFacts,
    boardFacts,
    visualRecipeFacts,
    trainingFacts,
    engineSupport,
    maiaSupport,
    repertoireSupport,
    exactMoveAllowed: preExactMoveAllowed,
    allowedClaims: [],
    blockedClaims: [],
    debug: {
      selectedCandidateReason: selected.reason,
      maiaStatus: maiaSupport.status,
      engineStatus: engineSupport.status,
      stale,
    },
  };

  const allowedClaims: VerifiedCoachClaim[] = [];
  const blockedClaims: BlockedCoachClaim[] = [];

  if (canClaimPieceDevelops(packet) && moveFacts) {
    allowedClaims.push({ type: "piece_develops", piece: moveFacts.movedPiece.type, to: moveFacts.movedPiece.to });
  } else {
    blockedClaims.push({ type: "piece_develops", reason: "move_not_development" });
  }

  if (canClaimBishopPressuresSquare(packet, "f7") && moveFacts) {
    allowedClaims.push({ type: "attacks_square", piece: "bishop", from: moveFacts.movedPiece.from, to: moveFacts.movedPiece.to, target: "f7" });
  } else if ((moveFacts?.movedPiece.type ?? "") === "b") {
    blockedClaims.push({ type: "attacks_square", reason: "bishop_does_not_attack_f7", attemptedText: "Bishop pressures f7" });
  }

  if (canClaimPreparesD4(packet)) {
    allowedClaims.push({ type: "prepares_break", breakMove: "d4", supportMove: moveFacts?.san });
  } else {
    blockedClaims.push({ type: "prepares_break", reason: "d4_support_not_validated" });
  }

  if (canClaimCenterTension(packet)) {
    allowedClaims.push({ type: "center_tension", squares: packet.boardFacts.contestedCenterSquares.length ? packet.boardFacts.contestedCenterSquares : packet.boardFacts.occupiedCenterSquares });
  }

  if (canClaimKingSafety(packet)) {
    allowedClaims.push({ type: "king_safety", reason: packet.boardFacts.kingSafetyFacts[0] ?? (moveFacts?.isCastle ? "castled" : "king_safety_plan") });
  }

  if (canClaimRookSupportsFile(packet, "e") && moveFacts) {
    allowedClaims.push({ type: "rook_file", file: "e", square: moveFacts.movedPiece.to });
  }

  packet.exactMoveAllowed = canClaimExactMove(packet);
  if (packet.exactMoveAllowed && packet.selectedCandidateMoveUci) {
    allowedClaims.push({ type: "exact_move_safe", moveUci: packet.selectedCandidateMoveUci, moveSan: packet.selectedCandidateMoveSan });
  } else if (packet.selectedCandidateMoveUci) {
    blockedClaims.push({ type: "exact_move_safe", reason: "exact_move_not_allowed" });
  }

  if (!allowedClaims.some((claim) => claim.type === "center_tension") && packet.boardFacts.safePlanObjects[0]) {
    allowedClaims.push({ type: "plan", planObject: packet.boardFacts.safePlanObjects[0] });
  }

  packet.allowedClaims = allowedClaims;
  packet.blockedClaims = blockedClaims;
  return packet;
}

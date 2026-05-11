import { Chess, validateFen } from "chess.js";
import type { Move } from "chess.js";

import { computeInfluenceMap } from "./geometry/influenceMap";
import { computeMobilityDelta } from "./geometry/mobilityDelta";
import { computeMoveDelta } from "./geometry/moveDelta";
import type { ChangedLine, ChangedSquare, Color, MobilityDelta, MoveDelta } from "./geometry/salienceTypes";
import { isBoardSquare } from "./geometry/lineGeometry";

export type LineKind = "attack" | "defense" | "plan" | "opponent";
export type CueKind = "origin" | "target" | "support" | "danger" | "opponent";
export type BoardViewName = "attack" | "defense" | "plan";

export type VisualLine = {
  from: string;
  to: string;
  kind: LineKind;
  label?: string;
  score?: number;
  reason?: string;
};

export type VisualCue = {
  square: string;
  kind: CueKind;
  score?: number;
  reason?: string;
};

export type VisualView = {
  title: string;
  message: string;
  lines: VisualLine[];
  cues: VisualCue[];
  insight?: string;
};

export type BlundrVisualModelOutput = {
  source: string;
  fallback: boolean;
  selectedView: BoardViewName;
  headline: string;
  mainExplanation: string;
  visualExplanation: string;
  planExplanation: string;
  nextPlan: string;
  keySquares: string[];
  planArrows: VisualLine[];
  attack: VisualView;
  defense: VisualView;
  plan: VisualView;
  threatNote?: string;
  suppress?: string[];
  confidence?: string;
  reason?: string;
  animation?: string;
  debug?: Record<string, unknown>;
};

export type CandidateClaimType =
  | "legal_move"
  | "center_control"
  | "center_tension"
  | "castle_safety"
  | "queen_danger"
  | "weak_square"
  | "attacks_square"
  | "quiet_development"
  | "pin_pressure"
  | "open_file_pressure";

export type CandidateClaim = {
  type: CandidateClaimType;
  move: string;
  square?: string;
  from?: string;
  to?: string;
  evidence: string;
  strength: number;
};

export type CandidateMoveFeature = {
  move: string;
  san?: string;
  from: string;
  to: string;
  promotion?: string;
  piece: string;
  color: Color;
  source: "expected" | "stockfish" | "candidate" | "derived";
  moveDelta: MoveDelta;
  mobilityDelta: MobilityDelta;
  topSquares: ChangedSquare[];
  topLines: ChangedLine[];
};

export type BlundrFeaturePacket = {
  fen: string;
  normalizedFen: string;
  turn: Color;
  openingName?: string;
  userColor?: Color;
  selectedView: BoardViewName;
  expectedMove?: string;
  stockfishBestMove?: string;
  derived: {
    candidateMoves: CandidateMoveFeature[];
    candidateSquares: string[];
    candidateArrows: VisualLine[];
    candidateClaims: CandidateClaim[];
  };
  raw?: Record<string, unknown>;
};

export type FeaturePacketInput = {
  fen: string;
  openingName?: string;
  userColor?: Color;
  selectedView?: BoardViewName;
  expectedMove?: string | { uci?: string; move?: string; san?: string };
  expectedMoves?: Array<{ uci?: string; move?: string; san?: string }>;
  stockfishBestMove?: string | { uci?: string; move?: string; san?: string };
  engine?: { pvs?: Array<{ uci?: string; move?: string; san?: string }> };
  clientEngine?: { pvs?: Array<{ uci?: string; move?: string; san?: string }> };
  candidateMoves?: Array<string | { uci?: string; move?: string; san?: string }>;
  derived?: Partial<BlundrFeaturePacket["derived"]>;
};

const CENTER = new Set(["d4", "e4", "d5", "e5"]);
const EXTENDED_CENTER = new Set(["c3", "d3", "e3", "f3", "c4", "d4", "e4", "f4", "c5", "d5", "e5", "f5", "c6", "d6", "e6", "f6"]);

function assertValidFen(fen: string): void {
  const validation = validateFen(fen);
  if (!validation.ok) {
    throw new Error(`Invalid FEN: ${validation.error}`);
  }
}

export function moveToUci(move: { from: string; to: string; promotion?: string }): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

function normalizeFen(fen: string): string {
  return fen.split(" ").slice(0, 4).join(" ");
}

function asUci(candidate: unknown): { uci: string; san?: string } | null {
  if (typeof candidate === "string") {
    return candidate.length >= 4 ? { uci: candidate } : null;
  }

  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const value = candidate as { uci?: unknown; move?: unknown; san?: unknown };
  const uci = typeof value.uci === "string" ? value.uci : typeof value.move === "string" ? value.move : "";
  if (uci.length < 4) {
    return null;
  }

  return { uci, san: typeof value.san === "string" ? value.san : undefined };
}

function legalMoveForUci(fen: string, uci: string): Move | null {
  try {
    const game = new Chess(fen);
    return game.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.length > 4 ? uci.slice(4, 5) : "q",
    });
  } catch {
    return null;
  }
}

function addCandidate(
  candidates: Array<{ uci: string; san?: string; source: CandidateMoveFeature["source"] }>,
  seen: Set<string>,
  item: unknown,
  source: CandidateMoveFeature["source"],
): void {
  const parsed = asUci(item);
  if (!parsed) {
    return;
  }

  const uci = parsed.uci.toLowerCase();
  if (seen.has(uci)) {
    return;
  }

  seen.add(uci);
  candidates.push({ uci, san: parsed.san, source });
}

function visualLine(from: string, to: string, kind: LineKind, label?: string, reason?: string, score?: number): VisualLine {
  return { from, to, kind, label, reason, score };
}

function addSquare(squares: Set<string>, square?: string): void {
  if (square && isBoardSquare(square)) {
    squares.add(square);
  }
}

function addArrow(arrows: VisualLine[], line: VisualLine): void {
  if (isBoardSquare(line.from) && isBoardSquare(line.to)) {
    arrows.push(line);
  }
}

function hasCastleFlag(move: Move): boolean {
  return move.san === "O-O" || move.san === "O-O-O" || move.isKingsideCastle() || move.isQueensideCastle();
}

function lineShowsPin(candidate: CandidateMoveFeature): CandidateClaim | null {
  const enemy = candidate.color === "w" ? "b" : "w";
  const after = computeInfluenceMap(candidate.moveDelta.afterFen);

  for (const line of candidate.topLines) {
    const enemyPieces = line.lineSquares.filter((square) => after.squares[square].occupiedBy?.color === enemy);
    const enemyKing = line.lineSquares.find((square) => after.squares[square].occupiedBy?.color === enemy && after.squares[square].occupiedBy?.piece === "k");
    if (enemyPieces.length >= 2 && enemyKing) {
      return {
        type: "pin_pressure",
        move: candidate.move,
        from: line.from,
        to: line.to,
        evidence: `line from ${line.from} to ${line.to} contains an enemy piece in front of the king`,
        strength: line.salience,
      };
    }
  }

  return null;
}

function buildClaims(candidate: CandidateMoveFeature, legalMove: Move): CandidateClaim[] {
  const claims: CandidateClaim[] = [
    {
      type: "legal_move",
      move: candidate.move,
      from: candidate.from,
      to: candidate.to,
      evidence: "validated by chess.js",
      strength: 1,
    },
  ];
  const after = computeInfluenceMap(candidate.moveDelta.afterFen);
  const enemy = candidate.color === "w" ? "b" : "w";
  const centerSquares = candidate.topSquares.filter((square) => CENTER.has(square.square));
  const extendedCenterSquares = candidate.topSquares.filter((square) => EXTENDED_CENTER.has(square.square));

  if (centerSquares.length || CENTER.has(candidate.to)) {
    claims.push({
      type: "center_control",
      move: candidate.move,
      square: centerSquares[0]?.square ?? candidate.to,
      evidence: "move delta increases salience on a central square",
      strength: centerSquares[0]?.totalSalience ?? 2,
    });
  }

  const tensionSquare = centerSquares.find((square) => after.squares[square.square]?.contested);
  if (tensionSquare) {
    claims.push({
      type: "center_tension",
      move: candidate.move,
      square: tensionSquare.square,
      evidence: "central square is contested after the move",
      strength: tensionSquare.totalSalience,
    });
  }

  if ((candidate.piece === "p" && (CENTER.has(candidate.to) || CENTER.has(candidate.from))) || centerSquares.length > 1) {
    claims.push({
      type: "center_tension",
      move: candidate.move,
      square: centerSquares[0]?.square ?? candidate.to,
      evidence: "central pawn move changes the center structure",
      strength: centerSquares[0]?.totalSalience ?? 2,
    });
  }

  if (hasCastleFlag(legalMove)) {
    claims.push({
      type: "castle_safety",
      move: candidate.move,
      from: candidate.from,
      to: candidate.to,
      evidence: "castling move validated by chess.js",
      strength: 8,
    });
  }

  for (const square of candidate.topSquares) {
    const influence = after.squares[square.square];
    const weak = enemy === "w" ? influence.weakForWhite || influence.hangingWhitePiece : influence.weakForBlack || influence.hangingBlackPiece;
    if (weak) {
      claims.push({
        type: "weak_square",
        move: candidate.move,
        square: square.square,
        evidence: "post-move influence map marks opponent weakness or hanging piece",
        strength: square.totalSalience,
      });
    }

    if (influence.occupiedBy?.color === enemy && influence.occupiedBy.piece === "q" && square.attackGain > 0) {
      claims.push({
        type: "queen_danger",
        move: candidate.move,
        square: square.square,
        evidence: "post-move attack gain touches the opponent queen",
        strength: square.totalSalience + influence.occupiedBy.value,
      });
    }

    if (square.attackGain >= 3 || square.occupiedTargetValue > 0 || square.kingProximityScore >= 6) {
      claims.push({
        type: "attacks_square",
        move: candidate.move,
        square: square.square,
        evidence: "move delta shows increased pressure on a salient square",
        strength: square.totalSalience,
      });
    }
  }

  for (const line of candidate.topLines) {
    if ((line.role === "file" || line.role === "rank") && (candidate.piece === "r" || candidate.piece === "q")) {
      claims.push({
        type: "open_file_pressure",
        move: candidate.move,
        from: line.from,
        to: line.to,
        evidence: `slider pressure on ${line.role}`,
        strength: line.salience,
      });
    }
  }

  const pinClaim = lineShowsPin(candidate);
  if (pinClaim) {
    claims.push(pinClaim);
  }

  const sharpClaims = claims.some((claim) => ["queen_danger", "weak_square", "pin_pressure", "open_file_pressure"].includes(claim.type));
  const developsMinor = (candidate.piece === "n" || candidate.piece === "b") && (candidate.from[1] === "1" || candidate.from[1] === "8");
  if (!sharpClaims && developsMinor && candidate.mobilityDelta.movedPieceGain > 0) {
    claims.push({
      type: "quiet_development",
      move: candidate.move,
      square: candidate.to,
      evidence: "minor piece develops and gains mobility without a sharper tactical claim",
      strength: candidate.mobilityDelta.movedPieceGain,
    });
  } else if (!sharpClaims && developsMinor && extendedCenterSquares.length) {
    claims.push({
      type: "quiet_development",
      move: candidate.move,
      square: candidate.to,
      evidence: "minor piece development supports useful central squares",
      strength: 1,
    });
  }

  return claims;
}

export function buildFeaturePacket(input: FeaturePacketInput): BlundrFeaturePacket {
  assertValidFen(input.fen);
  const game = new Chess(input.fen);
  const selectedView = ["attack", "defense", "plan"].includes(String(input.selectedView)) ? input.selectedView as BoardViewName : "plan";
  const seen = new Set<string>();
  const rawCandidates: Array<{ uci: string; san?: string; source: CandidateMoveFeature["source"] }> = [];

  addCandidate(rawCandidates, seen, input.expectedMove, "expected");
  for (const move of input.expectedMoves ?? []) {
    addCandidate(rawCandidates, seen, move, "expected");
  }
  addCandidate(rawCandidates, seen, input.stockfishBestMove, "stockfish");
  for (const move of input.engine?.pvs ?? []) {
    addCandidate(rawCandidates, seen, move, "stockfish");
  }
  for (const move of input.clientEngine?.pvs ?? []) {
    addCandidate(rawCandidates, seen, move, "stockfish");
  }
  for (const move of input.candidateMoves ?? []) {
    addCandidate(rawCandidates, seen, move, "candidate");
  }
  for (const move of input.derived?.candidateMoves ?? []) {
    addCandidate(rawCandidates, seen, move.move, "derived");
  }

  const candidateSquares = new Set<string>();
  const candidateArrows: VisualLine[] = [];
  const candidateClaims: CandidateClaim[] = [];
  const candidateMoves: CandidateMoveFeature[] = [];

  for (const raw of rawCandidates) {
    const legalMove = legalMoveForUci(input.fen, raw.uci);
    if (!legalMove) {
      continue;
    }

    const moveDelta = computeMoveDelta(input.fen, raw.uci, { topSquares: 12 });
    const mobilityDelta = computeMobilityDelta(input.fen, raw.uci);
    const feature: CandidateMoveFeature = {
      move: raw.uci,
      san: raw.san ?? legalMove.san,
      from: moveDelta.from,
      to: moveDelta.to,
      promotion: moveDelta.promotion,
      piece: moveDelta.piece,
      color: moveDelta.color,
      source: raw.source,
      moveDelta,
      mobilityDelta,
      topSquares: moveDelta.changedSquares,
      topLines: moveDelta.changedLines,
    };

    candidateMoves.push(feature);
    addSquare(candidateSquares, feature.from);
    addSquare(candidateSquares, feature.to);
    addArrow(candidateArrows, visualLine(feature.from, feature.to, "plan", feature.san, "legal candidate move", 999));

    for (const square of feature.topSquares) {
      addSquare(candidateSquares, square.square);
    }
    for (const line of feature.topLines) {
      for (const square of line.lineSquares) {
        addSquare(candidateSquares, square);
      }
      addArrow(candidateArrows, visualLine(line.from, line.to, "attack", line.role, "salience changed line", line.salience));
    }

    candidateClaims.push(...buildClaims(feature, legalMove));
  }

  for (const square of input.derived?.candidateSquares ?? []) {
    addSquare(candidateSquares, square);
  }
  for (const arrow of input.derived?.candidateArrows ?? []) {
    addArrow(candidateArrows, arrow);
  }
  for (const claim of input.derived?.candidateClaims ?? []) {
    candidateClaims.push(claim);
  }

  return {
    fen: input.fen,
    normalizedFen: normalizeFen(input.fen),
    turn: game.turn() as Color,
    openingName: input.openingName,
    userColor: input.userColor,
    selectedView,
    expectedMove: asUci(input.expectedMove)?.uci,
    stockfishBestMove: asUci(input.stockfishBestMove)?.uci ?? asUci(input.engine?.pvs?.[0])?.uci ?? asUci(input.clientEngine?.pvs?.[0])?.uci,
    derived: {
      candidateMoves,
      candidateSquares: Array.from(candidateSquares),
      candidateArrows,
      candidateClaims,
    },
    raw: input as Record<string, unknown>,
  };
}

function pendingOutput(packet: BlundrFeaturePacket, reason: string): BlundrVisualModelOutput {
  const view: VisualView = {
    title: "Recommendation pending",
    message: "Blundr is waiting for a verified repertoire or engine-backed candidate before drawing a recommendation.",
    lines: [],
    cues: [],
    insight: "No random legal fallback move is shown.",
  };

  return {
    source: "salience-selector",
    fallback: true,
    selectedView: packet.selectedView,
    headline: "Recommendation pending",
    mainExplanation: "No legal candidate move was available from the feature packet.",
    visualExplanation: "The visual selector suppresses unverified recommendations instead of inventing a legal fallback.",
    planExplanation: "Wait for a repertoire move, Stockfish move, or explicit candidate move.",
    nextPlan: "Recommendation pending.",
    keySquares: [],
    planArrows: [],
    attack: view,
    defense: view,
    plan: view,
    suppress: ["recommendation_pending"],
    confidence: "pending",
    reason,
    debug: { fallbackUsed: true },
  };
}

function uniqueLines(lines: VisualLine[], max: number): VisualLine[] {
  const seen = new Set<string>();
  const out: VisualLine[] = [];

  for (const line of lines) {
    if (!isBoardSquare(line.from) || !isBoardSquare(line.to)) {
      continue;
    }
    const key = `${line.from}-${line.to}-${line.kind}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    out.push(line);
    if (out.length >= max) {
      break;
    }
  }

  return out;
}

function uniqueSquares(squares: string[], max: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];

  for (const square of squares) {
    if (!isBoardSquare(square) || seen.has(square)) {
      continue;
    }
    seen.add(square);
    out.push(square);
    if (out.length >= max) {
      break;
    }
  }

  return out;
}

function repairView(view: VisualView, allowedSquares: Set<string>, allowedArrows: Set<string>, fallbackTitle: string): VisualView {
  const lines = uniqueLines(view.lines ?? [], 2).filter((line) => allowedArrows.has(`${line.from}-${line.to}`));
  const cues = (view.cues ?? [])
    .filter((cue) => isBoardSquare(cue.square) && allowedSquares.has(cue.square))
    .slice(0, 4);

  return {
    title: typeof view.title === "string" && view.title.trim() ? view.title.slice(0, 80) : fallbackTitle,
    message: typeof view.message === "string" && view.message.trim() ? view.message.slice(0, 320) : "Verified salience cue.",
    lines,
    cues,
    insight: typeof view.insight === "string" ? view.insight.slice(0, 260) : undefined,
  };
}

export function verifyVisualOutput(
  output: BlundrVisualModelOutput,
  packet: BlundrFeaturePacket,
  options: { mode?: "runtime" | "test" } = {},
): BlundrVisualModelOutput {
  if (!packet.derived.candidateMoves.length) {
    return pendingOutput(packet, "no legal candidate moves");
  }

  const allowedSquares = new Set(packet.derived.candidateSquares.filter(isBoardSquare));
  const allowedArrows = new Set(packet.derived.candidateArrows.map((line) => `${line.from}-${line.to}`));
  const selectedMove = typeof output.debug?.selectedMove === "string"
    ? packet.derived.candidateMoves.find((candidate) => candidate.move === output.debug?.selectedMove)
    : packet.derived.candidateMoves[0];

  if (selectedMove) {
    allowedSquares.add(selectedMove.from);
    allowedSquares.add(selectedMove.to);
    allowedArrows.add(`${selectedMove.from}-${selectedMove.to}`);
  }

  const planArrows = uniqueLines(output.planArrows ?? [], 2).filter((line) => allowedArrows.has(`${line.from}-${line.to}`));
  if (selectedMove && !planArrows.some((line) => line.from === selectedMove.from && line.to === selectedMove.to)) {
    planArrows.unshift(visualLine(selectedMove.from, selectedMove.to, "plan", selectedMove.san, "selected legal move", 999));
  }

  const keySquares = uniqueSquares(output.keySquares ?? [], 4);
  if (selectedMove && !keySquares.includes(selectedMove.to)) {
    keySquares.unshift(selectedMove.to);
  }

  const repaired: BlundrVisualModelOutput = {
    ...output,
    selectedView: ["attack", "defense", "plan"].includes(output.selectedView) ? output.selectedView : packet.selectedView,
    keySquares: uniqueSquares(keySquares.filter((square) => allowedSquares.has(square)), 4),
    planArrows: uniqueLines(planArrows, 2),
    attack: repairView(output.attack, allowedSquares, allowedArrows, "Attack"),
    defense: repairView(output.defense, allowedSquares, allowedArrows, "Defense"),
    plan: repairView(output.plan, allowedSquares, allowedArrows, "Plan"),
    suppress: Array.isArray(output.suppress) ? output.suppress.slice(0, 8) : [],
    debug: {
      ...(output.debug ?? {}),
      verifierMode: options.mode ?? "runtime",
      repaired: true,
    },
  };

  if (!repaired.keySquares.length && selectedMove) {
    repaired.keySquares = [selectedMove.to];
  }
  if (!repaired.plan.cues.some((cue) => cue.square === selectedMove?.to) && selectedMove) {
    repaired.plan.cues = [{ square: selectedMove.to, kind: "target" as const, reason: "selected destination" }, ...repaired.plan.cues].slice(0, 4);
  }

  return repaired;
}

export function recommendationPending(packetLike: BlundrFeaturePacket | FeaturePacketInput, reason = "salience selector failed"): BlundrVisualModelOutput {
  try {
    const packet = "derived" in packetLike && Array.isArray(packetLike.derived?.candidateMoves)
      ? packetLike as BlundrFeaturePacket
      : buildFeaturePacket(packetLike as FeaturePacketInput);
    return pendingOutput(packet, reason);
  } catch {
    const selectedView = ["attack", "defense", "plan"].includes(String((packetLike as FeaturePacketInput).selectedView))
      ? (packetLike as FeaturePacketInput).selectedView as BoardViewName
      : "plan";
    return pendingOutput({
      fen: String((packetLike as FeaturePacketInput).fen ?? ""),
      normalizedFen: "",
      turn: "w",
      selectedView,
      derived: {
        candidateMoves: [],
        candidateSquares: [],
        candidateArrows: [],
        candidateClaims: [],
      },
      raw: packetLike as Record<string, unknown>,
    }, reason);
  }
}

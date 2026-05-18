import type { BoardAnalysis, ConceptCandidate, MoveDelta, TeachingCueInput, VisualSquareCue } from "./teachingCueTypes";
import { centerSquares, fileOf } from "./squareUtils";

type DetectorInput = {
  before: BoardAnalysis;
  after: BoardAnalysis;
  delta: MoveDelta;
  input: TeachingCueInput;
};

function baseCandidate(input: DetectorInput, conceptId: ConceptCandidate["conceptId"], evidence: string[]): ConceptCandidate {
  return {
    conceptId,
    templateContext: {
      moveSan: input.input.move.san,
      targetSquare: input.delta.newlyAttackedPieces[0] ?? input.input.move.to,
    },
    visual: {
      primaryArrow: { from: input.input.move.from, to: input.input.move.to, kind: "move" },
      relationshipLines: [],
      keySquares: [{ square: input.input.move.to, kind: "target" }],
      ghostSquares: [],
      dangerSquares: [],
    },
    evidence,
    confidence: 0.55,
    deltaStrength: 0.5,
    visualClarity: 0.8,
    pedagogicalValue: 0.7,
    simplicity: 0.85,
    userNeed: 0.5,
    phaseFit: 0.5,
    tacticalUrgency: 0.4,
    penalties: 0,
  };
}

function squareCue(square: string, kind: VisualSquareCue["kind"]): VisualSquareCue {
  return { square, kind };
}

export function detectDevelopmentConcepts(input: DetectorInput): ConceptCandidate[] {
  const out: ConceptCandidate[] = [];
  const movedPiece = input.delta.movedPiece;
  if (movedPiece === "n" || movedPiece === "b") {
    if (input.delta.developmentDelta > 0 && (input.delta.newlyAttackedPieces.length > 0 || input.delta.kingZonePressureDelta > 0 || input.delta.centerControlDelta > 0)) {
      const c = baseCandidate(input, "development_with_pressure", ["minor piece developed", "new pressure created"]);
      c.deltaStrength = 0.8;
      c.confidence = 0.82;
      c.visual.relationshipLines = input.delta.newlyAttackedPieces.slice(0, 1).map((sq) => ({ from: input.input.move.to, to: sq, kind: "pressure" }));
      c.visual.keySquares = [squareCue(input.input.move.to, "target"), ...input.delta.newlyAttackedPieces.slice(0, 1).map((sq) => squareCue(sq, "danger"))].slice(0, 3);
      out.push(c);
    } else if (input.delta.developmentDelta > 0) {
      const c = baseCandidate(input, "quiet_development", ["minor piece developed"]);
      c.confidence = 0.76;
      c.deltaStrength = 0.64;
      out.push(c);
    }
  }
  return out;
}

export function detectCenterConcepts(input: DetectorInput): ConceptCandidate[] {
  const out: ConceptCandidate[] = [];
  const moveTo = input.input.move.to;
  const moveIsCenter = centerSquares().includes(moveTo);
  if (moveIsCenter || input.delta.centerControlDelta > 0) {
    const c = baseCandidate(input, "center_control", [moveIsCenter ? "piece moved into center" : "center control increased"]);
    c.confidence = 0.75;
    c.deltaStrength = Math.min(1, 0.6 + input.delta.centerControlDelta * 0.1);
    c.visual.keySquares = [squareCue(moveTo, centerSquares().includes(moveTo) ? "center" : "target")];
    out.push(c);
  }
  if (input.delta.isPawnMove && input.delta.centerControlDelta > 1) {
    const c = baseCandidate(input, "center_break", ["pawn challenges center"]);
    c.confidence = 0.7;
    c.deltaStrength = 0.72;
    c.visual.keySquares = [squareCue(moveTo, "center")];
    out.push(c);
  }
  return out;
}

export function detectKingSafetyConcepts(input: DetectorInput): ConceptCandidate[] {
  const out: ConceptCandidate[] = [];
  if (input.delta.isCastle) {
    const c = baseCandidate(input, "castle_for_safety", ["castling move"]);
    c.confidence = 0.95;
    c.deltaStrength = 0.85;
    c.pedagogicalValue = 0.9;
    c.visual.keySquares = [squareCue(input.input.move.to, "king_safety")];
    out.push(c);
  } else if (input.delta.kingSafetyDelta > 1) {
    const c = baseCandidate(input, "king_safety_escape", ["king safety improved"]);
    c.confidence = 0.68;
    c.deltaStrength = 0.66;
    c.visual.keySquares = [squareCue(input.input.move.to, "king_safety")];
    out.push(c);
  }
  return out;
}

export function detectTacticalConcepts(input: DetectorInput): ConceptCandidate[] {
  const out: ConceptCandidate[] = [];
  if (input.delta.isCheckmate) {
    const c = baseCandidate(input, "checkmate_threat", ["mate pattern"]);
    c.confidence = 0.99;
    c.tacticalUrgency = 0.95;
    c.deltaStrength = 0.95;
    out.push(c);
    return out;
  }
  if (input.delta.isCheck) {
    const c = baseCandidate(input, "forcing_check", ["forcing check"]);
    c.confidence = 0.8;
    c.tacticalUrgency = 0.8;
    out.push(c);
  }
  const targetLoose = input.delta.newlyAttackedPieces.find((sq) => input.after.loosePieces.includes(sq) || input.after.hangingPieces.includes(sq));
  if (targetLoose) {
    const c = baseCandidate(input, "win_loose_piece", ["new attack on loose piece"]);
    c.confidence = 0.85;
    c.deltaStrength = 0.82;
    c.tacticalUrgency = 0.78;
    c.visual.relationshipLines = [{ from: input.input.move.to, to: targetLoose, kind: "attack" }];
    c.visual.keySquares = [squareCue(input.input.move.to, "target"), squareCue(targetLoose, "danger")];
    out.push(c);
  } else if (input.delta.isCapture) {
    const c = baseCandidate(input, "safe_capture", ["capture move"]);
    c.confidence = 0.65;
    c.deltaStrength = 0.62;
    out.push(c);
  }
  if (input.delta.newlyAttackedPieces.length >= 2 && input.delta.movedPiece === "n") {
    const c = baseCandidate(input, "fork_creation", ["single move attacks multiple targets"]);
    c.confidence = 0.74;
    c.tacticalUrgency = 0.7;
    c.visual.keySquares = [squareCue(input.input.move.to, "target"), ...input.delta.newlyAttackedPieces.slice(0, 2).map((sq) => squareCue(sq, "danger"))];
    out.push(c);
  }
  return out;
}

export function detectOpenFileConcepts(input: DetectorInput): ConceptCandidate[] {
  const out: ConceptCandidate[] = [];
  const movedPiece = input.delta.movedPiece;
  const toFile = fileOf(input.input.move.to);
  if ((movedPiece === "r" || movedPiece === "q") && (input.after.openFiles.includes(toFile) || input.after.halfOpenFiles[input.input.sideToMove].includes(toFile))) {
    const c = baseCandidate(input, movedPiece === "r" ? "rook_activation" : "open_file_pressure", ["heavy piece moved to open/half-open file"]);
    c.confidence = 0.74;
    c.deltaStrength = 0.7;
    c.visual.keySquares = [squareCue(input.input.move.to, "target")];
    out.push(c);
  }
  return out;
}

export function detectPawnStructureConcepts(input: DetectorInput): ConceptCandidate[] {
  const out: ConceptCandidate[] = [];
  if (!input.delta.isPawnMove) return out;
  const to = input.input.move.to;
  const rank = Number(to[1]);
  const side = input.input.sideToMove;
  const advanced = side === "w" ? rank >= 5 : rank <= 4;
  if (advanced) {
    const c = baseCandidate(input, "space_gain", ["pawn advances and gains space"]);
    c.confidence = 0.64;
    c.deltaStrength = 0.6;
    c.visual.keySquares = [squareCue(to, "center")];
    out.push(c);
  }
  const passed = input.after.pawnStructure.passedPawns[side].includes(to);
  if (passed) {
    const c = baseCandidate(input, "passed_pawn_push", ["passed pawn advanced"]);
    c.confidence = 0.8;
    c.deltaStrength = 0.78;
    c.visual.keySquares = [squareCue(to, "target")];
    out.push(c);
  }
  return out;
}

export function detectDefensiveConcepts(input: DetectorInput): ConceptCandidate[] {
  const out: ConceptCandidate[] = [];
  const side = input.input.sideToMove;
  const beforeHanging = input.before.hangingPieces.filter((sq) => input.before.pieces.some((p) => p.square === sq && p.color === side));
  const afterHanging = input.after.hangingPieces.filter((sq) => input.after.pieces.some((p) => p.square === sq && p.color === side));
  if (beforeHanging.length > afterHanging.length) {
    const c = baseCandidate(input, "defensive_resource", ["reduced number of hanging pieces"]);
    c.confidence = 0.72;
    c.deltaStrength = 0.7;
    c.userNeed = 0.72;
    c.visual.keySquares = afterHanging.length ? afterHanging.slice(0, 1).map((sq) => squareCue(sq, "support")) : [squareCue(input.input.move.to, "support")];
    out.push(c);
  }
  if (input.delta.newlyDefendedPieces.length > 0) {
    const c = baseCandidate(input, "threat_prevention", ["newly defended own piece"]);
    c.confidence = 0.66;
    c.deltaStrength = 0.58;
    c.userNeed = 0.7;
    c.visual.keySquares = input.delta.newlyDefendedPieces.slice(0, 2).map((sq) => squareCue(sq, "support"));
    out.push(c);
  }
  return out;
}

export function detectEndgameConcepts(input: DetectorInput): ConceptCandidate[] {
  const out: ConceptCandidate[] = [];
  const totalMaterial = input.after.material.w + input.after.material.b;
  if (totalMaterial <= 20 && input.delta.movedPiece === "k") {
    const c = baseCandidate(input, "king_activity_endgame", ["king move in low-material position"]);
    c.confidence = 0.78;
    c.phaseFit = 0.9;
    c.deltaStrength = 0.7;
    c.visual.keySquares = [squareCue(input.input.move.to, "target")];
    out.push(c);
  }
  return out;
}

export function detectDefaultConcept(input: DetectorInput): ConceptCandidate[] {
  const c = baseCandidate(input, "default_pattern", ["fallback validated pattern"]);
  c.confidence = 0.4;
  c.deltaStrength = 0.35;
  c.pedagogicalValue = 0.55;
  c.simplicity = 0.95;
  c.visual.relationshipLines = [];
  c.visual.keySquares = [squareCue(input.input.move.to, "target")];
  return [c];
}

export function detectAllConcepts(input: DetectorInput): ConceptCandidate[] {
  return [
    ...detectDevelopmentConcepts(input),
    ...detectCenterConcepts(input),
    ...detectKingSafetyConcepts(input),
    ...detectTacticalConcepts(input),
    ...detectOpenFileConcepts(input),
    ...detectPawnStructureConcepts(input),
    ...detectDefensiveConcepts(input),
    ...detectEndgameConcepts(input),
    ...detectDefaultConcept(input),
  ];
}

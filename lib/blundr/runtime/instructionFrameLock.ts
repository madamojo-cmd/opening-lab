import {
  type BlundrPieceType,
  type CurrentInstructionDebugIssue,
  type CurrentInstructionSource,
  type CurrentInstructionFrame,
  type CurrentInstructionTarget,
  assertLockedInstructionTarget,
  getFrameTargetSignature,
  getInstructionTargetOrNull,
} from "./currentInstructionFrame";
import { normalizeChessColor, splitUciMove } from "./currentInstructionTarget";

export interface InstructionFrameLock {
  frameKey: string;
  targetUci: string | null;
  targetSignature: string | null;
  createdAt: string;
}

export interface InstructionFrameLockValidation {
  matches: boolean;
  reasons: string[];
}

export function createInstructionFrameLock(frame: CurrentInstructionFrame): InstructionFrameLock {
  const target = getInstructionTargetOrNull(frame);
  return {
    frameKey: frame.frameKey,
    targetUci: target?.uci ?? null,
    targetSignature: target ? getFrameTargetSignature(frame) : null,
    createdAt: new Date().toISOString(),
  };
}

export function validateInstructionFrameLock(input: {
  frame: CurrentInstructionFrame;
  lock: InstructionFrameLock;
}): InstructionFrameLockValidation {
  const reasons: string[] = [];
  const frameTarget = getInstructionTargetOrNull(input.frame);
  const frameSignature = frameTarget ? getFrameTargetSignature(input.frame) : null;

  if (input.lock.frameKey !== input.frame.frameKey) {
    reasons.push("frame_key_mismatch");
  }
  if (input.lock.targetUci !== (frameTarget?.uci ?? null)) {
    reasons.push("target_uci_mismatch");
  }
  if (input.lock.targetSignature !== frameSignature) {
    reasons.push("target_signature_mismatch");
  }

  return { matches: reasons.length === 0, reasons };
}

export function isLockedInstructionTarget(target: CurrentInstructionTarget | null | undefined): boolean {
  return Boolean(target && target.provenance?.confidence === "locked");
}

export function lockInstructionTarget(input: {
  uci: string;
  san?: string;
  pieceType: BlundrPieceType;
  color: "white" | "black" | "w" | "b";
  source: CurrentInstructionSource;
  reason: string;
  flags?: Partial<CurrentInstructionTarget["flags"]>;
}): CurrentInstructionTarget {
  const split = splitUciMove(input.uci);
  const flags = {
    isCapture: false,
    isCheck: false,
    isCheckmate: false,
    isCastle: false,
    isPromotion: false,
    isEnPassant: false,
    ...(input.flags ?? {}),
  };
  return {
    uci: input.uci.toLowerCase(),
    san: input.san,
    from: split.from,
    to: split.to,
    pieceType: input.pieceType,
    color: normalizeChessColor(input.color),
    flags,
    provenance: {
      source: input.source,
      reason: input.reason,
      confidence: "locked",
    },
    isCapture: flags.isCapture,
    isCheck: flags.isCheck,
    isMate: flags.isCheckmate,
    isCheckmate: flags.isCheckmate,
    isPromotion: flags.isPromotion,
    isCastle: flags.isCastle,
    isEnPassant: flags.isEnPassant,
  };
}

export function assertFrameTargetLocked(frame: CurrentInstructionFrame): CurrentInstructionTarget {
  return assertLockedInstructionTarget(frame);
}

export function createTargetMismatchIssue(input: {
  expected: string | null;
  actual: string | null;
  surface: string;
}): CurrentInstructionDebugIssue {
  return {
    code: "target_source_ambiguous",
    severity: "critical",
    message: `Target mismatch on ${input.surface}.`,
    details: {
      expected: input.expected,
      actual: input.actual,
      surface: input.surface,
    },
  };
}

import {
  type CurrentInstructionFrame,
  type CurrentInstructionTarget,
  getFrameTargetSignature,
  getInstructionTargetOrNull,
} from "./currentInstructionFrame";

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

import type { CompiledCoachFrame } from "../coachCompiler/types";
import { containsUnsafeStrongClaim, downgradeUnsafeStrongClaim } from "../coachCompiler/copyPolicy";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { CoachSafetyIssue } from "./types";

function hasCode(issues: CoachSafetyIssue[], codes: string[]): boolean {
  return issues.some((issue) => codes.includes(issue.code));
}

function normalizePiece(piece: string | null | undefined): "pawn" | "knight" | "bishop" | "rook" | "queen" | "king" | null {
  const value = String(piece ?? "").trim().toLowerCase();
  if (value === "p" || value === "pawn") return "pawn";
  if (value === "n" || value === "knight") return "knight";
  if (value === "b" || value === "bishop") return "bishop";
  if (value === "r" || value === "rook") return "rook";
  if (value === "q" || value === "queen") return "queen";
  if (value === "k" || value === "king") return "king";
  return null;
}

function buildRecoverableTeachingCopy(input: {
  targetSan: string | null;
  pieceType: string | null;
  to: string | null;
}): { title: string; body: string } {
  const targetSan = input.targetSan ?? "Target move";
  const piece = normalizePiece(input.pieceType);
  const to = input.to ?? "an active square";
  const centerSquares = new Set(["c4", "d4", "e4", "f4", "c5", "d5", "e5", "f5"]);

  if (piece === "knight") {
    return {
      title: `${targetSan} — Develop the knight`,
      body: `Move the knight to ${to}. This develops your knight toward active central squares.`,
    };
  }

  if (piece === "bishop") {
    return {
      title: `${targetSan} — Develop the bishop`,
      body: `Move the bishop to ${to}. This develops your bishop onto a useful diagonal.`,
    };
  }

  if (piece === "pawn" && centerSquares.has(to.toLowerCase())) {
    return {
      title: `${targetSan} — Challenge the center`,
      body: `Move the pawn to ${to}. This contests central space and opens lines for your pieces.`,
    };
  }

  if (piece === "pawn") {
    return {
      title: `${targetSan} — Improve your structure`,
      body: `Move the pawn to ${to}. This improves your structure while supporting future development.`,
    };
  }

  if (piece === "rook") {
    return {
      title: `${targetSan} — Activate the rook`,
      body: `Move the rook to ${to}. This improves rook activity and coordination.`,
    };
  }

  if (piece === "queen") {
    return {
      title: `${targetSan} — Improve queen activity`,
      body: `Move the queen to ${to}. This improves piece coordination with a safe, target-aligned plan.`,
    };
  }

  if (piece === "king") {
    return {
      title: `${targetSan} — Improve king safety`,
      body: `Move the king to ${to}. This supports king safety and piece coordination.`,
    };
  }

  return {
    title: `${targetSan} — Improve your position`,
    body: `Play ${targetSan}. This keeps your plan target-aligned with safe evidence.`,
  };
}

export function buildSafeFallbackCompiledFrame(input: {
  frame: CurrentInstructionFrame;
  compiled: CompiledCoachFrame;
  issues: CoachSafetyIssue[];
}): CompiledCoachFrame {
  const issueCodes = input.issues.map((issue) => issue.code);
  const targetInvalid = hasCode(input.issues, [
    "target_mismatch",
    "compiler_target_mismatch",
    "graph_target_mismatch",
    "piece_mismatch",
    "null_target_move_coaching",
  ]);
  const nullViolation = hasCode(input.issues, ["null_target_visual", "null_target_reveal", "null_target_move_coaching"]);
  const hasCritical = input.issues.some((issue) => issue.severity === "critical");
  const revealValid = !hasCritical
    && !hasCode(input.issues, ["reveal_mismatch", "null_target_reveal"])
    && input.frame.target
    && input.compiled.revealAction.kind === "reveal_target"
    && input.compiled.revealAction.targetUci === input.frame.target.uci;

  const keepTarget = Boolean(input.frame.target) && !targetInvalid;
  const plainLeakDetected = hasCode(input.issues, ["plain_leak"]);
  const strongClaimBlocked = hasCode(input.issues, ["unsupported_strong_claim", "claim_without_evidence"]);
  const recoverableOnly = input.issues.length > 0 && input.issues.every((issue) => issue.code === "unsupported_strong_claim" || issue.code === "claim_without_evidence");
  const safeTargetSan = input.compiled.targetSan ?? input.frame.target?.san ?? null;
  const sanitizeBlockedBody = (text: string, fallback: string) => {
    const value = String(text ?? "").trim();
    if (!value) return fallback;
    if (strongClaimBlocked || containsUnsafeStrongClaim(value)) return downgradeUnsafeStrongClaim(value);
    return value;
  };
  const recoverableTeachingCopy = buildRecoverableTeachingCopy({
    targetSan: safeTargetSan,
    pieceType: input.compiled.pieceType ?? input.frame.target?.pieceType ?? null,
    to: input.compiled.to ?? input.frame.target?.to ?? null,
  });
  const blockedAssisted = keepTarget
    ? {
        ...input.compiled.assisted,
        title: recoverableOnly ? recoverableTeachingCopy.title : (input.compiled.assisted.title || "Guided move"),
        body: sanitizeBlockedBody(
          recoverableOnly ? recoverableTeachingCopy.body : input.compiled.assisted.body,
          recoverableOnly
            ? recoverableTeachingCopy.body
            : (safeTargetSan ? `Play ${safeTargetSan} to improve your position.` : "Play the guided move to improve your position."),
        ),
        bullets: Array.isArray(input.compiled.assisted.bullets) ? input.compiled.assisted.bullets : [],
      }
    : {
        title: "Safety Blocked",
        body: "No move-specific coaching is available in this frame.",
        bullets: [],
        evidenceClaimIds: [],
        leakRisk: "none" as const,
      };
  const blockedShowMore = keepTarget
    ? {
        ...input.compiled.showMore,
        title: recoverableOnly ? recoverableTeachingCopy.title : (input.compiled.showMore.title || "Show More"),
        body: sanitizeBlockedBody(
          recoverableOnly ? recoverableTeachingCopy.body : input.compiled.showMore.body,
          recoverableOnly
            ? recoverableTeachingCopy.body
            : (safeTargetSan ? `${safeTargetSan} is supported by safe, target-aligned evidence.` : "The move is supported by safe, target-aligned evidence."),
        ),
        bullets: Array.isArray(input.compiled.showMore.bullets) ? input.compiled.showMore.bullets : [],
      }
    : {
        title: "Safety Blocked",
        body: "No additional move-specific explanation is available.",
        bullets: [],
        evidenceClaimIds: [],
        leakRisk: "none" as const,
      };
  const blockedPlain = keepTarget && !plainLeakDetected
    ? {
        ...input.compiled.plain,
        title: input.compiled.plain.title || "Your Hint",
        body: input.compiled.plain.body || "Look for an improving move.",
        bullets: Array.isArray(input.compiled.plain.bullets) ? input.compiled.plain.bullets : [],
      }
    : {
        title: "Safety Fallback",
        body: "Think about the safest improving move here.",
        bullets: ["Detailed coaching was blocked for safety."],
        evidenceClaimIds: [],
        leakRisk: "none" as const,
      };

  return {
    ...input.compiled,
    targetUci: keepTarget ? input.compiled.targetUci : null,
    targetSan: keepTarget ? input.compiled.targetSan : null,
    pieceType: keepTarget ? input.compiled.pieceType : null,
    from: keepTarget ? input.compiled.from : null,
    to: keepTarget ? input.compiled.to : null,
    plain: blockedPlain,
    assisted: blockedAssisted,
    showMore: blockedShowMore,
    visualIntents: hasCritical || targetInvalid || nullViolation ? [] : input.compiled.visualIntents,
    revealAction: revealValid
      ? input.compiled.revealAction
      : {
          kind: "none",
          label: "No reveal",
          targetUci: null,
          targetSan: null,
        },
    safetyPrecheck: {
      criticalIssues: [...new Set([...input.compiled.safetyPrecheck.criticalIssues, ...issueCodes])],
      warnings: [...new Set(input.compiled.safetyPrecheck.warnings)],
    },
    debug: {
      ...input.compiled.debug,
      suppressedConceptIds: [...new Set([...(input.compiled.debug.suppressedConceptIds ?? []), ...issueCodes])],
      slotKeys: [...new Set(input.compiled.debug.slotKeys ?? [])],
    },
  };
}

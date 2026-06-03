import type { CompiledCoachFrame } from "../coachCompiler/types";
import type { CurrentInstructionFrame } from "../runtime/currentInstructionFrame";
import type { CoachSafetyIssue } from "./types";

export function textContainsTargetLeak(input: {
  text: string;
  targetSan?: string | null;
  targetUci?: string | null;
  from?: string | null;
  to?: string | null;
  pieceType?: string | null;
}): boolean {
  const lower = String(input.text ?? "").toLowerCase();
  const direct = [input.targetSan, input.targetUci, input.from, input.to, input.pieceType]
    .map((value) => String(value ?? "").trim().toLowerCase())
    .filter((value) => value.length > 0);

  if (direct.some((token) => lower.includes(token))) return true;

  if (input.pieceType && input.to) {
    const phrase = `move the ${String(input.pieceType).toLowerCase()} to ${String(input.to).toLowerCase()}`;
    if (lower.includes(phrase)) return true;
  }

  return false;
}

export function detectPlainLeaks(input: {
  frame: CurrentInstructionFrame;
  compiled: CompiledCoachFrame;
}): CoachSafetyIssue[] {
  const target = input.frame.target;
  if (!target) return [];

  const hasLeak = textContainsTargetLeak({
    text: `${input.compiled.plain.title} ${input.compiled.plain.body} ${input.compiled.plain.bullets.join(" ")}`,
    targetSan: target.san ?? null,
    targetUci: target.uci,
    from: target.from,
    to: target.to,
    pieceType: target.pieceType,
  });

  if (!hasLeak) return [];

  return [
    {
      code: "plain_leak",
      severity: "critical",
      message: "Plain text leaks target information before Show More.",
      surface: "plain",
      expected: "no target leak",
      actual: "target leak detected",
    },
  ];
}

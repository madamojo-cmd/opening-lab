import type { CoachContext } from "./coachTypes";

export type HintLevel = "soft_hint" | "strong_hint" | "answer";

export function chooseHintLevel(context: CoachContext, hintRequestCount: number): HintLevel {
  if (context.answerShown || context.revealState === "revealed") return "answer";
  if (context.wrongAttempts >= 1) return "strong_hint";
  if (context.hintUsed) return "strong_hint";
  if (hintRequestCount >= 2) return "strong_hint";
  if (context.elapsedMs >= 30000) return "strong_hint";
  return "soft_hint";
}

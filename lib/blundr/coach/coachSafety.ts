import type { CoachContext, CoachCopyEntry, CoachDecision } from "./coachTypes";

const BANNED_TERMS = [
  "verified_top2",
  "repertoire_supported",
  "engine_close",
  "context_mode_does_not_recommend_move",
  "selected_grounding",
  "visualintent",
  "movetrust",
  "fallback",
  "untrusted",
  "top two",
  "stockfish",
  "maia probability",
  "centipawn",
  "engine delta",
  "severe_warning",
];

const UNSUPPORTED_TACTICAL = ["fork", "pin", "skewer", "mate", "forced win", "trapped"];

const REQUIRED_OBJECTS = [
  "bishop",
  "rook",
  "king",
  "pawn",
  "f7",
  "d4",
  "e4",
  "center",
  "e-file",
  "diagonal",
  "king safety",
  "pawn break",
  "pressure",
  "development",
  "target",
  "central plan",
  "piece activity",
  "open file",
  "least active piece",
  "plan",
];

export type CoachSafetyResult = {
  allowed: boolean;
  warnings: string[];
};

function containsAny(text: string, tokens: string[]): string[] {
  const lower = text.toLowerCase();
  return tokens.filter((token) => lower.includes(token.toLowerCase()));
}

function containsUnsupportedTactical(text: string): string[] {
  const lower = text.toLowerCase();
  return UNSUPPORTED_TACTICAL.filter((token) => {
    if (token.includes(" ")) return lower.includes(token);
    const regex = new RegExp(`\\b${token}\\b`, "i");
    return regex.test(text);
  });
}

function hasRequiredObject(text: string): boolean {
  const lower = text.toLowerCase();
  return REQUIRED_OBJECTS.some((token) => lower.includes(token));
}

export function validateCoachCopyEntry(entry: CoachCopyEntry): CoachSafetyResult {
  const warnings: string[] = [];
  const banned = containsAny(entry.text, BANNED_TERMS);
  if (banned.length) warnings.push(`banned:${banned.join(",")}`);
  if (!hasRequiredObject(entry.text)) warnings.push("missing_concrete_object");
  if (entry.givesAnswer && !entry.requiresAnswerPermission) warnings.push("answer_without_permission_gate");
  if (entry.givesAnswer && !/\b[a-h][1-8][a-h][1-8]\b|\bO-O\b|\bO-O-O\b|\b[BKQRN]?[a-h]?[1-8]?x?[a-h][1-8]/.test(entry.text)) {
    warnings.push("answer_missing_move_notation");
  }
  return { allowed: warnings.length === 0, warnings };
}

export function validateCoachDecision(context: CoachContext, decision: CoachDecision): CoachSafetyResult {
  const warnings: string[] = [];
  const text = `${decision.title ?? ""} ${decision.body ?? ""} ${decision.hint ?? ""} ${decision.answer ?? ""} ${decision.why ?? ""}`.trim();

  const banned = containsAny(text, BANNED_TERMS);
  if (banned.length) warnings.push(`banned:${banned.join(",")}`);

  if (context.viewMode === "plain" && context.revealState === "hidden" && decision.givesAnswer && !context.answerShown) {
    warnings.push("plain_answer_leak");
  }

  if (!context.recipeFrameMatchesBoard || !context.recipeFenMatchesBoard) {
    if (text) warnings.push("stale_context_output");
  }

  const unsupported = containsUnsupportedTactical(text);
  if (unsupported.length && !decision.claimTypes.includes("tactical_claim")) {
    warnings.push(`unsupported_tactical_claim:${unsupported.join(",")}`);
  }

  if ((decision.body || decision.hint || decision.answer) && !hasRequiredObject(text)) {
    warnings.push("missing_concrete_object");
  }

  if (decision.givesAnswer && !context.exactMoveAllowed && context.viewMode !== "assisted") {
    warnings.push("exact_move_not_allowed");
  }

  return { allowed: warnings.length === 0, warnings };
}

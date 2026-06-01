import { COACH_COPY_LIBRARY } from "../coach/coachCopyLibrary";
import { getLiveCoachCopyCatalog } from "../liveCoach/liveCoachCopyLibrary";

const BANNED = [
  "stockfish",
  "maia probability",
  "centipawn",
  "verified_top2",
  "repertoire_supported",
  "engine_close",
  "movetrust",
  "visualintent",
  "fallback",
  "untrusted",
  "severe_warning",
  "top two",
  "engine delta",
  "context_mode_does_not_recommend_move",
];

const TACTICAL_WORDS = ["fork", "pin", "skewer", "mate", "forced win", "trapped"];

function hasConcreteObject(text: string): boolean {
  return /bishop|rook|king|pawn|piece|f7|d4|e4|center|e-file|diagonal|safety|break|pressure|development|target|plan|activity|open file|least active|support/i.test(text);
}

export type CoachCopyLintIssue = {
  id: string;
  issue: string;
};

export function lintCoachCopy(): CoachCopyLintIssue[] {
  const issues: CoachCopyLintIssue[] = [];
  const live = getLiveCoachCopyCatalog();

  for (const entry of COACH_COPY_LIBRARY) {
    const lower = entry.text.toLowerCase();
    for (const banned of BANNED) {
      if (lower.includes(banned)) issues.push({ id: entry.utteranceId, issue: `banned:${banned}` });
    }
    if (entry.text.length > 120) issues.push({ id: entry.utteranceId, issue: "long_copy" });
    if (!hasConcreteObject(entry.text)) {
      issues.push({ id: entry.utteranceId, issue: "vague_copy" });
    }
    if (entry.givesAnswer && !/\bO-O\b|\bO-O-O\b|\bplay\b|\bcastle\b|\b[a-h][1-8][a-h][1-8]\b|\b[BKQRN]?[a-h]?[1-8]?x?[a-h][1-8]/i.test(entry.text)) {
      issues.push({ id: entry.utteranceId, issue: "answer_missing_move" });
    }
    if (!entry.requiresAnswerPermission && /\bplay\s+[nbrqk]?[a-h]?[1-8]?x?[a-h][1-8]\b/i.test(entry.text)) {
      issues.push({ id: entry.utteranceId, issue: "hint_leaks_exact_move" });
    }
    for (const word of TACTICAL_WORDS) {
      if (word.includes(" ")) {
        if (lower.includes(word)) issues.push({ id: entry.utteranceId, issue: `unsupported_tactical_word:${word}` });
      } else {
        const regex = new RegExp(`\\b${word}\\b`, "i");
        if (regex.test(entry.text)) issues.push({ id: entry.utteranceId, issue: `unsupported_tactical_word:${word}` });
      }
    }
  }

  for (const [opportunity, variants] of Object.entries(live)) {
    for (let i = 0; i < variants.length; i += 1) {
      const id = `live:${opportunity}:${i}`;
      const lower = variants[i].toLowerCase();
      for (const banned of BANNED) {
        if (lower.includes(banned)) issues.push({ id, issue: `banned:${banned}` });
      }
    }
  }

  return issues;
}

import { approxTokenCount, BLOCKED_UNSUPPORTED_WORDS, RAW_INTERNAL_TERMS, sentenceCount } from "./chessLanguageLibrary";
import type { CoachTemplate } from "./explanationTypes";

export function lintCoachExplanation(input: { text: string; template?: CoachTemplate; plainLeakPolicy?: boolean }): { allowed: boolean; warnings: string[] } {
  const warnings: string[] = [];
  for (const term of RAW_INTERNAL_TERMS) {
    if (input.text.toLowerCase().includes(term.toLowerCase())) warnings.push(`raw_internal_term:${term}`);
  }
  for (const term of BLOCKED_UNSUPPORTED_WORDS) {
    if (input.text.toLowerCase().includes(term.toLowerCase())) warnings.push(`unsupported_voice:${term}`);
  }
  if (/\{[a-zA-Z0-9]+\}/.test(input.text)) warnings.push("unresolved_template_variable");
  if (input.template && sentenceCount(input.text) > input.template.maxSentences) warnings.push("too_many_sentences");
  if (input.template && approxTokenCount(input.text) > input.template.maxTokensApprox) warnings.push("too_many_tokens");
  if (input.plainLeakPolicy && input.template?.safety.leaksAnswerInPlain) warnings.push("plain_view_answer_leak");
  return { allowed: warnings.length === 0, warnings };
}

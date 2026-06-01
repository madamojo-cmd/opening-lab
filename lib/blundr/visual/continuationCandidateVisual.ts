import { Chess } from "chess.js";

export interface ContinuationCandidateVisualLine {
  from: string;
  to: string;
  kind: "plan";
  label?: string;
}

export interface ContinuationCandidateVisualHighlight {
  square: string;
  role: "target";
}

export interface ContinuationCandidateVisualResult {
  source: "continuation_candidate";
  shouldRender: boolean;
  lines: ContinuationCandidateVisualLine[];
  highlights: ContinuationCandidateVisualHighlight[];
  blockedReason?: string;
}

function moveToUci(move: { from: string; to: string; promotion?: string }): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

export function buildContinuationCandidateVisual(input: {
  boardFen: string;
  candidateUci?: string | null;
  candidateSan?: string | null;
}): ContinuationCandidateVisualResult {
  const uci = input.candidateUci?.trim().toLowerCase();
  if (!uci || uci.length < 4) {
    return { source: "continuation_candidate", shouldRender: false, lines: [], highlights: [], blockedReason: "missing_candidate_uci" };
  }
  try {
    const game = new Chess(input.boardFen);
    const legal = (game.moves({ verbose: true }) as any[]).find((move) => moveToUci(move) === uci);
    if (!legal) {
      return { source: "continuation_candidate", shouldRender: false, lines: [], highlights: [], blockedReason: "candidate_not_legal" };
    }
    return {
      source: "continuation_candidate",
      shouldRender: true,
      lines: [{ from: legal.from, to: legal.to, kind: "plan", label: input.candidateSan ?? legal.san ?? uci }],
      highlights: [{ square: legal.to, role: "target" }],
    };
  } catch {
    return { source: "continuation_candidate", shouldRender: false, lines: [], highlights: [], blockedReason: "invalid_board_fen" };
  }
}

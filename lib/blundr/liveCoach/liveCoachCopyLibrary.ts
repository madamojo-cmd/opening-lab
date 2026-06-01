import type { CoachOpportunity } from "./liveCoachTypes";

function pieceName(piece: string): string {
  return piece === "p" ? "pawn" : piece === "n" ? "knight" : piece === "b" ? "bishop" : piece === "r" ? "rook" : piece === "q" ? "queen" : "king";
}

const COPY: Record<CoachOpportunity, string[]> = {
  predictable_human_mistake: [
    "That move is tempting because it looks active, but it gives up the center too early.",
    "Many players look for the forcing move here, but the quiet improvement solves the real problem.",
  ],
  hard_to_find_good_move: [
    "The quiet move is hard to see because it improves a piece in the center without an immediate threat.",
    "This idea is subtle: improve the piece first, then decide whether to open the center.",
  ],
  natural_good_move: ["Good. That natural move keeps the center stable."],
  pattern_transfer: [
    "This connects to the c3 idea: the d4 break works best when it has support.",
    "This is the same safety idea from castling: solve the king before the center opens.",
  ],
  plan_transition: [
    "You’re past the prepared line now. The center is still the story, so improve a piece before forcing the break.",
    "The memorized line is over. Start with king safety, the center, and your least active piece.",
  ],
  center_decision: [
    "The center is still tense. Decide whether to maintain, resolve, or reinforce it.",
    "Before forcing the center, check whether your pieces are ready for it to open.",
  ],
  king_safety_urgent: [
    "If the center opens, king safety matters more than grabbing space.",
    "Before starting an attack, make sure your king is not the one stuck in the center.",
  ],
  least_active_piece: [
    "Look for the piece that is still not helping your plan.",
    "Your best improvement is often the piece that has not joined the game yet.",
  ],
  premature_attack_warning: [
    "That attack comes before the center is ready.",
    "The active move is tempting, but your pieces are not ready for the center to open.",
  ],
  opponent_human_response: [
    "Black’s last move is natural: it develops while keeping the center tense.",
    "That was a human-looking response, and it gives you a chance to improve before forcing the issue.",
  ],
  review_reinforcement: ["This moment is worth reviewing because the plan shift is easy to miss."],
  supported_continuation: [
    "This continuation fits because it improves the piece tied to the center.",
    "That move is not just legal; it supports the plan you have been building.",
  ],
  silence: [""],
};

export function pickLiveCoachCopy(opportunity: CoachOpportunity, key = ""): string {
  const variants = COPY[opportunity] ?? [""];
  if (variants.length <= 1) return variants[0] ?? "";
  const index = Math.abs(hash(`${opportunity}:${key}`)) % variants.length;
  return variants[index];
}

export function buildVerifiedMoveFactFallback(input: {
  san: string;
  uci: string;
  from: string;
  to: string;
  pieceType: string;
  capture: boolean;
  check: boolean;
  mate: boolean;
}): string {
  const action = input.capture ? "captures on" : "moves to";
  const suffix = input.mate ? " and gives checkmate." : input.check ? " and gives check." : ".";
  return `Verified move: ${input.san} (${input.uci}) ${pieceName(input.pieceType)} from ${input.from} ${action} ${input.to}${suffix}`;
}

export function getLiveCoachCopyCatalog(): Record<CoachOpportunity, string[]> {
  return COPY;
}

function hash(input: string): number {
  let out = 0;
  for (let i = 0; i < input.length; i += 1) out = (out * 33 + input.charCodeAt(i)) | 0;
  return out;
}

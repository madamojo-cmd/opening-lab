import type { CoachButton } from "../coach/coachTypes";
import type { CoachEvidencePacket, CoachInteraction, VerifiedCoachClaim } from "./coachEvidenceTypes";

type BuildResult = {
  title: string;
  body?: string;
  hint?: string;
  answer?: string;
  buttons: CoachButton[];
  utteranceId: string;
  utteranceFamily: string;
  givesAnswer: boolean;
  shouldShowCoachCard: boolean;
  shouldMarkReviewWorthy: boolean;
  reviewReason?: string;
  suppressedReason?: string;
  exactMoveAllowed: boolean;
  copySource: string;
};

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function tokenCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function capText(text: string, portionMetric: "volumetric" | "weight"): string {
  const sentences = splitSentences(text);
  if (portionMetric === "volumetric") {
    return sentences.slice(0, 2).join(" ").trim();
  }
  const out: string[] = [];
  let count = 0;
  for (const sentence of sentences) {
    const nextCount = count + tokenCount(sentence);
    if (out.length >= 2 || nextCount > 60) break;
    out.push(sentence);
    count = nextCount;
  }
  return (out.length ? out : sentences.slice(0, 1)).join(" ").trim();
}

function claimPriority(claim: VerifiedCoachClaim, interaction: CoachInteraction): number {
  if (claim.type === "king_safety") return 1;
  if (claim.type === "center_tension" || claim.type === "prepares_break") return 2;
  if (claim.type === "exact_move_safe") return interaction === "answer" || interaction === "show_move" ? 3 : 99;
  if (claim.type === "attacks_square" || claim.type === "piece_develops") return 4;
  if (claim.type === "rook_file") return 5;
  return 6;
}

function describeClaim(claim: VerifiedCoachClaim): string {
  if (claim.type === "king_safety") return "King safety is urgent before the center opens.";
  if (claim.type === "center_tension") return `The center is tense around ${claim.squares.slice(0, 2).join(" and ")}.`;
  if (claim.type === "prepares_break") return "This move prepares the d4 break with better support.";
  if (claim.type === "exact_move_safe") return `One safe move here is ${claim.moveSan ?? claim.moveUci}.`;
  if (claim.type === "attacks_square") return `The ${claim.piece} now directly attacks ${claim.target}.`;
  if (claim.type === "piece_develops") return `This develops the ${claim.piece} to ${claim.to}.`;
  if (claim.type === "rook_file") return `The rook improves on the ${claim.file}-file.`;
  return `The plan is to improve ${claim.planObject}.`;
}

function pieceName(type: string): string {
  return type === "p" ? "pawn" : type === "n" ? "knight" : type === "b" ? "bishop" : type === "r" ? "rook" : type === "q" ? "queen" : "king";
}

function getSafeSan(move: any): string | null {
  if (!move) return null;
  const s = move.san;
  return (typeof s === "string" && s.length > 0) ? s : null;
}

function getSafeUci(move: any): string | null {
  if (!move) return null;
  const u = move.uci;
  return (typeof u === "string" && u.length > 0) ? u : null;
}

function verifiedMoveFallback(packet: CoachEvidencePacket): string {
  const move = packet?.moveFacts as any;
  if (!move?.legal) {
    return "A legal continuation is available.";
  }
  const san = getSafeSan(move);
  const uci = getSafeUci(move);
  const isCapture = Boolean(move.isCapture);
  const isCheck = Boolean(move.isCheck);
  const isCastle = Boolean(move.isCastle);
  const isPromotion = Boolean(move.isPromotion);
  const movedPiece = (move.movedPiece && typeof move.movedPiece === "object") ? move.movedPiece : null;
  const attacksAfter = Array.isArray(move.movedPieceAttacksAfter) ? move.movedPieceAttacksAfter : [];

  // Specific copy only when we have a valid san string; never call .includes on non-string.
  // Do not hallucinate SAN or piece details when data is missing.
  if (san && san.includes("#")) return `${san} is checkmate.`;
  if (san && isCapture && isCheck) {
    const to = movedPiece?.to ?? move.to ?? "?";
    return `${san} captures on ${to} with check.`;
  }
  if (san && isCapture) {
    const to = movedPiece?.to ?? move.to ?? "?";
    return `${san} captures on ${to}.`;
  }
  if (san && isCastle) return `${san} brings the king to safety and connects the rooks.`;
  if (san && isPromotion) {
    const promo = uci ? uci.slice(-1).toUpperCase() : "piece";
    return `${san} promotes the pawn to ${promo}.`;
  }
  if (san && movedPiece) {
    const to = movedPiece.to;
    const type = movedPiece.type;
    const color = movedPiece.color;
    if (type === "p" && to && ["d4", "e4", "d5", "e5"].includes(to)) return `${san} advances the pawn into the center and changes the central structure.`;
    if (type === "p") return `${san} advances the pawn and gains space.`;
    if (type === "n" && to) {
      const rank = Number(to[1]);
      if (!isNaN(rank) && ((rank > 2 && color === "w") || (rank < 7 && color === "b"))) {
        return `${san} develops the knight toward the center.`;
      }
    }
    if (type === "b" && attacksAfter.length) return `${san} develops a bishop onto an active diagonal.`;
  }

  // Safe generic fallbacks (no invented SAN when missing)
  if (san) {
    return `${san} is a legal continuation that improves the position without creating an immediate tactical problem.`;
  }
  if (uci) {
    return `This move (${uci}) is available from the current position.`;
  }
  return "A legal continuation is available.";
}

function buttonsFor(packet: CoachEvidencePacket): CoachButton[] {
  if (packet.viewMode === "assisted" && packet.bookStatus === "in_book") return ["why", "replay", "hide"];
  if (packet.viewMode === "plain" && packet.bookStatus === "in_book") return ["hint", "answer"];
  return packet.exactMoveAllowed ? ["show_plan", "analyze_idea", "show_move", "hide"] : ["show_plan", "analyze_idea", "hide"];
}

export function buildCoachCopyFromEvidence(input: {
  packet: CoachEvidencePacket;
  interaction: CoachInteraction;
  previousHintLevel?: number;
  portionMetric?: "volumetric" | "weight";
}): BuildResult {
  const packet = input.packet;
  const portionMetric = input.portionMetric ?? "volumetric";

  if (packet.stale) {
    return {
      title: "Coach",
      buttons: [],
      utteranceId: "silent_stale",
      utteranceFamily: "silent",
      givesAnswer: false,
      shouldShowCoachCard: false,
      shouldMarkReviewWorthy: false,
      suppressedReason: "stale_frame_or_fen",
      exactMoveAllowed: false,
      copySource: "evidence",
    };
  }

  const sortedClaims = packet.allowedClaims
    .slice()
    .sort((a, b) => claimPriority(a, input.interaction) - claimPriority(b, input.interaction));
  const primary = sortedClaims[0];
  const primaryPriority = primary ? claimPriority(primary, input.interaction) : 99;
  const secondary = sortedClaims.find((claim) => claim !== primary && claimPriority(claim, input.interaction) > primaryPriority && claimPriority(claim, input.interaction) < 90);

  let body = "";
  if (!primary) body = verifiedMoveFallback(packet);
  else {
    body = describeClaim(primary);
    if (secondary && secondary !== primary) {
      body = `${body} ${describeClaim(secondary)}`;
    }
  }

  const prompt = capText(body, portionMetric);
  const hintLevel = input.previousHintLevel ?? 0;
  const givesAnswer = input.interaction === "answer" || input.interaction === "show_move";

  const strongHintBase =
    hintLevel > 0 && primary?.type === "attacks_square"
      ? `Focus on ${primary.target}: the ${primary.piece} can create direct pressure there.`
      : hintLevel > 0 && primary?.type === "piece_develops"
        ? `Improve the ${primary.piece} first, then use that development to support the center.`
      : `${prompt} Focus on the concrete square relationship before choosing.`;
  const hint = capText(
    hintLevel > 0
      ? strongHintBase
      : verifiedMoveFallback(packet),
    portionMetric,
  );

  const answer = givesAnswer
    ? capText(
        packet.exactMoveAllowed && packet.selectedCandidateMoveSan
          ? `Play ${packet.selectedCandidateMoveSan}. ${prompt}`
          : `No exact move is unlocked yet. ${prompt}`,
        portionMetric,
      )
    : undefined;

  const continuedPending = packet.trainingMode === "continuation" && packet.engineSupport.status === "pending";
  let finalBody = prompt;
  let title = packet.trainingMode === "continuation" ? "Position context" : "Opening pattern";
  if (packet.trainingMode === "continuation" && packet.selectedCandidateMoveSan && packet.exactMoveAllowed) {
    title = "Suggested continuation";
    finalBody = capText(
      input.interaction === "show_plan"
        ? verifiedMoveFallback(packet)
        : input.interaction === "analyze_idea"
          ? verifiedMoveFallback(packet)
          : verifiedMoveFallback(packet),
      portionMetric,
    );
  }
  if (continuedPending && (input.interaction === "show_plan" || input.interaction === "analyze_idea" || input.interaction === "none")) {
    finalBody = capText("I’m checking the position. I’ll only show a move if it is safe and supported.", portionMetric);
  }
  if (packet.trainingMode === "continuation" && !continuedPending) {
    if (input.interaction === "show_plan") {
      finalBody = capText(verifiedMoveFallback(packet), portionMetric);
    } else if (input.interaction === "analyze_idea") {
      finalBody = capText(verifiedMoveFallback(packet), portionMetric);
    }
  }

  if (packet.viewMode === "plain" && !givesAnswer && packet.bookStatus === "in_book") {
    finalBody = capText("Find the move by plan first. Use Hint if you want a nudge.", portionMetric);
  }

  return {
    title,
    body: givesAnswer ? answer : finalBody,
    hint: input.interaction === "hint" ? hint : undefined,
    answer,
    buttons: buttonsFor(packet),
    utteranceId: `${packet.normalizedFen}:${input.interaction}:${primary?.type ?? "plan"}`,
    utteranceFamily: primary?.type ?? "plan",
    givesAnswer,
    shouldShowCoachCard: true,
    shouldMarkReviewWorthy: packet.viewMode === "plain" && (givesAnswer || input.interaction === "hint"),
    reviewReason: packet.viewMode === "plain" && givesAnswer ? "answer_used" : undefined,
    exactMoveAllowed: packet.exactMoveAllowed,
    copySource: "evidence",
  };
}

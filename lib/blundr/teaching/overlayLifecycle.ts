export type OverlayPhase =
  | "ready_for_user"
  | "opponent_selecting"
  | "opponent_replying"
  | "opponent_animating"
  | "transitioning"
  | "line_complete"
  | "continuation_ready"
  | "terminal"
  | "error";
export type OverlayTrust = "engine_verified" | "book_supported" | "repertoire_supported" | "engine_close" | string;

export function isTrustedOverlayMoveTrust(trust?: string): trust is OverlayTrust {
  return trust === "engine_verified" || trust === "book_supported" || trust === "repertoire_supported" || trust === "engine_close";
}

export function normalizeFenForVisualFrame(fen?: string): string | undefined {
  if (!fen) return undefined;
  const normalized = fen.trim().replace(/\s+/g, " ");
  if (!normalized) return undefined;
  const parts = normalized.split(" ");
  if (parts.length < 4) return undefined;
  return parts.slice(0, 4).join(" ");
}

export function visualFrameMatches(recipeFrameId: number | string | undefined, trainerFrameId: number | string | undefined): boolean {
  if (recipeFrameId === undefined || recipeFrameId === null) return false;
  if (trainerFrameId === undefined || trainerFrameId === null) return false;
  return String(recipeFrameId) === String(trainerFrameId);
}

export function shouldRenderMoveTeachingOverlay(input: {
  phase: OverlayPhase;
  userToMove: boolean;
  viewMode: "assisted" | "plain";
  mode?: string;
  expectedUserMoveUci?: string;
  moveTrust?: string;
  contextFen?: string;
  boardFen: string;
}): boolean {
  const contextFen = normalizeFenForVisualFrame(input.contextFen);
  const boardFen = normalizeFenForVisualFrame(input.boardFen);
  return (
    input.phase === "ready_for_user" &&
    input.userToMove &&
    input.viewMode === "assisted" &&
    (input.mode === "move_teaching" || input.mode === "primary_move_only") &&
    Boolean(input.expectedUserMoveUci) &&
    isTrustedOverlayMoveTrust(input.moveTrust) &&
    Boolean(contextFen) &&
    Boolean(boardFen) &&
    contextFen === boardFen
  );
}

export function shouldRenderAssistedContextOverlay(input: {
  phase: OverlayPhase;
  viewMode: "assisted" | "plain";
  mode?: string;
  contextTrust?: string;
  hasAnswerArrow: boolean;
}): boolean {
  return (
    input.phase === "ready_for_user" &&
    input.viewMode === "assisted" &&
    input.mode === "assisted_context" &&
    input.contextTrust === "safe_context" &&
    !input.hasAnswerArrow
  );
}

export function shouldRenderOpponentLastMoveHighlight(input: {
  committed: boolean;
  cueFen?: string;
  boardFen: string;
}): boolean {
  const cueFen = normalizeFenForVisualFrame(input.cueFen);
  const boardFen = normalizeFenForVisualFrame(input.boardFen);
  return Boolean(input.committed && cueFen && boardFen && cueFen === boardFen);
}

export function shouldIgnoreStaleOverlay(input: {
  trainerFrameId: number | string;
  overlayFrameId: number | string | undefined;
  overlayFen?: string;
  boardFen: string;
}): boolean {
  if (!visualFrameMatches(input.overlayFrameId, input.trainerFrameId)) return true;
  const overlayFen = normalizeFenForVisualFrame(input.overlayFen);
  const boardFen = normalizeFenForVisualFrame(input.boardFen);
  if (!overlayFen || !boardFen) return true;
  if (overlayFen !== boardFen) return true;
  return false;
}

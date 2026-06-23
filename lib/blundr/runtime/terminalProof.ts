import { resolveSelectedLineExhaustion } from "./selectedLineExhaustion";
import { resolveStage2OpeningIdentity } from "../openings/openingIdentity";

export type Stage2TerminalProofSource =
  | "selected_line_cursor"
  | "selected_line_exhaustion"
  | "explicit_curated_terminal_node"
  | "valid_branch_complete_latch"
  | "none";

export interface ResolveStage2TerminalProofInput {
  trainingMode: "restricted" | "continuation";
  isUserTurn: boolean;
  userExplicitlyEnteredContinuation: boolean;
  selectedOpeningId: string | null;
  selectedLineId: string | null;
  runtimeOpeningId: string | null;
  selectedOpeningRuntimeAvailable: boolean;
  fen4: string;
  lastUserMoveUci: string | null;
  lastUserMoveSan: string | null;
  afterFinalUserMove: boolean;
  explicitCuratedTerminalNode: boolean;
  selectedLineCompleteConfirmed: boolean;
  exactNodeHasChildren: boolean | "unknown";
  hasNextOpponentMove: boolean | "unknown";
  hasNextUserMove: boolean | "unknown";
  validBranchCompleteLatch: boolean;
  bookCompleteAllowed: boolean;
  guidedCompleteAllowed: boolean;
  runtimeBookBookExhausted: boolean;
  runtimeBookCandidateCount: number;
  runtimeBookStatus: string | null;
}

export interface Stage2TerminalProofResolution {
  proven: boolean;
  source: Stage2TerminalProofSource;
  reason: string | null;
  blockedReasons: string[];
  selectedLineExhausted: boolean;
  selectedLineExhaustionReason: string | null;
  selectedLineExhaustionBlockedReason: string | null;
  runtimeBookExhaustionObserved: boolean;
  runtimeBookExhaustionTreatedAsDebugOnly: boolean;
}

function normalize(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function resolveStage2TerminalProof(input: ResolveStage2TerminalProofInput): Stage2TerminalProofResolution {
  const openingIdentity = resolveStage2OpeningIdentity({
    selectedOpeningId: input.selectedOpeningId,
    runtimeOpeningId: input.runtimeOpeningId,
    selectedOpeningRuntimeAvailable: input.selectedOpeningRuntimeAvailable,
  });
  const selectedLineExhaustion = resolveSelectedLineExhaustion({
    trainingMode: input.trainingMode,
    selectedLineId: input.selectedLineId,
    fen4: input.fen4,
    lastUserMoveUci: input.lastUserMoveUci,
    lastUserMoveSan: input.lastUserMoveSan,
    userExplicitlyEnteredContinuation: input.userExplicitlyEnteredContinuation,
    afterFinalUserMove: input.afterFinalUserMove,
    explicitCuratedTerminalNode: input.explicitCuratedTerminalNode,
    exactNodeHasChildren: input.exactNodeHasChildren,
    hasNextOpponentMove: input.hasNextOpponentMove,
    hasNextUserMove: input.hasNextUserMove,
    validBranchCompleteLatch: input.validBranchCompleteLatch,
  });

  const selectedLineCompleteConfirmed = Boolean(input.selectedLineCompleteConfirmed);
  const selectedLineExhausted = Boolean(selectedLineExhaustion.exhausted);
  const runtimeBookExhaustionObserved = Boolean(input.runtimeBookBookExhausted);
  const identityMatched = Boolean(openingIdentity.openingIdentityMatched);
  const lineProofKnown = selectedLineCompleteConfirmed || selectedLineExhausted || input.explicitCuratedTerminalNode;
  const validLatchOnlyProof =
    Boolean(input.validBranchCompleteLatch) &&
    selectedLineExhausted &&
    selectedLineExhaustion.reason === "valid_branch_complete_latch" &&
    !selectedLineCompleteConfirmed &&
    !input.explicitCuratedTerminalNode;
  const staleBranchCompleteLatch = Boolean(
    input.validBranchCompleteLatch &&
      (!identityMatched || !input.bookCompleteAllowed || !input.guidedCompleteAllowed || !lineProofKnown || validLatchOnlyProof),
  );
  const runtimeBookExhaustionTreatedAsDebugOnly =
    runtimeBookExhaustionObserved &&
    (!identityMatched || !lineProofKnown || !input.bookCompleteAllowed || !input.guidedCompleteAllowed || staleBranchCompleteLatch || validLatchOnlyProof);

  const blockedReasons: string[] = [];
  if (input.trainingMode !== "restricted") blockedReasons.push("not_restricted_mode");
  if (input.userExplicitlyEnteredContinuation) blockedReasons.push("already_in_continuation");
  if (!openingIdentity.canonicalSelectedOpeningId) blockedReasons.push("noncanonical_selected_opening");
  if (openingIdentity.openingIdentityMismatchReason === "noncanonical_selected_opening") blockedReasons.push("noncanonical_selected_opening");
  if (!input.selectedOpeningRuntimeAvailable) blockedReasons.push("selected_opening_runtime_unavailable");
  if (!identityMatched) blockedReasons.push("runtime_opening_mismatch");
  if (!lineProofKnown) blockedReasons.push("selected_line_cursor_unknown");
  if (!input.bookCompleteAllowed) blockedReasons.push("book_complete_not_allowed");
  if (!input.guidedCompleteAllowed) blockedReasons.push("guided_complete_not_allowed");
  if (staleBranchCompleteLatch) blockedReasons.push("stale_branch_complete_latch");
  if (validLatchOnlyProof) blockedReasons.push("stale_branch_complete_latch");
  if (!selectedLineCompleteConfirmed && !selectedLineExhausted && !input.explicitCuratedTerminalNode && !input.validBranchCompleteLatch) {
    blockedReasons.push(selectedLineExhaustion.blockedReason ?? "selected_line_not_exhausted");
    if (runtimeBookExhaustionTreatedAsDebugOnly) blockedReasons.push("runtime_book_exhausted_is_debug_only");
  }

  const proven =
    identityMatched &&
    input.bookCompleteAllowed &&
    input.guidedCompleteAllowed &&
    (selectedLineCompleteConfirmed ||
      (selectedLineExhausted && selectedLineExhaustion.reason !== "valid_branch_complete_latch") ||
      input.explicitCuratedTerminalNode);

  const source: Stage2TerminalProofSource = selectedLineCompleteConfirmed
    ? "selected_line_cursor"
    : selectedLineExhausted && selectedLineExhaustion.reason !== "valid_branch_complete_latch"
      ? "selected_line_exhaustion"
      : input.explicitCuratedTerminalNode
        ? "explicit_curated_terminal_node"
        : input.validBranchCompleteLatch
          ? "valid_branch_complete_latch"
          : "none";

  const reason =
    selectedLineCompleteConfirmed
      ? "selected_line_complete_confirmed"
      : selectedLineExhausted && selectedLineExhaustion.reason !== "valid_branch_complete_latch"
        ? normalize(selectedLineExhaustion.reason) || "selected_line_exhaustion"
      : input.explicitCuratedTerminalNode
        ? "explicit_curated_terminal_node"
        : input.validBranchCompleteLatch
          ? "valid_branch_complete_latch"
            : null;

  return {
    proven,
    source,
    reason,
    blockedReasons,
    selectedLineExhausted,
    selectedLineExhaustionReason: selectedLineExhaustion.reason,
    selectedLineExhaustionBlockedReason: selectedLineExhaustion.blockedReason,
    runtimeBookExhaustionObserved,
    runtimeBookExhaustionTreatedAsDebugOnly,
  };
}

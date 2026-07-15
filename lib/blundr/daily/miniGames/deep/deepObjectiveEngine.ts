import { Chess } from "chess.js";
import type {
  DeepMiniGameScenario,
  DeepMiniGameState,
  DeepMiniGameResult,
} from "./deepMiniGameTypes";

function apply(fen: string, uci: string): string | null {
  try {
    const chess = new Chess(fen);
    chess.move(uci);
    return chess.fen();
  } catch {
    return null;
  }
}

export function advanceDeepMiniGame(
  state: DeepMiniGameState,
  scenario: DeepMiniGameScenario,
  uci: string,
  now: string,
): DeepMiniGameResult {
  if (
    state.state === "completed" ||
    state.state === "revealed" ||
    state.state === "invalid_content"
  )
    return {
      kind: "invalid",
      state,
      message: "This activity is already committed.",
    };
  const expected = scenario.solution.userMoves[state.userMoveIndex];
  const nextFen = apply(state.currentFen, uci);
  if (!nextFen)
    return {
      kind: "invalid",
      state: { ...state, state: "invalid_content" },
      message: "That move is not legal in the current position.",
    };
  if (!expected || uci.toLowerCase() !== expected.toLowerCase())
    return {
      kind: "objective_failed",
      state: {
        ...state,
        state: "completed",
        firstAttempt: "incorrect",
        firstAttemptRecordedAt: now,
        feedback: "The verified objective was not completed.",
      },
      message: "Objective failed.",
    };
  const userMoveIndex = state.userMoveIndex + 1;
  const moves = [...state.moves, uci];
  const destination = uci.slice(2, 4).toLowerCase();
  const targetsReached = scenario.solution.requiredTargets?.includes(
    destination,
  )
    ? [...new Set([...state.targetsReached, destination])]
    : state.targetsReached;
  const targetsComplete =
    !scenario.solution.requiredTargets?.length ||
    targetsReached.length === scenario.solution.requiredTargets.length;
  const reply = scenario.solution.opponentReplies[state.opponentReplyIndex];
  const afterReply = reply ? apply(nextFen, reply) : nextFen;
  if (!afterReply)
    return {
      kind: "invalid",
      state: { ...state, state: "invalid_content" },
      message: "The verified opponent reply is no longer legal.",
    };
  const allUserMoves =
    userMoveIndex >= scenario.solution.userMoves.length && targetsComplete;
  const nextState: DeepMiniGameState = {
    ...state,
    state: allUserMoves ? "completed" : "in_progress",
    currentFen: afterReply,
    userMoveIndex,
    opponentReplyIndex: reply
      ? state.opponentReplyIndex + 1
      : state.opponentReplyIndex,
    moves: reply ? [...moves, reply] : moves,
    targetsReached,
    firstAttempt: allUserMoves ? "correct" : state.firstAttempt,
    firstAttemptRecordedAt: allUserMoves ? now : state.firstAttemptRecordedAt,
    feedback: allUserMoves ? "Verified objective complete." : null,
    terminalResult: allUserMoves
      ? (scenario.solution.terminalResult ?? null)
      : null,
  };
  return {
    kind: allUserMoves
      ? "objective_complete"
      : reply
        ? "opponent_reply"
        : "legal_progress",
    state: nextState,
    message: allUserMoves
      ? "Objective complete."
      : reply
        ? "Verified reply played."
        : "Legal progress.",
  };
}

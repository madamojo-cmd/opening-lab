import type { CSSProperties } from "react";

import type { BoardVisualUiModel } from "@/lib/blundr/presentation/uiSurfaceAdapter";

import type { MiniGameRunnerScenario, MiniGameRunnerState } from "./miniGameRunnerState";

export type MiniGameBoardFeedbackAdapterResult = {
  squareStyles: Record<string, CSSProperties>;
  boardVisuals: BoardVisualUiModel | null;
  animationClassName: string | null;
};

const LAST_MOVE_STYLE: CSSProperties = {
  boxShadow: "inset 0 0 0 999px rgba(255,255,255,.12), inset 0 0 22px rgba(255,255,255,.5)",
};

const LAST_MOVE_DESTINATION_STYLE: CSSProperties = {
  boxShadow: "inset 0 0 0 999px rgba(255,255,255,.16), inset 0 0 24px rgba(255,255,255,.62)",
};

const WRONG_MOVE_STYLE: CSSProperties = {
  background: "radial-gradient(circle, rgba(239,68,68,.26) 0%, rgba(239,68,68,.16) 38%, transparent 72%)",
  boxShadow: "inset 0 0 0 3px rgba(239,68,68,.48), inset 0 0 22px rgba(239,68,68,.28)",
};

const WRONG_MOVE_DESTINATION_STYLE: CSSProperties = {
  background: "radial-gradient(circle, rgba(239,68,68,.18) 0%, rgba(239,68,68,.1) 38%, transparent 72%)",
  boxShadow: "inset 0 0 0 2px rgba(239,68,68,.35), inset 0 0 18px rgba(239,68,68,.18)",
};

const ANIMATION_BY_MINIGAME: Record<string, string> = {
  tactic_shots: "fork-spark",
  key_square_conquest: "open-file-radar",
  structure_builder: "center-break-pulse",
  imbalance_arena: "diagonal-pressure-glow",
  technique_lab: "defensive-shield",
  king_race: "continuation-ghost-plan",
  knight_gymnasium: "knight-pressure-center",
  pawn_wars: "quiet-development-glow",
};

function squareEntriesFromScenario(scenario: MiniGameRunnerScenario): string[] {
  return [
    scenario.solution.from,
    scenario.solution.to,
    ...(scenario.overlays.targetSquares ?? []),
    ...(scenario.overlays.keySquares ?? []),
  ]
    .map((square) => String(square ?? "").trim().toLowerCase())
    .filter((square) => /^[a-h][1-8]$/.test(square));
}

function createResultVisuals(scenario: MiniGameRunnerScenario, includeAnswerArrow: boolean): BoardVisualUiModel | null {
  const squares = Array.from(new Set(squareEntriesFromScenario(scenario)));
  const visualRecipes: BoardVisualUiModel["visualRecipes"] = [];

  if (squares.length) {
    visualRecipes.push({
      id: `${scenario.scenarioKey}:targets`,
      type: "square_highlight",
      targetUci: scenario.solution.primaryMoveUci,
      squares,
      visible: true,
    });
  }

  if (includeAnswerArrow) {
    visualRecipes.push({
      id: `${scenario.scenarioKey}:answer`,
      type: "move_arrow",
      targetUci: scenario.solution.primaryMoveUci,
      from: scenario.solution.from,
      to: scenario.solution.to,
      squares: [scenario.solution.from, scenario.solution.to],
      visible: true,
    });
  }

  if (!visualRecipes.length) return null;

  return {
    visualRecipes,
    debug: {
      source: "VisibleTeachingSurface",
      targetVisualUcis: [scenario.solution.primaryMoveUci],
    },
  };
}

export function buildMiniGameBoardFeedback(
  scenario: MiniGameRunnerScenario,
  state: MiniGameRunnerState,
): MiniGameBoardFeedbackAdapterResult {
  const squareStyles: Record<string, CSSProperties> = {};
  const animationClassName = state.status === "correct" || state.status === "revealed"
    ? `blundr-anim-${ANIMATION_BY_MINIGAME[scenario.miniGameId] ?? "quiet-development-glow"}`
    : state.status === "incorrect"
      ? "blundr-anim-queen-danger-warning"
      : null;

  if (state.status === "correct") {
    const from = state.attemptedMove?.from ?? scenario.solution.from;
    const to = state.attemptedMove?.to ?? scenario.solution.to;
    squareStyles[from] = {
      ...LAST_MOVE_STYLE,
      background: "radial-gradient(circle, rgba(46,107,79,.16) 0%, rgba(46,107,79,.08) 38%, transparent 72%)",
    };
    squareStyles[to] = {
      ...LAST_MOVE_DESTINATION_STYLE,
      background: "radial-gradient(circle, rgba(46,107,79,.22) 0%, rgba(46,107,79,.12) 38%, transparent 72%)",
    };
  } else if (state.status === "revealed") {
    squareStyles[scenario.solution.from] = {
      ...LAST_MOVE_STYLE,
      background: "radial-gradient(circle, rgba(37,99,235,.16) 0%, rgba(37,99,235,.08) 38%, transparent 72%)",
    };
    squareStyles[scenario.solution.to] = {
      ...LAST_MOVE_DESTINATION_STYLE,
      background: "radial-gradient(circle, rgba(37,99,235,.22) 0%, rgba(37,99,235,.12) 38%, transparent 72%)",
    };
  } else if (state.status === "incorrect" && state.attemptedMove) {
    squareStyles[state.attemptedMove.from] = {
      ...WRONG_MOVE_STYLE,
    };
    squareStyles[state.attemptedMove.to] = {
      ...WRONG_MOVE_DESTINATION_STYLE,
    };
  }

  const boardVisuals = state.status === "correct"
    ? createResultVisuals(scenario, false)
    : state.status === "revealed"
      ? createResultVisuals(scenario, true)
      : null;

  return {
    squareStyles,
    boardVisuals,
    animationClassName,
  };
}

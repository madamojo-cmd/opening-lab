import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { DeepTacticShotsCard } from "../DeepTacticShotsCard";
import { createDeepMiniGameState } from "@/lib/blundr/daily/miniGames/deep";
const scenario = {
  id: "s",
  miniGameId: "tactic_shots_deep" as const,
  startFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  sideToMove: "white" as const,
  solution: { userMoves: ["e2e4", "g1f3"], opponentReplies: ["e7e5", "b8c6"] },
  schemaVersion: "v",
  generatorVersion: "v",
  validatorVersion: "v",
  evidenceVersion: "v",
};
test("deep tactic card exposes accessible progress", () => {
  render(<DeepTacticShotsCard state={createDeepMiniGameState(scenario)} />);
  expect(
    screen.getByRole("heading", { name: "Deep Tactic Shots" }),
  ).toBeTruthy();
  expect(screen.getByRole("status").textContent).toContain("0 committed moves");
});

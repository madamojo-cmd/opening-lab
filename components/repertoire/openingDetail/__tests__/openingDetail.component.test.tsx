import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { OpeningDetailPage } from "../OpeningDetailPage";
const model = {
  openingId: "italian-white",
  openingName: "Italian Game",
  side: "white" as const,
  state: "ready" as const,
  nodes: [
    {
      nodeId: "n",
      positionKey: "p",
      openingId: "italian-white",
      sanSequence: ["e4"],
      status: "weak" as const,
      confidence: 0.5,
      lastFirstAttemptResult: "incorrect" as const,
      nextDueAt: null,
      evidenceCount: 2,
      importedGameEvidenceCount: 1,
      weaknessExplanation: "Review the first move.",
      recommendedDailyIntervention: "review_position",
      alternateRoute: false,
      childCount: 0,
      access: "active" as const,
    },
  ],
  masteredPositions: 0,
  learningPositions: 1,
  weakPositions: 1,
  unseenPositions: 0,
  firstAttemptUnaidedAccuracy: 0,
  retention7d: null,
  retention30d: null,
  importedGameMatchCount: 1,
  lastTrainedAt: null,
  nextDueAt: null,
  weakBranches: [
    {
      positionKey: "p",
      openingId: "italian-white",
      sanSequence: ["e4"],
      explanation: "Review the first move.",
      confidence: 0.5,
      evidenceCount: 2,
      recommendedActivity: "review_position",
      recentResult: "incorrect" as const,
    },
  ],
};
test("opening detail renders aggregate intelligence and accessible expansion", () => {
  render(<OpeningDetailPage model={model} />);
  expect(screen.getByRole("heading", { name: "Italian Game" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Expand" })).toBeTruthy();
  expect(document.body.textContent).not.toContain("raw PGN");
});

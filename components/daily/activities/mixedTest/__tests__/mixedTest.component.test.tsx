import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import { MixedTestCard } from "../MixedTestCard";
import { createMixedTestState } from "@/lib/blundr/daily/activities/mixedTest";
test("Mixed Test presents fixed progress without hints", () => {
  const state = createMixedTestState(
    [
      "daily_recall",
      "daily_recall",
      "daily_plan_recall",
      "daily_candidate_choice",
      "daily_continuation_challenge",
    ].map((activityId, index) => ({
      itemId: `${index}`,
      activityId,
      openingId: "italian-white",
      positionKey: `${index}`,
      prompt: "Choose the move.",
    })),
  );
  render(<MixedTestCard state={state} />);
  expect(screen.getByRole("heading", { name: "Mixed Test" })).toBeTruthy();
  expect(screen.getByRole("status").textContent).toContain("Item");
  expect(document.body.textContent).not.toContain("Correct answer");
});

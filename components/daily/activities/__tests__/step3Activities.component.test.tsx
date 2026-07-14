import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CandidateChoiceCard } from "../candidateChoice/CandidateChoiceCard";
import { PlanRecallCard } from "../planRecall/PlanRecallCard";
import { SamePositionDifferentRouteCard } from "../samePositionDifferentRoute/SamePositionDifferentRouteCard";
import { ContinuationChallengeCard } from "../continuationChallenge/ContinuationChallengeCard";
import { PunishTheMistakeCard } from "../punishTheMistake/PunishTheMistakeCard";

const presentation = (activityId: string) => ({
  schemaVersion: "2026-07-13.v1" as const,
  activityId,
  cardFingerprint: `${activityId}-card`,
  positionKey: `${activityId}-position`,
  positionFen: "fen",
  prompt: "Choose the practical action.",
  state: "ready" as const,
  options: [
    { id: "a", label: "Choice A" },
    { id: "b", label: "Choice B" },
  ],
  feedback: null,
});

describe("Step 3 activity answer-safe shells", () => {
  it("renders all five activities with accessible controls and no answer fields", () => {
    render(
      <div>
        <CandidateChoiceCard
          presentation={presentation("daily_candidate_choice")}
        />
        <PlanRecallCard presentation={presentation("daily_plan_recall")} />
        <SamePositionDifferentRouteCard
          presentation={presentation("daily_same_position_different_route")}
        />
        <ContinuationChallengeCard
          presentation={presentation("daily_continuation_challenge")}
          objective="Complete development"
        />
        <PunishTheMistakeCard
          presentation={presentation("daily_punish_the_mistake")}
        />
      </div>,
    );
    expect(screen.getAllByRole("article")).toHaveLength(5);
    expect(screen.getAllByRole("button").length).toBeGreaterThan(5);
    expect(document.body.textContent).not.toContain("acceptedMoves");
    expect(document.body.innerHTML).not.toContain("correctCandidateIndex");
  });
});

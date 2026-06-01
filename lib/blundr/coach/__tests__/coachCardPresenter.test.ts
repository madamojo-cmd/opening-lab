import assert from "node:assert/strict";
import { presentCoachCard } from "../coachCardPresenter";

export function testCoachCardPresenter(): void {
  const hidden = presentCoachCard({ shouldShowCoachCard: false } as any);
  assert.equal(hidden, null);

  const shown = presentCoachCard({
    shouldShowCoachCard: true,
    title: "Opening pattern",
    body: "The bishop develops with pressure.",
    buttons: ["why", "replay", "hide"],
  } as any);
  assert.equal(Boolean(shown), true);
  assert.equal(shown?.buttons.includes("replay"), true);
}

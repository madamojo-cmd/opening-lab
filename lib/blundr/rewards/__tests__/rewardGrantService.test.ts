import assert from "node:assert/strict";

import { resetLocalAccountState } from "../../accounts/localAccountStorage";
import { loadRepertoireProgress } from "../../repertoire/repertoireProgressService";
import { applyRewardGrant } from "../rewardGrantService";
import { evaluateRewardRoll, buildRewardTriggerEventId } from "../rewardRollService";

resetLocalAccountState("user-1");

void (async () => {
  const triggerEventId = buildRewardTriggerEventId({
    userId: "user-1",
    localDate: "2026-07-06",
    trigger: "weekly_cache",
    streakDays: 7,
  });
  const outcome = evaluateRewardRoll({
    userId: "user-1",
    localDate: "2026-07-06",
    trigger: "weekly_cache",
    triggerEventId,
    streakDays: 7,
    now: "2026-07-06T12:00:00.000Z",
  });

  assert.equal(outcome.didReward, true);
  assert.ok(outcome.reward);

  const result = await applyRewardGrant({
    userId: "user-1",
    roll: outcome.roll,
    grantMode: outcome.grantMode ?? "guaranteed_cache",
    now: "2026-07-06T12:00:00.000Z",
    starterPackId: "classical_attacker",
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.grant.applied, true);
    assert.equal(result.pointResult.ok, true);
  }

  const progress = loadRepertoireProgress({ userId: "user-1", now: "2026-07-06T12:00:00.000Z" });
  assert.ok(progress.availablePoints > 0);
  assert.equal(progress.availablePoints, outcome.reward?.amount ?? 0);

  console.log("rewardGrantService.test.ts passed");
})();


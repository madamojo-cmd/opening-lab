import assert from "node:assert/strict";

import { resetLocalAccountState } from "../../accounts/localAccountStorage";
import { loadRepertoireProgress } from "../../repertoire/repertoireProgressService";
import {
  applyRewardGrant,
  buildRewardGrantRecord,
} from "../rewardGrantService";
import {
  evaluateRewardRoll,
  buildRewardTriggerEventId,
} from "../rewardRollService";

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

  const grantRecord = buildRewardGrantRecord({
    userId: "user-1",
    roll: outcome.roll,
    grantMode: outcome.grantMode ?? "guaranteed_cache",
    now: "2026-07-06T12:00:00.000Z",
    starterPackId: "classical_attacker",
  });
  assert.equal("ok" in grantRecord, false);
  if (!("ok" in grantRecord)) {
    assert.equal(grantRecord.applied, true);
    assert.equal(grantRecord.pointsApplied, outcome.reward?.amount ?? 0);
  }

  const beforeProgress = loadRepertoireProgress({
    userId: "user-1",
    now: "2026-07-06T12:00:00.000Z",
  });

  const result = await applyRewardGrant({
    userId: "user-1",
    roll: outcome.roll,
    grantMode: outcome.grantMode ?? "guaranteed_cache",
    now: "2026-07-06T12:00:00.000Z",
    starterPackId: "classical_attacker",
  });

  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.equal(result.code, "reward_authority_required");
  }

  const afterProgress = loadRepertoireProgress({
    userId: "user-1",
    now: "2026-07-06T12:00:00.000Z",
  });
  assert.deepEqual(afterProgress, beforeProgress);
  assert.equal(afterProgress.availablePoints, 0);

  console.log("rewardGrantService.test.ts passed");
})();

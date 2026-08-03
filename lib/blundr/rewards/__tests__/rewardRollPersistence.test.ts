import assert from "node:assert/strict";
import test from "node:test";

import type { RewardRoll } from "../../accounts/accountTypes";
import { dedupeRewardRollsById } from "../rewardRollPersistence";

const rewardRoll = (id: string): RewardRoll => ({
  id,
  userId: "user-a",
  trigger: "daily_tempo_ring_closed",
  rolledAt: "2026-08-03T00:00:00.000Z",
  didReward: false,
  seed: "seed",
});

test("reward roll sync retains one durable roll per id", () => {
  assert.deepEqual(
    dedupeRewardRollsById([
      rewardRoll("roll-1"),
      rewardRoll("roll-1"),
      rewardRoll("roll-2"),
      rewardRoll(""),
    ]).map((roll) => roll.id),
    ["roll-1", "roll-2"],
  );
});

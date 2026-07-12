import assert from "node:assert/strict";

import { rebasePointEventOwnership, rebaseUnlockEventOwnership } from "../../../../app/api/blundr/repertoire/sync/route";

void (async () => {
  const pointEvent = {
    id: "point-event-1",
    userId: "stale-body-user",
    source: "manual_dev_adjustment" as const,
    points: 25,
    createdAt: "2026-07-07T12:00:00.000Z",
  };
  const unlockEvent = {
    id: "unlock-event-1",
    userId: "stale-body-user",
    openingId: "italian-white",
    pointsSpent: 150,
    unlockIndex: 1,
    createdAt: "2026-07-07T12:01:00.000Z",
  };

  assert.equal(rebasePointEventOwnership(pointEvent, "auth-user-id").userId, "auth-user-id");
  assert.equal(rebaseUnlockEventOwnership(unlockEvent, "auth-user-id").userId, "auth-user-id");

  console.log("repertoireSyncOwnership.test.ts passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

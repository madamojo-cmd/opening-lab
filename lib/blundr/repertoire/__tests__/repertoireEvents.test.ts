import assert from "node:assert/strict";

import {
  createRepertoirePointEventId,
  createRepertoireUnlockEventId,
  getRepertoirePointEventTotal,
  getRepertoireUnlockSpendTotal,
  normalizeRepertoirePointEvent,
  normalizeRepertoireUnlockEvent,
  sortRepertoirePointEvents,
  sortRepertoireUnlockEvents,
} from "../repertoireEvents";
import { createRepertoirePointEvent } from "../repertoirePoints";

const pointA = createRepertoirePointEvent({
  userId: "user-1",
  source: "opening_run_completed",
  openingId: "italian-white",
  id: "point-2",
  createdAt: "2026-07-04T10:02:00.000Z",
});
const pointB = createRepertoirePointEvent({
  userId: "user-1",
  source: "continuation_completed",
  openingId: "italian-white",
  id: "point-1",
  createdAt: "2026-07-04T10:01:00.000Z",
});
const pointEvents = sortRepertoirePointEvents([pointA, pointB, pointB]);
assert.deepEqual(pointEvents.map((event) => event.id), ["point-1", "point-2"]);
assert.equal(getRepertoirePointEventTotal(pointEvents), 3);
assert.equal(createRepertoirePointEventId(pointB).includes("continuation_completed"), true);
assert.equal(normalizeRepertoirePointEvent({ id: "point-3", userId: "user-1", source: "daily_blundr_deck_completed", points: 5, createdAt: "2026-07-04T10:03:00.000Z" })?.points, 5);
assert.equal(normalizeRepertoirePointEvent(null), null);

const unlockA = {
  id: createRepertoireUnlockEventId({ userId: "user-1", openingId: "london-white", unlockIndex: 1, createdAt: "2026-07-04T11:02:00.000Z" }),
  userId: "user-1",
  openingId: "london-white",
  pointsSpent: 150,
  unlockIndex: 1,
  createdAt: "2026-07-04T11:02:00.000Z",
};
const unlockB = {
  id: createRepertoireUnlockEventId({ userId: "user-1", openingId: "slav-black", unlockIndex: 2, createdAt: "2026-07-04T11:01:00.000Z" }),
  userId: "user-1",
  openingId: "slav-black",
  pointsSpent: 300,
  unlockIndex: 2,
  createdAt: "2026-07-04T11:01:00.000Z",
};
const unlockEvents = sortRepertoireUnlockEvents([unlockA, unlockB, unlockB]);
assert.deepEqual(unlockEvents.map((event) => event.id), [unlockB.id, unlockA.id]);
assert.equal(getRepertoireUnlockSpendTotal(unlockEvents), 450);
assert.equal(normalizeRepertoireUnlockEvent({ ...unlockA, pointsSpent: 200 })?.pointsSpent, 200);
assert.equal(normalizeRepertoireUnlockEvent(null), null);

console.log("repertoireEvents.test.ts passed");

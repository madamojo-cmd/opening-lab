import assert from "node:assert/strict";

import {
  clearRewardPopupQueue,
  dismissRewardPopup,
  enqueueRewardPopup,
  getRewardPopupBusServerSnapshot,
  getRewardPopupBusSnapshot,
  subscribeRewardPopupBus,
  resetRewardPopupBusForTests,
} from "../rewardPopupBus";

resetRewardPopupBusForTests();

const serverSnapshotA = getRewardPopupBusServerSnapshot();
const serverSnapshotB = getRewardPopupBusServerSnapshot();
assert.strictEqual(serverSnapshotA, serverSnapshotB);

const initialSnapshot = getRewardPopupBusSnapshot();
assert.strictEqual(initialSnapshot, getRewardPopupBusSnapshot());

let notifyCount = 0;
const unsubscribe = subscribeRewardPopupBus(() => {
  notifyCount += 1;
});

const firstEvent = {
  id: "popup-one",
  kind: "failure",
  preview: true,
  title: "Shared reward persistence failed",
  description: "Preview failure state.",
  createdAt: "2026-07-10T00:00:00.000Z",
  code: "shared_sync_failed",
  message: "Shared reward persistence failed. Please retry.",
} as const;

assert.equal(enqueueRewardPopup(firstEvent), true);
const afterFirstEnqueue = getRewardPopupBusSnapshot();
assert.notStrictEqual(afterFirstEnqueue, initialSnapshot);
assert.equal(afterFirstEnqueue.active?.id, "popup-one");
assert.equal(notifyCount, 1);
assert.equal(enqueueRewardPopup(firstEvent), false);
assert.strictEqual(getRewardPopupBusSnapshot(), afterFirstEnqueue);
assert.equal(notifyCount, 1);

const secondEvent = {
  ...firstEvent,
  id: "popup-two",
  title: "Admin grant applied",
  code: "admin_grant",
  message: "Preview admin grant state.",
} as const;

assert.equal(enqueueRewardPopup(secondEvent), true);
const afterSecondEnqueue = getRewardPopupBusSnapshot();
assert.notStrictEqual(afterSecondEnqueue, afterFirstEnqueue);
assert.equal(afterSecondEnqueue.queue.length, 2);
assert.equal(notifyCount, 2);

const duplicateContent = { ...secondEvent, id: "popup-three" };
assert.equal(enqueueRewardPopup(duplicateContent), true);
assert.equal(getRewardPopupBusSnapshot().queue.length, 3);
assert.equal(enqueueRewardPopup(duplicateContent), false);

dismissRewardPopup("popup-one");
const afterDismiss = getRewardPopupBusSnapshot();
assert.notStrictEqual(afterDismiss, afterSecondEnqueue);
assert.equal(afterDismiss.active?.id, "popup-two");
assert.equal(notifyCount, 4);

assert.equal(dismissRewardPopup("missing-id"), false);
assert.equal(getRewardPopupBusSnapshot(), afterDismiss);
assert.equal(notifyCount, 4);

assert.equal(dismissRewardPopup(), true);
assert.equal(getRewardPopupBusSnapshot().active?.id, "popup-three");
assert.equal(dismissRewardPopup(), true);
const afterQueueDrain = getRewardPopupBusSnapshot();
assert.equal(afterQueueDrain.active, null);
assert.equal(afterQueueDrain.queue.length, 0);
assert.equal(notifyCount, 6);

assert.equal(enqueueRewardPopup(firstEvent), false);
assert.equal(notifyCount, 6);

assert.equal(clearRewardPopupQueue(), false);
assert.equal(getRewardPopupBusSnapshot(), afterQueueDrain);
assert.equal(notifyCount, 6);

unsubscribe();

console.log("rewardPopupBus.test.ts passed");

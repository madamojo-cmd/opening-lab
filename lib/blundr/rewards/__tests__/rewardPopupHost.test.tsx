import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { RewardPopupHost, renderRewardPopupEvent } from "../../../../components/rewards/RewardPopupHost";
import { resetRewardPopupBusForTests, enqueueRewardPopup } from "../rewardPopupBus";
import type { RewardPopupEvent } from "../rewardPopupTypes";

function render(event: RewardPopupEvent): string {
  return renderToStaticMarkup(<>{renderRewardPopupEvent(event, () => undefined, { frame: "desktop", reducedMotion: false, darkBackdrop: true })}</>);
}

resetRewardPopupBusForTests();
assert.doesNotThrow(() => {
  renderToStaticMarkup(<RewardPopupHost />);
});

const previewMarkup = render({
  id: "preview-reward",
  kind: "reward_popup",
  preview: true,
  title: "Common reward",
  description: "A normal point grant preview.",
  createdAt: "2026-07-10T00:00:00.000Z",
  variant: "A",
  rarity: "common",
  rewardType: "unlock_points",
  amount: 10,
});

assert.match(previewMarkup, /Common reward/i);
assert.match(previewMarkup, /Repertoire Points/i);

const appliedMarkup = render({
  id: "applied-reward",
  kind: "reward_popup",
  preview: false,
  title: "Opening Fragment",
  description: "Collect 3 to choose a new opening.",
  createdAt: "2026-07-10T00:00:00.000Z",
  variant: "B",
  rarity: "uncommon",
  rewardType: "opening_fragment",
  amount: 1,
  grant: {
    id: "grant-1",
    rewardId: "reward-1",
    rewardRollId: "roll-1",
    trigger: "weekly_cache",
    triggerEventId: "roll-1",
    rarity: "uncommon",
    rewardType: "opening_fragment",
    amount: 1,
    displayName: "Opening Fragment",
    description: "Collect 3 to choose a new opening.",
    pointsApplied: 0,
    applied: true,
    pendingChoice: false,
    grantMode: "guaranteed_cache",
    createdAt: "2026-07-10T00:00:00.000Z",
  },
});

assert.match(appliedMarkup, /Opening Fragment/i);
assert.match(appliedMarkup, /Opening Fragment/i);

const failureMarkup = render({
  id: "failure-popup",
  kind: "failure",
  preview: false,
  title: "Shared reward persistence failed",
  description: "Shared reward persistence failed.",
  createdAt: "2026-07-10T00:00:00.000Z",
  code: "shared_sync_failed",
  message: "Shared reward persistence failed. Please retry.",
});

assert.match(failureMarkup, /Shared reward persistence failed/i);
assert.match(failureMarkup, /shared_sync_failed/i);

const adminMarkup = render({
  id: "admin-popup",
  kind: "admin_grant",
  preview: false,
  title: "Admin grant applied",
  description: "Granted opening_fragment to target-user.",
  createdAt: "2026-07-10T00:00:00.000Z",
  success: true,
  targetUserId: "target-user",
  targetEmail: "target@example.com",
  grantType: "opening_fragment",
  amount: 1,
  reason: "QA manual grant",
  beforeSummary: "fragments=0, tokens=0",
  afterSummary: "fragments=1, tokens=0",
  auditId: "audit-123",
});

assert.match(adminMarkup, /Admin grant applied/i);
assert.match(adminMarkup, /target-user/i);
assert.match(adminMarkup, /audit-123/i);

const tempoMarkup = render({
  id: "tempo-popup",
  kind: "tempo_cache",
  preview: true,
  title: "Tempo Cache opened",
  description: "Preview the opened state.",
  createdAt: "2026-07-10T00:00:00.000Z",
  variant: "B",
  state: "revealed",
  rewardGrants: [],
  rewardHistory: null,
});

assert.match(tempoMarkup, /Tempo Cache/i);
assert.match(tempoMarkup, /Reward Deck/i);

enqueueRewardPopup({
  id: "host-render-popup",
  kind: "failure",
  preview: false,
  title: "Shared reward persistence failed",
  description: "Shared reward persistence failed.",
  createdAt: "2026-07-10T00:00:00.000Z",
  code: "shared_sync_failed",
  message: "Shared reward persistence failed. Please retry.",
});

assert.doesNotThrow(() => {
  renderToStaticMarkup(<RewardPopupHost />);
});

console.log("rewardPopupHost.test.tsx passed");

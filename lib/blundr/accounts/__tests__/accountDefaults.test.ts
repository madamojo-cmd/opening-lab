import assert from "node:assert/strict";

import {
  createDefaultDailyRetentionProgress,
  createDefaultRewardHistory,
  createDefaultStreakRecord,
  createDefaultTrainingProfile,
  createDefaultUserAccount,
  createDefaultUserRepertoire,
  createLocalDemoUser,
} from "../accountDefaults";

const now = "2026-07-03T12:00:00.000Z";

const profile = createDefaultTrainingProfile("user-1", now);
assert.equal(profile.userId, "user-1");
assert.equal(profile.ratingBandId, "1200-1600");
assert.equal(profile.dailyTempoGoal, 10);
assert.equal(profile.createdAt, now);

const repertoire = createDefaultUserRepertoire("user-1", now);
assert.deepEqual(repertoire.unlockedOpeningIds, []);
assert.deepEqual(repertoire.lockedOpeningIds, []);

const progress = createDefaultDailyRetentionProgress("user-1", "2026-07-03", undefined, now);
assert.equal(progress.userId, "user-1");
assert.equal(progress.localDate, "2026-07-03");
assert.equal(progress.rings.dailyTempo.goal, 10);
assert.equal(progress.updatedAt, now);

const streak = createDefaultStreakRecord("user-1", now);
assert.equal(streak.currentStreak, 0);

const rewardHistory = createDefaultRewardHistory("user-1", now);
assert.equal(rewardHistory.randomBonusPityCounter, 0);

const account = createDefaultUserAccount("user-1", now);
assert.equal(account.userId, "user-1");
assert.equal(account.profile.userId, "user-1");

const localDemo = createLocalDemoUser(now);
assert.equal(localDemo.userId, "local-demo-user");
assert.equal(localDemo.mode, "local_demo");

console.log("accountDefaults.test.ts passed");

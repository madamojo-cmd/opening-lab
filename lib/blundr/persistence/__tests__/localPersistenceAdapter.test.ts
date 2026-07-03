import assert from "node:assert/strict";

import { createDefaultDailyRetentionProgress, createDefaultOpeningUnlockEvent, createDefaultOpeningUnlockProgress, createDefaultRewardHistory, createDefaultRewardRoll, createDefaultStreakRecord, createDefaultTrainingProfile, createDefaultUserRepertoire } from "../../accounts/accountDefaults";
import { readLocalAccountBundle, resetLocalAccountState } from "../../accounts/localAccountStorage";
import { createBlundrLocalPersistenceAdapter } from "../localPersistenceAdapter";

const adapter = createBlundrLocalPersistenceAdapter("local_demo");
resetLocalAccountState("user-1");

void (async () => {
  const now = "2026-07-03T12:00:00.000Z";
  const profile = createDefaultTrainingProfile("user-1", now);
  const repertoire = createDefaultUserRepertoire("user-1", now);
  const progress = createDefaultDailyRetentionProgress("user-1", "2026-07-03", undefined, now);
  const streak = createDefaultStreakRecord("user-1", now);
  const rewardHistory = createDefaultRewardHistory("user-1", now);
  const openingUnlockProgress = createDefaultOpeningUnlockProgress("user-1", "open-1", now, 10);
  const openingUnlockEvent = createDefaultOpeningUnlockEvent("user-1", "open-1", "manual_admin_unlock", 10, "event-1", now);
  const rewardRoll = createDefaultRewardRoll("user-1", "daily_blundr_ring_closed", "seed-1", now, true);

  assert.equal((await adapter.upsertTrainingProfile(profile)).ok, true);
  assert.equal((await adapter.upsertUserRepertoire(repertoire)).ok, true);
  assert.equal((await adapter.upsertDailyRetentionProgress(progress)).ok, true);
  assert.equal((await adapter.upsertStreakRecord(streak)).ok, true);
  assert.equal((await adapter.upsertRewardHistory(rewardHistory)).ok, true);
  assert.equal((await adapter.upsertOpeningUnlockProgress(openingUnlockProgress)).ok, true);
  assert.equal((await adapter.appendOpeningUnlockEvent(openingUnlockEvent)).ok, true);
  assert.equal((await adapter.appendRewardRoll(rewardRoll)).ok, true);
  assert.equal((await adapter.saveValidationSnapshot({
    id: "snapshot-1",
    userId: "user-1",
    generatedAt: now,
    valid: true,
    issueCount: 0,
    errorCount: 0,
    warningCount: 0,
    reportJson: { valid: true },
  })).ok, true);

  const bundle = readLocalAccountBundle();
  assert.equal(bundle.trainingProfilesByUserId["user-1"].userId, "user-1");
  assert.equal(bundle.repertoiresByUserId["user-1"].userId, "user-1");
  assert.equal(bundle.dailyRetentionProgressByKey["user-1:2026-07-03"].localDate, "2026-07-03");
  assert.equal(bundle.streakRecordsByUserId["user-1"].userId, "user-1");
  assert.equal(bundle.rewardHistoryByUserId["user-1"].userId, "user-1");
  assert.equal(bundle.openingUnlockProgressByUserId["user-1"][0].openingId, "open-1");
  assert.equal(bundle.openingUnlockEventsByUserId["user-1"][0].openingId, "open-1");
  assert.equal(bundle.rewardRollsByUserId["user-1"][0].seed, "seed-1");
  assert.equal(bundle.validationSnapshotsById["snapshot-1"].id, "snapshot-1");

  console.log("localPersistenceAdapter.test.ts passed");
})();

import assert from "node:assert/strict";

import { createDefaultDailyRetentionProgress, createDefaultOpeningUnlockEvent, createDefaultOpeningUnlockProgress, createDefaultRewardHistory, createDefaultRewardRoll, createDefaultStreakRecord, createDefaultTrainingProfile, createDefaultUserRepertoire } from "../../accounts/accountDefaults";
import { createBlundrLocalPersistenceAdapter } from "../localPersistenceAdapter";
import { mapDailyRetentionRow, mapDailyRetentionRowToModel, mapOpeningUnlockEventRow, mapOpeningUnlockProgressRow, mapOpeningUnlockProgressRowToModel, mapRepertoireRow, mapRepertoireRowToModel, mapRewardHistoryRow, mapRewardHistoryRowToModel, mapRewardRollRow, mapRewardRollRowToModel, mapStreakRecordRow, mapStreakRecordRowToModel, mapTrainingProfileRow, mapTrainingProfileRowToModel, mapValidationSnapshotRow, mapValidationSnapshotRowToModel } from "../supabasePersistenceAdapter";
import { resolveBlundrPersistenceAdapter } from "../persistenceService";

const now = "2026-07-03T12:00:00.000Z";

const profile = createDefaultTrainingProfile("user-1", now);
assert.deepEqual(
  JSON.parse(JSON.stringify(mapTrainingProfileRowToModel(mapTrainingProfileRow(profile)))),
  JSON.parse(JSON.stringify(profile)),
);

const repertoire = createDefaultUserRepertoire("user-1", now);
assert.deepEqual(
  JSON.parse(JSON.stringify(mapRepertoireRowToModel(mapRepertoireRow(repertoire)))),
  JSON.parse(JSON.stringify(repertoire)),
);

const progress = createDefaultDailyRetentionProgress("user-1", "2026-07-03", undefined, now);
assert.equal("id" in mapDailyRetentionRow(progress), false);
assert.deepEqual(
  JSON.parse(JSON.stringify(mapDailyRetentionRowToModel(mapDailyRetentionRow(progress)))),
  JSON.parse(JSON.stringify(progress)),
);

const streak = createDefaultStreakRecord("user-1", now);
const rewardHistory = createDefaultRewardHistory("user-1", now);
const rewardRoll = createDefaultRewardRoll("user-1", "daily_blundr_ring_closed", "seed-1", now, true);
const openingUnlockProgress = createDefaultOpeningUnlockProgress("user-1", "open-1", now, 10);
const openingUnlockEvent = createDefaultOpeningUnlockEvent("user-1", "open-1", "manual_admin_unlock", 10, "event-1", now);

assert.deepEqual(
  JSON.parse(JSON.stringify(mapOpeningUnlockProgressRowToModel(mapOpeningUnlockProgressRow(openingUnlockProgress)))),
  JSON.parse(JSON.stringify(openingUnlockProgress)),
);
assert.equal("id" in mapOpeningUnlockProgressRow(openingUnlockProgress), false);
assert.equal(mapOpeningUnlockEventRow(openingUnlockEvent).opening_id, "open-1");
assert.deepEqual(
  JSON.parse(JSON.stringify(mapStreakRecordRowToModel(mapStreakRecordRow(streak)))),
  JSON.parse(JSON.stringify(streak)),
);
assert.deepEqual(
  JSON.parse(JSON.stringify(mapRewardHistoryRowToModel(mapRewardHistoryRow(rewardHistory)))),
  JSON.parse(JSON.stringify(rewardHistory)),
);
assert.deepEqual(
  JSON.parse(JSON.stringify(mapRewardRollRowToModel(mapRewardRollRow(rewardRoll)))),
  JSON.parse(JSON.stringify(rewardRoll)),
);

const adapter = createBlundrLocalPersistenceAdapter("local_demo");
assert.equal(adapter.mode, "local_demo");
assert.equal(typeof adapter.getTrainingProfile, "function");
assert.equal(typeof adapter.upsertRewardHistory, "function");

const resolved = resolveBlundrPersistenceAdapter({ mode: "local_demo", allowLocalFallback: true });
assert.equal(resolved.mode, "local_demo");

const snapshot = mapValidationSnapshotRowToModel(
  mapValidationSnapshotRow({
    id: "snapshot-1",
    userId: "user-1",
    generatedAt: now,
    valid: true,
    issueCount: 0,
    errorCount: 0,
    warningCount: 0,
    reportJson: { valid: true },
  }),
);
assert.equal(snapshot?.id, "snapshot-1");

console.log("persistenceAdapter.test.ts passed");

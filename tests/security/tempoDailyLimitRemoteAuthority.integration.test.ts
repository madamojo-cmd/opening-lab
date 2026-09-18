import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const required = [
  "BLUNDR_RLS_TEST_URL",
  "BLUNDR_RLS_TEST_SERVICE_ROLE_KEY",
  "BLUNDR_RLS_TEST_USER_A_EMAIL",
  "BLUNDR_RLS_TEST_USER_A_PASSWORD",
  "BLUNDR_RLS_TEST_USER_B_EMAIL",
  "BLUNDR_RLS_TEST_USER_B_PASSWORD",
];
for (const name of required) assert.ok(process.env[name], `${name} required`);
assert.equal(process.env.BLUNDR_RLS_TEST_ENVIRONMENT_ROLE, "disposable");

const service = createClient(
  process.env.BLUNDR_RLS_TEST_URL!,
  process.env.BLUNDR_RLS_TEST_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);
const scope = `tempo-${Date.now()}-${randomUUID().slice(0, 8)}`;
const made: string[] = [];

function scopedEmail(base: string, suffix: string) {
  const at = base.indexOf("@");
  return `${base.slice(0, at)}+${scope}-${suffix}${base.slice(at)}`;
}

async function createUser(email: string, password: string) {
  const result = await service.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  assert.equal(result.error, null);
  assert.ok(result.data.user);
  made.push(result.data.user!.id);
  const profile = await service.from("blundr_user_profiles").insert({
    user_id: result.data.user!.id,
    time_zone: "UTC",
  });
  assert.equal(profile.error, null);
  return result.data.user!.id;
}

function session(userId: string, ordinal: number, openingId: string) {
  const sessionId = `tempo-session:${scope}:${userId}:${ordinal}`;
  return {
    session_id: sessionId,
    user_id: userId,
    opening_id: openingId,
    line_id: `tempo-line:${scope}:${ordinal}`,
    line_fingerprint: "a".repeat(64),
    canonical_line: [
      {
        target_id: `trainer-target:1:${"b".repeat(24)}`,
        target_fingerprint: "b".repeat(64),
        opening_id: openingId,
        position_key: `tempo-position:${scope}:${ordinal}`,
        expected_move_uci: "a1a2",
        move_order_key: `tempo-play:${scope}:${ordinal}`,
      },
    ],
    line_length: 1,
  };
}

async function reserve(
  userId: string,
  ordinal: number,
  openingId = "italian-white",
) {
  const row = session(userId, ordinal, openingId);
  const result = await service.from("blundr_trainer_sessions_v2").insert(row);
  assert.equal(result.error, null);
  return row.session_id;
}

async function complete(sessionId: string, completedAt: string, label: string) {
  const result = await service
    .from("blundr_trainer_sessions_v2")
    .update({
      state: "completed",
      current_cursor: 1,
      state_version: 2,
      terminal_completion_id: `trainer-terminal:${scope}:${label}`,
      completed_at: completedAt,
    })
    .eq("session_id", sessionId);
  return result.error;
}

async function countCompleted(userId: string) {
  const result = await service
    .from("blundr_trainer_sessions_v2")
    .select("session_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("state", "completed")
    .not("terminal_completion_id", "is", null)
    .not("completed_at", "is", null);
  assert.equal(result.error, null);
  return result.count;
}

async function main() {
  const userA = await createUser(
    scopedEmail(process.env.BLUNDR_RLS_TEST_USER_A_EMAIL!, "a"),
    process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
  );
  const userB = await createUser(
    scopedEmail(process.env.BLUNDR_RLS_TEST_USER_B_EMAIL!, "b"),
    process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD!,
  );
  try {
    const day = "2026-09-18T12:00:00.000Z";
    for (let ordinal = 1; ordinal <= 20; ordinal += 1) {
      const opening =
        ordinal <= 8
          ? "italian-white"
          : ordinal <= 15
            ? "scotch-white"
            : "caro-kann-black";
      const sessionId = await reserve(userA, ordinal, opening);
      const error = await complete(sessionId, day, `a-${ordinal}`);
      assert.equal(error, null, `Free completion ${ordinal} must be allowed`);
    }
    assert.equal(await countCompleted(userA), 20);
    const blockedSession = await reserve(userA, 21, "italian-white");
    const blocked = await complete(blockedSession, day, "a-21");
    assert.ok(blocked);
    assert.match(String(blocked?.message), /free_tempo_daily_limit_reached/);
    assert.equal(await countCompleted(userA), 20);

    for (let ordinal = 1; ordinal <= 19; ordinal += 1) {
      const sessionId = await reserve(userB, ordinal, "italian-white");
      assert.equal(await complete(sessionId, day, `b-${ordinal}`), null);
    }
    const concurrentA = await reserve(userB, 20, "scotch-white");
    const concurrentB = await reserve(userB, 21, "caro-kann-black");
    const concurrent = await Promise.all([
      complete(concurrentA, day, "b-20"),
      complete(concurrentB, day, "b-21"),
    ]);
    assert.equal(concurrent.filter((error) => !error).length, 1);
    assert.equal(
      concurrent.filter(
        (error) =>
          error && /free_tempo_daily_limit_reached/.test(error.message),
      ).length,
      1,
    );
    assert.equal(await countCompleted(userB), 20);

    const nextDay = await reserve(userB, 22, "italian-white");
    assert.equal(
      await complete(nextDay, "2026-09-19T00:01:00.000Z", "b-next-day"),
      null,
    );
    assert.equal(await countCompleted(userB), 21);
    console.log(
      "Tempo remote authority passed: free-20=allowed free-21=blocked concurrency=passed cross-opening=passed local-day-reset=passed count-source=trainer-completions skips=0",
    );
  } finally {
    for (const id of made) await service.auth.admin.deleteUser(id);
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

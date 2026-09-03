import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type TestClient = SupabaseClient<any, "public">;

const requiredEnvironmentNames = [
  "SUPABASE_ACCESS_TOKEN",
  "SUPABASE_DB_PASSWORD",
  "BLUNDR_RLS_TEST_PROJECT_REF",
  "BLUNDR_RLS_TEST_ENVIRONMENT_ROLE",
  "BLUNDR_RLS_TEST_URL",
  "BLUNDR_RLS_TEST_ANON_KEY",
  "BLUNDR_RLS_TEST_SERVICE_ROLE_KEY",
  "BLUNDR_RLS_TEST_USER_A_EMAIL",
  "BLUNDR_RLS_TEST_USER_A_PASSWORD",
  "BLUNDR_RLS_TEST_USER_B_EMAIL",
  "BLUNDR_RLS_TEST_USER_B_PASSWORD",
] as const;
const missingEnvironmentNames = requiredEnvironmentNames.filter(
  (name) => !process.env[name],
);
const configured = missingEnvironmentNames.length === 0;
const runningInCi = Boolean(process.env.CI);

const rewardTables = [
  "blundr_reward_transactions_v2",
  "blundr_reward_grants_v2",
  "blundr_reward_inventory_v2",
  "blundr_reward_inventory_events_v2",
  "blundr_reward_presentations_v2",
] as const;
const dailyTables = [
  "blundr_daily_decks",
  "blundr_daily_sessions",
  "blundr_daily_attempts",
] as const;
const legacyRewardTables = ["blundr_completion_grants"] as const;
const reportDomains = [
  "learning_imported_observations",
  "learning_canonical_coordinates",
  "user_iana_time_zones",
  "daily_reservation_identity",
  "daily_parent_ownership",
] as const;

const rpcCases = [
  {
    name: "blundr_project_learning_evidence_v2",
    args: (userId: string) => ({ p_user_id: userId, p_event: {} }),
    serviceError: /invalid_learning_projection_request/i,
  },
  {
    name: "blundr_reserve_daily_v2",
    args: (userId: string) => ({
      p_user_id: userId,
      p_local_date: "2026-08-05",
      p_reservation: {},
    }),
    serviceError: /invalid_daily_reservation_request/i,
  },
  {
    name: "blundr_commit_daily_action_v2",
    args: (userId: string) => ({
      p_user_id: userId,
      p_session_id: "pr01-rls-session",
      p_action: {},
    }),
    serviceError: /invalid_daily_action_request/i,
  },
  {
    name: "blundr_apply_reward_transaction_v2",
    args: (userId: string) => ({
      p_user_id: userId,
      p_completion_id: "pr01-completion",
      p_source: "pr01-rls-test",
      p_evidence_id: "pr01-evidence",
      p_idempotency_key: "pr01-idempotency",
      p_policy_version: "pr01-test",
      p_randomness_key_version: null,
    }),
    serviceError: /invalid_reward_transaction_request/i,
  },
  {
    name: "blundr_spend_inventory_and_unlock_v2",
    args: (userId: string) => ({
      p_user_id: userId,
      p_opening_id: "italian-game",
      p_inventory_kind: "pr01-invalid",
      p_idempotency_key: "pr01-idempotency",
      p_policy_version: "pr01-test",
    }),
    serviceError: /invalid_inventory_unlock_request/i,
  },
] as const;

function scopedEmail(baseEmail: string, scope: string): string {
  const at = baseEmail.indexOf("@");
  return at === -1
    ? `${baseEmail}+${scope}`
    : `${baseEmail.slice(0, at)}+${scope}@${baseEmail.slice(at + 1)}`;
}

function isScopedPr01Email(email: string, baseEmail: string): boolean {
  const at = baseEmail.indexOf("@");
  if (at === -1) return email.startsWith(`${baseEmail}+pr01-`);
  return (
    email.startsWith(`${baseEmail.slice(0, at)}+pr01-`) &&
    email.endsWith(`@${baseEmail.slice(at + 1)}`)
  );
}

async function deleteScopedPr01Users(service: TestClient, baseEmail: string) {
  const users = [] as Array<{ id: string; email?: string | null }>;
  for (let page = 1; page <= 20; page++) {
    const response = await service.auth.admin.listUsers({ page, perPage: 100 });
    assert.equal(
      response.error,
      null,
      "service role must list scoped test users",
    );
    users.push(...(response.data.users ?? []));
    if ((response.data.users ?? []).length < 100) break;
  }
  for (const user of users.filter((candidate) =>
    isScopedPr01Email(candidate.email ?? "", baseEmail),
  )) {
    assert.equal((await service.auth.admin.deleteUser(user.id)).error, null);
  }
}

function isMissingPr01Schema(error: {
  code?: string;
  message?: string;
}): boolean {
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    /could not find the table|does not exist|schema cache/i.test(
      error.message ?? "",
    )
  );
}

async function hasPr01Schema(service: TestClient): Promise<boolean> {
  for (const table of [
    ...rewardTables,
    "blundr_learning_daily_backfill_reports",
  ]) {
    const response = await service.from(table).select("*").limit(1);
    if (response.error && isMissingPr01Schema(response.error)) return false;
    assert.equal(
      response.error,
      null,
      `service-role schema probe failed for ${table}`,
    );
  }
  return true;
}

async function assertServiceOnlyAuthorityRpcs(
  service: TestClient,
  anonymous: TestClient,
  userA: TestClient,
  userB: TestClient,
  userAId: string,
) {
  for (const rpc of rpcCases) {
    const args = rpc.args(userAId);
    const serviceResponse = await service.rpc(rpc.name, args as never);
    assert.ok(
      serviceResponse.error,
      `${rpc.name} service authority must fail closed`,
    );
    assert.match(serviceResponse.error.message, rpc.serviceError);
    for (const [actor, client] of [
      ["anonymous", anonymous],
      ["user A", userA],
      ["user B", userB],
    ] as const) {
      const response = await client.rpc(rpc.name, args as never);
      assert.ok(response.error, `${rpc.name} must deny ${actor}`);
      assert.doesNotMatch(
        response.error.message,
        rpc.serviceError,
        `${rpc.name} exposed its internal validation error to ${actor}`,
      );
    }
  }
}

async function assertBackfillReport(
  service: TestClient,
  anonymous: TestClient,
  userA: TestClient,
) {
  const report = await service
    .from("blundr_learning_daily_backfill_reports")
    .select("migration_id, domain, resolved_count, unresolved_count, details")
    .eq("migration_id", "20260805120000_blundr_learning_daily_authority_v2");
  assert.equal(report.error, null);
  assert.deepEqual(
    [...(report.data ?? [])].map((row) => row.domain).sort(),
    [...reportDomains].sort(),
  );
  for (const row of report.data ?? []) {
    assert.ok(row.resolved_count >= 0 && row.unresolved_count >= 0);
    assert.equal(typeof row.details, "object");
  }
  const serviceUpdate = await service
    .from("blundr_learning_daily_backfill_reports")
    .update({ details: { fabricated: true } })
    .eq("migration_id", "20260805120000_blundr_learning_daily_authority_v2");
  assert.ok(
    serviceUpdate.error,
    "service role must not rewrite migration reports",
  );
  const serviceDelete = await service
    .from("blundr_learning_daily_backfill_reports")
    .delete()
    .eq("migration_id", "20260805120000_blundr_learning_daily_authority_v2");
  assert.ok(
    serviceDelete.error,
    "service role must not delete migration reports",
  );
  const serviceInsert = await service
    .from("blundr_learning_daily_backfill_reports")
    .insert({
      migration_id: "20260805120000_blundr_learning_daily_authority_v2",
      domain: "fabricated_evidence",
      resolved_count: 1,
      unresolved_count: 0,
      details: { fabricated: true },
    });
  assert.ok(
    serviceInsert.error,
    "service role must not append fabricated migration reports",
  );
  for (const [actor, client] of [
    ["anonymous", anonymous],
    ["user A", userA],
  ] as const) {
    const privateRead = await client
      .from("blundr_learning_daily_backfill_reports")
      .select("domain")
      .eq("migration_id", "20260805120000_blundr_learning_daily_authority_v2");
    assert.ok(
      privateRead.error || privateRead.data?.length === 0,
      `${actor} must not read backfill reports`,
    );
    const mutation = await client
      .from("blundr_learning_daily_backfill_reports")
      .delete()
      .eq("migration_id", "20260805120000_blundr_learning_daily_authority_v2");
    assert.ok(
      mutation.error,
      `${actor} must not mutate immutable backfill reports`,
    );
  }
}

async function assertFirstAttemptSpoofDenied(
  service: TestClient,
  userA: TestClient,
  userB: TestClient,
  userAId: string,
  runTag: string,
) {
  const firstAttempt = {
    event_id: `pr01-recall-${runTag}`,
    user_id: userAId,
    idempotency_key: `pr01-recall-${runTag}`,
    schema_version: "pr01-test",
    session_id: `pr01-session-${runTag}`,
    occurred_at: new Date().toISOString(),
    taxonomy: "opening_recall",
    repertoire_side: "white",
    source: "train",
    first_attempt: true,
    content_version: "pr01-test",
    classifier_version: "pr01-test",
    evidence_kind: "recall_attempt",
    exposure_id: `pr01-exposure-${runTag}`,
  };
  assert.ok(
    (await userA.from("blundr_learning_events").insert(firstAttempt)).error,
    "User A cannot self-assert a first attempt before PR-02",
  );
  assert.ok(
    (
      await userB.from("blundr_learning_events").insert({
        ...firstAttempt,
        event_id: `pr01-cross-user-${runTag}`,
        idempotency_key: `pr01-cross-user-${runTag}`,
      })
    ).error,
    "User B cannot spoof User A first attempt",
  );
  const inserted = await service
    .from("blundr_learning_events")
    .insert(firstAttempt)
    .select("event_id")
    .single();
  assert.equal(inserted.error, null);
  assert.equal(inserted.data?.event_id, firstAttempt.event_id);
  assert.ok(
    (
      await service.from("blundr_learning_events").insert({
        ...firstAttempt,
        event_id: `pr01-duplicate-${runTag}`,
        idempotency_key: `pr01-duplicate-${runTag}`,
      })
    ).error,
    "one exposure may have only one first attempt",
  );
}

async function assertRewardsAndCascade(
  service: TestClient,
  anonymous: TestClient,
  userA: TestClient,
  userB: TestClient,
  userAId: string,
  userBId: string,
  runTag: string,
) {
  const transaction = {
    user_id: userAId,
    idempotency_key: `pr01-${runTag}`,
    transaction_kind: "reward_grant",
    completion_id: `pr01-completion-${runTag}`,
    source: "pr01-rls-test",
    policy_version: "pr01-test",
  };
  const inserted = await service
    .from("blundr_reward_transactions_v2")
    .insert(transaction)
    .select("id")
    .single();
  assert.equal(inserted.error, null);
  assert.ok(inserted.data?.id);
  const transactionId = inserted.data.id;
  const anonymousTransactionRead = await anonymous
    .from("blundr_reward_transactions_v2")
    .select("user_id");
  assert.ok(
    anonymousTransactionRead.error ||
      anonymousTransactionRead.data?.length === 0,
    "signed-out reward transaction reads must error or return no rows",
  );
  assert.equal(
    (
      await userA
        .from("blundr_reward_transactions_v2")
        .select("user_id")
        .eq("user_id", userAId)
    ).data?.length,
    1,
  );
  assert.deepEqual(
    (
      await userB
        .from("blundr_reward_transactions_v2")
        .select("user_id")
        .eq("user_id", userAId)
    ).data,
    [],
  );
  assert.ok(
    (
      await userA
        .from("blundr_reward_transactions_v2")
        .insert({ ...transaction, idempotency_key: `browser-${runTag}` })
    ).error,
    "User A cannot write reward transactions",
  );
  const grant = {
    transaction_id: transactionId,
    user_id: userAId,
    grant_key: `grant-${runTag}`,
    grant_type: "routine_points",
    quantity: 1,
    policy_version: "pr01-test",
  };
  const event = {
    transaction_id: transactionId,
    user_id: userAId,
    event_key: `event-${runTag}`,
    event_kind: "grant",
    inventory_kind: "opening_fragment",
    quantity_delta: 1,
    policy_version: "pr01-test",
  };
  const presentation = {
    transaction_id: transactionId,
    user_id: userAId,
    presentation_key: `presentation-${runTag}`,
    presentation_kind: "toast",
    envelope: { source: "pr01" },
    policy_version: "pr01-test",
  };
  assert.equal(
    (await service.from("blundr_reward_grants_v2").insert(grant)).error,
    null,
  );
  assert.equal(
    (await service.from("blundr_reward_inventory_events_v2").insert(event))
      .error,
    null,
  );
  assert.equal(
    (
      await service.from("blundr_reward_inventory_v2").insert({
        user_id: userAId,
        inventory_kind: "opening_fragment",
        quantity: 1,
      })
    ).error,
    null,
  );
  assert.equal(
    (await service.from("blundr_reward_presentations_v2").insert(presentation))
      .error,
    null,
  );
  for (const table of rewardTables) {
    const response = await userB
      .from(table)
      .select("user_id")
      .eq("user_id", userAId);
    assert.deepEqual(response.data, [], `User B must not read User A ${table}`);
  }
  for (const [name, result] of [
    [
      "grant",
      await service.from("blundr_reward_grants_v2").insert({
        ...grant,
        user_id: userBId,
        grant_key: `cross-grant-${runTag}`,
      }),
    ],
    [
      "inventory event",
      await service.from("blundr_reward_inventory_events_v2").insert({
        ...event,
        user_id: userBId,
        event_key: `cross-event-${runTag}`,
      }),
    ],
    [
      "presentation",
      await service.from("blundr_reward_presentations_v2").insert({
        ...presentation,
        user_id: userBId,
        presentation_key: `cross-presentation-${runTag}`,
      }),
    ],
  ] as const) {
    assert.ok(
      result.error,
      `service role must not attach User B ${name} to User A transaction`,
    );
  }
  assert.ok(
    (
      await userB.from("blundr_reward_inventory_v2").insert({
        user_id: userAId,
        inventory_kind: "opening_fragment",
        quantity: 1,
      })
    ).error,
    "User B cannot write User A inventory",
  );
}

async function assertDailyOwnership(
  service: TestClient,
  userA: TestClient,
  userB: TestClient,
  userAId: string,
  userBId: string,
  runTag: string,
) {
  const deckId = `pr01-daily-deck-${runTag}`;
  const sessionId = `pr01-daily-session-${runTag}`;
  const attemptId = `pr01-daily-attempt-${runTag}`;
  const deck = {
    deck_id: deckId,
    user_id: userAId,
    local_date: "2026-08-05",
    deck_fingerprint: `pr01-daily-deck-fingerprint-${runTag}`,
    public_cards: [],
    server_cards: [],
    content_version: "pr01-test",
  };
  const session = {
    session_id: sessionId,
    deck_id: deckId,
    user_id: userAId,
    state: {},
  };
  const attempt = {
    attempt_id: attemptId,
    session_id: sessionId,
    user_id: userAId,
    card_fingerprint: `pr01-card-${runTag}`,
    outcome: "incorrect",
  };
  assert.equal(
    (await service.from("blundr_daily_decks").insert(deck)).error,
    null,
  );
  assert.equal(
    (await service.from("blundr_daily_sessions").insert(session)).error,
    null,
  );
  assert.equal(
    (await service.from("blundr_daily_attempts").insert(attempt)).error,
    null,
  );
  const ownerAttemptRead = await userA
    .from("blundr_daily_attempts")
    .select("attempt_id")
    .eq("attempt_id", attemptId);
  assert.ok(
    ownerAttemptRead.error || ownerAttemptRead.data?.length === 1,
    "Daily attempts must be explicitly server-only or readable only by their owner",
  );
  for (const table of dailyTables) {
    const response = await userB
      .from(table)
      .select("user_id")
      .eq("user_id", userAId);
    assert.ok(
      response.error || response.data?.length === 0,
      `User B must be denied or filtered from User A ${table}`,
    );
  }
  for (const [name, response] of [
    [
      "deck",
      await userB.from("blundr_daily_decks").insert({
        ...deck,
        deck_id: `pr01-cross-daily-deck-${runTag}`,
      }),
    ],
    [
      "session",
      await userB.from("blundr_daily_sessions").insert({
        ...session,
        session_id: `pr01-cross-daily-session-${runTag}`,
        user_id: userBId,
      }),
    ],
    [
      "attempt",
      await userB.from("blundr_daily_attempts").insert({
        ...attempt,
        attempt_id: `pr01-cross-daily-attempt-${runTag}`,
        user_id: userBId,
      }),
    ],
  ] as const) {
    assert.ok(
      response.error,
      `User B cannot attach a ${name} to User A Daily parent`,
    );
  }
  for (const [name, response] of [
    [
      "session",
      await service.from("blundr_daily_sessions").insert({
        ...session,
        session_id: `pr01-service-cross-daily-session-${runTag}`,
        user_id: userBId,
      }),
    ],
    [
      "attempt",
      await service.from("blundr_daily_attempts").insert({
        ...attempt,
        attempt_id: `pr01-service-cross-daily-attempt-${runTag}`,
        user_id: userBId,
      }),
    ],
  ] as const) {
    assert.equal(
      response.error?.code,
      "23503",
      `service authority must reject a User B Daily ${name} attached to User A parent by composite ownership FK`,
    );
  }
}

async function assertAccountDeletionCascade(
  service: TestClient,
  userAId: string,
) {
  assert.equal((await service.auth.admin.deleteUser(userAId)).error, null);
  for (const table of [
    "blundr_learning_events",
    "blundr_node_mastery",
    "blundr_weakness_projection",
    "blundr_review_states",
    ...dailyTables,
    ...legacyRewardTables,
    ...rewardTables,
  ]) {
    const response = await service
      .from(table)
      .select("*")
      .eq("user_id", userAId);
    assert.equal(response.error, null, `service role must inspect ${table}`);
    assert.deepEqual(
      response.data,
      [],
      `account deletion must cascade User A ${table} rows`,
    );
  }
}

async function assertAnonymousProtectedStateDenied(
  service: TestClient,
  anonymous: TestClient,
  protectedUserId: string,
) {
  for (const table of [
    "blundr_learning_events",
    "blundr_review_states",
    "blundr_node_mastery",
    "blundr_weakness_projection",
    ...dailyTables,
    ...rewardTables,
    "blundr_learning_daily_backfill_reports",
  ]) {
    const read = await anonymous.from(table).select("*").limit(1);
    assert.ok(
      read.error || read.data?.length === 0,
      `signed-out users must not read protected ${table} state`,
    );
    const isBackfillReport = table === "blundr_learning_daily_backfill_reports";
    const filterColumn = isBackfillReport ? "migration_id" : "user_id";
    const filterValue = isBackfillReport
      ? "20260805120000_blundr_learning_daily_authority_v2"
      : protectedUserId;
    const mutation = await anonymous
      .from(table)
      .delete()
      .eq(filterColumn, filterValue)
      .select("*");
    assert.ok(
      mutation.error || mutation.data?.length === 0,
      `signed-out ${table} mutation must error or affect zero rows`,
    );
    const unchanged = await service
      .from(table)
      .select("*", { count: "exact", head: true })
      .eq(filterColumn, filterValue);
    assert.equal(unchanged.error, null);
    assert.ok(
      (unchanged.count ?? 0) > 0,
      `service verification must prove protected ${table} state remains`,
    );
  }
}

async function assertLearningProjectionIsolation(
  service: TestClient,
  userA: TestClient,
  userB: TestClient,
  userAId: string,
  userBId: string,
  runTag: string,
) {
  for (const [userId, suffix] of [
    [userAId, "a"],
    [userBId, "b"],
  ] as const) {
    assert.equal(
      (
        await service.from("blundr_review_states").insert({
          user_id: userId,
          opening_id: `pr01-${runTag}`,
          play_key: `pr01-${suffix}-${runTag}`,
          due_at: new Date().toISOString(),
        })
      ).error,
      null,
    );
    assert.equal(
      (
        await service.from("blundr_node_mastery").insert({
          user_id: userId,
          position_key: `pr01-${suffix}-${runTag}`,
        })
      ).error,
      null,
    );
    assert.equal(
      (
        await service.from("blundr_weakness_projection").insert({
          user_id: userId,
          position_key: `pr01-${suffix}-${runTag}`,
          category: "pr01-isolation",
          explanation: "PR-01 isolation fixture",
          recommended_daily_intervention: "none",
        })
      ).error,
      null,
    );
  }
  for (const [actor, otherUserId] of [
    [userA, userBId],
    [userB, userAId],
  ] as const) {
    for (const table of [
      "blundr_learning_events",
      "blundr_review_states",
      "blundr_node_mastery",
      "blundr_weakness_projection",
    ]) {
      const read = await actor
        .from(table)
        .select("user_id")
        .eq("user_id", otherUserId);
      assert.ok(
        read.error || read.data?.length === 0,
        `cross-user ${table} rows must be denied or filtered`,
      );
      const mutationMarker = "2099-01-01T00:00:00.000Z";
      const validMutation =
        table === "blundr_learning_events"
          ? { taxonomy: "cross_user_spoof" }
          : { updated_at: mutationMarker };
      const mutation = await actor
        .from(table)
        .update(validMutation)
        .eq("user_id", otherUserId)
        .select("user_id");
      assert.ok(
        mutation.error || mutation.data?.length === 0,
        `cross-user ${table} mutation must error or affect zero rows`,
      );
      const unchanged = await service
        .from(table)
        .select("user_id")
        .eq("user_id", otherUserId)
        .eq(
          table === "blundr_learning_events" ? "taxonomy" : "updated_at",
          table === "blundr_learning_events"
            ? "cross_user_spoof"
            : mutationMarker,
        );
      assert.equal(unchanged.error, null);
      assert.deepEqual(
        unchanged.data,
        [],
        `service verification must prove cross-user ${table} remained unchanged`,
      );
    }
  }
}

async function runPr01RlsMatrix(): Promise<void> {
  assert.ok(
    configured,
    `CI requires configured disposable PR-01 credentials: ${missingEnvironmentNames.join(", ")}`,
  );
  assert.ok(
    ["disposable", "staging"].includes(
      process.env.BLUNDR_RLS_TEST_ENVIRONMENT_ROLE ?? "",
    ),
    "PR-01 authority tests only run against disposable or staging environments",
  );
  const url = process.env.BLUNDR_RLS_TEST_URL!;
  const service = createClient(
    url,
    process.env.BLUNDR_RLS_TEST_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  if (!(await hasPr01Schema(service)))
    assert.fail(
      "Disposable RLS database must apply both PR-01 migrations before this gate can pass.",
    );
  const runTag = randomUUID().slice(0, 8);
  const baseEmailA = process.env.BLUNDR_RLS_TEST_USER_A_EMAIL!;
  const baseEmailB = process.env.BLUNDR_RLS_TEST_USER_B_EMAIL!;
  await deleteScopedPr01Users(service, baseEmailA);
  await deleteScopedPr01Users(service, baseEmailB);
  let userAId: string | undefined;
  let userBId: string | undefined;
  try {
    const createdA = await service.auth.admin.createUser({
      email: scopedEmail(baseEmailA, `pr01-a-${runTag}`),
      password: process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
      email_confirm: true,
    });
    const createdB = await service.auth.admin.createUser({
      email: scopedEmail(baseEmailB, `pr01-b-${runTag}`),
      password: process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD!,
      email_confirm: true,
    });
    assert.equal(createdA.error, null);
    assert.equal(createdB.error, null);
    assert.ok(createdA.data.user && createdB.data.user);
    userAId = createdA.data.user.id;
    userBId = createdB.data.user.id;
    const anonymous = createClient(url, process.env.BLUNDR_RLS_TEST_ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const userA = createClient(url, process.env.BLUNDR_RLS_TEST_ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const userB = createClient(url, process.env.BLUNDR_RLS_TEST_ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    assert.equal(
      (
        await userA.auth.signInWithPassword({
          email: scopedEmail(baseEmailA, `pr01-a-${runTag}`),
          password: process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
        })
      ).error,
      null,
    );
    assert.equal(
      (
        await userB.auth.signInWithPassword({
          email: scopedEmail(baseEmailB, `pr01-b-${runTag}`),
          password: process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD!,
        })
      ).error,
      null,
    );
    await assertBackfillReport(service, anonymous, userA);
    await assertFirstAttemptSpoofDenied(service, userA, userB, userAId, runTag);
    await assertRewardsAndCascade(
      service,
      anonymous,
      userA,
      userB,
      userAId,
      userBId,
      runTag,
    );
    await assertDailyOwnership(service, userA, userB, userAId, userBId, runTag);
    await assertFirstAttemptSpoofDenied(
      service,
      userB,
      userA,
      userBId,
      `${runTag}-reverse`,
    );
    await assertRewardsAndCascade(
      service,
      anonymous,
      userB,
      userA,
      userBId,
      userAId,
      `${runTag}-reverse`,
    );
    await assertDailyOwnership(
      service,
      userB,
      userA,
      userBId,
      userAId,
      `${runTag}-reverse`,
    );
    await assertLearningProjectionIsolation(
      service,
      userA,
      userB,
      userAId,
      userBId,
      runTag,
    );
    await assertAnonymousProtectedStateDenied(service, anonymous, userAId);
    await assertServiceOnlyAuthorityRpcs(
      service,
      anonymous,
      userA,
      userB,
      userAId,
    );
    await assertAccountDeletionCascade(service, userAId);
    userAId = undefined;
  } finally {
    if (userAId)
      assert.equal((await service.auth.admin.deleteUser(userAId)).error, null);
    if (userBId)
      assert.equal((await service.auth.admin.deleteUser(userBId)).error, null);
  }
}

test(
  "PR-01 RLS keeps v2 tables private and authority service-only",
  {
    skip:
      !configured &&
      !runningInCi &&
      "BLUNDR_RLS_TEST_* disposable credentials are not configured locally.",
  },
  runPr01RlsMatrix,
);

test("PR-01 keeps the v2 Daily and reward writers disabled in committed profiles", async () => {
  for (const profileName of ["staging-3.99.json", "production-3.99.json"]) {
    const profile = JSON.parse(
      await readFile(
        join(process.cwd(), "release", "feature-profiles", profileName),
        "utf8",
      ),
    ) as { featureFlags?: Record<string, unknown> };
    assert.equal(profile.featureFlags?.daily_adaptive_v2, false, profileName);
    assert.equal(profile.featureFlags?.rewards_v2_enabled, false, profileName);
    const expectedPresentations =
      profileName === "staging-3.99.json" ? true : false;
    assert.equal(
      profile.featureFlags?.reward_presentations_v2_enabled,
      expectedPresentations,
      profileName,
    );
  }
});

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
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
const reportDomains = [
  "learning_imported_observations",
  "learning_canonical_coordinates",
  "user_iana_time_zones",
  "daily_reservation_identity",
] as const;

const rpcCases = [
  {
    name: "blundr_project_learning_evidence_v2",
    args: (userId: string) => ({ p_user_id: userId, p_event: {} }),
    serviceError: /learning_projection_authority_not_implemented/i,
  },
  {
    name: "blundr_reserve_daily_v2",
    args: (userId: string) => ({
      p_user_id: userId,
      p_local_date: "2026-08-05",
      p_reservation: {},
    }),
    serviceError: /daily_reservation_authority_not_implemented/i,
  },
  {
    name: "blundr_commit_daily_action_v2",
    args: (userId: string) => ({
      p_user_id: userId,
      p_session_id: "pr01-rls-session",
      p_action: {},
    }),
    serviceError: /daily_action_authority_not_implemented/i,
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
    serviceError: /blundr_rewards_v2_transaction_unavailable/i,
  },
  {
    name: "blundr_spend_inventory_and_unlock_v2",
    args: (userId: string) => ({
      p_user_id: userId,
      p_opening_id: "italian-game",
      p_inventory_kind: "opening_fragment",
      p_idempotency_key: "pr01-idempotency",
      p_policy_version: "pr01-test",
    }),
    serviceError: /blundr_rewards_v2_inventory_unlock_unavailable/i,
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

async function assertServiceOnlyShells(
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
      `${rpc.name} service shell must fail closed`,
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
        `${rpc.name} exposed its service-only implementation to ${actor}`,
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
  assert.deepEqual(
    (await anonymous.from("blundr_reward_transactions_v2").select("user_id"))
      .data,
    [],
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

async function assertAccountDeletionCascade(
  service: TestClient,
  userAId: string,
) {
  assert.equal((await service.auth.admin.deleteUser(userAId)).error, null);
  for (const table of ["blundr_learning_events", ...rewardTables]) {
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

async function runPr01RlsMatrix(): Promise<void> {
  assert.ok(
    configured,
    `CI requires configured disposable PR-01 credentials: ${missingEnvironmentNames.join(", ")}`,
  );
  assert.equal(
    process.env.BLUNDR_RLS_TEST_ENVIRONMENT_ROLE,
    "disposable",
    "PR-01 authority tests only run against disposable CI",
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
    await assertServiceOnlyShells(service, anonymous, userA, userB, userAId);
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

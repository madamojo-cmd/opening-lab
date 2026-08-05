import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type TestClient = SupabaseClient<any, "public">;

const configured = Boolean(
  process.env.BLUNDR_RLS_TEST_URL &&
    process.env.BLUNDR_RLS_TEST_ANON_KEY &&
    process.env.BLUNDR_RLS_TEST_SERVICE_ROLE_KEY &&
    process.env.BLUNDR_RLS_TEST_USER_A_EMAIL &&
    process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD &&
    process.env.BLUNDR_RLS_TEST_USER_B_EMAIL &&
    process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD,
);

const rewardTables = [
  "blundr_reward_transactions_v2",
  "blundr_reward_grants_v2",
  "blundr_reward_inventory_v2",
  "blundr_reward_inventory_events_v2",
  "blundr_reward_presentations_v2",
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
  if (at === -1) return `${baseEmail}+${scope}`;
  return `${baseEmail.slice(0, at)}+${scope}@${baseEmail.slice(at + 1)}`;
}

async function deleteUsersForEmailBase(
  service: TestClient,
  baseEmail: string,
): Promise<void> {
  const at = baseEmail.indexOf("@");
  const local = at === -1 ? baseEmail : baseEmail.slice(0, at);
  const domain = at === -1 ? "" : baseEmail.slice(at + 1);
  const users = [] as Array<{ id: string; email?: string | null }>;
  for (let page = 1; page <= 20; page++) {
    const response = await service.auth.admin.listUsers({ page, perPage: 100 });
    users.push(...(response.data.users ?? []));
    if ((response.data.users ?? []).length < 100) break;
  }
  await Promise.all(
    users
      .filter((user) => {
        const email = user.email ?? "";
        return (
          email === baseEmail ||
          (domain &&
            email.startsWith(`${local}+`) &&
            email.endsWith(`@${domain}`))
        );
      })
      .map((user) => service.auth.admin.deleteUser(user.id)),
  );
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
  for (const table of rewardTables) {
    const response = await service.from(table).select("user_id").limit(1);
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
): Promise<void> {
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

async function runPr01RlsMatrix(): Promise<void> {
  const url = process.env.BLUNDR_RLS_TEST_URL!;
  const anonKey = process.env.BLUNDR_RLS_TEST_ANON_KEY!;
  const service = createClient(
    url,
    process.env.BLUNDR_RLS_TEST_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  );
  if (!(await hasPr01Schema(service))) {
    assert.fail(
      "Disposable RLS database must apply both PR-01 migrations before this gate can pass.",
    );
  }

  const runTag = randomUUID().slice(0, 8);
  const baseEmailA = process.env.BLUNDR_RLS_TEST_USER_A_EMAIL!;
  const baseEmailB = process.env.BLUNDR_RLS_TEST_USER_B_EMAIL!;
  await deleteUsersForEmailBase(service, baseEmailA);
  await deleteUsersForEmailBase(service, baseEmailB);
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

  const anonymous = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const userA = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const userB = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  try {
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

    const transaction = {
      user_id: createdA.data.user.id,
      idempotency_key: `pr01-${runTag}`,
      transaction_kind: "reward_grant",
      completion_id: `pr01-completion-${runTag}`,
      source: "pr01-rls-test",
      policy_version: "pr01-test",
    };
    const insertedTransaction = await service
      .from("blundr_reward_transactions_v2")
      .insert(transaction)
      .select("id")
      .single();
    assert.equal(insertedTransaction.error, null);
    assert.ok(insertedTransaction.data?.id);
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
          .eq("user_id", createdA.data.user.id)
      ).data?.length,
      1,
    );
    assert.deepEqual(
      (await userB.from("blundr_reward_transactions_v2").select("user_id"))
        .data,
      [],
    );
    assert.ok(
      (
        await userA
          .from("blundr_reward_transactions_v2")
          .insert({ ...transaction, idempotency_key: `browser-${runTag}` })
      ).error,
      "authenticated users must not receive reward-v2 table write access",
    );
    assert.ok(
      (
        await service.from("blundr_reward_grants_v2").insert({
          transaction_id: insertedTransaction.data.id,
          user_id: createdB.data.user.id,
          grant_key: `cross-user-${runTag}`,
          grant_type: "routine_points",
          quantity: 1,
          policy_version: "pr01-test",
        })
      ).error,
      "service role must not be able to attach User B grant data to User A's transaction",
    );

    await assertServiceOnlyShells(
      service,
      anonymous,
      userA,
      userB,
      createdA.data.user.id,
    );
  } finally {
    for (const table of [
      "blundr_reward_presentations_v2",
      "blundr_reward_inventory_events_v2",
      "blundr_reward_grants_v2",
      "blundr_reward_inventory_v2",
      "blundr_reward_transactions_v2",
    ]) {
      await service.from(table).delete().eq("user_id", createdA.data.user.id);
    }
    await service.auth.admin.deleteUser(createdA.data.user.id);
    await service.auth.admin.deleteUser(createdB.data.user.id);
  }
}

test(
  "PR-01 RLS keeps v2 tables private and RPC shells service-only",
  {
    skip:
      !configured &&
      "BLUNDR_RLS_TEST_* disposable credentials are not configured.",
  },
  runPr01RlsMatrix,
);

import assert from "node:assert/strict";

import { NextRequest } from "next/server";

import { createDefaultRewardRoll } from "../../lib/blundr/accounts/accountDefaults";
import { setOnboardingAuthClientFactoryForTesting, resetOnboardingAuthClientFactoryForTesting } from "../../lib/blundr/accounts/accountSession";
import { createBlundrSupabasePersistenceAdapter } from "../../lib/blundr/persistence/supabasePersistenceAdapter";
import { POST } from "../../app/api/blundr/rewards/sync/route";
import { dedupeRewardRollsById } from "../../lib/blundr/rewards/rewardRollPersistence";

const previousFetch = globalThis.fetch;
const previousEnv = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

const firstRoll = createDefaultRewardRoll("reward-user", "weekly_cache", "seed-original", "2026-07-11T10:00:00.000Z", true, {
  id: "fragment-reward",
  rarity: "uncommon",
  rewardType: "opening_fragment",
  amount: 1,
  displayName: "Opening Fragment",
  description: "A fragment",
}, "reward-roll-1");
const replayRoll = {
  ...firstRoll,
  seed: "seed-replayed",
  rolledAt: "2026-07-11T11:00:00.000Z",
  userId: "another-user",
  reward: { ...firstRoll.reward!, amount: 99 },
};
const secondRoll = createDefaultRewardRoll("reward-user", "weekly_cache", "seed-second", "2026-07-11T12:00:00.000Z", true, undefined, "reward-roll-2");
const rows = new Map<string, Record<string, unknown>>();
const requests: Array<{ url: string; init: RequestInit }> = [];

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://rewards-test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";

globalThis.fetch = (async (input, init = {}) => {
  const url = String(input);
  requests.push({ url, init });
  if (url.endsWith("/auth/v1/user")) {
    return new Response(JSON.stringify({ id: "reward-user", email: "reward@example.com", app_metadata: {} }), { status: 200 });
  }
  if (url.includes("/rest/v1/blundr_reward_rolls")) {
    const row = JSON.parse(String(init.body ?? "{}")) as Record<string, unknown>;
    if (rows.has(String(row.id))) return new Response("[]", { status: 201, headers: { "content-type": "application/json" } });
    rows.set(String(row.id), row);
    return new Response(JSON.stringify([row]), { status: 201, headers: { "content-type": "application/json" } });
  }
  throw new Error(`Unexpected Supabase request: ${url}`);
}) as typeof fetch;

void (async () => {
  try {
    const adapter = createBlundrSupabasePersistenceAdapter({ accessToken: "token", mode: "authenticated" });

    assert.equal((await adapter.appendRewardRoll(firstRoll)).ok, true, "first reward-roll insert succeeds");
    assert.equal((await adapter.appendRewardRoll(replayRoll)).ok, true, "replayed immutable ID is a successful no-op");
    assert.deepEqual(rows.get(firstRoll.id), {
      id: firstRoll.id,
      user_id: firstRoll.userId,
      trigger: firstRoll.trigger,
      rolled_at: firstRoll.rolledAt,
      did_reward: firstRoll.didReward,
      reward_json: firstRoll.reward,
      seed: firstRoll.seed,
    }, "duplicate cannot rewrite trigger, seed, reward_json, rolled_at, or user_id");
    assert.equal((await adapter.appendRewardRoll(secondRoll)).ok, true, "a new ID inserts beside existing rolls");
    assert.equal(rows.size, 2);

    const rewardRolls = dedupeRewardRollsById([firstRoll, replayRoll, secondRoll, secondRoll]);
    assert.deepEqual(rewardRolls.map((roll) => roll.id), [firstRoll.id, secondRoll.id]);

    setOnboardingAuthClientFactoryForTesting(() => ({
      auth: {
        getSession: async () => ({ data: { session: { access_token: "token" } }, error: null }),
        getUser: async () => ({ data: { user: { id: "reward-user", email: "reward@example.com", app_metadata: {} } }, error: null }),
      },
    }) as never);
    const response = await POST(new NextRequest("http://localhost/api/blundr/rewards/sync", {
      method: "POST",
      headers: { authorization: "Bearer token", "content-type": "application/json" },
      body: JSON.stringify({ rewardRolls: [firstRoll, replayRoll] }),
    }));
    assert.equal(response.status, 200, "API does not return 500 for an existing immutable reward-roll ID");
    assert.equal((await response.json()).ok, true);
    assert.equal(rows.size, 2, "API replay does not duplicate inventory/history rows");
    const rollWrites = requests.filter((request) => request.url.includes("/rest/v1/blundr_reward_rolls"));
    assert.ok(rollWrites.every((request) => {
      const headers = request.init.headers;
      const prefer = headers instanceof Headers ? headers.get("prefer") : String((headers as Record<string, string> | undefined)?.prefer ?? "");
      return prefer.includes("resolution=ignore-duplicates");
    }));
    console.log("immutableRewardRollPersistence.test.ts passed");
  } finally {
    globalThis.fetch = previousFetch;
    resetOnboardingAuthClientFactoryForTesting();
    if (previousEnv.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previousEnv.url;
    if (previousEnv.anonKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousEnv.anonKey;
  }
})();

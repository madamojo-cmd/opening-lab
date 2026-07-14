import assert from "node:assert/strict";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";

const configured = Boolean(
  process.env.BLUNDR_RLS_TEST_URL &&
    process.env.BLUNDR_RLS_TEST_ANON_KEY &&
    process.env.BLUNDR_RLS_TEST_SERVICE_ROLE_KEY &&
    process.env.BLUNDR_RLS_TEST_USER_A_EMAIL &&
    process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD &&
    process.env.BLUNDR_RLS_TEST_USER_B_EMAIL &&
    process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD,
);

test("Learning Core v2 RLS enforces anonymous, user A, user B, and service-role boundaries", async (t) => {
  if (!configured) {
    t.skip(
      "requires a migrated disposable Supabase project and two test users",
    );
    return;
  }
  const url = process.env.BLUNDR_RLS_TEST_URL!;
  const anonKey = process.env.BLUNDR_RLS_TEST_ANON_KEY!;
  const service = createClient(
    url,
    process.env.BLUNDR_RLS_TEST_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const anonymous = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const emailA = process.env.BLUNDR_RLS_TEST_USER_A_EMAIL!;
  const emailB = process.env.BLUNDR_RLS_TEST_USER_B_EMAIL!;
  const existingUsers = (await service.auth.admin.listUsers()).data.users;
  await Promise.all(
    existingUsers
      .filter((user) => user.email === emailA || user.email === emailB)
      .map((user) => service.auth.admin.deleteUser(user.id)),
  );
  const createdA = await service.auth.admin.createUser({
    email: emailA,
    password: process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
    email_confirm: true,
  });
  const createdB = await service.auth.admin.createUser({
    email: emailB,
    password: process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD!,
    email_confirm: true,
  });
  assert.equal(createdA.error, null);
  assert.equal(createdB.error, null);
  assert.ok(createdA.data.user);
  assert.ok(createdB.data.user);
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
          email: emailA,
          password: process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
        })
      ).error,
      null,
    );
    assert.equal(
      (
        await userB.auth.signInWithPassword({
          email: emailB,
          password: process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD!,
        })
      ).error,
      null,
    );
    const eventId = `rls-test-${Date.now()}`;
    const row = {
      event_id: eventId,
      user_id: createdB.data.user.id,
      idempotency_key: eventId,
      schema_version: "2026-07-13.v1",
      session_id: "rls-session",
      occurred_at: new Date().toISOString(),
      taxonomy: "position_seen",
      source: "train",
      content_version: "v1",
      classifier_version: "v1",
      migration_marker: null,
    };
    assert.deepEqual(
      (await anonymous.from("blundr_learning_events").select("event_id")).data,
      [],
    );
    const inserted = await userA
      .from("blundr_learning_events")
      .insert(row)
      .select("event_id,user_id")
      .single();
    assert.equal(inserted.error, null);
    assert.equal(inserted.data?.user_id, createdA.data.user.id);
    assert.equal(
      (await userA.from("blundr_learning_events").select("event_id")).data
        ?.length,
      1,
    );
    assert.deepEqual(
      (await userB.from("blundr_learning_events").select("event_id")).data,
      [],
    );
    assert.equal(
      (
        await service
          .from("blundr_learning_events")
          .select("event_id")
          .eq("event_id", eventId)
      ).data?.length,
      1,
    );
    await userA
      .from("blundr_learning_events")
      .update({ taxonomy: "move_attempted" })
      .eq("event_id", eventId);
    await userA.from("blundr_learning_events").delete().eq("event_id", eventId);
    const appendOnlyRecord = await service
      .from("blundr_learning_events")
      .select("taxonomy")
      .eq("event_id", eventId)
      .single();
    assert.equal(appendOnlyRecord.error, null);
    assert.equal(appendOnlyRecord.data?.taxonomy, "position_seen");

    const positionKey = `rls-position-${Date.now()}`;
    const mastery = {
      user_id: createdA.data.user.id,
      position_key: positionKey,
      attempts: 1,
      first_attempt_result: "incorrect",
      confidence: 0.5,
      access_decision: "active",
    };
    const weakness = {
      user_id: createdA.data.user.id,
      position_key: positionKey,
      category: "opening_move",
      score: 0.5,
      confidence: 0.5,
      explanation: "RLS test",
      recommended_daily_intervention: "review_position",
      access_decision: "active",
    };
    assert.ok((await userA.from("blundr_node_mastery").insert(mastery)).error);
    assert.ok(
      (await userA.from("blundr_weakness_projection").insert(weakness)).error,
    );
    assert.equal(
      (
        await service
          .from("blundr_node_mastery")
          .insert(mastery)
          .select("position_key")
          .single()
      ).error,
      null,
    );
    assert.equal(
      (
        await service
          .from("blundr_weakness_projection")
          .insert(weakness)
          .select("position_key")
          .single()
      ).error,
      null,
    );
    assert.equal(
      (await userA.from("blundr_node_mastery").select("position_key")).data
        ?.length,
      1,
    );
    assert.equal(
      (await userB.from("blundr_node_mastery").select("position_key")).data
        ?.length,
      0,
    );
    assert.equal(
      (await userA.from("blundr_weakness_projection").select("position_key"))
        .data?.length,
      1,
    );
    assert.equal(
      (await userB.from("blundr_weakness_projection").select("position_key"))
        .data?.length,
      0,
    );
    assert.ok(
      (
        await userA
          .from("blundr_node_mastery")
          .update({ confidence: 1 })
          .eq("position_key", positionKey)
      ).error,
    );
    assert.ok(
      (
        await userA
          .from("blundr_weakness_projection")
          .delete()
          .eq("position_key", positionKey)
      ).error,
    );
    await service
      .from("blundr_learning_events")
      .delete()
      .eq("event_id", eventId);
    await service
      .from("blundr_node_mastery")
      .delete()
      .eq("position_key", positionKey);
    await service
      .from("blundr_weakness_projection")
      .delete()
      .eq("position_key", positionKey);
  } finally {
    await service.auth.admin.deleteUser(createdA.data.user.id);
    await service.auth.admin.deleteUser(createdB.data.user.id);
  }
});

test("Game Data RLS isolates provider accounts and denies browser source-worker writes", async (t) => {
  if (!configured) {
    t.skip("requires the configured disposable Supabase project");
    return;
  }
  const url = process.env.BLUNDR_RLS_TEST_URL!;
  const anonKey = process.env.BLUNDR_RLS_TEST_ANON_KEY!;
  const service = createClient(
    url,
    process.env.BLUNDR_RLS_TEST_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const emailA = process.env.BLUNDR_RLS_TEST_USER_A_EMAIL!;
  const emailB = process.env.BLUNDR_RLS_TEST_USER_B_EMAIL!;
  const existing = (await service.auth.admin.listUsers()).data.users;
  await Promise.all(
    existing
      .filter((user) => user.email === emailA || user.email === emailB)
      .map((user) => service.auth.admin.deleteUser(user.id)),
  );
  const createdA = await service.auth.admin.createUser({
    email: emailA,
    password: process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
    email_confirm: true,
  });
  const createdB = await service.auth.admin.createUser({
    email: emailB,
    password: process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD!,
    email_confirm: true,
  });
  assert.equal(createdA.error, null);
  assert.equal(createdB.error, null);
  assert.ok(createdA.data.user && createdB.data.user);
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
          email: emailA,
          password: process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD!,
        })
      ).error,
      null,
    );
    assert.equal(
      (
        await userB.auth.signInWithPassword({
          email: emailB,
          password: process.env.BLUNDR_RLS_TEST_USER_B_PASSWORD!,
        })
      ).error,
      null,
    );
    const account = {
      user_id: createdA.data.user.id,
      provider: "lichess",
      username: `rls-${Date.now()}`,
      verification_state: "verified",
    };
    assert.equal(
      (
        await userA
          .from("blundr_provider_accounts")
          .insert({ ...account, user_id: createdB.data.user.id })
      ).error,
      null,
    );
    const own = await userA
      .from("blundr_provider_accounts")
      .select("user_id,provider")
      .eq("provider", "lichess")
      .maybeSingle();
    assert.equal(own.data?.user_id, createdA.data.user.id);
    assert.deepEqual(
      (
        await userB
          .from("blundr_provider_accounts")
          .select("user_id")
          .eq("provider", "lichess")
      ).data,
      [],
    );
    assert.ok(
      (
        await userA.from("blundr_game_import_jobs").insert({
          id: `rls-job-${Date.now()}`,
          user_id: createdA.data.user.id,
          provider: "lichess",
          status: "queued",
          cursor: {},
          correlation_id: "rls",
        })
      ).error,
    );
    assert.ok(
      (
        await userA.from("blundr_external_games").insert({
          user_id: createdA.data.user.id,
          provider: "lichess",
          fallback_fingerprint: `rls-${Date.now()}`,
          username: "a",
          white_player: "a",
          black_player: "b",
          played_at: new Date().toISOString(),
          result: "1-0",
          variant: "standard",
          normalized_pgn: "1. d4 d5",
          player_color: "white",
          processing_version: "v1",
          classifier_version: "v1",
        })
      ).error,
    );
    assert.ok(
      (
        await userA.from("blundr_game_opening_segments").insert({
          user_id: createdA.data.user.id,
          segment_id: "rls-segment",
          game_fingerprint: "rls",
          opening_id: "locked",
          repertoire_side: "white",
          first_matched_ply: 1,
          last_matched_ply: 1,
          runtime_version: "v1",
          access_state: "active",
        })
      ).error,
    );
    assert.ok(
      (
        await userA.from("blundr_learning_findings").insert({
          user_id: createdA.data.user.id,
          finding_id: "rls",
          finding_fingerprint: "rls",
          segment_id: "rls",
          game_fingerprint: "rls",
          position_key: "rls",
          opening_id: "locked",
          repertoire_side: "white",
          category: "opening_move",
          confidence: 1,
          severity: "high",
          evidence: {},
          explanation: "test",
          status: "active",
        })
      ).error,
    );
    assert.equal(
      (
        await service
          .from("blundr_provider_accounts")
          .delete()
          .eq("user_id", createdA.data.user.id)
          .eq("provider", "lichess")
      ).error,
      null,
    );
  } finally {
    await service
      .from("blundr_provider_accounts")
      .delete()
      .eq("user_id", createdA.data.user.id);
    await service.auth.admin.deleteUser(createdA.data.user.id);
    await service.auth.admin.deleteUser(createdB.data.user.id);
  }
});

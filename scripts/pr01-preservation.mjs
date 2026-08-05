import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const mode = process.env.BLUNDR_PR01_PRESERVATION_MODE;
const snapshotPath = process.env.BLUNDR_PR01_SNAPSHOT_PATH;
const requiredEnvironmentNames = [
  "BLUNDR_RLS_TEST_ENVIRONMENT_ROLE",
  "BLUNDR_RLS_TEST_URL",
  "BLUNDR_RLS_TEST_SERVICE_ROLE_KEY",
  "BLUNDR_RLS_TEST_USER_A_EMAIL",
  "BLUNDR_RLS_TEST_USER_A_PASSWORD",
];

function hash(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function scopedEmail(baseEmail, scope) {
  const at = baseEmail.indexOf("@");
  return at === -1
    ? `${baseEmail}+${scope}`
    : `${baseEmail.slice(0, at)}+${scope}@${baseEmail.slice(at + 1)}`;
}

function isScopedPreservationEmail(email, baseEmail) {
  const at = baseEmail.indexOf("@");
  if (at === -1) return email.startsWith(`${baseEmail}+pr01preservation-`);
  return (
    email.startsWith(`${baseEmail.slice(0, at)}+pr01preservation-`) &&
    email.endsWith(`@${baseEmail.slice(at + 1)}`)
  );
}

function failClosed(message) {
  throw new Error(`PR-01 preservation harness failed closed: ${message}`);
}

function requireConfiguration() {
  if (!["seed", "snapshot", "verify", "cleanup"].includes(mode ?? "")) {
    failClosed(
      "BLUNDR_PR01_PRESERVATION_MODE must be seed, snapshot, verify, or cleanup.",
    );
  }
  if (!snapshotPath) {
    failClosed("BLUNDR_PR01_SNAPSHOT_PATH is required.");
  }
  const missing = requiredEnvironmentNames.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    if (
      !process.env.CI &&
      process.env.BLUNDR_PR01_PRESERVATION_ALLOW_MISSING_ENV === "1"
    ) {
      process.stdout.write(
        "PR-01 preservation harness not run: disposable environment is not configured.\n",
      );
      process.exit(0);
    }
    failClosed("disposable service-authority environment is not configured.");
  }
  if (process.env.BLUNDR_RLS_TEST_ENVIRONMENT_ROLE !== "disposable") {
    failClosed(
      "only BLUNDR_RLS_TEST_ENVIRONMENT_ROLE=disposable is permitted.",
    );
  }
  return createClient(
    process.env.BLUNDR_RLS_TEST_URL,
    process.env.BLUNDR_RLS_TEST_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

async function expectNoError(request, operation) {
  const response = await request;
  if (response.error) {
    const errorCode =
      typeof response.error.code === "string" ? response.error.code : "unknown";
    failClosed(`${operation} (database error code ${errorCode})`);
  }
  return response.data;
}

async function listUsers(service) {
  const users = [];
  for (let page = 1; page <= 20; page += 1) {
    const data = await expectNoError(
      service.auth.admin.listUsers({ page, perPage: 100 }),
      "could not list disposable users",
    );
    users.push(...(data.users ?? []));
    if ((data.users ?? []).length < 100) break;
  }
  return users;
}

async function findSnapshotUser(service, snapshot) {
  const users = await listUsers(service);
  const user = users.find(
    (candidate) =>
      hash(candidate.id) === snapshot.userHash &&
      hash(candidate.email ?? "") === snapshot.emailHash &&
      isScopedPreservationEmail(
        candidate.email ?? "",
        process.env.BLUNDR_RLS_TEST_USER_A_EMAIL,
      ),
  );
  if (!user) failClosed("the scoped preservation user was not found.");
  return user.id;
}

function stableRows(rows) {
  return [...rows].sort((left, right) =>
    JSON.stringify(left).localeCompare(JSON.stringify(right)),
  );
}

async function legacyState(service, userId) {
  const [
    profile,
    repertoire,
    learning,
    review,
    mastery,
    rewardHistory,
    rewardRolls,
    completionGrants,
    pointEvents,
    deck,
    session,
    attempt,
  ] = await Promise.all([
    expectNoError(
      service
        .from("blundr_user_profiles")
        .select(
          "onboarding_completed,rating_band_id,rating_source,raw_rating,rating_time_control,preferred_training_mode,daily_tempo_goal,daily_battery_goal,daily_blundr_goal,selected_starter_pack_id",
        )
        .eq("user_id", userId),
      "could not read legacy profile",
    ),
    expectNoError(
      service
        .from("blundr_user_repertoires")
        .select(
          "selected_starter_pack_id,unlocked_opening_ids,locked_opening_ids,opening_unlock_points",
        )
        .eq("user_id", userId),
      "could not read legacy repertoire",
    ),
    expectNoError(
      service
        .from("blundr_learning_events")
        .select(
          "event_id,idempotency_key,schema_version,session_id,occurred_at,taxonomy,position_key,canonical_fen,opening_id,expected_move_uci,repertoire_side,move_order_key,source,first_attempt,finding,content_version,classifier_version,migration_marker",
        )
        .eq("user_id", userId),
      "could not read legacy learning history",
    ),
    expectNoError(
      service
        .from("blundr_review_states")
        .select(
          "opening_id,play_key,due_at,srs_state,last_attempt_id,last_outcome",
        )
        .eq("user_id", userId),
      "could not read legacy review schedule",
    ),
    expectNoError(
      service
        .from("blundr_node_mastery")
        .select(
          "position_key,attempts,first_attempt_at,first_attempt_result,confidence,access_decision",
        )
        .eq("user_id", userId),
      "could not read legacy mastery",
    ),
    expectNoError(
      service
        .from("blundr_reward_history")
        .select(
          "random_bonus_pity_counter,last_random_bonus_at,all_rings_days_since_random_reward,last_random_reward_local_date,last_pity_guarantee_local_date,applied_reward_ids",
        )
        .eq("user_id", userId),
      "could not read legacy reward history",
    ),
    expectNoError(
      service
        .from("blundr_reward_rolls")
        .select("id,trigger,rolled_at,did_reward,reward_json,seed")
        .eq("user_id", userId),
      "could not read legacy reward rolls",
    ),
    expectNoError(
      service
        .from("blundr_completion_grants")
        .select(
          "completion_id,source,local_date,evidence_id,opening_id,repertoire_points,reward_points,xp,result_json,created_at",
        )
        .eq("user_id", userId),
      "could not read legacy completion grants",
    ),
    expectNoError(
      service
        .from("blundr_repertoire_point_events")
        .select("id,source,points,opening_id,daily_session_id,created_at")
        .eq("user_id", userId),
      "could not read legacy reward grants",
    ),
    expectNoError(
      service
        .from("blundr_daily_decks")
        .select(
          "deck_id,local_date,deck_fingerprint,public_cards,server_cards,content_version,reserved_at,composer_version,runtime_package_id,profile_version",
        )
        .eq("user_id", userId),
      "could not read legacy Daily deck",
    ),
    expectNoError(
      service
        .from("blundr_daily_sessions")
        .select(
          "session_id,deck_id,state,state_version,started_at,completed_at",
        )
        .eq("user_id", userId),
      "could not read legacy Daily session",
    ),
    expectNoError(
      service
        .from("blundr_daily_attempts")
        .select(
          "attempt_id,session_id,card_fingerprint,first_attempt,attempt_kind,outcome,answer,created_at",
        )
        .eq("user_id", userId),
      "could not read legacy Daily attempt",
    ),
  ]);
  return Object.fromEntries(
    Object.entries({
      profile,
      repertoire,
      learning,
      review,
      mastery,
      rewardHistory,
      rewardRolls,
      completionGrants,
      pointEvents,
      deck,
      session,
      attempt,
    }).map(([name, rows]) => [name, hash(stableRows(rows))]),
  );
}

async function writeSnapshot(service, userId) {
  const user = await expectNoError(
    service.auth.admin.getUserById(userId),
    "could not read scoped preservation user",
  );
  if (!user.user?.email) failClosed("scoped preservation user has no email.");
  const snapshot = {
    schemaVersion: 1,
    userHash: hash(userId),
    emailHash: hash(user.user.email),
    legacyHashes: await legacyState(service, userId),
  };
  await writeFile(
    snapshotPath,
    `${JSON.stringify(snapshot, null, 2)}\n`,
    "utf8",
  );
  return snapshot;
}

async function seed(service) {
  const scope = `pr01preservation-${randomUUID().slice(0, 12)}`;
  const created = await service.auth.admin.createUser({
    email: scopedEmail(process.env.BLUNDR_RLS_TEST_USER_A_EMAIL, scope),
    password: process.env.BLUNDR_RLS_TEST_USER_A_PASSWORD,
    email_confirm: true,
  });
  if (created.error || !created.data.user)
    failClosed("could not create scoped preservation user");
  const userId = created.data.user.id;
  const at = "2026-08-04T12:00:00.000Z";
  const deckId = `pr01-legacy-deck-${scope}`;
  const sessionId = `pr01-legacy-session-${scope}`;
  try {
    await expectNoError(
      service.from("blundr_user_profiles").insert({
        user_id: userId,
        onboarding_completed: true,
        rating_band_id: "1200-1600",
        rating_source: "manual",
        raw_rating: 1450,
        rating_time_control: "rapid",
        preferred_training_mode: "plain",
        daily_tempo_goal: 12,
        daily_battery_goal: 4,
        daily_blundr_goal: 2,
        selected_starter_pack_id: "italian-white",
      }),
      "could not seed legacy profile",
    );
    await expectNoError(
      service.from("blundr_user_repertoires").insert({
        user_id: userId,
        selected_starter_pack_id: "italian-white",
        unlocked_opening_ids: ["italian-game"],
        locked_opening_ids: ["french-defense"],
        opening_unlock_points: 7,
      }),
      "could not seed legacy repertoire",
    );
    await expectNoError(
      service.from("blundr_learning_events").insert({
        event_id: `pr01-legacy-learning-${scope}`,
        user_id: userId,
        idempotency_key: `pr01-legacy-learning-${scope}`,
        schema_version: "prior21",
        session_id: `pr01-legacy-learning-session-${scope}`,
        occurred_at: at,
        taxonomy: "opening_recall",
        position_key: `pr01-legacy-position-${scope}`,
        canonical_fen: "",
        opening_id: null,
        expected_move_uci: null,
        repertoire_side: "white",
        move_order_key: null,
        source: "train",
        first_attempt: false,
        finding: null,
        content_version: "prior21",
        classifier_version: "prior21",
        migration_marker: null,
      }),
      "could not seed legacy learning history",
    );
    await expectNoError(
      service.from("blundr_review_states").insert({
        user_id: userId,
        opening_id: "italian-game",
        play_key: "e2e4-e7e5-g1f3",
        due_at: "2026-08-10T12:00:00.000Z",
        srs_state: { interval: 4, ease: 2.5 },
        last_attempt_id: `pr01-legacy-learning-${scope}`,
        last_outcome: "correct",
      }),
      "could not seed legacy review schedule",
    );
    await expectNoError(
      service.from("blundr_node_mastery").insert({
        user_id: userId,
        position_key: `pr01-legacy-position-${scope}`,
        attempts: 3,
        first_attempt_at: at,
        first_attempt_result: "correct",
        confidence: 0.75,
        access_decision: "active",
      }),
      "could not seed legacy mastery",
    );
    await expectNoError(
      service.from("blundr_reward_history").insert({
        user_id: userId,
        random_bonus_pity_counter: 2,
        all_rings_days_since_random_reward: 2,
        applied_reward_ids: ["prior21-reward"],
      }),
      "could not seed legacy reward history",
    );
    await expectNoError(
      service.from("blundr_reward_rolls").insert({
        id: `pr01-legacy-roll-${scope}`,
        user_id: userId,
        trigger: "daily_blundr_ring_closed",
        rolled_at: at,
        did_reward: true,
        reward_json: { id: "prior21-reward", amount: 5 },
        seed: `pr01-legacy-seed-${scope}`,
      }),
      "could not seed legacy reward roll",
    );
    await expectNoError(
      service.from("blundr_repertoire_point_events").insert({
        id: `pr01-legacy-grant-${scope}`,
        user_id: userId,
        source: "reward_bonus",
        points: 5,
        opening_id: "italian-game",
        daily_session_id: sessionId,
        created_at: at,
      }),
      "could not seed legacy reward grant",
    );
    await expectNoError(
      service.from("blundr_completion_grants").insert({
        user_id: userId,
        completion_id: `pr01-legacy-completion-${scope}`,
        source: "opening_run_completed",
        local_date: "2026-08-04",
        evidence_id: `pr01-legacy-evidence-${scope}`,
        opening_id: "italian-game",
        repertoire_points: 5,
        reward_points: 0,
        xp: 10,
        result_json: { source: "prior21", applied: true },
        created_at: at,
      }),
      "could not seed legacy completion grant",
    );
    await expectNoError(
      service.from("blundr_daily_decks").insert({
        deck_id: deckId,
        user_id: userId,
        local_date: "2026-08-04",
        deck_fingerprint: `pr01-legacy-deck-fingerprint-${scope}`,
        public_cards: [],
        server_cards: [],
        content_version: "prior21",
        reserved_at: at,
      }),
      "could not seed legacy Daily deck",
    );
    await expectNoError(
      service.from("blundr_daily_sessions").insert({
        session_id: sessionId,
        deck_id: deckId,
        user_id: userId,
        state: { currentIndex: 0 },
        state_version: 1,
      }),
      "could not seed legacy Daily session",
    );
    await expectNoError(
      service.from("blundr_daily_attempts").insert({
        attempt_id: `pr01-legacy-attempt-${scope}`,
        session_id: sessionId,
        user_id: userId,
        card_fingerprint: `pr01-legacy-card-${scope}`,
        first_attempt: true,
        attempt_kind: "answer",
        outcome: "incorrect",
        answer: { choice: "opaque" },
        created_at: at,
      }),
      "could not seed legacy Daily attempt",
    );
    await writeSnapshot(service, userId);
  } catch (error) {
    await service.auth.admin.deleteUser(userId);
    throw error;
  }
}

async function assertPostUpgradeDefaults(service, userId) {
  const [profile, learning, review, mastery, deck, session, attempt] =
    await Promise.all([
      expectNoError(
        service
          .from("blundr_user_profiles")
          .select("time_zone")
          .eq("user_id", userId)
          .single(),
        "could not inspect profile upgrade fields",
      ),
      expectNoError(
        service
          .from("blundr_learning_events")
          .select(
            "expected_move_uci,evidence_kind,played_move_uci,evidence_version,projection_version,projected_at",
          )
          .eq("user_id", userId)
          .single(),
        "could not inspect learning upgrade fields",
      ),
      expectNoError(
        service
          .from("blundr_review_states")
          .select(
            "fsrs_algorithm_version,fsrs_state_version,fsrs_desired_retention,review_state_version,last_recall_event_id",
          )
          .eq("user_id", userId)
          .single(),
        "could not inspect review upgrade fields",
      ),
      expectNoError(
        service
          .from("blundr_node_mastery")
          .select(
            "mastery_state,mastery_state_version,recall_attempt_count,correct_recall_count,lapse_count,first_recall_attempt_at,last_recall_event_id,next_due_at",
          )
          .eq("user_id", userId)
          .single(),
        "could not inspect mastery upgrade fields",
      ),
      expectNoError(
        service
          .from("blundr_daily_decks")
          .select(
            "access_policy_id,access_policy_version,time_zone,reservation_generation,reservation_version,reservation_state",
          )
          .eq("user_id", userId)
          .single(),
        "could not inspect Daily deck upgrade fields",
      ),
      expectNoError(
        service
          .from("blundr_daily_sessions")
          .select(
            "reservation_generation,session_contract_version,current_step_id",
          )
          .eq("user_id", userId)
          .single(),
        "could not inspect Daily session upgrade fields",
      ),
      expectNoError(
        service
          .from("blundr_daily_attempts")
          .select(
            "action_id,step_id,reservation_generation,session_state_version,learning_exposure_id",
          )
          .eq("user_id", userId)
          .single(),
        "could not inspect Daily attempt upgrade fields",
      ),
    ]);
  assert.equal(profile.time_zone, null);
  assert.deepEqual(learning, {
    expected_move_uci: null,
    evidence_kind: "legacy_unclassified",
    played_move_uci: null,
    evidence_version: "legacy-unclassified",
    projection_version: null,
    projected_at: null,
  });
  assert.deepEqual(review, {
    fsrs_algorithm_version: "legacy-unclassified",
    fsrs_state_version: 0,
    fsrs_desired_retention: null,
    review_state_version: 1,
    last_recall_event_id: null,
  });
  assert.deepEqual(mastery, {
    mastery_state: "legacy_unclassified",
    mastery_state_version: 0,
    recall_attempt_count: 0,
    correct_recall_count: 0,
    lapse_count: 0,
    first_recall_attempt_at: null,
    last_recall_event_id: null,
    next_due_at: null,
  });
  assert.deepEqual(deck, {
    access_policy_id: "legacy-unclassified",
    access_policy_version: "legacy-unclassified",
    time_zone: null,
    reservation_generation: 1,
    reservation_version: 1,
    reservation_state: "legacy_unclassified",
  });
  assert.deepEqual(session, {
    reservation_generation: 1,
    session_contract_version: "legacy-unclassified",
    current_step_id: null,
  });
  assert.deepEqual(attempt, {
    action_id: null,
    step_id: null,
    reservation_generation: 1,
    session_state_version: 1,
    learning_exposure_id: null,
  });
}

async function assertV2Empty(service, userId) {
  for (const table of [
    "blundr_reward_transactions_v2",
    "blundr_reward_grants_v2",
    "blundr_reward_inventory_v2",
    "blundr_reward_inventory_events_v2",
    "blundr_reward_presentations_v2",
  ]) {
    const rows = await expectNoError(
      service.from(table).select("user_id").eq("user_id", userId),
      "could not inspect v2 reward state",
    );
    assert.deepEqual(
      rows,
      [],
      `${table} must remain empty for the legacy seed`,
    );
  }
}

async function verify(service) {
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
  if (
    snapshot?.schemaVersion !== 1 ||
    typeof snapshot?.userHash !== "string" ||
    typeof snapshot?.emailHash !== "string"
  ) {
    failClosed("snapshot has an unsupported shape.");
  }
  const userId = await findSnapshotUser(service, snapshot);
  assert.deepEqual(await legacyState(service, userId), snapshot.legacyHashes);
  await assertPostUpgradeDefaults(service, userId);
  await assertV2Empty(service, userId);
}

async function cleanup(service) {
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
  if (
    snapshot?.schemaVersion !== 1 ||
    typeof snapshot?.userHash !== "string" ||
    typeof snapshot?.emailHash !== "string"
  ) {
    failClosed("snapshot has an unsupported shape.");
  }
  const userId = await findSnapshotUser(service, snapshot);
  await expectNoError(
    service.auth.admin.deleteUser(userId),
    "could not delete scoped preservation user",
  );
}

const service = requireConfiguration();
if (mode === "seed") await seed(service);
if (mode === "snapshot") {
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8"));
  await writeSnapshot(service, await findSnapshotUser(service, snapshot));
}
if (mode === "verify") await verify(service);
if (mode === "cleanup") await cleanup(service);
process.stdout.write(`PR-01 preservation ${mode} complete.\n`);

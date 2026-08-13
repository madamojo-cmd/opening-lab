import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const required = (name) => {
  const value = String(process.env[name] ?? "").trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const httpsEvidence = (name) => {
  const value = required(name);
  assert(new URL(value).protocol === "https:", `${name} must be HTTPS`);
  return value;
};
const expectedSha = required("BLUNDR_EXPECTED_GIT_SHA").toLowerCase();
assert(
  /^[0-9a-f]{40}$/.test(expectedSha),
  "Expected Git SHA must be full length",
);
const checkoutSha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();
assert(
  checkoutSha === expectedSha,
  "Runner checkout does not match expected SHA",
);

const baseUrl = new URL(required("BLUNDR_STAGING_BASE_URL"));
assert(baseUrl.protocol === "https:", "Staging deployment URL must be HTTPS");
const evidenceToken = required("BLUNDR_RELEASE_EVIDENCE_TOKEN");
const supabaseUrl = new URL(required("BLUNDR_STAGING_SUPABASE_URL"));
const supabaseAnonKey = required("BLUNDR_STAGING_SUPABASE_ANON_KEY");
const supabaseServiceKey = required("BLUNDR_STAGING_SUPABASE_SERVICE_ROLE_KEY");
const qaPassword = required("BLUNDR_STAGING_QA_PASSWORD");
const qaEmailDomain = required("BLUNDR_STAGING_QA_EMAIL_DOMAIN");
const chesscomUsername = required("BLUNDR_STAGING_CHESSCOM_USERNAME");
const lichessUsername = required("BLUNDR_STAGING_LICHESS_USERNAME");
const cronSecret = required("BLUNDR_STAGING_CRON_SECRET");
const rollbackSha = required("BLUNDR_ROLLBACK_GIT_SHA").toLowerCase();
assert(/^[0-9a-f]{40}$/.test(rollbackSha), "Rollback SHA must be full length");

const externalEvidence = {
  browserAccessibility: httpsEvidence("BLUNDR_BROWSER_QA_EVIDENCE_URL"),
  telemetry: httpsEvidence("BLUNDR_TELEMETRY_EVIDENCE_URL"),
  rollback: httpsEvidence("BLUNDR_ROLLBACK_EVIDENCE_URL"),
};
const runId = `${expectedSha.slice(0, 12)}-${Date.now()}`;
const localDate = new Date().toISOString().slice(0, 10);
const qaEmail = `blundr-3.99-${runId}@${qaEmailDomain}`;
const artifact = {
  schemaVersion: 1,
  releaseId: "blundr-staging-3.99",
  runId,
  startedAt: new Date().toISOString(),
  status: "running",
  expectedSha,
  checkoutSha,
  deploymentUrl: baseUrl.toString(),
  qaUserId: null,
  journeys: [],
  externalEvidence,
};

let accessToken = null;
let qaUserId = null;
let buildIdentity = null;
let dailySession = null;

function appUrl(route) {
  return new URL(route, baseUrl).toString();
}

async function fetchJson(url, init = {}, label = url) {
  const response = await fetch(url, {
    ...init,
    headers: { accept: "application/json", ...(init.headers ?? {}) },
    signal: AbortSignal.timeout(60_000),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const detail =
      body?.error?.code ?? body?.error ?? body?.message ?? response.status;
    throw new Error(`${label} failed: ${detail}`);
  }
  return { body, response };
}

async function app(route, init = {}) {
  return fetchJson(
    appUrl(route),
    {
      ...init,
      headers: {
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
        ...(init.body ? { "content-type": "application/json" } : {}),
        ...(init.headers ?? {}),
      },
    },
    route,
  );
}

async function supabaseAuth(route, init = {}, admin = false) {
  return fetchJson(
    new URL(route, supabaseUrl).toString(),
    {
      ...init,
      headers: {
        apikey: admin ? supabaseServiceKey : supabaseAnonKey,
        authorization: `Bearer ${admin ? supabaseServiceKey : supabaseAnonKey}`,
        "content-type": "application/json",
        ...(init.headers ?? {}),
      },
    },
    route,
  );
}

async function rows(table, query = {}) {
  const url = new URL(`/rest/v1/${table}`, supabaseUrl);
  for (const [key, value] of Object.entries(query))
    url.searchParams.set(key, String(value));
  const { body } = await fetchJson(
    url.toString(),
    {
      headers: {
        apikey: supabaseServiceKey,
        authorization: `Bearer ${supabaseServiceKey}`,
      },
    },
    `database:${table}`,
  );
  assert(Array.isArray(body), `database:${table} returned a non-row payload`);
  return body;
}

async function journey(name, action) {
  const started = Date.now();
  try {
    const evidence = await action();
    artifact.journeys.push({
      index: artifact.journeys.length + 1,
      name,
      status: "passed",
      durationMs: Date.now() - started,
      evidence,
    });
  } catch (error) {
    artifact.journeys.push({
      index: artifact.journeys.length + 1,
      name,
      status: "failed",
      durationMs: Date.now() - started,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function completeDailyDeck(session, privateCards) {
  let current = session;
  for (
    let actionCount = 0;
    actionCount < 40 && !current.completedAt;
    actionCount += 1
  ) {
    const card = current.publicCards[current.state.currentIndex];
    assert(card, "Daily session has no current card");
    const privateCard = privateCards.find(
      (candidate) => candidate.cardFingerprint === card.cardFingerprint,
    );
    assert(privateCard, "Daily server-owned answer is missing");
    const stepIndex =
      current.state.activityProgress?.[card.cardFingerprint]?.stepIndex ?? 0;
    const answerFrame = privateCard.privateSteps?.[stepIndex] ?? privateCard;
    const answer =
      answerFrame.acceptedMoves?.[0] ?? answerFrame.acceptedAnswers?.[0];
    assert(answer, "Daily server-owned answer frame is empty");
    const result = await app(
      `/api/blundr/daily/sessions/${encodeURIComponent(current.sessionId)}/attempts`,
      {
        method: "POST",
        body: JSON.stringify({
          cardFingerprint: card.cardFingerprint,
          answer,
          expectedVersion: current.version,
        }),
      },
    );
    assert(result.body.correct === true, "Verified Daily answer was rejected");
    current = result.body.session;
  }
  assert(current.completedAt, "Daily deck did not reach durable completion");
  return current;
}

async function persistArtifact() {
  artifact.finishedAt = new Date().toISOString();
  const output =
    process.env.BLUNDR_EVIDENCE_OUTPUT ??
    `release/evidence/staging-3.99-${expectedSha}-${runId}.json`;
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  return output;
}

async function main() {
  await journey("exact build identity", async () => {
    const result = await app("/api/build-info", {
      headers: { "x-blundr-release-evidence-token": evidenceToken },
    });
    buildIdentity = result.body;
    const deployedHost = String(buildIdentity.deployment?.url ?? "")
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "");
    assert(buildIdentity.ready === true, "Build identity is not ready");
    assert(buildIdentity.gitSha === expectedSha, "Deployed SHA mismatch");
    assert(
      buildIdentity.releaseId === "blundr-staging-3.99",
      "Release ID mismatch",
    );
    assert(
      buildIdentity.featureProfileId === "staging-3.99",
      "Feature profile mismatch",
    );
    assert(
      buildIdentity.migrationHead === "20260812192625",
      "Migration head mismatch",
    );
    assert(
      buildIdentity.runtime?.packageId === "blundr-opening-runtime-3.99.v2",
      "Runtime package mismatch",
    );
    assert(
      deployedHost === baseUrl.host,
      "Runner must target the immutable deployment URL",
    );
    assert(buildIdentity.deployment?.id, "Deployment ID is missing");
    return {
      deploymentId: buildIdentity.deployment.id,
      gitSha: buildIdentity.gitSha,
      releaseId: buildIdentity.releaseId,
      featureProfileId: buildIdentity.featureProfileId,
      migrationHead: buildIdentity.migrationHead,
      runtime: buildIdentity.runtime,
    };
  });

  await journey("dependency readiness", async () => {
    const { body } = await app("/api/health");
    assert(body.ready === true, "Canonical health route is not ready");
    assert(body.build?.gitSha === expectedSha, "Health/build SHA mismatch");
    assert(
      body.dependencies?.database?.ready === true,
      "Database is not ready",
    );
    assert(body.dependencies?.maia?.ready === true, "Remote Maia is not ready");
    assert(
      body.dependencies?.maia?.transport === "remote",
      "Maia is not remote",
    );
    assert(body.dependencies?.worker?.ready === true, "Worker is not ready");
    assert(
      body.dependencies?.telemetry?.ready === true,
      "Telemetry is not ready",
    );
    return { checkedAt: body.checkedAt, dependencies: body.dependencies };
  });

  await journey("unique authenticated QA account", async () => {
    const created = await supabaseAuth(
      "/auth/v1/admin/users",
      {
        method: "POST",
        body: JSON.stringify({
          email: qaEmail,
          password: qaPassword,
          email_confirm: true,
          user_metadata: {
            age_13_confirmed: true,
            purpose: "staging-3.99-golden",
          },
        }),
      },
      true,
    );
    qaUserId = created.body.id;
    assert(qaUserId, "QA user ID is missing");
    artifact.qaUserId = qaUserId;
    const signedIn = await supabaseAuth("/auth/v1/token?grant_type=password", {
      method: "POST",
      body: JSON.stringify({ email: qaEmail, password: qaPassword }),
    });
    accessToken = signedIn.body.access_token;
    assert(accessToken, "QA access token is missing");
    return { qaUserId, uniqueAlias: runId };
  });

  await journey("onboarding V11 persistence", async () => {
    const steps = [
      { step: "welcome", ageConfirmed: true },
      { step: "level", value: "1200-1600" },
      { step: "priorities", value: ["remember_openings", "review_mistakes"] },
      { step: "training-loop" },
      { step: "pace", value: "standard" },
      { step: "starter-pack", value: "classical_attacker" },
      { step: "training-mode", value: "assisted" },
      { step: "plan" },
    ];
    for (const step of steps)
      await app("/api/blundr/onboarding/v11", {
        method: "PATCH",
        body: JSON.stringify(step),
      });
    const completed = await app("/api/blundr/onboarding/v11/complete", {
      method: "POST",
      body: JSON.stringify({}),
    });
    assert(
      completed.body.data?.completed === true,
      "Onboarding did not complete",
    );
    const profiles = await rows("blundr_user_profiles", {
      select:
        "user_id,onboarding_completed,onboarding_step,selected_starter_pack_id",
      user_id: `eq.${qaUserId}`,
    });
    const repertoires = await rows("blundr_user_repertoires", {
      select: "user_id,unlocked_opening_ids,opening_unlock_points",
      user_id: `eq.${qaUserId}`,
    });
    assert(
      profiles[0]?.onboarding_completed === true,
      "Profile completion was not durable",
    );
    assert(
      repertoires[0]?.unlocked_opening_ids?.includes("italian-white"),
      "Starter opening is not unlocked",
    );
    return { profile: profiles[0], repertoire: repertoires[0] };
  });

  await journey("provider connections", async () => {
    for (const [provider, username] of [
      ["chesscom", chesscomUsername],
      ["lichess", lichessUsername],
    ])
      await app("/api/blundr/game-data/connections", {
        method: "POST",
        body: JSON.stringify({ provider, username, days: 30 }),
      });
    const accounts = await rows("blundr_provider_accounts", {
      select: "provider,username,verification_state",
      user_id: `eq.${qaUserId}`,
      order: "provider.asc",
    });
    assert(accounts.length === 2, "Both provider accounts were not persisted");
    assert(
      accounts.every((row) => row.verification_state === "verified"),
      "Provider verification failed",
    );
    return { accounts };
  });

  await journey("provider worker and imported evidence", async () => {
    let jobs = [];
    for (let attempt = 0; attempt < 8; attempt += 1) {
      await app("/api/blundr/jobs/process-game-import", {
        method: "POST",
        headers: { authorization: `Bearer ${cronSecret}` },
        body: JSON.stringify({ runId }),
      });
      jobs = await rows("blundr_game_import_jobs", {
        select: "provider,status,counts,error_code",
        user_id: `eq.${qaUserId}`,
        order: "provider.asc",
      });
      if (
        jobs.length === 2 &&
        jobs.every((row) =>
          ["completed", "partially_completed"].includes(row.status),
        )
      )
        break;
    }
    assert(jobs.length === 2, "Both import jobs were not persisted");
    assert(
      jobs.every((row) =>
        ["completed", "partially_completed"].includes(row.status),
      ),
      "Provider jobs did not complete successfully",
    );
    assert(
      jobs.every((row) => Number(row.counts?.fetched ?? 0) > 0),
      "Provider jobs fetched no games",
    );
    const games = await rows("blundr_external_games", {
      select: "provider,provider_game_id",
      user_id: `eq.${qaUserId}`,
      limit: "10",
    });
    assert(games.length > 0, "No normalized external games were persisted");
    return { jobs, sampledGameCount: games.length };
  });

  await journey("exact-frame remote Maia", async () => {
    const fen = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1";
    const fen4 = fen.split(" ").slice(0, 4).join(" ");
    const legalMovesUci = [
      "a7a6",
      "a7a5",
      "b7b6",
      "b7b5",
      "c7c6",
      "c7c5",
      "d7d6",
      "d7d5",
      "e7e6",
      "e7e5",
      "f7f6",
      "f7f5",
      "g7g6",
      "g7g5",
      "h7h6",
      "h7h5",
      "b8a6",
      "b8c6",
      "g8f6",
      "g8h6",
    ];
    const { body } = await app("/api/maia/opponent-reply", {
      method: "POST",
      body: JSON.stringify({
        requestId: Date.now(),
        fen,
        fen4,
        legalMovesUci,
        skillLevel: "maia-1500",
        timeoutMs: 3000,
        requestedRating: 1500,
      }),
    });
    assert(body.status === "ready", "Maia did not return ready");
    assert(body.fen4 === fen4, "Maia response frame changed");
    assert(
      body.selectedCandidate?.source === "maia",
      "Response is not Maia-authored",
    );
    assert(
      legalMovesUci.includes(body.selectedCandidate?.uci),
      "Maia selected an illegal move",
    );
    assert(
      body.provenance?.contractVersion === "blundr-maia-move.v1",
      "Maia response contract is not production v1",
    );
    assert(
      body.provenance?.provider?.name === "csslab-maia-v1" &&
        body.provenance?.provider?.sourceCommit ===
          "749204cf5979ce7f8b0412e804a4ee7c83c49ff8",
      "Maia provider provenance is missing",
    );
    assert(
      body.provenance?.model?.skillLevel === "maia-1500" &&
        body.provenance?.model?.sha256 ===
          "35ab6f20421d59e1df3b17c5a5016947af4c6761368ef84044a9a9c7619a9a00",
      "Maia model provenance is missing",
    );
    assert(
      body.provenance?.engine?.name === "lc0" &&
        body.provenance?.engine?.version === "0.32.1" &&
        body.provenance?.engine?.commit ===
          "fd71a2d921b689c5f479d3227c3806c8e272d9c5" &&
        body.provenance?.engine?.search === "classic" &&
        body.provenance?.engine?.nodes === 1,
      "Maia engine provenance is invalid",
    );
    return {
      fen4,
      selectedCandidate: body.selectedCandidate,
      providerMs: body.providerMs,
      provenance: body.provenance,
    };
  });

  await journey("trainer evidence and idempotent reward", async () => {
    const sessionId = `golden-trainer-${runId}`;
    const eventId = `golden-attempt-${runId}`;
    const learning = await app("/api/blundr/learning/events", {
      method: "POST",
      body: JSON.stringify({
        eventId,
        sessionId,
        type: "move_correct",
        createdAt: new Date().toISOString(),
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        openingId: "italian-white",
        moveOrderKey: "startpos",
        expectedMoveUci: "e2e4",
        playedMoveUci: "e2e4",
      }),
    });
    const completion = {
      completionId: `golden-completion-${runId}`,
      source: "opening_run_completed",
      evidenceId: sessionId,
      localDate,
      openingId: "italian-white",
    };
    const first = await app("/api/blundr/rewards/complete", {
      method: "POST",
      body: JSON.stringify(completion),
    });
    const duplicate = await app("/api/blundr/rewards/complete", {
      method: "POST",
      body: JSON.stringify(completion),
    });
    assert(
      first.body.data?.duplicate === false,
      "First reward was treated as duplicate",
    );
    assert(
      duplicate.body.data?.duplicate === true,
      "Duplicate reward was not idempotent",
    );
    const events = await rows("blundr_learning_events", {
      select: "event_id,session_id,taxonomy,opening_id",
      user_id: `eq.${qaUserId}`,
      session_id: `eq.${sessionId}`,
    });
    const grants = await rows("blundr_completion_grants", {
      select: "completion_id,repertoire_points,reward_points,xp",
      user_id: `eq.${qaUserId}`,
      completion_id: `eq.${completion.completionId}`,
    });
    assert(
      events.length === 1 && events[0].taxonomy === "move_correct",
      "Learning event was not durable",
    );
    assert(
      grants.length === 1,
      "Reward idempotency did not hold in the database",
    );
    return { learning, grant: grants[0], duplicateConfirmed: true };
  });

  await journey("five-card Daily and three minigames", async () => {
    const reserved = await app("/api/blundr/daily/today");
    dailySession = reserved.body.session;
    assert(
      dailySession.publicCards?.length === 5,
      "Daily did not reserve exactly five cards",
    );
    assert(
      dailySession.publicCards.every((card) => card.interaction === "move"),
      "Daily contains a non-board interaction",
    );
    assert(
      new Set(dailySession.publicCards.map((card) => card.positionKey)).size ===
        5,
      "Daily cards do not use five distinct board positions",
    );
    const decks = await rows("blundr_daily_decks", {
      select:
        "deck_id,server_cards,runtime_package_id,composer_version,profile_version",
      user_id: `eq.${qaUserId}`,
      local_date: `eq.${localDate}`,
    });
    assert(
      decks.length === 1 && decks[0].server_cards?.length === 5,
      "Daily reservation is not durable",
    );
    assert(
      decks[0].runtime_package_id === "blundr-opening-runtime-3.99.v2",
      "Daily reserved from the wrong runtime",
    );

    dailySession = await completeDailyDeck(dailySession, decks[0].server_cards);
    const dailyCompletion = {
      completionId: `${localDate}:${dailySession.sessionId}:daily_blundr_deck_completed`,
      source: "daily_blundr_deck_completed",
      evidenceId: dailySession.sessionId,
      localDate,
      openingId: null,
    };
    const dailyReward = await app("/api/blundr/rewards/complete", {
      method: "POST",
      body: JSON.stringify(dailyCompletion),
    });
    assert(
      dailyReward.body.data?.duplicate === false,
      "Daily completion reward was not newly persisted",
    );

    const minigameApiEvidence = [];
    for (const miniGameId of [
      "tactic_shots_deep",
      "knight_gymnasium_deep",
      "king_pawn_lab",
    ]) {
      const created = await app("/api/blundr/minigames/instances", {
        method: "POST",
        body: JSON.stringify({ miniGameId }),
      });
      const instanceId = created.body.instance?.instanceId;
      const revision = created.body.instance?.revision;
      assert(
        instanceId && revision === 0,
        `${miniGameId} did not create cleanly`,
      );
      const loaded = await app(
        `/api/blundr/minigames/instances/${encodeURIComponent(instanceId)}`,
      );
      assert(
        loaded.body.instance?.instanceId === instanceId,
        `${miniGameId} did not reload`,
      );
      const revealed = await app(
        `/api/blundr/minigames/instances/${encodeURIComponent(instanceId)}/reveal`,
        { method: "POST", body: JSON.stringify({ revision }) },
      );
      assert(
        revealed.body.instance?.feedback,
        `${miniGameId} reveal has no feedback`,
      );
      const retried = await app(
        `/api/blundr/minigames/instances/${encodeURIComponent(instanceId)}/retry`,
        {
          method: "POST",
          body: JSON.stringify({ revision: revealed.body.instance.revision }),
        },
      );
      assert(
        retried.body.instance?.revision === revealed.body.instance.revision + 1,
        `${miniGameId} retry was not persisted`,
      );
      minigameApiEvidence.push({
        miniGameId,
        instanceId,
        revision: retried.body.instance.revision,
        feedbackConfirmed: true,
        retryConfirmed: true,
      });
    }
    const minigames = await rows("blundr_minigame_instances", {
      select: "instance_id,mini_game_id,kind,revision",
      user_id: `eq.${qaUserId}`,
      order: "mini_game_id.asc",
    });
    const createdIds = new Set(minigames.map((row) => row.mini_game_id));
    assert(
      ["tactic_shots_deep", "knight_gymnasium_deep", "king_pawn_lab"].every(
        (id) => createdIds.has(id),
      ),
      "One or more MVP minigames were not persisted",
    );
    return {
      daily: {
        sessionId: dailySession.sessionId,
        cardCount: 5,
        completedAt: dailySession.completedAt,
        reward: dailyReward.body.data,
        activityIds: dailySession.publicCards.map((card) => card.activityId),
        reservationIdentity: dailySession.reservationIdentity,
      },
      minigames: minigameApiEvidence,
      durableMinigames: minigames,
    };
  });

  await journey("progress, telemetry, and rollback evidence", async () => {
    const progress = await app(
      `/api/blundr/progress/summary?localDate=${localDate}`,
    );
    assert(progress.body.ok === true, "Durable progress endpoint failed");
    const grants = await rows("blundr_completion_grants", {
      select: "completion_id,repertoire_points,reward_points,xp",
      user_id: `eq.${qaUserId}`,
    });
    assert(grants.length >= 1, "Progress has no durable reward evidence");
    const telemetry = await app("/api/blundr/telemetry", {
      method: "POST",
      body: JSON.stringify({
        name: "AUTH_HYDRATION_COMPLETED",
        payload: {
          attempt: 1,
          durationMs: 1,
          pathClass: `staging-golden:${runId}`,
        },
      }),
    });
    assert(
      telemetry.body.accepted === true,
      "Telemetry sink rejected the QA event",
    );
    assert(
      rollbackSha !== expectedSha,
      "Rollback SHA must differ from candidate SHA",
    );
    return {
      durableProgress: progress.body.data,
      durableGrantCount: grants.length,
      telemetryAccepted: true,
      rollbackSha,
      externalEvidence,
    };
  });

  artifact.status = "passed";
  artifact.buildIdentity = buildIdentity;
  artifact.rollbackSha = rollbackSha;
}

try {
  await main();
} catch (error) {
  artifact.status = "failed";
  artifact.failure = error instanceof Error ? error.message : String(error);
  process.exitCode = 1;
} finally {
  const output = await persistArtifact();
  console.log(
    `${artifact.status.toUpperCase()}: ${artifact.journeys.length}/10 journeys recorded in ${output}`,
  );
}

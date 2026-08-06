import "server-only";

import { Chess } from "chess.js";
import {
  createDeterministicIdentity,
  createPositionIdentity,
  type CardFingerprint,
} from "@/lib/blundr/contracts";
import { readUserRepertoire } from "@/lib/blundr/accounts/accountRepository";
import type { CurrentBlundrUser } from "@/lib/blundr/accounts/accountTypes";
import { loadTrainingRuntimePackage } from "@/lib/blundr/trainingRuntime/trainingRuntimeLoader";
import { buildDeterministicDailyDeck } from "./core/dailyDeckPolicy";
import { reduceDailySession } from "./core/dailySessionReducer";
import type { DailySessionState } from "./core/dailyActivityTypes";
import { ProductionDailyRepository } from "./productionDailyRepository.server";
import type {
  ProductionDailyPrivateCard,
  ProductionDailyPrivateStep,
  ProductionDailyPublicCard,
  ProductionDailyPublicStep,
  ProductionDailyPublicSession,
  ProductionDailySession,
} from "./productionDailyTypes";
import { buildLearningProjection } from "@/lib/blundr/learning/core/learningProjection";
import { RepertoireOpeningAccessRepository } from "@/lib/blundr/openingAccess/openingAccessRepository";
import { getStage2OpeningAvailability } from "@/lib/blundr/openings/openingAvailability";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";
import { buildCandidateSet } from "./activities/candidateChoice/candidateSetBuilder";
import { buildPlanRecall } from "./activities/planRecall/planQuestionBuilder";
import { approvedPlanEvidence } from "./activities/planRecall/approvedPlanAdapter";
import { buildContinuationChallenge } from "./activities/continuationChallenge/continuationChallengeBuilder";
import { buildPunishmentActivity } from "./activities/punishTheMistake/punishmentBuilder";
import { buildTranspositionActivity } from "./activities/samePositionDifferentRoute/transpositionActivityBuilder";
import { replayRoute } from "./activities/samePositionDifferentRoute/transpositionGroupBuilder";
import { legalMoves } from "./activities/activityUtils";
import { toPublicDailySession } from "./productionDailyProjection";
import { readDueReviewKeys } from "./productionReviewRepository.server";
import type { DailyReservationIdentity } from "./productionDailyTypes";
import { runtimeSequenceToFen } from "./runtimeSequence";
import { selectProductionDailyBoardCards } from "./productionDailyDeckSelection";

// Request-time Daily selection uses only verified runtime data. Bound the
// amount of chess reconstruction per reservation so a large runtime package
// cannot turn an empty or newly unlocked account into an unbounded request.
const MAX_RUNTIME_CANDIDATES_PER_RESERVATION = 600;
const DAILY_COMPOSER_VERSION = "daily-board-first-v3";

async function dailyLearningEvent(input: {
  userId: string; sessionId: string; attemptId: string; card: ProductionDailyPrivateCard;
  fen: string; correct: boolean; firstAttempt: boolean; now: string; runtimePackageId: string;
}): Promise<Record<string, unknown> | null> {
  if (!input.firstAttempt) return null;
  const exposureId = `daily:${input.sessionId}:${input.card.cardFingerprint}`;
  const client = createBlundrSupabaseAdminClient();
  const [review, mastery] = client
    ? await Promise.all([client
        .from("blundr_review_states")
        .select("srs_state,review_state_version")
        .eq("user_id", input.userId)
        .eq("opening_id", input.card.openingId)
        .eq("play_key", input.card.playKey)
        .maybeSingle(), client.from("blundr_node_mastery").select("recall_attempt_count,correct_recall_count,lapse_count,mastery_state_version").eq("user_id", input.userId).eq("position_key", input.card.positionKey).maybeSingle()])
    : [{ data: null, error: null }, { data: null, error: null }];
  if (review.error || mastery.error) throw new Error("daily_projection_state_read_unavailable");
  const projection = buildLearningProjection({ source: "daily", firstAttempt: true, exposureId, correct: input.correct, occurredAt: input.now, previousFsrs: (review.data?.srs_state as never) ?? null, previousMastery: mastery.data ? { recallAttemptCount: Number(mastery.data.recall_attempt_count ?? 0), correctRecallCount: Number(mastery.data.correct_recall_count ?? 0), lapseCount: Number(mastery.data.lapse_count ?? 0) } : null });
  if (projection.evidenceKind !== "recall_attempt") return null;
  return {
    event_id: createDeterministicIdentity("learning-event", [input.userId, input.attemptId]),
    user_id: input.userId, idempotency_key: createDeterministicIdentity("learning-attempt", [input.userId, input.attemptId, true]),
    schema_version: "2026-07-13.v1", session_id: input.sessionId, attempt_id: input.attemptId, occurred_at: input.now,
    taxonomy: "daily_answered", position_key: input.card.positionKey, canonical_fen: input.fen, opening_id: input.card.openingId,
    expected_move_uci: input.card.acceptedMoves[0] ?? null, repertoire_side: input.card.side, move_order_key: input.card.playKey,
    source: "daily", first_attempt: true, finding: input.correct ? null : { category: "opening_move", explanation: input.card.explanation },
    content_version: input.runtimePackageId, classifier_version: "weakness-classifier-v1", evidence_kind: projection.evidenceKind,
    exposure_id: exposureId, evidence_version: "blundr-learning-evidence-v2", correct: input.correct, access_decision: "active", fsrs: projection.fsrs, mastery: projection.mastery,
    expected_review_state_version: Number(review.data?.review_state_version ?? 0),
    expected_mastery_state_version: Number(mastery.data?.mastery_state_version ?? 0),
  };
}

function dailyProfileVersion(
  flags: ReturnType<typeof getServerFeatureFlags>,
): string {
  return [
    "daily-production-profile-v1",
    ...[
      "daily_candidate_choice",
      "daily_plan_recall",
      "daily_same_position_different_route",
      "daily_continuation_challenge",
      "daily_punish_the_mistake",
      "daily_mixed_test",
    ].filter((flag) => flags[flag as keyof typeof flags]),
  ].join(",");
}

function stableDailyHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function selectBoundedRuntimeNodes<
  T extends {
    openingId: string;
    sideToMove: string;
    playKey: string;
  },
>(
  nodes: readonly T[],
  priorityOpenings: ReadonlySet<string>,
  priorityPositions: ReadonlySet<string>,
  seed: string,
): T[] {
  const unique = new Map<string, T>();
  for (const node of nodes) {
    const key = `${node.openingId}:${node.playKey}`;
    if (!unique.has(key)) unique.set(key, node);
  }
  const ranked = (items: readonly T[]) =>
    [...items].sort(
      (a, b) =>
        stableDailyHash(`${seed}:${a.openingId}:${a.playKey}`) -
          stableDailyHash(`${seed}:${b.openingId}:${b.playKey}`) ||
        a.openingId.localeCompare(b.openingId) ||
        a.playKey.localeCompare(b.playKey),
    );
  const selected: T[] = [];
  const seen = new Set<string>();
  const add = (node: T) => {
    const key = `${node.openingId}:${node.playKey}`;
    if (
      selected.length < MAX_RUNTIME_CANDIDATES_PER_RESERVATION &&
      !seen.has(key)
    ) {
      seen.add(key);
      selected.push(node);
    }
  };
  for (const node of ranked(
    [...unique.values()].filter(
      (node) =>
        priorityPositions.has(`${node.openingId}:${node.playKey}`) ||
        priorityOpenings.has(node.openingId),
    ),
  ))
    add(node);
  const buckets = new Map<string, T[]>();
  for (const node of unique.values()) {
    const key = `${node.openingId}:${node.sideToMove}`;
    buckets.set(key, [...(buckets.get(key) ?? []), node]);
  }
  const queues = [...buckets.entries()]
    .sort(
      ([a], [b]) =>
        stableDailyHash(`${seed}:bucket:${a}`) -
          stableDailyHash(`${seed}:bucket:${b}`) || a.localeCompare(b),
    )
    .map(([, bucket]) => ranked(bucket));
  for (
    let index = 0;
    selected.length < MAX_RUNTIME_CANDIDATES_PER_RESERVATION;
    index += 1
  ) {
    let added = false;
    for (const queue of queues) {
      const node = queue[index];
      if (!node) continue;
      add(node);
      added = true;
      if (selected.length >= MAX_RUNTIME_CANDIDATES_PER_RESERVATION) break;
    }
    if (!added) break;
  }
  return selected;
}

function fenAfterMoves(
  startFen: string,
  moves: readonly string[],
): string | null {
  try {
    const chess = new Chess(startFen);
    for (const uci of moves) {
      chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
      });
    }
    return chess.fen();
  } catch {
    return null;
  }
}

async function openingAccess(
  user: CurrentBlundrUser,
): Promise<RepertoireOpeningAccessRepository> {
  const repertoire = await readUserRepertoire(user.userId, {
    user,
    allowLocalFallback: false,
  });
  const stored = repertoire.ok ? repertoire.data : null;
  return new RepertoireOpeningAccessRepository(() =>
    stored
      ? {
          userId: user.userId,
          selectedStarterPackId:
            stored.selectedStarterPackId ?? "classical_attacker",
          unlockedOpeningIds: stored.unlockedOpeningIds,
          lockedOpeningIds: stored.lockedOpeningIds,
          availablePoints: stored.openingUnlockPoints,
          lifetimePoints: stored.openingUnlockPoints,
          spentPoints: 0,
          nextUnlockCost: 0,
          nextUnlockProgressPct: 0,
          pointEvents: [],
          unlockEvents: [],
          updatedAt: stored.updatedAt,
        }
      : null,
  );
}

async function buildReservation(
  user: CurrentBlundrUser,
  dateKey: string,
  now: string,
) {
  const runtime = await loadTrainingRuntimePackage();
  const access = await openingAccess(user);
  const featureFlags = getServerFeatureFlags();
  const reservationIdentity: DailyReservationIdentity = {
    composerVersion: DAILY_COMPOSER_VERSION,
    runtimePackageId: runtime.manifest.packageId,
    profileVersion: dailyProfileVersion(featureFlags),
  };
  const movesByOpeningPlayKey = new Map<string, typeof runtime.candidates>();
  for (const move of runtime.candidates) {
    const key = `${move.openingId}:${move.playKeyBefore}`;
    movesByOpeningPlayKey.set(key, [
      ...(movesByOpeningPlayKey.get(key) ?? []),
      move,
    ]);
  }
  const weaknessScores = new Map<string, number>();
  const priorityOpenings = new Set<string>();
  const priorityPositions = new Set<string>();
  for (const review of await readDueReviewKeys(user.userId, now))
    priorityPositions.add(`${review.openingId}:${review.playKey}`);
  const admin = createBlundrSupabaseAdminClient();
  if (admin) {
    const [projectionResult, priorityResult] = await Promise.all([
      admin
        .from("blundr_weakness_projection")
        .select(
          "position_key,opening_id,play_key,score,confidence,updated_at,access_decision",
        )
        .eq("user_id", user.userId)
        .eq("access_decision", "active"),
      admin
        .from("blundr_daily_priorities")
        .select("opening_id,status,requested_for")
        .eq("user_id", user.userId)
        .in("status", ["queued", "added_today"])
        .lte("requested_for", dateKey),
    ]);
    if (!projectionResult.error) {
      for (const projection of projectionResult.data ?? []) {
        const score = Number(projection.score);
        if (Number.isFinite(score) && score > 0)
          weaknessScores.set(String(projection.position_key), score);
        if (projection.opening_id && projection.play_key)
          priorityPositions.add(
            `${projection.opening_id}:${projection.play_key}`,
          );
      }
    }
    if (!priorityResult.error)
      for (const priority of priorityResult.data ?? [])
        priorityOpenings.add(String(priority.opening_id));
  }
  const eligibleNodes = runtime.nodes.filter((node) => {
    const availability = getStage2OpeningAvailability(node.openingId);
    return Boolean(
      availability &&
        access.get({
          userId: user.userId,
          openingId: node.openingId,
          repertoireSide: node.sideToMove,
        }).decision === "active",
    );
  });
  const boundedNodes = selectBoundedRuntimeNodes(
    eligibleNodes,
    priorityOpenings,
    priorityPositions,
    `${user.userId}:${dateKey}`,
  );
  const runtimeCandidates = boundedNodes
    .map((node) => {
      const availability = getStage2OpeningAvailability(node.openingId);
      const side = node.sideToMove;
      const decision = access.get({
        userId: user.userId,
        openingId: node.openingId,
        repertoireSide: side,
      }).decision;
      const fen = runtimeSequenceToFen(node.playSequenceUci);
      const snapshot = {
        openingId: node.openingId,
        repertoireSide: side,
        decision,
        checkedAt: now,
        expiresAt: new Date(Date.parse(now) + 300000).toISOString(),
      } as const;
      const moves = (
        movesByOpeningPlayKey.get(`${node.openingId}:${node.playKey}`) ?? []
      )
        .slice()
        .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
      if (!availability || decision !== "active" || !fen || !moves.length)
        return null;
      const position = createPositionIdentity({
        canonicalFen: fen,
        openingId: node.openingId,
        expectedMoveUci: moves[0].moveUci,
        repertoireSide: side,
        moveOrderKey: node.playKey,
      });
      return {
        node,
        fen,
        side,
        snapshot,
        position,
        moves,
        priority: weaknessScores.get(position.positionKey) ?? 0.1,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const cards: Array<{
    publicCard: ProductionDailyPublicCard;
    privateCard: ProductionDailyPrivateCard;
    priority: number;
    stableKey: string;
  }> = [];
  const addCard = (
    entry: (typeof runtimeCandidates)[number],
    activityId: string,
    title: string,
    prompt: string,
    acceptedMoves: readonly string[],
    explanation: string,
    options?: readonly { id: string; label: string }[],
    acceptedAnswers?: readonly string[],
    privateSteps?: readonly ProductionDailyPrivateStep[],
  ) => {
    const fingerprint = createDeterministicIdentity(activityId, [
      user.userId,
      dateKey,
      entry.position.positionKey,
    ]);
    const publicCard: ProductionDailyPublicCard = {
      cardFingerprint: fingerprint as CardFingerprint,
      positionKey: entry.position.positionKey,
      activityId,
      title,
      prompt,
      positionFen: entry.fen,
      openingId: entry.node.openingId,
      playKey: entry.node.playKey,
      side: entry.side,
      why:
        entry.priority > 0.1
          ? "This position is prioritized from a verified weakness projection."
          : "This position comes from an unlocked, verified opening line.",
      interaction: options?.length ? "choice" : "move",
      options,
      steps: privateSteps?.map(
        ({
          acceptedMoves: _moves,
          acceptedAnswers: _answers,
          explanation: _explanation,
          ...step
        }) => step,
      ),
    };
    cards.push({
      publicCard,
      privateCard: {
        ...publicCard,
        acceptedMoves,
        acceptedAnswers,
        explanation,
        privateSteps,
      },
      priority: entry.priority,
      stableKey: fingerprint,
    });
  };

  for (const entry of runtimeCandidates) {
    const primary = entry.moves[0];
    const legal = legalMoves(entry.fen);
    const legalByUci = new Map(
      Array.isArray(legal) ? legal.map((move) => [move.uci, move.san]) : [],
    );
    const labels = entry.moves
      .slice(0, 3)
      .filter((move) => legalByUci.has(move.moveUci));
    if (!primary || !legalByUci.has(primary.moveUci)) continue;

    addCard(
      entry,
      "daily_move_recall",
      "Opening recall",
      "Play the approved move for this exact position.",
      [primary.moveUci],
      "This move keeps the approved opening plan on track.",
    );

    addCard(
      entry,
      "daily_repair_line",
      "Repair the line",
      "Restore the verified line by playing the missing move.",
      [primary.moveUci],
      "This move repairs the line using the checksum-pinned runtime position.",
    );

    if (featureFlags.daily_plan_recall && labels.length >= 2) {
      const question = {
        type: "next_plan" as const,
        prompt: "Which move matches the verified plan for this position?",
        choices: labels.map((move) => ({
          id: move.moveUci,
          label: legalByUci.get(move.moveUci) ?? move.moveUci,
        })),
        acceptedIds: [primary.moveUci],
        validForFen: true,
        evidence: approvedPlanEvidence({
          sourceId: entry.node.nodeId,
          type: "next_plan",
          version: runtime.manifest.packageId,
        }),
        explanation:
          "The selected move is the verified runtime repertoire choice.",
      };
      const built = buildPlanRecall({
        openingId: entry.node.openingId,
        side: entry.side,
        positionKey: entry.position.positionKey,
        positionFen: entry.fen,
        access: entry.snapshot,
        question,
      });
      if (built.ok)
        addCard(
          entry,
          built.activityId,
          "Plan recall",
          question.prompt,
          [primary.moveUci],
          question.explanation,
          question.choices,
          question.acceptedIds,
        );
    }

    if (featureFlags.daily_candidate_choice && labels.length >= 3) {
      const built = buildCandidateSet({
        userId: user.userId,
        openingId: entry.node.openingId,
        side: entry.side,
        positionKey: entry.position.positionKey,
        positionFen: entry.fen,
        approvedMoves: [primary.moveUci],
        mistakeMove: labels[1].moveUci,
        alternativeMove: labels[2].moveUci,
        access: entry.snapshot,
        evidenceVersion: runtime.manifest.packageId,
      });
      if (built.ok) {
        const options = built.solution.candidates.map((candidate) => ({
          id: candidate.id,
          label: candidate.label,
        }));
        addCard(
          entry,
          built.activityId,
          "Candidate choice",
          "Choose the move that best preserves the verified plan.",
          [primary.moveUci],
          "The selected move is the verified runtime repertoire choice.",
          options,
          built.solution.acceptedIds,
        );
      }
    }

    const child = runtimeCandidates.find(
      (candidate) =>
        candidate.node.openingId === entry.node.openingId &&
        candidate.node.playKey === `${entry.node.playKey},${primary.moveUci}`,
    );
    const childMove = child?.moves[0];
    const secondEntry =
      child && childMove
        ? runtimeCandidates.find(
            (candidate) =>
              candidate.node.openingId === child.node.openingId &&
              candidate.node.playKey ===
                `${child.node.playKey},${childMove.moveUci}`,
          )
        : undefined;
    const secondMove = secondEntry?.moves[0];
    const secondReplyEntry =
      secondEntry && secondMove
        ? runtimeCandidates.find(
            (candidate) =>
              candidate.node.openingId === secondEntry.node.openingId &&
              candidate.node.playKey ===
                `${secondEntry.node.playKey},${secondMove.moveUci}`,
          )
        : undefined;
    const secondReply = secondReplyEntry?.moves[0];
    const secondStepFen =
      childMove &&
      fenAfterMoves(entry.fen, [primary.moveUci, childMove.moveUci]);
    const privateSteps =
      childMove && secondMove && secondStepFen
        ? ([
            {
              stepIndex: 0,
              positionFen: entry.fen,
              prompt: "Play the verified continuation move.",
              side: entry.side,
              acceptedMoves: [primary.moveUci],
              explanation:
                "The move follows the verified opening continuation.",
            },
            {
              stepIndex: 1,
              positionFen: secondStepFen,
              prompt: "Continue the line after the verified reply.",
              side: entry.side,
              acceptedMoves: [secondMove.moveUci],
              explanation:
                "The move completes the verified continuation sequence.",
            },
          ] satisfies readonly ProductionDailyPrivateStep[])
        : undefined;
    if (
      child &&
      childMove &&
      secondMove &&
      secondReply &&
      privateSteps &&
      featureFlags.daily_continuation_challenge
    ) {
      const built = buildContinuationChallenge({
        openingId: entry.node.openingId,
        side: entry.side,
        positionKey: entry.position.positionKey,
        access: entry.snapshot,
        objective: "complete_development",
        userMoves: [primary.moveUci, secondMove.moveUci],
        opponentReplies: [childMove.moveUci, secondReply.moveUci],
        sourceId: entry.node.nodeId,
        evidenceVerified: true,
      });
      if (built.ok)
        addCard(
          entry,
          built.activityId,
          "Practical continuation",
          "Play the next verified move in the plan.",
          [primary.moveUci],
          built.solution.explanation,
          undefined,
          undefined,
          privateSteps,
        );
    }

    if (
      child &&
      childMove &&
      secondMove &&
      labels.length >= 2 &&
      privateSteps &&
      featureFlags.daily_punish_the_mistake
    ) {
      const built = buildPunishmentActivity({
        openingId: entry.node.openingId,
        side: entry.side,
        positionKey: entry.position.positionKey,
        fen: entry.fen,
        mistakeMove: labels[1].moveUci,
        bestResponses: [primary.moveUci],
        continuation: [childMove.moveUci, secondMove.moveUci],
        sourceId: entry.node.nodeId,
        source: "continuation",
        access: entry.snapshot,
        evidenceVerified: true,
        explanation:
          "The verified reply restores the opening plan after the deviation.",
      });
      if (built.ok)
        addCard(
          entry,
          built.activityId,
          "Punish the mistake",
          "Find the verified response to the deviation.",
          [primary.moveUci],
          built.solution.explanation,
          undefined,
          undefined,
          privateSteps,
        );
    }
  }

  if (featureFlags.daily_same_position_different_route) {
    const routeGroups = new Map<string, (typeof runtimeCandidates)[number][]>();
    for (const entry of runtimeCandidates) {
      const finalFen = runtimeSequenceToFen(entry.node.playSequenceUci);
      if (!finalFen) continue;
      const key = `${entry.node.openingId}:${finalFen.split(" ").slice(0, 4).join(" ")}`;
      routeGroups.set(key, [...(routeGroups.get(key) ?? []), entry]);
    }
    for (const group of routeGroups.values()) {
      if (group.length < 2) continue;
      const standard = group[0];
      const alternate = group.find(
        (candidate) =>
          candidate.node.playSequenceUci !== standard.node.playSequenceUci,
      );
      if (!alternate) continue;
      const standardRoute = standard.node.playSequenceUci
        .split(/[,\s]+/)
        .filter(Boolean);
      const alternateRoute = alternate.node.playSequenceUci
        .split(/[,\s]+/)
        .filter(Boolean);
      const startFen = new Chess().fen();
      if (
        !replayRoute(startFen, standardRoute) ||
        !replayRoute(startFen, alternateRoute)
      )
        continue;
      const built = buildTranspositionActivity({
        openingId: standard.node.openingId,
        side: "white",
        positionKey: standard.position.positionKey,
        startFen,
        standardRoute,
        alternateRoute,
        expectedMoves: [standard.moves[0].moveUci],
        access: standard.snapshot,
        sourceId: `${standard.node.nodeId}:${alternate.node.nodeId}`,
      });
      if (!built.ok) continue;
      addCard(
        standard,
        built.activityId,
        "Same position, different route",
        "Play the verified move from this position.",
        [standard.moves[0].moveUci],
        "This card is backed by two verified legal routes reaching the same position.",
      );
      break;
    }
  }

  if (featureFlags.daily_mixed_test) {
    const mixedSourceCards = cards
      .filter(
        (card) =>
          card.publicCard.activityId !== "daily_move_recall" &&
          card.publicCard.activityId !== "daily_mixed_test",
      )
      .sort(
        (a, b) =>
          b.priority - a.priority || a.stableKey.localeCompare(b.stableKey),
      )
      .filter(
        (card, index, all) =>
          all.findIndex(
            (candidate) =>
              candidate.publicCard.activityId === card.publicCard.activityId,
          ) === index,
      );
    if (mixedSourceCards.length >= 3) {
      const first = mixedSourceCards[0];
      const baseEntry = runtimeCandidates.find(
        (entry) => entry.position.positionKey === first.publicCard.positionKey,
      );
      if (baseEntry) {
        const privateSteps = mixedSourceCards.slice(0, 5).map(
          (card, stepIndex) =>
            ({
              stepIndex,
              positionFen: card.publicCard.positionFen,
              prompt: card.publicCard.prompt,
              side: card.publicCard.side,
              options: card.publicCard.options,
              acceptedMoves: card.privateCard.acceptedMoves,
              acceptedAnswers: card.privateCard.acceptedAnswers,
              explanation: card.privateCard.explanation,
            }) satisfies ProductionDailyPrivateStep,
        );
        addCard(
          baseEntry,
          "daily_mixed_test",
          "Mixed Test",
          "Complete the verified no-hint item block.",
          privateSteps[0].acceptedMoves,
          "This block combines independently verified Daily items.",
          undefined,
          undefined,
          privateSteps,
        );
      }
    }
  }

  const selected = selectProductionDailyBoardCards(cards, 5);
  const deck = buildDeterministicDailyDeck({
    userId: user.userId,
    dateKey,
    reservationIdentity,
    candidates: selected.map(({ publicCard, priority, stableKey }) => ({
      ...publicCard,
      deckFingerprint: "pending" as never,
      positionKey: publicCard.positionKey,
      activityId: publicCard.activityId,
      priority,
      stableKey,
      cardFingerprint: publicCard.cardFingerprint,
    })),
    limit: 5,
  });
  const privateById = new Map(
    selected.map((entry) => [
      entry.publicCard.cardFingerprint,
      entry.privateCard,
    ]),
  );
  const publicCards = deck.cards.map((card) => ({
    ...card,
    why:
      selected.find(
        (entry) => entry.publicCard.cardFingerprint === card.cardFingerprint,
      )?.publicCard.why ?? "Selected from current learning evidence.",
  }));
  const privateCards = publicCards
    .map((card) => privateById.get(card.cardFingerprint))
    .filter((card): card is ProductionDailyPrivateCard => Boolean(card));
  const state: DailySessionState = {
    deck: {
      ...deck,
      cards: deck.cards.map((card) => ({
        ...card,
        deckFingerprint: deck.deckFingerprint,
      })),
    },
    attempts: [],
    currentIndex: 0,
    revealedCardIds: [],
    firstAttemptIds: [],
    activityProgress: {},
    status: "in_progress",
  };
  return {
    deckId: String(deck.deckFingerprint),
    sessionId: String(deck.sessionId),
    publicCards,
    privateCards,
    state,
    reservationIdentity,
  };
}

export async function getOrReserveDaily(
  user: CurrentBlundrUser,
  dateKey: string,
  now = new Date().toISOString(),
) {
  const repository = new ProductionDailyRepository();
  const built = await buildReservation(user, dateKey, now);
  return (
    await repository.reserve({ userId: user.userId, dateKey, now, ...built })
  ).session;
}

export async function applyDailyAction(input: {
  user: CurrentBlundrUser;
  sessionId: string;
  cardFingerprint: string;
  action: "answer" | "reveal" | "retry";
  answer?: string;
  expectedVersion: number;
  now?: string;
}) {
  const repository = new ProductionDailyRepository();
  const session = await repository.getOwned(input.sessionId, input.user.userId);
  if (!session) throw new Error("daily_session_not_found");
  const privateCard = session.privateCards.find(
    (card) => card.cardFingerprint === input.cardFingerprint,
  );
  if (!privateCard) throw new Error("daily_card_not_found");
  const now = input.now ?? new Date().toISOString();
  if (privateCard.privateSteps?.length) {
    const progress =
      input.user.userId &&
      session.state.activityProgress?.[input.cardFingerprint];
    const current = progress ?? {
      stepIndex: 0,
      firstAttemptRecorded: false,
      status: "in_progress" as const,
    };
    const step = privateCard.privateSteps[current.stepIndex];
    if (!step) throw new Error("daily_activity_step_not_found");
    const answerCorrect = Boolean(
      input.action === "answer" &&
        input.answer &&
        (step.acceptedAnswers ?? step.acceptedMoves).includes(input.answer),
    );
    const nextProgress =
      input.action === "retry"
        ? { ...current, stepIndex: 0, status: "in_progress" as const }
        : input.action === "reveal"
          ? { ...current, status: "revealed" as const }
          : answerCorrect
            ? current.stepIndex + 1 >= privateCard.privateSteps.length
              ? {
                  ...current,
                  status: "completed" as const,
                  firstAttemptRecorded: true,
                }
              : {
                  ...current,
                  stepIndex: current.stepIndex + 1,
                  firstAttemptRecorded: true,
                  status: "in_progress" as const,
                }
            : { ...current, firstAttemptRecorded: true };
    const nextState = {
      ...session.state,
      activityProgress: {
        ...(session.state.activityProgress ?? {}),
        [input.cardFingerprint]: nextProgress,
      },
    };
    const finalStep = nextProgress.status === "completed";
    const completedState = finalStep
      ? reduceDailySession(nextState, {
          userId: input.user.userId,
          cardFingerprint: input.cardFingerprint,
          now,
          outcome: "correct",
          feedback: step.explanation,
        }).state
      : nextState;
    const next = {
      ...session,
      state: completedState,
      version: session.version + 1,
      completedAt:
        completedState.status === "completed"
          ? (session.completedAt ?? now)
          : session.completedAt,
    };
    const attemptId = createDeterministicIdentity("daily-step-attempt", [
      input.sessionId,
      input.cardFingerprint,
      current.stepIndex,
      input.action,
      input.answer ?? "",
    ]);
    const persisted = await repository.commitAction({
      attemptId,
      cardFingerprint: input.cardFingerprint,
      firstAttempt: !current.firstAttemptRecorded && input.action !== "retry",
      attemptKind: input.action,
      outcome:
        input.action === "reveal"
          ? "revealed"
          : input.action === "retry"
            ? "skipped"
            : answerCorrect
              ? "correct"
              : "incorrect",
      answer: input.action === "answer" ? input.answer : undefined,
      session: next,
      expectedVersion: input.expectedVersion,
      learningEvent: await dailyLearningEvent({ userId: input.user.userId, sessionId: input.sessionId, attemptId, card: privateCard, fen: step.positionFen, correct: answerCorrect, firstAttempt: !current.firstAttemptRecorded && input.action === "answer", now, runtimePackageId: session.reservationIdentity.runtimePackageId }),
    });
    if (persisted === "conflict") throw new Error("daily_session_conflict");
    return {
      session: next,
      presentation: {
        state:
          nextProgress.status === "completed"
            ? "committed"
            : nextProgress.status,
        feedback: {
          kind:
            input.action === "reveal"
              ? "revealed"
              : answerCorrect
                ? "correct"
                : "incorrect",
          message:
            input.action === "reveal"
              ? step.explanation
              : answerCorrect
                ? finalStep
                  ? "Sequence complete."
                  : "Correct. Continue the verified line."
                : "That move does not match the verified continuation.",
        },
      },
      result: finalStep ? "accepted" : "retry_recorded",
      correct: answerCorrect,
    };
  }
  const firstAttemptAlreadyRecorded = session.state.attempts.some(
    (attempt) =>
      attempt.card.cardFingerprint === input.cardFingerprint && attempt.scored,
  );
  const correct =
    input.action === "answer" &&
    Boolean(
      input.answer &&
        (privateCard.acceptedAnswers ?? privateCard.acceptedMoves).includes(
          input.answer,
        ),
    );
  const outcome =
    input.action === "retry"
      ? "retry"
      : input.action === "reveal"
        ? "reveal"
        : correct
          ? "correct"
          : "incorrect";
  const reduced = reduceDailySession(session.state, {
    userId: input.user.userId,
    cardFingerprint: input.cardFingerprint,
    now,
    outcome,
    feedback:
      input.action === "reveal"
        ? privateCard.explanation
        : correct
          ? "Correct. The approved move keeps the opening plan on track."
          : "Recorded. Review the position and try the line again.",
  });
  const next = {
    ...session,
    state: reduced.state,
    version: session.version + 1,
    completedAt:
      reduced.state.status === "completed"
        ? (session.completedAt ?? now)
        : session.completedAt,
  };
  const persisted = await repository.commitAction({
    attemptId:
      reduced.state.attempts.at(-1)?.attemptId ??
      createDeterministicIdentity("daily-noop", [
        input.sessionId,
        input.cardFingerprint,
        input.action,
      ]),
    cardFingerprint: input.cardFingerprint,
    firstAttempt: !firstAttemptAlreadyRecorded && input.action !== "retry",
    attemptKind: input.action,
    outcome:
      outcome === "reveal"
        ? "revealed"
        : outcome === "retry"
          ? "skipped"
          : outcome,
    answer: input.action === "answer" ? input.answer : undefined,
    session: next,
    expectedVersion: input.expectedVersion,
    learningEvent: await dailyLearningEvent({ userId: input.user.userId, sessionId: input.sessionId, attemptId: reduced.state.attempts.at(-1)?.attemptId ?? input.cardFingerprint, card: privateCard, fen: privateCard.positionFen, correct, firstAttempt: !firstAttemptAlreadyRecorded && input.action === "answer", now, runtimePackageId: session.reservationIdentity.runtimePackageId }),
  });
  if (persisted === "conflict") throw new Error("daily_session_conflict");
  return {
    session: next,
    presentation: reduced.presentation,
    result: reduced.result,
    correct,
  };
}

export function publicDailySession(
  session: ProductionDailySession,
): ProductionDailyPublicSession {
  return toPublicDailySession(session);
}

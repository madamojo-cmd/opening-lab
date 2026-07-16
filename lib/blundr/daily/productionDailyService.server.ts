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
  ProductionDailyPublicCard,
  ProductionDailyPublicSession,
  ProductionDailySession,
} from "./productionDailyTypes";
import { appendLearningEventV2 } from "@/lib/blundr/learning/core/learningEventService.server";
import { RepertoireOpeningAccessRepository } from "@/lib/blundr/openingAccess/openingAccessRepository";
import { getStage2OpeningAvailability } from "@/lib/blundr/openings/openingAvailability";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";

function fenForSequence(sequence: string): string | null {
  try {
    const chess = new Chess();
    for (const uci of sequence.trim().split(/\s+/).filter(Boolean)) {
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

function toPublic(
  session: ProductionDailySession,
): ProductionDailyPublicSession {
  const completedCardIds = session.state.attempts
    .filter((attempt) => attempt.scored)
    .map((attempt) => attempt.card.cardFingerprint);
  return {
    sessionId: session.sessionId,
    deckId: session.deckId,
    dateKey: session.dateKey,
    publicCards: session.publicCards,
    version: session.version,
    completedAt: session.completedAt,
    state: {
      currentIndex: session.state.currentIndex,
      completedCardIds,
      revealedCardIds: session.state.revealedCardIds,
    },
  };
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
  const weaknessScores = new Map<string, number>();
  const admin = createBlundrSupabaseAdminClient();
  if (admin) {
    const projectionResult = await admin
      .from("blundr_weakness_projection")
      .select("position_key,score,access_decision")
      .eq("user_id", user.userId)
      .eq("access_decision", "active");
    if (!projectionResult.error) {
      for (const projection of projectionResult.data ?? []) {
        const score = Number(projection.score);
        if (Number.isFinite(score) && score > 0)
          weaknessScores.set(String(projection.position_key), score);
      }
    }
  }
  const candidates = runtime.nodes
    .map((node) => {
      const availability = getStage2OpeningAvailability(node.openingId);
      const side = node.sideToMove;
      const decision = access.get({
        userId: user.userId,
        openingId: node.openingId,
        repertoireSide: side,
      }).decision;
      const fen = fenForSequence(node.playSequenceUci);
      const candidate = runtime.candidates.find(
        (move) =>
          move.openingId === node.openingId &&
          move.playKeyBefore === node.playKey,
      );
      if (!availability || decision !== "active" || !fen || !candidate)
        return null;
      const position = createPositionIdentity({
        canonicalFen: fen,
        openingId: node.openingId,
        expectedMoveUci: candidate.moveUci,
        repertoireSide: side,
      });
      const fingerprint = createDeterministicIdentity("daily-move-recall", [
        user.userId,
        dateKey,
        position.positionKey,
      ]);
      const publicCard: ProductionDailyPublicCard = {
        cardFingerprint: fingerprint as CardFingerprint,
        positionKey: position.positionKey,
        activityId: "daily_move_recall",
        title: "Opening recall",
        prompt: "Play the approved move for this exact position.",
        positionFen: fen,
        openingId: node.openingId,
        side,
        why: "This position comes from an unlocked opening in your repertoire.",
      };
      const privateCard: ProductionDailyPrivateCard = {
        ...publicCard,
        acceptedMoves: [candidate.moveUci],
        explanation: "This move keeps the approved opening plan on track.",
      };
      return {
        publicCard,
        privateCard,
        priority: weaknessScores.get(position.positionKey) ?? 0.1,
        stableKey: fingerprint,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  const selected = candidates
    .sort(
      (a, b) =>
        b.priority - a.priority || a.stableKey.localeCompare(b.stableKey),
    )
    .slice(0, 5);
  const deck = buildDeterministicDailyDeck({
    userId: user.userId,
    dateKey,
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
    status: "in_progress",
  };
  return {
    deckId: String(deck.deckFingerprint),
    sessionId: String(deck.sessionId),
    publicCards,
    privateCards,
    state,
  };
}

export async function getOrReserveDaily(
  user: CurrentBlundrUser,
  dateKey: string,
  now = new Date().toISOString(),
) {
  const repository = new ProductionDailyRepository();
  const existing = await repository.getByDate(user.userId, dateKey);
  if (existing) return existing;
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
  const firstAttemptAlreadyRecorded = session.state.attempts.some(
    (attempt) =>
      attempt.card.cardFingerprint === input.cardFingerprint && attempt.scored,
  );
  const correct =
    input.action === "answer" &&
    Boolean(input.answer && privateCard.acceptedMoves.includes(input.answer));
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
  if ((await repository.update(next, input.expectedVersion)) === "conflict")
    throw new Error("daily_session_conflict");
  await repository.appendAttempt({
    attemptId:
      reduced.state.attempts.at(-1)?.attemptId ??
      createDeterministicIdentity("daily-noop", [
        input.sessionId,
        input.cardFingerprint,
        input.action,
      ]),
    sessionId: input.sessionId,
    userId: input.user.userId,
    cardFingerprint: input.cardFingerprint,
    firstAttempt: !firstAttemptAlreadyRecorded && input.action !== "retry",
    attemptKind: input.action,
    outcome,
    answer: input.action === "answer" ? input.answer : undefined,
  });
  if (!firstAttemptAlreadyRecorded && input.action !== "retry")
    await appendLearningEventV2({
      userId: input.user.userId,
      sessionId: input.sessionId,
      attemptId:
        reduced.state.attempts.at(-1)?.attemptId ?? input.cardFingerprint,
      source: "daily",
      taxonomy: input.action === "reveal" ? "daily_revealed" : "daily_answered",
      position: {
        positionKey: privateCard.positionKey,
        canonicalFen: privateCard.positionFen,
        openingId: privateCard.openingId,
        expectedMoveUci: privateCard.acceptedMoves[0] ?? null,
        repertoireSide: privateCard.side,
        moveOrderKey: null,
        runtimePackageVersion: "stage2-21-opening-stepdown-runtime-v1",
      },
      correct,
      firstAttempt: true,
      now,
      access: {
        openingId: privateCard.openingId,
        repertoireSide: privateCard.side,
        decision: "active",
        checkedAt: now,
        authorityVersion: "repertoire-unlock-v1",
        expiresAt: new Date(Date.parse(now) + 300000).toISOString(),
      },
      explanation: privateCard.explanation,
    });
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
  return toPublic(session);
}

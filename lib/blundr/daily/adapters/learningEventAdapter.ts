import { sanToUci } from "@/lib/blundr/geometry/legalMoveUtils";
import { normalizeFenForVisualFrame } from "@/lib/blundr/teaching/overlayLifecycle";
import type { LearningEvent } from "@/lib/blundr/learning/learningEvents";
import type {
  DailyBlundrDifficulty,
  DailyBlundrMasteryTarget,
  DailyBlundrSeed,
} from "../dailyBlundrTypes";
import { buildDailyBlundrCardKey, buildDailyBlundrPositionKey, buildDailyBlundrMoveKey } from "./progressMistakeAdapter";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function deriveMoveUci(fen: string, san?: string | null, uci?: string | null): string | null {
  const direct = normalizeText(uci);
  if (direct) return direct.toLowerCase();
  const sanText = normalizeText(san);
  if (!sanText) return null;
  const derived = sanToUci(fen, sanText);
  return derived ? derived.toLowerCase() : null;
}

function buildMasteryTargets(input: {
  positionKey: string;
  openingId: string | null;
  openingName: string | null;
  patternId: string | null;
  concept: string | null;
  expectedMoveUci: string | null;
  expectedMoveSan: string | null;
}): DailyBlundrMasteryTarget[] {
  const moveKey = buildDailyBlundrMoveKey(input.expectedMoveUci ?? input.expectedMoveSan);
  const targets: DailyBlundrMasteryTarget[] = [
    {
      conceptKey: `daily:${input.positionKey}:${moveKey || "unknown"}`,
      domain: "daily_recall",
      label: input.openingName || "Daily recall",
      difficultyHint: "intermediate",
    },
  ];

  if (input.openingId) {
    targets.push({
      conceptKey: `opening:${input.openingId}`,
      domain: "opening_review",
      label: input.openingName || input.openingId,
      difficultyHint: "beginner",
    });
  }

  if (input.patternId || input.concept) {
    targets.push({
      conceptKey: `concept:${input.patternId || input.concept}`,
      domain: "tactical_idea",
      label: input.concept || input.patternId || input.openingName || "Idea review",
      difficultyHint: "early_intermediate",
    });
  }

  return targets;
}

function buildDifficulty(event: LearningEvent, hasExpectedUci: boolean): DailyBlundrDifficulty {
  const timeToMoveMs = typeof event.timeToMoveMs === "number" && Number.isFinite(event.timeToMoveMs) ? event.timeToMoveMs : null;
  if (event.type === "move_incorrect") return hasExpectedUci ? "intermediate" : "beginner";
  if (event.type === "cue_revealed") return "beginner";
  if (event.type === "move_correct" && timeToMoveMs !== null && timeToMoveMs >= 7000) return "intermediate";
  if (event.type === "move_correct" && timeToMoveMs !== null && timeToMoveMs >= 4000) return "early_intermediate";
  if (event.trainerView === "plain") return "early_intermediate";
  return "beginner";
}

function estimateSeedWeight(event: LearningEvent): number {
  const base = event.type === "move_incorrect" ? 1.45 : event.type === "cue_revealed" ? 1.28 : event.type === "move_correct" ? 1.08 : 0.85;
  const timingBoost = typeof event.timeToMoveMs === "number" && event.timeToMoveMs > 0 ? Math.min(0.65, event.timeToMoveMs / 12000) : 0;
  const plainBoost = event.trainerView === "plain" ? 0.08 : 0;
  return base + timingBoost + plainBoost;
}

function shouldSeedEvent(event: LearningEvent): boolean {
  return event.type === "move_incorrect" || event.type === "cue_revealed" || event.type === "move_correct" || event.type === "trainer_view_changed";
}

export function adaptLearningEventsToDailySeeds(events: readonly LearningEvent[] | null | undefined): DailyBlundrSeed[] {
  if (!events?.length) return [];
  const seeds: DailyBlundrSeed[] = [];

  for (const event of events) {
    if (!shouldSeedEvent(event)) continue;
    const fen = normalizeText(event.fen);
    if (!fen) continue;

    const expectedMoveSan = normalizeText(event.expectedMoveSan);
    const playedMoveSan = normalizeText(event.playedMoveSan);
    const playedMoveUci = deriveMoveUci(fen, playedMoveSan, event.playedMoveUci);
    const expectedMoveUci = deriveMoveUci(fen, expectedMoveSan, event.expectedMoveUci);

    if (!expectedMoveUci && !expectedMoveSan) continue;
    if (event.type === "move_correct" && typeof event.timeToMoveMs === "number" && event.timeToMoveMs < 3500 && event.trainerView !== "plain") continue;
    if (event.type === "trainer_view_changed" && event.trainerView !== "plain" && event.trainerView !== "assisted") continue;

    const positionKey = normalizeFenForVisualFrame(fen) ?? buildDailyBlundrPositionKey(fen);
    const cardKey = buildDailyBlundrCardKey({ fen, expectedMoveSan, expectedMoveUci });
    const sourceTag = `event:${normalizeText(event.source) || "train"}`;
    const signals = [
      event.type,
      sourceTag,
      event.correct === false ? "incorrect" : event.correct === true ? "correct" : "unknown_outcome",
      event.trainerView ? `view:${event.trainerView}` : null,
      event.trainingMode ? `mode:${event.trainingMode}` : null,
      typeof event.timeToMoveMs === "number" ? `time:${Math.max(0, Math.round(event.timeToMoveMs))}` : null,
    ].filter((value): value is string => Boolean(value));
    seeds.push({
      source: "learning_event",
      cardKey,
      positionKey,
      fen,
      expectedMoveUci,
      expectedMoveSan: expectedMoveSan || null,
      playedMoveUci,
      playedMoveSan: playedMoveSan || null,
      openingId: normalizeText(event.openingId) || null,
      openingName: normalizeText(event.openingName) || null,
      patternId: normalizeText(event.patternId) || null,
      concept: normalizeText(event.concept) || null,
      count: 1,
      weight: estimateSeedWeight(event),
      lastSeenAt: normalizeText(event.createdAt) || null,
      note: sourceTag,
      signals,
      masteryTargets: buildMasteryTargets({
        positionKey,
        openingId: normalizeText(event.openingId) || null,
        openingName: normalizeText(event.openingName) || null,
        patternId: normalizeText(event.patternId) || null,
        concept: normalizeText(event.concept) || null,
        expectedMoveUci,
        expectedMoveSan: expectedMoveSan || null,
      }),
      confidence:
        event.type === "move_incorrect"
          ? "high"
          : event.type === "cue_revealed"
            ? "medium"
            : event.type === "move_correct" && typeof event.timeToMoveMs === "number" && event.timeToMoveMs >= 7000
              ? "medium"
              : "low",
      difficulty: buildDifficulty(event, Boolean(expectedMoveUci)),
    });
  }

  return seeds;
}

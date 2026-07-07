import { Chess } from "chess.js";

import { buildDailyBlundrDeck } from "../daily/dailyBlundrDeckBuilder";
import { loadDailyBlundrOverview } from "../daily/dailyBlundrReadModel";
import { loadStage2RuntimeBook, buildStage2RuntimeBookIndex } from "../runtimeBook";
import { getStage2RuntimeCandidatesForFrame } from "../runtimeBook/getStage2RuntimeCandidatesForFrame";
import { getStage2RuntimeTrainableRepertoire } from "../openings/runtimeTrainableRepertoires";
import { loadStage2RuntimeTrainableRepertoires } from "../openings/runtimeLineBodyLoader";
import { getStage2OpeningAvailability, getStage2OpeningAvailabilitySummary, STAGE2_OPENING_AVAILABILITY_MATRIX } from "../openings/openingAvailability";
import { getAllStarterPacks, getStarterPackOpeningIds } from "../onboarding/starterPacks";
import { buildDailyMiniGameHealthReport, type DailyMiniGameHealthReport } from "../daily/miniGames/dailyMiniGameHealth";

export type GameDataHealthReport = {
  generatedAt: string;
  runtimeBook: {
    packageRoot: string | null;
    runtimeDir: string | null;
    nodeFilePath: string | null;
    moveFilePath: string | null;
    nodeCount: number;
    moveCount: number;
    openingIds: string[];
    parseErrors: string[];
  };
  runtimeTrainableRepertoires: {
    count: number;
    openingIds: string[];
    emptyOpeningIds: string[];
  };
  openingAvailability: {
    openingCount: number;
    openingIds: string[];
    runtimeAvailableCount: number;
    missingStarterPackOpenings: string[];
    emptyOpenings: string[];
  };
  starterPacks: {
    count: number;
    missingOpeningIds: string[];
    joinErrors: string[];
  };
  joinChecks: {
    sampledOpeningIds: string[];
    joinErrors: string[];
  };
  dailyBlundr: {
    liveDeckCardCount: number;
    liveDeckHasCards: boolean;
    syntheticDeckCardCount: number;
    syntheticDeckHasCards: boolean;
  };
  minigames: DailyMiniGameHealthReport;
};

function nowIso(): string {
  return new Date().toISOString();
}

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function buildUciHistoryFromSanMoves(moves: readonly string[]): string[] {
  const game = new Chess();
  const ucis: string[] = [];
  for (const san of moves) {
    const move = game.move(san);
    if (!move) break;
    ucis.push(`${move.from}${move.to}${move.promotion ?? ""}`.toLowerCase());
  }
  return ucis;
}

function sampleJoinProbe(openingId: string): string[] {
  const repertoire = getStage2RuntimeTrainableRepertoire(openingId);
  const line = repertoire?.lines?.[0] ?? [];
  const prefixLength = Math.max(1, Math.min(5, line.length - 1));
  return buildUciHistoryFromSanMoves(line.slice(0, prefixLength));
}

export async function buildGameDataHealthReport(now = nowIso()): Promise<GameDataHealthReport> {
  const parseErrors: string[] = [];
  let runtimeBookPackageRoot: string | null = null;
  let runtimeBookRuntimeDir: string | null = null;
  let runtimeBookNodeFilePath: string | null = null;
  let runtimeBookMoveFilePath: string | null = null;
  let runtimeBookNodeCount = 0;
  let runtimeBookMoveCount = 0;
  let runtimeBookOpeningIds: string[] = [];
  let runtimeBookIndex = null as Awaited<ReturnType<typeof loadStage2RuntimeBook>> | null;

  try {
    runtimeBookIndex = await loadStage2RuntimeBook();
    const indexed = buildStage2RuntimeBookIndex(runtimeBookIndex);
    runtimeBookPackageRoot = indexed.packageRoot;
    runtimeBookRuntimeDir = indexed.runtimeDir;
    runtimeBookNodeFilePath = runtimeBookIndex.nodeFilePath;
    runtimeBookMoveFilePath = runtimeBookIndex.moveFilePath;
    runtimeBookNodeCount = indexed.nodeCount;
    runtimeBookMoveCount = indexed.moveCount;
    runtimeBookOpeningIds = indexed.openingIds.slice();
  } catch (error) {
    parseErrors.push(error instanceof Error ? error.message : String(error));
  }

  const runtimeTrainableRepertoires = await loadStage2RuntimeTrainableRepertoires();
  const runtimeTrainableOpeningIds = runtimeTrainableRepertoires.map((entry) => entry.id);
  const emptyRuntimeTrainableOpeningIds = runtimeTrainableRepertoires.filter((entry) => !entry.lines.length).map((entry) => entry.id);

  const openingAvailability = STAGE2_OPENING_AVAILABILITY_MATRIX;
  const missingStarterPackOpenings: string[] = [];
  const emptyOpenings: string[] = [];

  for (const entry of openingAvailability) {
    if (entry.runtimeNodeCount <= 0 || entry.runtimeCandidateMoveCount <= 0) {
      emptyOpenings.push(entry.openingId);
    }
  }

  const starterPacks = getAllStarterPacks();
  const starterPackJoinErrors: string[] = [];
  const sampledOpeningIds: string[] = [];
  const joinErrors: string[] = [];

  for (const pack of starterPacks) {
    const openingIds = getStarterPackOpeningIds(pack.id);
    sampledOpeningIds.push(openingIds.whiteOpeningId, openingIds.blackOpeningId);
    for (const openingId of [openingIds.whiteOpeningId, openingIds.blackOpeningId]) {
      if (!getStage2OpeningAvailability(openingId)) {
        missingStarterPackOpenings.push(openingId);
        continue;
      }
      if (!getStage2RuntimeTrainableRepertoire(openingId)?.lines.length) {
        starterPackJoinErrors.push(`starter_pack_trainable_missing:${pack.id}:${openingId}`);
        continue;
      }
      const probePlayKeyBefore = sampleJoinProbe(openingId);
      if (!probePlayKeyBefore.length) {
        starterPackJoinErrors.push(`starter_pack_probe_unavailable:${pack.id}:${openingId}`);
        continue;
      }
      if (!runtimeBookIndex) continue;
      const probe = getStage2RuntimeCandidatesForFrame({
        index: buildStage2RuntimeBookIndex(runtimeBookIndex),
        openingId,
        playKeyBefore: probePlayKeyBefore.join(","),
      });
      if (!probe.candidates.length) {
        starterPackJoinErrors.push(`starter_pack_join_empty:${pack.id}:${openingId}`);
      }
    }
  }

  if (runtimeBookIndex) {
    const indexed = buildStage2RuntimeBookIndex(runtimeBookIndex);
    for (const openingId of sampledOpeningIds.slice(0, 4)) {
      const probePlayKeyBefore = sampleJoinProbe(openingId);
      if (!probePlayKeyBefore.length) continue;
      const probe = getStage2RuntimeCandidatesForFrame({
        index: indexed,
        openingId,
        playKeyBefore: probePlayKeyBefore.join(","),
      });
      if (!probe.candidates.length) {
        joinErrors.push(`runtime_book_join_empty:${openingId}:${probePlayKeyBefore.join(",")}`);
      }
    }
  }

  const syntheticDeck = buildDailyBlundrDeck({
    progress: null,
    learningEvents: [
      {
        id: "game-data-health-synthetic-event",
        type: "move_incorrect",
        source: "train",
        createdAt: now,
        sessionId: "game-data-health-session",
        userId: "game-data-health-user",
        fen: new Chess().fen(),
        openingId: "italian-white",
        openingName: "Italian Game",
        expectedMoveSan: "e4",
        expectedMoveUci: "e2e4",
        playedMoveSan: "e5",
        playedMoveUci: "e7e5",
        correct: false,
        trainerView: "assisted",
        trainingMode: "restricted",
        timeToMoveMs: 9000,
      },
    ],
    mastery: null,
    dateKey: now.slice(0, 10),
    now,
    limit: 5,
  });

  const liveOverview = loadDailyBlundrOverview(5);
  const miniGames = buildDailyMiniGameHealthReport({
    dateKey: now.slice(0, 10),
    now,
  });

  return {
    generatedAt: now,
    runtimeBook: {
      packageRoot: runtimeBookPackageRoot,
      runtimeDir: runtimeBookRuntimeDir,
      nodeFilePath: runtimeBookNodeFilePath,
      moveFilePath: runtimeBookMoveFilePath,
      nodeCount: runtimeBookNodeCount,
      moveCount: runtimeBookMoveCount,
      openingIds: runtimeBookOpeningIds,
      parseErrors,
    },
    runtimeTrainableRepertoires: {
      count: runtimeTrainableRepertoires.length,
      openingIds: runtimeTrainableOpeningIds,
      emptyOpeningIds: emptyRuntimeTrainableOpeningIds,
    },
    openingAvailability: {
      openingCount: getStage2OpeningAvailabilitySummary().openingCount,
      openingIds: openingAvailability.map((entry) => entry.openingId),
      runtimeAvailableCount: openingAvailability.filter((entry) => entry.runtimeAvailable).length,
      missingStarterPackOpenings: Array.from(new Set(missingStarterPackOpenings)),
      emptyOpenings,
    },
    starterPacks: {
      count: starterPacks.length,
      missingOpeningIds: Array.from(new Set(missingStarterPackOpenings)),
      joinErrors: Array.from(new Set(starterPackJoinErrors)),
    },
    joinChecks: {
      sampledOpeningIds: Array.from(new Set(sampledOpeningIds.map((value) => normalizeText(value)).filter(Boolean))),
      joinErrors: Array.from(new Set(joinErrors)),
    },
    dailyBlundr: {
      liveDeckCardCount: liveOverview.deck.cards.length,
      liveDeckHasCards: liveOverview.deck.cards.length > 0,
      syntheticDeckCardCount: syntheticDeck.cards.length,
      syntheticDeckHasCards: syntheticDeck.cards.length > 0,
    },
    minigames: miniGames,
  };
}

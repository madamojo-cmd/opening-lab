import { describe, expect, it } from "vitest";
import { normalizeProviderGame } from "@/lib/blundr/gameData/gameNormalizer";
import { replayPgn } from "@/lib/blundr/gameData/pgnReplay";
import { matchOpeningSegments } from "@/lib/blundr/gameData/openingSegmentMatcher";
import { extractDeterministicFindings } from "@/lib/blundr/gameData/findingExtractor";
import { dedupeFindings } from "@/lib/blundr/gameData/findingDedupe";
import type {
  RuntimeCandidateMove,
  RuntimeOpeningNode,
} from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";
import { createRuntimeEvidenceIndices } from "@/lib/blundr/trainingRuntime/runtimeEvidenceIndices";

describe("Step 2 trusted end-to-end fixture loop", () => {
  it("keeps duplicate games/findings singular and gates locked openings", () => {
    const pgn = `[White "alice"]\n[Black "bob"]\n[Result "1-0"]\n\n1. d4 d5 2. f3 e6`;
    const game = normalizeProviderGame({
      provider: "lichess",
      externalId: "g1",
      username: "alice",
      white: "alice",
      black: "bob",
      playedAt: "2026-07-14T00:00:00Z",
      result: "1-0",
      variant: "standard",
      pgn,
      moves: ["d2d4", "d7d5", "f2f3", "e7e6"],
    });
    expect(game).not.toBeNull();
    const replay = replayPgn(pgn, "white");
    expect(replay.ok).toBe(true);
    if (!game || !replay.ok) return;
    const nodes: RuntimeOpeningNode[] = [
      {
        nodeId: "parent",
        openingId: "london-white",
        playKey: "d2d4,d7d5",
        playSequenceUci: "d2d4,d7d5",
        ply: 2,
        sideToMove: "white",
      },
      {
        nodeId: "child",
        openingId: "london-white",
        playKey: "d2d4,d7d5,c2c4",
        playSequenceUci: "d2d4,d7d5,c2c4",
        ply: 3,
        sideToMove: "black",
      },
    ];
    const candidates: RuntimeCandidateMove[] = [
      {
        openingId: "london-white",
        playKeyBefore: "d2d4,d7d5",
        moveUci: "c2c4",
        rank: 1,
      },
    ];
    const gated = {
      openingId: "london-white",
      repertoireSide: "white" as const,
      decision: "gated_pending" as const,
      checkedAt: new Date().toISOString(),
      authorityVersion: "test",
      expiresAt: null,
    };
    const segment = matchOpeningSegments({
      game,
      plies: replay.plies,
      nodes,
      access: () => gated,
    })[0];
    const findings = extractDeterministicFindings({
      userId: "a",
      game,
      segment,
      plies: replay.plies,
      trainer: createRuntimeEvidenceIndices(nodes, candidates).trainer,
      access: gated,
    });
    expect(segment.accessState).toBe("gated_pending");
    expect(findings[0].status).toBe("gated_pending");
    expect(dedupeFindings([...findings, ...findings])).toHaveLength(1);
  });
});

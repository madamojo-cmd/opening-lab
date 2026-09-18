import { describe, expect, it } from "vitest";
import { Chess } from "chess.js";

import { canonicalPositionFenFromChess } from "@/lib/blundr/chess/canonicalPosition";
import {
  classifyContinuedPlayRuleState,
  selectContinuedPlayMove,
} from "@/lib/blundr/continuedPlay/continuedPlayMovePolicy";

function countPosition(
  counts: Map<string, number>,
  chess: Chess,
): void {
  const key = canonicalPositionFenFromChess(chess);
  counts.set(key, (counts.get(key) ?? 0) + 1);
}

describe("Wave 2E runtime continuation termination", () => {
  it("drives the real continued-play selector through repetition without looping forever", () => {
    const chess = new Chess();
    const counts = new Map<string, number>();
    countPosition(counts, chess);

    for (const uci of [
      "g1f3",
      "g8f6",
      "f3g1",
      "f6g8",
      "g1f3",
      "g8f6",
      "f3g1",
      "f6g8",
    ]) {
      const selected = selectContinuedPlayMove({
        fen: chess.fen(),
        positionCounts: counts,
        engineTop: {
          uci,
          source: "engine",
          engineSafe: true,
          stockfishInTop10: true,
        },
      });
      expect(selected?.selectedUci).toBe(uci);
      chess.move({ from: uci.slice(0, 2), to: uci.slice(2, 4) });
      countPosition(counts, chess);
    }

    const ruleState = classifyContinuedPlayRuleState({
      fen: chess.fen(),
      positionCounts: counts,
    });
    expect(ruleState.threefoldClaimable).toBe(true);
    expect(ruleState.fivefoldAutomatic).toBe(false);
    expect(ruleState.claimableDraw).toBe(true);
    expect(ruleState.terminal).toBe(false);
    expect(
      selectContinuedPlayMove({
        fen: chess.fen(),
        positionCounts: counts,
        engineTop: {
          uci: "g1f3",
          source: "engine",
          engineSafe: true,
          stockfishInTop10: true,
        },
      }),
    ).toBeNull();
  });

  it("stops the real continued-play selector for automatic terminal rule states", () => {
    const cases = [
      {
        fen: "rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 1 3",
        reason: "checkmate",
      },
      {
        fen: "7k/5K2/6Q1/8/8/8/8/8 b - - 0 1",
        reason: "stalemate",
      },
      {
        fen: "7k/8/8/8/8/8/8/K7 w - - 0 1",
        reason: "dead_position",
      },
      {
        fen: "6k1/8/8/8/8/8/8/R5K1 w - - 150 76",
        reason: "seventy_five_move_rule",
      },
    ] as const;

    for (const item of cases) {
      const ruleState = classifyContinuedPlayRuleState({ fen: item.fen });
      expect(ruleState.reason).toBe(item.reason);
      expect(ruleState.terminal).toBe(true);
      expect(
        selectContinuedPlayMove({
          fen: item.fen,
          engineTop: {
            uci: "a1a2",
            source: "engine",
            engineSafe: true,
            stockfishInTop10: true,
          },
        }),
      ).toBeNull();
    }
  });

  it("identifies fifty-move as claimable without collapsing it into automatic termination", () => {
    const fen = "6k1/8/8/8/8/8/8/R5K1 w - - 100 51";
    const ruleState = classifyContinuedPlayRuleState({ fen });
    expect(ruleState.fiftyMoveClaimable).toBe(true);
    expect(ruleState.seventyFiveMoveAutomatic).toBe(false);
    expect(ruleState.claimableDraw).toBe(true);
    expect(ruleState.terminal).toBe(false);
    expect(
      selectContinuedPlayMove({
        fen,
        engineTop: {
          uci: "a1a2",
          source: "engine",
          engineSafe: true,
          stockfishInTop10: true,
        },
      }),
    ).toBeNull();
  });
});

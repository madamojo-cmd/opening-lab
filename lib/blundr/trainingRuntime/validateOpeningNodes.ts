import { Chess } from "chess.js";
import { createPositionIdentity } from "@/lib/blundr/contracts";
import { normalizeRuntimeCastlingUci } from "@/lib/blundr/runtime/uciNormalization";
import type {
  RuntimeOpeningNode,
  RuntimeRejection,
} from "./trainingRuntimeSchema";
import {
  canonicalRuntimePlayKey,
  RUNTIME_STARTPOS_PLAY_KEY,
  splitRuntimePlayKey,
} from "./runtimePlayKey";

function playUci(chess: Chess, uci: string): void {
  const move = normalizeRuntimeCastlingUci(uci) ?? "";
  if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(move))
    throw new Error("invalid_uci");
  const result = chess.move({
    from: move.slice(0, 2),
    to: move.slice(2, 4),
    promotion: move[4] as "q" | "r" | "b" | "n" | undefined,
  });
  if (!result) throw new Error("illegal_move");
}

export function validateOpeningNode(
  raw: unknown,
  rowNumber: number,
): { node: RuntimeOpeningNode } | { rejection: RuntimeRejection } {
  if (!raw || typeof raw !== "object")
    return {
      rejection: {
        rowNumber,
        source: "opening-node",
        reason: "not_object",
        row: raw,
      },
    };
  const value = raw as Partial<RuntimeOpeningNode>;
  if (
    !value.nodeId ||
    !value.openingId ||
    !value.playKey ||
    !Number.isInteger(value.ply)
  )
    return {
      rejection: {
        rowNumber,
        source: "opening-node",
        reason: "missing_required_field",
        row: raw,
      },
    };
  try {
    const playKey = canonicalRuntimePlayKey(value.playKey);
    const sequence = splitRuntimePlayKey(value.playSequenceUci);
    if (playKey === RUNTIME_STARTPOS_PLAY_KEY && sequence.length !== 0)
      throw new Error("startpos_sequence_mismatch");
    if (
      playKey !== RUNTIME_STARTPOS_PLAY_KEY &&
      playKey !== canonicalRuntimePlayKey(sequence.join(","))
    )
      throw new Error("play_key_sequence_mismatch");
    const chess = new Chess();
    for (const move of sequence) playUci(chess, move);
    const expectedSide = chess.turn() === "w" ? "white" : "black";
    if (value.sideToMove && value.sideToMove !== expectedSide)
      throw new Error("side_to_move_mismatch");
    if (Number(value.ply) !== sequence.length) throw new Error("ply_mismatch");
    const learnerPerspective =
      value.learnerPerspective === "white" ||
      value.learnerPerspective === "black"
        ? value.learnerPerspective
        : "unknown";
    const canonicalFen = chess.fen();
    const positionKey = createPositionIdentity({
      canonicalFen,
      openingId: value.openingId,
      repertoireSide: learnerPerspective,
    }).positionKey;
    return {
      node: {
        ...(raw as RuntimeOpeningNode),
        playKey,
        playSequenceUci: sequence.join(","),
        ply: sequence.length,
        sideToMove: expectedSide,
        canonicalFen,
        positionKey,
      },
    };
  } catch (error) {
    return {
      rejection: {
        rowNumber,
        source: "opening-node",
        reason: error instanceof Error ? error.message : "invalid_position",
        row: raw,
      },
    };
  }
}

export function validateOpeningNodes(rows: readonly unknown[]): {
  accepted: RuntimeOpeningNode[];
  rejected: RuntimeRejection[];
} {
  const accepted: RuntimeOpeningNode[] = [];
  const rejected: RuntimeRejection[] = [];
  rows.forEach((row, index) => {
    const result = validateOpeningNode(row, index + 1);
    if ("node" in result) accepted.push(result.node);
    else rejected.push(result.rejection);
  });
  return { accepted, rejected };
}

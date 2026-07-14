import { Chess } from "chess.js";
import type {
  RuntimeCandidateMove,
  RuntimeOpeningNode,
  RuntimeRejection,
} from "./trainingRuntimeSchema";

export function validateCandidateMove(
  raw: unknown,
  rowNumber: number,
  nodesByKey: ReadonlyMap<string, RuntimeOpeningNode>,
): { candidate: RuntimeCandidateMove } | { rejection: RuntimeRejection } {
  if (!raw || typeof raw !== "object")
    return {
      rejection: {
        rowNumber,
        source: "candidate-move",
        reason: "not_object",
        row: raw,
      },
    };
  const value = raw as Partial<RuntimeCandidateMove>;
  const parent = value.playKeyBefore
    ? nodesByKey.get(`${value.openingId}:${value.playKeyBefore}`)
    : undefined;
  if (!value.openingId || !value.playKeyBefore || !value.moveUci || !parent)
    return {
      rejection: {
        rowNumber,
        source: "candidate-move",
        reason: parent ? "missing_required_field" : "parent_node_missing",
        row: raw,
      },
    };
  try {
    const chess = new Chess();
    for (const move of parent.playSequenceUci.split(",").filter(Boolean))
      chess.move({
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        promotion: move[4] as "q" | "r" | "b" | "n" | undefined,
      });
    const uci = String(value.moveUci);
    const result = chess.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
    });
    if (!result) throw new Error("illegal_move");
    return { candidate: raw as RuntimeCandidateMove };
  } catch (error) {
    return {
      rejection: {
        rowNumber,
        source: "candidate-move",
        reason:
          error instanceof Error &&
          error.message.toLowerCase().includes("invalid move")
            ? "illegal_move"
            : error instanceof Error
              ? error.message
              : "invalid_move",
        row: raw,
      },
    };
  }
}

export function validateCandidateMoves(
  rows: readonly unknown[],
  nodes: readonly RuntimeOpeningNode[],
): { accepted: RuntimeCandidateMove[]; rejected: RuntimeRejection[] } {
  const index = new Map(
    nodes.map((node) => [`${node.openingId}:${node.playKey}`, node]),
  );
  const accepted: RuntimeCandidateMove[] = [];
  const rejected: RuntimeRejection[] = [];
  rows.forEach((row, indexNumber) => {
    const result = validateCandidateMove(row, indexNumber + 1, index);
    if ("candidate" in result) accepted.push(result.candidate);
    else rejected.push(result.rejection);
  });
  return { accepted, rejected };
}

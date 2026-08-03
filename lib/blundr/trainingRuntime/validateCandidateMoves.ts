import { Chess } from "chess.js";
import { normalizeRuntimeCastlingUci } from "@/lib/blundr/runtime/uciNormalization";
import type {
  RuntimeCandidateMove,
  RuntimeOpeningNode,
  RuntimeRejection,
} from "./trainingRuntimeSchema";
import { canonicalRuntimePlayKey, splitRuntimePlayKey } from "./runtimePlayKey";

function nodeLookupKey(
  openingId: string,
  playKey: string,
  profileId?: string,
): string {
  return `${openingId}:${playKey}:${profileId ?? ""}`;
}

function candidateField(
  raw: Record<string, unknown>,
  canonical: string,
  authoritative: string,
): unknown {
  return raw[canonical] ?? raw[authoritative];
}

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
  const source = raw as Record<string, unknown>;
  const openingId = String(source.openingId ?? "").trim();
  const rawPlayKey = candidateField(source, "playKeyBefore", "playKey");
  const playKeyBefore = rawPlayKey ? canonicalRuntimePlayKey(rawPlayKey) : "";
  const moveUci = normalizeRuntimeCastlingUci(
    candidateField(source, "moveUci", "uci"),
  );
  const profileId = String(
    candidateField(source, "profileId", "profiles") ?? "",
  ).trim();
  const parent =
    nodesByKey.get(nodeLookupKey(openingId, playKeyBefore, profileId)) ??
    nodesByKey.get(nodeLookupKey(openingId, playKeyBefore));
  if (!openingId || !playKeyBefore || !moveUci || !parent)
    return {
      rejection: {
        rowNumber,
        source: "candidate-move",
        reason: parent ? "missing_required_field" : "parent_node_missing",
        row: raw,
      },
    };
  try {
    if (!/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(moveUci))
      throw new Error("invalid_uci");
    const totalGames = source.totalGames;
    if (
      totalGames !== undefined &&
      (!Number.isFinite(totalGames) || Number(totalGames) < 0)
    )
      throw new Error("invalid_total_games");
    const playPct = source.playPct;
    if (
      playPct !== undefined &&
      (!Number.isFinite(playPct) || Number(playPct) < 0 || Number(playPct) > 1)
    )
      throw new Error("invalid_play_pct");
    if (
      source.ply !== undefined &&
      (!Number.isInteger(source.ply) || Number(source.ply) !== parent.ply)
    )
      throw new Error("ply_mismatch");
    if (
      source.sideToMove !== undefined &&
      source.sideToMove !== parent.sideToMove
    )
      throw new Error("side_to_move_mismatch");
    if (
      source.learnerToMove !== undefined &&
      typeof source.learnerToMove === "boolean" &&
      parent.learnerPerspective &&
      source.learnerToMove !== (parent.sideToMove === parent.learnerPerspective)
    )
      throw new Error("learner_to_move_mismatch");
    const chess = new Chess();
    for (const move of splitRuntimePlayKey(parent.playSequenceUci))
      chess.move({
        from: move.slice(0, 2),
        to: move.slice(2, 4),
        promotion: move[4] as "q" | "r" | "b" | "n" | undefined,
      });
    const result = chess.move({
      from: moveUci.slice(0, 2),
      to: moveUci.slice(2, 4),
      promotion: moveUci[4] as "q" | "r" | "b" | "n" | undefined,
    });
    if (!result) throw new Error("illegal_move");
    const sourceName = String(
      candidateField(source, "source", "sources") ?? "",
    ).trim();
    const moveSan = String(
      candidateField(source, "moveSan", "san") ?? result.san,
    ).trim();
    return {
      candidate: {
        ...source,
        nodeId:
          typeof source.nodeId === "string" ? source.nodeId : parent.nodeId,
        openingId,
        playKeyBefore,
        moveUci,
        moveSan,
        profileId: profileId || parent.profileId,
        profiles: profileId || parent.profileId,
        source: sourceName || parent.source,
        sources: sourceName || parent.source,
        ply: parent.ply,
      } as RuntimeCandidateMove,
    };
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
    nodes.flatMap((node) => [
      [
        nodeLookupKey(node.openingId, node.playKey, node.profileId),
        node,
      ] as const,
      [nodeLookupKey(node.openingId, node.playKey), node] as const,
    ]),
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

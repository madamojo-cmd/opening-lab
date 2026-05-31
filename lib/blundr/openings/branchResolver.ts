import { Chess } from "chess.js";
import type { RepertoireContinuation, RepertoireNode } from "./openingTypes";

function isLegalUci(fen: string, uci: string): boolean {
  try {
    const game = new Chess(fen);
    return (game.moves({ verbose: true }) as any[]).some((move) => `${move.from}${move.to}${move.promotion ?? ""}` === uci);
  } catch {
    return false;
  }
}

export function legalContinuationsForColor(nodes: RepertoireNode[], fen: string, color: "w" | "b"): RepertoireContinuation[] {
  const continuations = nodes
    .flatMap((node) => node.continuations.map((continuation) => ({ ...continuation })))
    .filter((continuation) => continuation.color === color)
    .filter((continuation, index, all) => all.findIndex((candidate) => candidate.uci === continuation.uci) === index)
    .filter((continuation) => isLegalUci(fen, continuation.uci));

  return continuations.sort((a, b) => a.ply - b.ply || a.san.localeCompare(b.san) || a.uci.localeCompare(b.uci));
}

export function hasTerminalNodeForColor(nodes: RepertoireNode[], color: "w" | "b"): boolean {
  return nodes.some((node) => node.terminal && node.sideToMove === color);
}

export function classifyContinuationSource(nodes: RepertoireNode[], continuation: RepertoireContinuation): "lesson_line" | "opening_branch" {
  const matchingNodes = nodes.filter((node) => node.continuations.some((candidate) => candidate.uci === continuation.uci));
  return matchingNodes.length > 1 || nodes.length > 1 ? "opening_branch" : "lesson_line";
}

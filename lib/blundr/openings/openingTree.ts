import { Chess } from "chess.js";
import { normalizeVisualFen } from "../visual/normalizeVisualFen";
import type { OpeningTree, RepertoireContinuation, RepertoireLineInput, RepertoireNode } from "./openingTypes";

function moveToUci(move: { from: string; to: string; promotion?: string }): string {
  return `${move.from}${move.to}${move.promotion ?? ""}`;
}

export function transpositionKeyForFen(fen: string): string {
  return fen.split(" ").slice(0, 2).join(" ");
}

function cloneContinuations(continuations: RepertoireContinuation[]): RepertoireContinuation[] {
  return continuations.map((continuation) => ({ ...continuation }));
}

function addNode(nodesByFen4: Record<string, RepertoireNode[]>, nodesByTranspositionKey: Record<string, RepertoireNode[]>, node: RepertoireNode): void {
  const existing = nodesByFen4[node.fen4] ?? [];
  const sameNode = existing.find((candidate) => candidate.lineId === node.lineId && candidate.ply === node.ply);
  if (sameNode) {
    for (const continuation of node.continuations) {
      if (!sameNode.continuations.some((existingContinuation) => existingContinuation.uci === continuation.uci && existingContinuation.lineId === continuation.lineId)) {
        sameNode.continuations.push({ ...continuation });
      }
    }
    sameNode.terminal = sameNode.terminal && node.terminal;
    return;
  }
  const stored = { ...node, continuations: cloneContinuations(node.continuations) };
  nodesByFen4[node.fen4] = [...existing, stored];
  nodesByTranspositionKey[node.transpositionKey] = [...(nodesByTranspositionKey[node.transpositionKey] ?? []), stored];
}

export function buildOpeningTree(lines: RepertoireLineInput[]): OpeningTree {
  const first = lines[0];
  const nodesByFen4: Record<string, RepertoireNode[]> = {};
  const nodesByTranspositionKey: Record<string, RepertoireNode[]> = {};
  const invalidSan: OpeningTree["invalidSan"] = [];

  for (const line of lines) {
    const game = new Chess();
    let stopped = false;
    for (let ply = 0; ply < line.movesSan.length; ply += 1) {
      const san = line.movesSan[ply];
      const fenBefore = game.fen();
      const fen4 = normalizeVisualFen(fenBefore);
      try {
        const move = game.move(san);
        if (!move) {
          invalidSan.push({ openingId: line.openingId, lineId: line.lineId, ply, san, reason: "illegal_or_unparseable_san" });
          stopped = true;
          break;
        }
        const continuation: RepertoireContinuation = {
          san: move.san,
          uci: moveToUci(move),
          color: move.color as "w" | "b",
          resultingFen: game.fen(),
          resultingFen4: normalizeVisualFen(game.fen()),
          source: "lesson_line",
          lineId: line.lineId,
          openingId: line.openingId,
          ply,
        };
        addNode(nodesByFen4, nodesByTranspositionKey, {
          fen4,
          fullFen: fenBefore,
          ply,
          lineId: line.lineId,
          openingId: line.openingId,
          openingName: line.openingName,
          sideToMove: new Chess(fenBefore).turn() as "w" | "b",
          continuations: [continuation],
          transpositionKey: transpositionKeyForFen(fenBefore),
          terminal: false,
          lineLength: line.movesSan.length,
        });
      } catch {
        invalidSan.push({ openingId: line.openingId, lineId: line.lineId, ply, san, reason: "san_exception" });
        stopped = true;
        break;
      }
    }

    if (!stopped) {
      const terminalFen = game.fen();
      addNode(nodesByFen4, nodesByTranspositionKey, {
        fen4: normalizeVisualFen(terminalFen),
        fullFen: terminalFen,
        ply: line.movesSan.length,
        lineId: line.lineId,
        openingId: line.openingId,
        openingName: line.openingName,
        sideToMove: game.turn() as "w" | "b",
        continuations: [],
        transpositionKey: transpositionKeyForFen(terminalFen),
        terminal: true,
        lineLength: line.movesSan.length,
      });
    }
  }

  return {
    openingId: first?.openingId ?? "unknown",
    openingName: first?.openingName ?? "Unknown Opening",
    sideToTrain: first?.sideToTrain ?? "white",
    nodesByFen4,
    nodesByTranspositionKey,
    invalidSan,
    lineCount: lines.length,
    nodeCount: Object.values(nodesByFen4).reduce((sum, nodes) => sum + nodes.length, 0),
  };
}

export function getNodesForFen(tree: OpeningTree, fen: string): RepertoireNode[] {
  return tree.nodesByFen4[normalizeVisualFen(fen)] ?? [];
}

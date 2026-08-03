import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { Chess } from "chess.js";

import { applyRuntimeUciMove } from "../runtime/uciReplay";
import {
  normalizeRuntimeCastlingUci,
  normalizeRuntimePlayKey,
  normalizeRuntimePlaySequenceUci,
} from "../runtime/uciNormalization";
import type {
  Stage2RuntimeBookLoadResult,
  Stage2RuntimeBookMove,
  Stage2RuntimeBookNode,
  Stage2RuntimeBookRawMoveRow,
  Stage2RuntimeBookRawNodeRow,
} from "./runtimeBookTypes";

function assertReadableFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    throw new Error(`runtime_book_file_missing:${filePath}`);
  }
  if (!fs.statSync(filePath).isFile()) {
    throw new Error(`runtime_book_path_not_file:${filePath}`);
  }
}

async function parseJsonl<T>(
  filePath: string,
  onRow: (row: T, lineNumber: number) => void,
): Promise<void> {
  const stream = fs.createReadStream(filePath, "utf8");
  const lines = readline.createInterface({
    input: stream,
    crlfDelay: Infinity,
  });
  let lineNumber = 0;
  for await (const line of lines) {
    lineNumber += 1;
    if (!line.trim()) continue;
    try {
      onRow(JSON.parse(line) as T, lineNumber);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        `runtime_book_jsonl_parse_error:${filePath}:${lineNumber}:${detail}`,
      );
    }
  }
}

function normalizeNodeRow(
  row: Stage2RuntimeBookRawNodeRow,
  lineNumber: number,
): Stage2RuntimeBookNode {
  if (typeof row.openingId !== "string" || !row.openingId) {
    throw new Error(`runtime_book_node_missing_opening_id:${lineNumber}`);
  }
  if (row.playKey != null && typeof row.playKey !== "string") {
    throw new Error(`runtime_book_node_invalid_play_key:${lineNumber}`);
  }
  if (row.ply != null && !Number.isFinite(row.ply)) {
    throw new Error(`runtime_book_node_invalid_ply:${lineNumber}`);
  }
  const playSequenceUci = normalizeRuntimePlaySequenceUci(
    String(row.playSequenceUci ?? row.playKey ?? "").split(","),
  );
  const playKey = normalizeRuntimePlayKey(
    row.playKey ?? playSequenceUci.join(","),
  );
  if (playSequenceUci.length) {
    const chess = new Chess();
    for (const uci of playSequenceUci) {
      if (!applyRuntimeUciMove(chess, uci)) {
        throw new Error(
          `runtime_book_node_illegal_replay:${lineNumber}:${uci}`,
        );
      }
    }
  }
  return {
    ...row,
    playSequenceUci:
      playSequenceUci.length > 0 ? playSequenceUci.join(",") : undefined,
    playKey: playKey ?? undefined,
  };
}

function normalizeMoveRow(
  row: Stage2RuntimeBookRawMoveRow,
  lineNumber: number,
): Stage2RuntimeBookMove {
  if (typeof row.openingId !== "string" || !row.openingId) {
    throw new Error(`runtime_book_move_missing_opening_id:${lineNumber}`);
  }
  if (row.playKeyBefore != null && typeof row.playKeyBefore !== "string") {
    throw new Error(`runtime_book_move_invalid_play_key_before:${lineNumber}`);
  }
  if (row.moveUci != null && typeof row.moveUci !== "string") {
    throw new Error(`runtime_book_move_invalid_move_uci:${lineNumber}`);
  }
  if (row.rank != null && !Number.isFinite(row.rank)) {
    throw new Error(`runtime_book_move_invalid_rank:${lineNumber}`);
  }
  if (row.totalGames != null && !Number.isFinite(row.totalGames)) {
    throw new Error(`runtime_book_move_invalid_total_games:${lineNumber}`);
  }
  if (row.playPct != null && !Number.isFinite(row.playPct)) {
    throw new Error(`runtime_book_move_invalid_play_pct:${lineNumber}`);
  }
  return {
    ...row,
    playKeyBefore:
      normalizeRuntimePlayKey(row.playKeyBefore ?? "") ?? undefined,
    moveUci: normalizeRuntimeCastlingUci(row.moveUci ?? undefined) ?? undefined,
  };
}

export async function loadLegacyStage2RuntimeBook(options: {
  packageRoot: string;
}): Promise<Stage2RuntimeBookLoadResult> {
  const packageRoot = path.resolve(options.packageRoot);
  const runtimeDir = path.join(packageRoot, "runtime");
  const nodeFilePath = path.join(
    runtimeDir,
    "opening-book.nodes.runtime.v1.jsonl",
  );
  const moveFilePath = path.join(
    runtimeDir,
    "opening-book.moves.runtime.v1.jsonl",
  );
  assertReadableFile(nodeFilePath);
  assertReadableFile(moveFilePath);
  const nodes: Stage2RuntimeBookNode[] = [];
  await parseJsonl<Stage2RuntimeBookRawNodeRow>(
    nodeFilePath,
    (row, lineNumber) => nodes.push(normalizeNodeRow(row, lineNumber)),
  );
  const moves: Stage2RuntimeBookMove[] = [];
  await parseJsonl<Stage2RuntimeBookRawMoveRow>(
    moveFilePath,
    (row, lineNumber) => moves.push(normalizeMoveRow(row, lineNumber)),
  );
  return { packageRoot, runtimeDir, nodeFilePath, moveFilePath, nodes, moves };
}

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

import { Chess } from "chess.js";

import { STAGE2_RUNTIME_OPENING_IDS } from "../lib/blundr/openings/openingIdentity";
import { normalizeRuntimeCastlingUci, normalizeRuntimePlayKey, normalizeRuntimePlaySequenceUci } from "../lib/blundr/runtime/uciNormalization";
import { applyRuntimeUciMove } from "../lib/blundr/runtime/uciReplay";

type RuntimeNodeRow = {
  openingId: string;
  playKey?: string;
  playSequenceUci?: string;
  ply?: number;
  totalGames?: number;
};

type GeneratedLine = {
  lineId: string;
  playKey: string;
  playSequenceUci: string[];
  movesSan: string[];
  totalGames: number;
};

const REPO_ROOT = path.join(process.cwd());
const INPUT_FILE = path.join(
  REPO_ROOT,
  "data",
  "blundr",
  "stage2-21-opening-stepdown-runtime-v1",
  "runtime",
  "opening-book.nodes.runtime.v1.jsonl",
);
const OUTPUT_FILE = path.join(
  REPO_ROOT,
  "lib",
  "blundr",
  "openings",
  "stage2RuntimeTrainableRepertoires.generated.ts",
);

async function parseJsonl(filePath: string, onRow: (row: RuntimeNodeRow, lineNumber: number) => void): Promise<void> {
  const stream = fs.createReadStream(filePath, "utf8");
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  let lineNumber = 0;
  for await (const line of rl) {
    lineNumber += 1;
    if (!line.trim()) continue;
    onRow(JSON.parse(line) as RuntimeNodeRow, lineNumber);
  }
}

function uciToMove(uci: string): { from: string; to: string; promotion?: string } {
  return { from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci.length > 4 ? uci.slice(4, 5) : undefined };
}

function normalizeSequenceAndReplay(uciSequence: string[]): { normalizedSequence: string[]; sanLine: string[] } {
  const game = new Chess();
  const normalizedSequence = normalizeRuntimePlaySequenceUci(uciSequence);
  const sanLine: string[] = [];
  for (const uci of normalizedSequence) {
    const move = applyRuntimeUciMove(game, uci);
    if (!move) {
      throw new Error(`runtime_trainable_line_illegal_sequence:${normalizedSequence.join(",")}`);
    }
    sanLine.push(move.san);
  }
  return { normalizedSequence, sanLine };
}

async function main(): Promise<void> {
  const byOpening = new Map<string, GeneratedLine[]>();
  const seenCounts = new Map<string, { raw: number; dirty: number }>();
  const openingIds = STAGE2_RUNTIME_OPENING_IDS as readonly string[];

  await parseJsonl(INPUT_FILE, (row) => {
    const openingId = String(row.openingId ?? "").trim();
    if (!openingId || !openingIds.includes(openingId)) return;
    if (row.ply !== 12) return;
    if (!(Number(row.totalGames) >= 500)) return;

    const playSequenceUci = normalizeRuntimePlaySequenceUci(String(row.playSequenceUci ?? "").split(","));
    const playKey = normalizeRuntimePlayKey(row.playKey ?? playSequenceUci.join(","));
    if (!playSequenceUci.length || !playKey) return;

    const { normalizedSequence, sanLine } = normalizeSequenceAndReplay(playSequenceUci);
    const entry: GeneratedLine = {
      lineId: `${openingId}:runtime:${byOpening.get(openingId)?.length ?? 0}`,
      playKey,
      playSequenceUci: normalizedSequence,
      movesSan: sanLine,
      totalGames: Number(row.totalGames),
    };
    const list = byOpening.get(openingId) ?? [];
    list.push(entry);
    byOpening.set(openingId, list);

    const stats = seenCounts.get(openingId) ?? { raw: 0, dirty: 0 };
    stats.raw += 1;
    const sourcePlayKey = String(row.playKey ?? "");
    const sourcePlaySequence = String(row.playSequenceUci ?? "");
    if (
      sourcePlayKey.includes("e1h1") ||
      sourcePlayKey.includes("e1a1") ||
      sourcePlayKey.includes("e8h8") ||
      sourcePlayKey.includes("e8a8") ||
      sourcePlaySequence.includes("e1h1") ||
      sourcePlaySequence.includes("e1a1") ||
      sourcePlaySequence.includes("e8h8") ||
      sourcePlaySequence.includes("e8a8")
    ) {
      stats.dirty += 1;
    }
    seenCounts.set(openingId, stats);
  });

  for (const openingId of STAGE2_RUNTIME_OPENING_IDS) {
    const lines = byOpening.get(openingId);
    if (!lines || lines.length === 0) {
      throw new Error(`runtime_trainable_opening_missing:${openingId}`);
    }
    lines.sort((a, b) => b.totalGames - a.totalGames || a.playKey.localeCompare(b.playKey));
  }

  const linesByOpening = Object.fromEntries(
    STAGE2_RUNTIME_OPENING_IDS.map((openingId) => [openingId, byOpening.get(openingId) ?? []]),
  );

  const content = `// Auto-generated from data/blundr/stage2-21-opening-stepdown-runtime-v1/runtime/opening-book.nodes.runtime.v1.jsonl.\n` +
    `// Do not edit by hand.\n\n` +
    `export const STAGE2_RUNTIME_TRAINABLE_REPERTOIRE_LINES = ${JSON.stringify(linesByOpening, null, 2)} as const;\n`;

  fs.writeFileSync(OUTPUT_FILE, content);

  const summary = STAGE2_RUNTIME_OPENING_IDS.map((openingId) => ({
    openingId,
    lineCount: byOpening.get(openingId)?.length ?? 0,
    dirtyRows: seenCounts.get(openingId)?.dirty ?? 0,
  }));
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

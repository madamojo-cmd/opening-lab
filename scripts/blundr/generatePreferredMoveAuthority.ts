import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { Chess } from "chess.js";

import {
  PREFERRED_MOVE_AUTHORITY_KEY,
  PREFERRED_MOVE_AUTHORITY_SCHEMA_VERSION,
  PREFERRED_MOVE_STOCKFISH_DEPTH,
  PREFERRED_MOVE_STOCKFISH_MULTIPV,
  PREFERRED_MOVE_STOCKFISH_VERSION,
  selectApprovedStockfishTopTwoMove,
  type PreferredMoveAuthorityEntry,
  type PreferredMoveAuthorityIndex,
} from "@/lib/blundr/openings/preferredMoveAuthority";
import {
  EXPECTED_TRAINING_RUNTIME_IDENTITY,
  loadVerifiedTrainingRuntimePackage,
} from "@/lib/blundr/trainingRuntime/trainingRuntimePackage";
import {
  TRAINING_RUNTIME_FILES,
  TRAINING_RUNTIME_PACKAGE_ROOT,
} from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";
import { buildOpeningTree } from "@/lib/blundr/openings/openingTree";
import { legalContinuationsForColor } from "@/lib/blundr/openings/branchResolver";
import { STAGE2_RUNTIME_TRAINABLE_REPERTOIRES } from "@/lib/blundr/openings/runtimeTrainableRepertoires";

type EngineLine = { rank: 1 | 2; uci: string };
type Group = {
  key: string;
  openingId: string;
  canonicalFen4: string;
  engineFen: string;
  repertoireSide: "white" | "black";
  candidateUcis: Set<string>;
  sourcePlayKeys: Set<string>;
};

function arg(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? null) : null;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function legalMoves(fen: string): Set<string> {
  const chess = new Chess(fen);
  return new Set(
    (chess.moves({ verbose: true }) as Array<{
      from: string;
      to: string;
      promotion?: string;
    }>).map((move) => `${move.from}${move.to}${move.promotion ?? ""}`),
  );
}

function authorityKey(input: {
  openingId: string;
  canonicalFen4: string;
  repertoireSide: "white" | "black";
}): string {
  return `${input.openingId}|${input.canonicalFen4}|${input.repertoireSide}`;
}

class StockfishUciEngine {
  private engine: { listener?: (line: string) => void; sendCommand: (command: string) => void } | null = null;
  private waiters: Array<{
    match: (line: string) => boolean;
    resolve: (line: string) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = [];

  async start(): Promise<void> {
    const require = createRequire(import.meta.url);
    const initEngine = require("stockfish") as (
      enginePath: "lite-single",
    ) => Promise<{ listener?: (line: string) => void; sendCommand: (command: string) => void }>;
    this.engine = await initEngine("lite-single");
    this.engine.listener = (line: string) => this.dispatch(line.trim());
    this.send("uci");
    await this.waitFor((line) => line === "uciok", 10_000);
    this.send(
      `setoption name MultiPV value ${PREFERRED_MOVE_STOCKFISH_MULTIPV}`,
    );
    this.send("isready");
    await this.waitFor((line) => line === "readyok", 10_000);
  }

  async analyze(fen: string): Promise<EngineLine[]> {
    const seen = new Map<number, string>();
    const onLine = (line: string) => {
      const match = /(?:^|\s)multipv\s+([12])\b.*\bpv\s+([a-h][1-8][a-h][1-8][qrbn]?)/.exec(
        line,
      );
      if (match) seen.set(Number(match[1]), match[2].toLowerCase());
    };
    this.send(`position fen ${fen}`);
    this.send(`go depth ${PREFERRED_MOVE_STOCKFISH_DEPTH}`);
    await this.waitFor((line) => {
      onLine(line);
      return line.startsWith("bestmove ");
    }, 30_000);
    return [1, 2]
      .map((rank) => ({ rank: rank as 1 | 2, uci: seen.get(rank) ?? "" }))
      .filter((line) => line.uci);
  }

  close(): void {
    this.send("quit");
    this.engine = null;
  }

  private send(command: string): void {
    this.engine?.sendCommand(command);
  }

  private dispatch(line: string): void {
    if (!line) return;
    for (const waiter of [...this.waiters]) {
      if (!waiter.match(line)) continue;
      this.waiters = this.waiters.filter((entry) => entry !== waiter);
      clearTimeout(waiter.timeout);
      waiter.resolve(line);
      return;
    }
  }

  private waitFor(
    match: (line: string) => boolean,
    timeoutMs: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const waiter = {
        match,
        resolve,
        reject,
        timeout: setTimeout(() => {
          this.waiters = this.waiters.filter((entry) => entry !== waiter);
          reject(new Error("stockfish_timeout"));
        }, timeoutMs),
      };
      this.waiters.push(waiter);
    });
  }
}

async function runtimeArtifactChecksums(packageRoot: string) {
  const checksums: Record<string, string> = {};
  for (const file of [
    TRAINING_RUNTIME_FILES.manifest,
    TRAINING_RUNTIME_FILES.nodes,
    TRAINING_RUNTIME_FILES.candidates,
    TRAINING_RUNTIME_FILES.openingIndex,
    TRAINING_RUNTIME_FILES.openingAvailability,
    TRAINING_RUNTIME_FILES.validationReport,
  ]) {
    checksums[file] = sha256(await readFile(path.join(packageRoot, file), "utf8"));
  }
  return checksums;
}

async function main() {
  const packageRoot = path.resolve(arg("--package-root") ?? TRAINING_RUNTIME_PACKAGE_ROOT);
  const out = path.resolve(
    arg("--out") ??
      "lib/blundr/openings/preferredMoveAuthority.generated.json",
  );
  const runtime = await loadVerifiedTrainingRuntimePackage({
    packageRoot,
    expectedIdentity: EXPECTED_TRAINING_RUNTIME_IDENTITY,
  });
  const groups = new Map<string, Group>();
  let duplicateCandidatesCollapsed = 0;
  let illegalOrMalformedGroups = 0;

  for (const repertoire of STAGE2_RUNTIME_TRAINABLE_REPERTOIRES) {
    const tree = buildOpeningTree(
      repertoire.lines.map((movesSan, index) => ({
        openingId: repertoire.id,
        lineId: `${repertoire.id}:${index}`,
        openingName: repertoire.name,
        sideToTrain: repertoire.color,
        movesSan,
      })),
    );
    const learnerColor = repertoire.color === "black" ? "b" : "w";
    for (const [fen4, nodes] of Object.entries(tree.nodesByFen4)) {
      try {
        const representativeFen = nodes[0]?.fullFen;
        if (!representativeFen) {
          illegalOrMalformedGroups += 1;
          continue;
        }
        legalMoves(representativeFen);
        const continuations = legalContinuationsForColor(
          nodes,
          representativeFen,
          learnerColor,
        );
        if (!continuations.length) continue;
        const key = authorityKey({
          openingId: repertoire.id,
          canonicalFen4: fen4,
          repertoireSide: repertoire.color,
        });
        const group =
          groups.get(key) ??
          {
            key,
            openingId: repertoire.id,
            canonicalFen4: fen4,
            engineFen: representativeFen,
            repertoireSide: repertoire.color,
            candidateUcis: new Set<string>(),
            sourcePlayKeys: new Set<string>(),
          };
        for (const continuation of continuations) {
          if (group.candidateUcis.has(continuation.uci))
            duplicateCandidatesCollapsed += 1;
          group.candidateUcis.add(continuation.uci);
          group.sourcePlayKeys.add(continuation.lineId);
        }
        groups.set(key, group);
      } catch {
        illegalOrMalformedGroups += 1;
      }
    }
  }

  const engine = new StockfishUciEngine();
  await engine.start();
  const entries: PreferredMoveAuthorityEntry[] = [];
  let rankOneSelections = 0;
  let rankTwoSelections = 0;
  let omittedNoApprovedMatch = 0;
  try {
    for (const group of [...groups.values()].sort((a, b) =>
      a.key.localeCompare(b.key),
    )) {
      const topTwo = await engine.analyze(group.engineFen);
      const match = selectApprovedStockfishTopTwoMove({
        approvedCandidateUcis: [...group.candidateUcis],
        topMoves: topTwo,
      });
      if (!match) {
        omittedNoApprovedMatch += 1;
        continue;
      }
      if (match.rank === 1) rankOneSelections += 1;
      else rankTwoSelections += 1;
      entries.push({
        key: group.key,
        openingId: group.openingId,
        canonicalFen4: group.canonicalFen4,
        repertoireSide: group.repertoireSide,
        selectedUci: match.uci,
        stockfishRank: match.rank,
      });
    }
  } finally {
    engine.close();
  }

  const index: PreferredMoveAuthorityIndex = {
    schemaVersion: PREFERRED_MOVE_AUTHORITY_SCHEMA_VERSION,
    authorityKey: PREFERRED_MOVE_AUTHORITY_KEY,
    engine: {
      name: "stockfish",
      version: PREFERRED_MOVE_STOCKFISH_VERSION,
      depth: PREFERRED_MOVE_STOCKFISH_DEPTH,
      multiPv: PREFERRED_MOVE_STOCKFISH_MULTIPV,
    },
    runtime: {
      packageId: runtime.manifest.packageId,
      schemaVersion: runtime.manifest.schemaVersion,
      sourceFiles: runtime.manifest.sourceFiles,
      artifactFiles: {
        ...(await runtimeArtifactChecksums(packageRoot)),
        "lib/blundr/openings/stage2RuntimeTrainableRepertoires.generated.ts":
          sha256(
            await readFile(
              path.resolve(
                "lib/blundr/openings/stage2RuntimeTrainableRepertoires.generated.ts",
              ),
              "utf8",
            ),
          ),
      },
    },
    generatedAt: runtime.manifest.builtAt,
    counts: {
      positionGroupsAnalyzed: groups.size,
      rankOneSelections,
      rankTwoSelections,
      omittedNoApprovedMatch,
      illegalOrMalformedGroups,
      duplicateCandidatesCollapsed,
    },
    openings: STAGE2_RUNTIME_TRAINABLE_REPERTOIRES.map((entry) => entry.id).sort(),
    entries: entries.sort((a, b) => a.key.localeCompare(b.key)),
  };
  await writeFile(out, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(JSON.stringify(index.counts, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

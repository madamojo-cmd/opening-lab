import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildTrainingRuntimePackage } from "../buildTrainingRuntimePackage";
import {
  loadVerifiedTrainingRuntimePackage,
  type ExpectedTrainingRuntimeIdentity,
} from "../trainingRuntimePackage";
import {
  TRAINING_RUNTIME_FILES,
  TRAINING_RUNTIME_SCHEMA_VERSION,
} from "../trainingRuntimeSchema";

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function writeJsonl(file: string, rows: readonly unknown[]): string {
  const raw = `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`;
  fs.writeFileSync(file, raw);
  return raw;
}

test("runtime package build is deterministic and loader fails closed", async () => {
  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "blundr-runtime-package-"),
  );
  try {
    const nodesFile = path.join(tempRoot, "nodes.jsonl");
    const candidatesFile = path.join(tempRoot, "candidates.jsonl");
    const nodesRaw = writeJsonl(nodesFile, [
      {
        nodeId: "root",
        openingId: "test-white",
        displayName: "Test Opening",
        learnerPerspective: "white",
        playKey: "startpos",
        playSequenceUci: "",
        ply: 0,
        sideToMove: "white",
        source: "lichess",
        profileId: "test-profile",
        totalGames: 5_000,
      },
      {
        nodeId: "e4",
        openingId: "test-white",
        displayName: "Test Opening",
        learnerPerspective: "white",
        playKey: "e2e4",
        playSequenceUci: "e2e4",
        ply: 1,
        sideToMove: "black",
        source: "lichess",
        profileId: "test-profile",
        totalGames: 4_000,
      },
    ]);
    const candidatesRaw = writeJsonl(candidatesFile, [
      {
        nodeId: "root",
        openingId: "test-white",
        playKey: "startpos",
        uci: "e2e4",
        san: "e4",
        ply: 0,
        sideToMove: "white",
        source: "lichess",
        profileId: "test-profile",
        totalGames: 4_000,
        playPct: 0.8,
        learnerToMove: true,
        isBookCandidate: true,
      },
      {
        nodeId: "e4",
        openingId: "test-white",
        playKey: "e2e4",
        uci: "e7e5",
        san: "e5",
        ply: 1,
        sideToMove: "black",
        source: "lichess",
        profileId: "test-profile",
        totalGames: 3_000,
        playPct: 0.75,
        learnerToMove: false,
        isBookCandidate: true,
      },
    ]);
    const sourceFiles = {
      openingNodes: {
        fileName: "nodes.jsonl",
        rows: 2,
        sha256: sha256(nodesRaw),
      },
      candidateMoves: {
        fileName: "candidates.jsonl",
        rows: 2,
        sha256: sha256(candidatesRaw),
      },
    };
    const identity: ExpectedTrainingRuntimeIdentity = {
      packageId: "test-runtime",
      schemaVersion: TRAINING_RUNTIME_SCHEMA_VERSION,
      gitSha: "test-sha",
      openingCount: 1,
      maximumPly: 2,
      profileId: "test-profile",
      minimumTotalGames: 500,
      maximumMovesPerParent: 8,
      sourceFiles,
    };
    const outputA = path.join(tempRoot, "output-a");
    const outputB = path.join(tempRoot, "output-b");
    for (const outputRoot of [outputA, outputB]) {
      await buildTrainingRuntimePackage({
        openingNodesFile: nodesFile,
        candidateMovesFile: candidatesFile,
        outputRoot,
        gitSha: identity.gitSha,
        builtAt: "2026-08-03T00:00:00.000Z",
        packageId: identity.packageId,
        profileId: identity.profileId,
        minimumTotalGames: identity.minimumTotalGames,
        maximumMovesPerParent: identity.maximumMovesPerParent,
        maximumPly: identity.maximumPly,
        expectedOpeningCount: identity.openingCount,
        expectedSourceFiles: sourceFiles,
      });
    }
    for (const file of Object.values(TRAINING_RUNTIME_FILES)) {
      assert.equal(
        fs.readFileSync(path.join(outputA, file), "utf8"),
        fs.readFileSync(path.join(outputB, file), "utf8"),
        `nondeterministic:${file}`,
      );
    }
    const loaded = await loadVerifiedTrainingRuntimePackage({
      packageRoot: outputA,
      expectedIdentity: identity,
    });
    assert.equal(loaded.nodes.length, 3);
    assert.equal(loaded.candidates.length, 2);
    assert.equal(loaded.nodes.at(-1)?.ply, 2);

    await assert.rejects(
      loadVerifiedTrainingRuntimePackage({
        packageRoot: outputA,
        expectedIdentity: { ...identity, gitSha: "wrong-sha" },
      }),
      /training_runtime_identity_mismatch:gitSha/,
    );
    fs.appendFileSync(
      path.join(outputA, TRAINING_RUNTIME_FILES.candidates),
      " ",
    );
    await assert.rejects(
      loadVerifiedTrainingRuntimePackage({
        packageRoot: outputA,
        expectedIdentity: identity,
      }),
      /training_runtime_checksum_mismatch:opening-book\.candidates\.runtime\.v1\.jsonl/,
    );
    fs.unlinkSync(path.join(outputB, TRAINING_RUNTIME_FILES.manifest));
    await assert.rejects(
      loadVerifiedTrainingRuntimePackage({
        packageRoot: outputB,
        expectedIdentity: identity,
      }),
      /training_runtime_file_missing:manifest\.json/,
    );
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
});

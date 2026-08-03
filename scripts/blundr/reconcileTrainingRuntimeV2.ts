import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { Chess } from "chess.js";

import { buildTrainingRuntimePackage } from "@/lib/blundr/trainingRuntime/buildTrainingRuntimePackage";
import {
  TRAINING_RUNTIME_BUILD_GIT_SHA,
  TRAINING_RUNTIME_MAX_MOVES_PER_PARENT,
  TRAINING_RUNTIME_MAX_PLY,
  TRAINING_RUNTIME_MIN_TOTAL_GAMES,
  TRAINING_RUNTIME_PROFILE,
} from "@/lib/blundr/trainingRuntime/trainingRuntimeSchema";
import { canonicalRuntimePlayKey } from "@/lib/blundr/trainingRuntime/runtimePlayKey";

const PACKAGE_ID = "blundr-opening-runtime-3.99.v2";
const BUILT_AT = "2026-08-03T00:00:00.000Z";
const V1_OPENING_NODES = {
  fileName: "opening-nodes.v1.jsonl",
  rows: 7_430,
  sha256: "fbc7d750a84b47ccc1e9c0b95d7fd2b511246beda2e65f99b1b5d2caf4ed9512",
};
const V1_CANDIDATE_MOVES = {
  fileName: "candidate-moves.v1.jsonl",
  rows: 170_860,
  sha256: "a8e76805524f256afb90583140f277d734266efb831155c8e9b98f424e5f97d4",
};
const UCI_PATTERN = /^[a-h][1-8][a-h][1-8][qrbn]?$/;

type JsonObject = Record<string, unknown>;

type FetchManifestRow = {
  cached: boolean;
  endpoint: "lichess";
  fetchedAt: string;
  kind: "spine" | "candidate-child";
  moveCount: number;
  openingEco: string | null;
  openingId: string;
  openingName: string | null;
  passesMinGames: boolean;
  playKey: string;
  ply: number;
  profileId: string;
  rawPath: string;
  requestSha1: string;
  requestUrl: string;
  responseSha256: string;
  source: "lichess";
  totalGames: number;
};

type LichessMove = {
  uci: string;
  san: string;
  averageRating: number | null;
  white: number;
  draws: number;
  black: number;
  opening?: { eco?: string; name?: string } | null;
};

type LichessResponse = {
  white: number;
  draws: number;
  black: number;
  moves: LichessMove[];
  opening?: { eco?: string; name?: string } | null;
};

type ValidatedSupplement = {
  manifestRows: FetchManifestRow[];
  responses: Map<string, LichessResponse>;
  spineCoordinates: string[];
  manifestSha256: string;
  summarySha256: string;
};

function arg(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 ? (process.argv[index + 1] ?? null) : null;
}

function requiredArg(name: string): string {
  const value = arg(name);
  if (!value) throw new Error(`missing_required_argument:${name}`);
  return path.resolve(value);
}

function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function sha1(value: string): string {
  return createHash("sha1").update(value).digest("hex");
}

function jsonlRows(raw: string, label: string): JsonObject[] {
  const rows: JsonObject[] = [];
  for (const [index, line] of raw.split("\n").entries()) {
    if (!line.trim()) continue;
    try {
      const row = JSON.parse(line) as unknown;
      if (!row || typeof row !== "object" || Array.isArray(row)) {
        throw new Error("not_object");
      }
      rows.push(row as JsonObject);
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`invalid_jsonl:${label}:${index + 1}:${detail}`);
    }
  }
  return rows;
}

function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index];
    if (quoted) {
      if (character === '"' && raw[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"') {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("invalid_csv:unterminated_quote");
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

function csvObjects(raw: string, label: string): JsonObject[] {
  const [header, ...rows] = parseCsv(raw);
  if (!header?.length) throw new Error(`invalid_csv:${label}:missing_header`);
  return rows
    .filter((row) => row.some(Boolean))
    .map((row, index) => {
      if (row.length !== header.length) {
        throw new Error(`invalid_csv:${label}:${index + 2}:column_count`);
      }
      return Object.fromEntries(
        header.map((key, column) => [key, row[column]]),
      );
    });
}

function integer(value: unknown, label: string): number {
  if (!Number.isInteger(value) || Number(value) < 0) {
    throw new Error(`invalid_nonnegative_integer:${label}`);
  }
  return Number(value);
}

function moveTotal(
  move: Pick<LichessMove, "white" | "draws" | "black">,
): number {
  return move.white + move.draws + move.black;
}

function responseTotal(response: LichessResponse): number {
  return response.white + response.draws + response.black;
}

function splitPlayKey(playKey: string): string[] {
  return playKey === "startpos" ? [] : playKey.split(",");
}

function appendMove(playKey: string, move: string): string {
  return playKey === "startpos" ? move : `${playKey},${move}`;
}

function coordinate(openingId: string, playKey: string): string {
  return `${openingId}::${playKey}`;
}

function buildRequestUrl(playKey: string): string {
  const query = new URLSearchParams();
  query.set("variant", "standard");
  query.set("speeds", "blitz,rapid,classical");
  query.set("ratings", "1200,1400,1600,1800,2000,2200,2500");
  if (playKey !== "startpos") query.set("play", playKey);
  return `https://explorer.lichess.org/lichess?${query.toString()}`;
}

function assertResponseSchema(raw: unknown, label: string): LichessResponse {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`invalid_response_schema:${label}:not_object`);
  }
  const value = raw as JsonObject;
  const response: LichessResponse = {
    white: integer(value.white, `${label}:white`),
    draws: integer(value.draws, `${label}:draws`),
    black: integer(value.black, `${label}:black`),
    moves: [],
    opening:
      value.opening && typeof value.opening === "object"
        ? (value.opening as LichessResponse["opening"])
        : null,
  };
  if (!Array.isArray(value.moves)) {
    throw new Error(`invalid_response_schema:${label}:moves`);
  }
  const position = new Chess();
  for (const uci of splitPlayKey(label.split("::")[1] ?? "")) {
    const replay = position.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
    });
    if (!replay) throw new Error(`invalid_response_position:${label}:${uci}`);
  }
  for (const [index, rawMove] of value.moves.entries()) {
    if (!rawMove || typeof rawMove !== "object" || Array.isArray(rawMove)) {
      throw new Error(`invalid_response_schema:${label}:move:${index}`);
    }
    const source = rawMove as JsonObject;
    const uci = String(source.uci ?? "");
    const san = String(source.san ?? "");
    if (!UCI_PATTERN.test(uci) || !san) {
      throw new Error(
        `invalid_response_schema:${label}:move_identity:${index}`,
      );
    }
    const legalityProbe = new Chess(position.fen());
    const legalMove = legalityProbe.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
    });
    if (!legalMove) throw new Error(`illegal_response_move:${label}:${uci}`);
    if (legalMove.san !== san) {
      throw new Error(
        `response_san_mismatch:${label}:${uci}:${san}:${legalMove.san}`,
      );
    }
    response.moves.push({
      uci,
      san,
      averageRating:
        source.averageRating == null
          ? null
          : integer(source.averageRating, `${label}:averageRating:${index}`),
      white: integer(source.white, `${label}:moveWhite:${index}`),
      draws: integer(source.draws, `${label}:moveDraws:${index}`),
      black: integer(source.black, `${label}:moveBlack:${index}`),
      opening:
        source.opening && typeof source.opening === "object"
          ? (source.opening as LichessMove["opening"])
          : null,
    });
  }
  return response;
}

function assertV1Identity(
  raw: string,
  rows: JsonObject[],
  expected: typeof V1_OPENING_NODES,
): void {
  if (rows.length !== expected.rows) {
    throw new Error(
      `v1_row_count_mismatch:${expected.fileName}:${rows.length}`,
    );
  }
  const actualHash = sha256(raw);
  if (actualHash !== expected.sha256) {
    throw new Error(`v1_checksum_mismatch:${expected.fileName}:${actualHash}`);
  }
}

function targetRows(
  raw: string,
): Array<{ openingId: string; playKey: string }> {
  return csvObjects(raw, "targets").map((row, index) => {
    const openingId = String(row.openingId ?? "").trim();
    const playKey = canonicalRuntimePlayKey(row.playKey);
    if (!openingId || !playKey) throw new Error(`invalid_target:${index + 2}`);
    return { openingId, playKey };
  });
}

function expectedSpines(
  targets: Array<{ openingId: string; playKey: string }>,
  existing: Set<string>,
): Set<string> {
  const expected = new Set<string>();
  for (const target of targets) {
    const moves = splitPlayKey(target.playKey);
    for (let depth = 1; depth <= moves.length; depth += 1) {
      const playKey = moves.slice(0, depth).join(",");
      const key = coordinate(target.openingId, playKey);
      if (!existing.has(key)) expected.add(key);
    }
  }
  return expected;
}

function sortedSet(values: Iterable<string>): string[] {
  return [...values].sort();
}

function assertSameSet(
  label: string,
  actual: Set<string>,
  expected: Set<string>,
): void {
  const actualValues = sortedSet(actual);
  const expectedValues = sortedSet(expected);
  if (JSON.stringify(actualValues) !== JSON.stringify(expectedValues)) {
    throw new Error(
      `${label}_mismatch:${JSON.stringify({ actual: actualValues, expected: expectedValues })}`,
    );
  }
}

async function validateSupplement(input: {
  supplementRoot: string;
  targetFile: string;
  v1Nodes: JsonObject[];
  v1NodeRaw: string;
}): Promise<ValidatedSupplement> {
  const manifestPath = path.join(
    input.supplementRoot,
    "lichess-fetch-manifest.jsonl",
  );
  const summaryPath = path.join(
    input.supplementRoot,
    "lichess-fetch-summary.csv",
  );
  const [manifestRaw, summaryRaw, targetsRaw] = await Promise.all([
    readFile(manifestPath, "utf8"),
    readFile(summaryPath, "utf8"),
    readFile(input.targetFile, "utf8"),
  ]);
  const manifestRows = jsonlRows(
    manifestRaw,
    "supplement-manifest",
  ) as FetchManifestRow[];
  const summaryRows = csvObjects(summaryRaw, "supplement-summary");
  if (manifestRows.length !== summaryRows.length) {
    throw new Error(
      `supplement_summary_count_mismatch:${manifestRows.length}:${summaryRows.length}`,
    );
  }
  const existing = new Set(
    input.v1Nodes
      .filter((row) => row.profileId === TRAINING_RUNTIME_PROFILE)
      .map((row) =>
        coordinate(
          String(row.openingId ?? ""),
          canonicalRuntimePlayKey(row.playKey),
        ),
      ),
  );
  const targets = targetRows(targetsRaw);
  const expectedSpineSet = expectedSpines(targets, existing);
  const manifestCoordinates = new Set<string>();
  const manifestSpines = new Set<string>();
  const responses = new Map<string, LichessResponse>();
  const expectedCandidateChildren = new Set<string>();
  const rawFiles = new Set<string>();

  for (const [index, row] of manifestRows.entries()) {
    const playKey = canonicalRuntimePlayKey(row.playKey);
    const key = coordinate(row.openingId, playKey);
    if (manifestCoordinates.has(key)) {
      throw new Error(`supplement_duplicate_coordinate:${key}`);
    }
    manifestCoordinates.add(key);
    if (row.kind === "spine") manifestSpines.add(key);
    if (row.kind !== "spine" && row.kind !== "candidate-child") {
      throw new Error(`supplement_invalid_kind:${key}:${String(row.kind)}`);
    }
    if (
      row.source !== "lichess" ||
      row.endpoint !== "lichess" ||
      row.profileId !== TRAINING_RUNTIME_PROFILE
    ) {
      throw new Error(`supplement_identity_mismatch:${key}`);
    }
    if (row.ply !== splitPlayKey(playKey).length) {
      throw new Error(`supplement_ply_mismatch:${key}`);
    }
    const requestUrl = buildRequestUrl(playKey);
    const requestSha1 = sha1(requestUrl);
    if (
      row.requestUrl !== requestUrl ||
      row.requestSha1 !== requestSha1 ||
      row.rawPath !== `raw/lichess/${requestSha1}.json`
    ) {
      throw new Error(`supplement_request_identity_mismatch:${key}`);
    }
    const rawPath = path.resolve(input.supplementRoot, row.rawPath);
    if (
      !rawPath.startsWith(`${path.resolve(input.supplementRoot)}${path.sep}`)
    ) {
      throw new Error(`supplement_raw_path_escape:${key}`);
    }
    const rawBuffer = await readFile(rawPath);
    rawFiles.add(path.basename(rawPath));
    const responseHash = sha256(rawBuffer);
    if (responseHash !== row.responseSha256) {
      throw new Error(`supplement_response_checksum_mismatch:${key}`);
    }
    let rawResponse: unknown;
    try {
      rawResponse = JSON.parse(rawBuffer.toString("utf8"));
    } catch (error) {
      throw new Error(
        `supplement_response_json_invalid:${key}:${String(error)}`,
      );
    }
    const response = assertResponseSchema(rawResponse, key);
    responses.set(key, response);
    const totalGames = responseTotal(response);
    if (
      row.totalGames !== totalGames ||
      row.moveCount !== response.moves.length ||
      row.passesMinGames !== totalGames >= TRAINING_RUNTIME_MIN_TOTAL_GAMES
    ) {
      throw new Error(`supplement_response_metadata_mismatch:${key}`);
    }
    const summary = summaryRows[index];
    const expectedSummary = {
      openingId: row.openingId,
      playKey,
      ply: String(row.ply),
      kind: row.kind,
      totalGames: String(row.totalGames),
      passesMinGames: row.passesMinGames ? "True" : "False",
      moveCount: String(row.moveCount),
      responseSha256: row.responseSha256,
      rawPath: row.rawPath,
    };
    for (const [field, value] of Object.entries(expectedSummary)) {
      if (String(summary[field] ?? "") !== value) {
        throw new Error(`supplement_summary_mismatch:${index + 2}:${field}`);
      }
    }
  }

  assertSameSet("supplement_spines", manifestSpines, expectedSpineSet);
  for (const target of targets) {
    if (!manifestSpines.has(coordinate(target.openingId, target.playKey))) {
      throw new Error(
        `supplement_required_target_missing:${target.openingId}:${target.playKey}`,
      );
    }
  }
  for (const key of manifestSpines) {
    const row = manifestRows.find(
      (candidate) => coordinate(candidate.openingId, candidate.playKey) === key,
    )!;
    if (
      !row.passesMinGames ||
      row.totalGames < TRAINING_RUNTIME_MIN_TOTAL_GAMES
    ) {
      throw new Error(
        `supplement_spine_below_minimum:${key}:${row.totalGames}`,
      );
    }
    if (row.ply >= TRAINING_RUNTIME_MAX_PLY) continue;
    const response = responses.get(key)!;
    const candidates = response.moves
      .filter((move) => moveTotal(move) >= TRAINING_RUNTIME_MIN_TOTAL_GAMES)
      .sort(
        (left, right) =>
          moveTotal(right) - moveTotal(left) ||
          left.uci.localeCompare(right.uci),
      )
      .slice(0, TRAINING_RUNTIME_MAX_MOVES_PER_PARENT);
    for (const move of candidates) {
      const childKey = coordinate(
        row.openingId,
        appendMove(row.playKey, move.uci),
      );
      if (!existing.has(childKey)) expectedCandidateChildren.add(childKey);
    }
  }
  const actualCandidateChildren = new Set(
    manifestRows
      .filter((row) => row.kind === "candidate-child")
      .map((row) => coordinate(row.openingId, row.playKey)),
  );
  const expectedNonSpineChildren = new Set(
    [...expectedCandidateChildren].filter((key) => !manifestSpines.has(key)),
  );
  assertSameSet(
    "supplement_candidate_children",
    actualCandidateChildren,
    expectedNonSpineChildren,
  );
  const diskRawFiles = new Set(
    (await readdir(path.join(input.supplementRoot, "raw", "lichess"))).filter(
      (file) => file.endsWith(".json"),
    ),
  );
  assertSameSet("supplement_raw_files", rawFiles, diskRawFiles);
  if (manifestRows.length !== 68 || manifestSpines.size !== 8) {
    throw new Error(
      `supplement_record_count_mismatch:${manifestRows.length}:${manifestSpines.size}`,
    );
  }
  return {
    manifestRows,
    responses,
    spineCoordinates: sortedSet(manifestSpines),
    manifestSha256: sha256(manifestRaw),
    summarySha256: sha256(summaryRaw),
  };
}

function fixed(value: number): number {
  return Number(value.toFixed(4));
}

function nodeIdentity(openingId: string, playKey: string): string {
  return sha1(`blundr-opening-node-v2\u0000${openingId}\u0000${playKey}`);
}

function supplementRows(input: {
  validated: ValidatedSupplement;
  v1Nodes: JsonObject[];
}): { nodes: JsonObject[]; candidates: JsonObject[] } {
  const openingMetadata = new Map<string, JsonObject>();
  for (const row of input.v1Nodes) {
    const openingId = String(row.openingId ?? "");
    if (
      row.profileId === TRAINING_RUNTIME_PROFILE &&
      !openingMetadata.has(openingId)
    ) {
      openingMetadata.set(openingId, row);
    }
  }
  const nodes: JsonObject[] = [];
  const candidates: JsonObject[] = [];
  for (const manifest of input.validated.manifestRows) {
    const key = coordinate(manifest.openingId, manifest.playKey);
    const response = input.validated.responses.get(key)!;
    const metadata = openingMetadata.get(manifest.openingId);
    if (!metadata)
      throw new Error(`supplement_opening_metadata_missing:${key}`);
    const chess = new Chess();
    for (const uci of splitPlayKey(manifest.playKey)) {
      const move = chess.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci[4] as "q" | "r" | "b" | "n" | undefined,
      });
      if (!move) throw new Error(`supplement_node_replay_failed:${key}:${uci}`);
    }
    const sideToMove = chess.turn() === "w" ? "white" : "black";
    const learnerPerspective = String(metadata.learnerPerspective) as
      | "white"
      | "black";
    const nodeId = nodeIdentity(manifest.openingId, manifest.playKey);
    nodes.push({
      nodeId,
      openingId: manifest.openingId,
      displayName: String(metadata.displayName ?? manifest.openingId),
      learnerPerspective,
      playKey: manifest.playKey,
      playSequenceUci: manifest.playKey === "startpos" ? "" : manifest.playKey,
      ply: manifest.ply,
      sideToMove,
      source: "lichess",
      profileId: TRAINING_RUNTIME_PROFILE,
      whiteWins: response.white,
      draws: response.draws,
      blackWins: response.black,
      totalGames: responseTotal(response),
      openingEco: manifest.openingEco,
      openingName: manifest.openingName,
      trainerCutoff: manifest.ply >= TRAINING_RUNTIME_MAX_PLY,
      needsLichessData: false,
      fetchedAt: manifest.fetchedAt,
      rawPath: `release-inputs/lichess-v2-supplement/${manifest.rawPath}`,
      supplementManifestSha256: input.validated.manifestSha256,
      supplementResponseSha256: manifest.responseSha256,
    });
    const parentTotal = responseTotal(response);
    for (const move of response.moves) {
      const totalGames = moveTotal(move);
      const decisiveGames = move.white + move.black;
      const learnerToMove = sideToMove === learnerPerspective;
      candidates.push({
        nodeId,
        openingId: manifest.openingId,
        displayName: String(metadata.displayName ?? manifest.openingId),
        learnerPerspective,
        sideToMove,
        ply: manifest.ply,
        playKey: manifest.playKey,
        source: "lichess",
        profileId: TRAINING_RUNTIME_PROFILE,
        uci: move.uci,
        san: move.san,
        whiteWins: move.white,
        draws: move.draws,
        blackWins: move.black,
        totalGames,
        playPct: parentTotal > 0 ? fixed(totalGames / parentTotal) : 0,
        whiteScorePct:
          decisiveGames > 0 ? fixed(move.white / decisiveGames) : 0,
        blackScorePct:
          decisiveGames > 0 ? fixed(move.black / decisiveGames) : 0,
        sideToMoveScorePct:
          decisiveGames > 0
            ? fixed(
                (sideToMove === "white" ? move.white : move.black) /
                  decisiveGames,
              )
            : 0,
        averageRating: move.averageRating,
        averageOpponentRating: null,
        performance: null,
        openingEco: move.opening?.eco ?? null,
        openingName: move.opening?.name ?? null,
        learnerToMove,
        isBookCandidate: totalGames >= TRAINING_RUNTIME_MIN_TOTAL_GAMES,
        blundrUse:
          totalGames >= TRAINING_RUNTIME_MIN_TOTAL_GAMES
            ? learnerToMove
              ? "learner_candidate_data"
              : "opponent_reply"
            : "rare_but_track",
        supplementManifestSha256: input.validated.manifestSha256,
        supplementResponseSha256: manifest.responseSha256,
      });
    }
  }
  nodes.sort(
    (left, right) =>
      String(left.openingId).localeCompare(String(right.openingId)) ||
      Number(left.ply) - Number(right.ply) ||
      String(left.playKey).localeCompare(String(right.playKey)),
  );
  candidates.sort(
    (left, right) =>
      String(left.openingId).localeCompare(String(right.openingId)) ||
      String(left.playKey).localeCompare(String(right.playKey)) ||
      String(left.uci).localeCompare(String(right.uci)),
  );
  return { nodes, candidates };
}

function appendJsonl(raw: string, rows: JsonObject[]): string {
  const prefix = raw.endsWith("\n") ? raw : `${raw}\n`;
  return `${prefix}${rows.map((row) => JSON.stringify(row)).join("\n")}\n`;
}

async function main(): Promise<void> {
  const openingNodesV1 = requiredArg("--nodes-v1");
  const candidateMovesV1 = requiredArg("--candidates-v1");
  const targets = requiredArg("--targets");
  const supplementRoot = requiredArg("--supplement");
  const openingNodesV2 = requiredArg("--nodes-v2");
  const candidateMovesV2 = requiredArg("--candidates-v2");
  const outputRoot = requiredArg("--out");
  const reportPath = path.resolve(
    arg("--report") ??
      path.join(
        path.dirname(openingNodesV2),
        "runtime-v2-reconciliation-report.json",
      ),
  );
  const gitSha = arg("--git-sha") ?? TRAINING_RUNTIME_BUILD_GIT_SHA;
  const [v1NodeRaw, v1CandidateRaw] = await Promise.all([
    readFile(openingNodesV1, "utf8"),
    readFile(candidateMovesV1, "utf8"),
  ]);
  const v1Nodes = jsonlRows(v1NodeRaw, V1_OPENING_NODES.fileName);
  const v1Candidates = jsonlRows(v1CandidateRaw, V1_CANDIDATE_MOVES.fileName);
  assertV1Identity(v1NodeRaw, v1Nodes, V1_OPENING_NODES);
  assertV1Identity(v1CandidateRaw, v1Candidates, V1_CANDIDATE_MOVES);
  const validated = await validateSupplement({
    supplementRoot,
    targetFile: targets,
    v1Nodes,
    v1NodeRaw,
  });
  const supplement = supplementRows({ validated, v1Nodes });
  const v2NodeRaw = appendJsonl(v1NodeRaw, supplement.nodes);
  const v2CandidateRaw = appendJsonl(v1CandidateRaw, supplement.candidates);
  await Promise.all([
    mkdir(path.dirname(openingNodesV2), { recursive: true }),
    mkdir(path.dirname(candidateMovesV2), { recursive: true }),
    mkdir(path.dirname(reportPath), { recursive: true }),
  ]);
  await Promise.all([
    writeFile(openingNodesV2, v2NodeRaw),
    writeFile(candidateMovesV2, v2CandidateRaw),
  ]);
  const sourceFiles = {
    openingNodes: {
      fileName: "opening-nodes.v2.jsonl",
      rows: v1Nodes.length + supplement.nodes.length,
      sha256: sha256(v2NodeRaw),
    },
    candidateMoves: {
      fileName: "candidate-moves.v2.jsonl",
      rows: v1Candidates.length + supplement.candidates.length,
      sha256: sha256(v2CandidateRaw),
    },
  };
  const build = await buildTrainingRuntimePackage({
    openingNodesFile: openingNodesV2,
    candidateMovesFile: candidateMovesV2,
    outputRoot,
    gitSha,
    builtAt: BUILT_AT,
    packageId: PACKAGE_ID,
    expectedSourceFiles: sourceFiles,
  });
  const report = {
    schemaVersion: "blundr-runtime-v2-reconciliation-report.v1",
    valid: true,
    packageId: PACKAGE_ID,
    gitSha,
    v1Sources: {
      openingNodes: V1_OPENING_NODES,
      candidateMoves: V1_CANDIDATE_MOVES,
    },
    supplement: {
      manifestRows: validated.manifestRows.length,
      manifestSha256: validated.manifestSha256,
      summarySha256: validated.summarySha256,
      responseRecords: validated.responses.size,
      responseChecksumsVerified: validated.responses.size,
      requiredSpinePositions: validated.spineCoordinates,
      requiredSpineCount: validated.spineCoordinates.length,
      rejectedRecords: [],
    },
    v2Sources: sourceFiles,
    appendedRows: {
      openingNodes: supplement.nodes.length,
      candidateMoves: supplement.candidates.length,
    },
    runtime: {
      acceptedCounts: build.manifest.acceptedCounts,
      files: build.manifest.files,
      validation: build.validationReport,
    },
  };
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});

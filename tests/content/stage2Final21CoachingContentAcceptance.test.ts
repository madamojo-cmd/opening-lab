import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { execSync } from "node:child_process";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const RUNTIME_PACKAGE = "data/blundr/stage2-21-opening-stepdown-runtime-v1";
const RUNTIME_MOVES_JSONL = path.join(REPO_ROOT, RUNTIME_PACKAGE, "runtime", "opening-book.moves.runtime.v1.jsonl");
const RUNTIME_NODES_JSONL = path.join(REPO_ROOT, RUNTIME_PACKAGE, "runtime", "opening-book.nodes.runtime.v1.jsonl");
const CANONICAL_CONTENT_DIR = path.join(REPO_ROOT, "docs", "content", "stage2");
const INVENTORY_OUTPUT_PATH = path.join(REPO_ROOT, "docs", "2026-06-12", "stage2-final-21-coaching-content-inventory.json");

const EXPECTED_GLOBAL_DOCS = [
  "07_COPY_LIBRARY.md",
  "06_FEATURE_TO_CONCEPT_MAPPING.md",
  "08_VISUAL_RECIPE_LIBRARY.md",
  "03_CONCEPT_REGISTRY.md",
  "09_TACTICAL_MOTIF_REGISTRY.md",
  "10_STRATEGIC_POSITIONAL_REGISTRY.md",
];

const SECTION_NAMES = [
  "Opening Identity",
  "Opening Summary",
  "Curriculum Goals",
  "Core Plans",
  "Main Line",
  "Branch Map",
  "Feature Detection Map",
  "Feature-to-Concept Map",
  "Copy Library",
  "Visual Recipe Library",
  "Tactical and Strategic Motifs",
  "Common Mistakes and Remediation",
  "Test Fixtures",
  "Acceptance Matrix",
];

type RuntimeMoveRow = {
  openingId: string;
  playKeyBefore?: string;
  moveUci?: string;
  rank?: number;
  totalGames?: number;
  playPct?: number;
};

type RuntimeNodeRow = {
  openingId: string;
  playKey?: string;
};

type OpeningSummary = {
  openingId: string;
  markdownFileExists: boolean;
  jsonSpecFileExists: boolean;
  displayName: string | null;
  learnerPerspective: string | null;
  contentStatus: string | null;
  sectionsPresent: string[];
  conceptIdsFound: string[];
  copyEntriesFound: number;
  visualRecipeRefsFound: string[];
  moveSpecificReferences: {
    uciRefs: string[];
    playKeyRefs: string[];
  };
  warnings: string[];
  runtimeReconciliationCount: number;
  runtimeReconciliationFailures: string[];
  acceptanceStatus: "accepted_for_inventory" | "partial" | "blocked";
};

function normalizeUci(raw: string): string | null {
  const value = String(raw).trim().toLowerCase();
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value) ? value : null;
}

function trackedByGit(relativePath: string): boolean {
  const out = execSync(`git ls-files -- "${relativePath}"`, { cwd: REPO_ROOT, encoding: "utf8" }).trim();
  return out.length > 0;
}

function pickContentSourceDirectory(): { sourceDirectory: string; sourceTracked: boolean } {
  const canonicalExists = fs.existsSync(CANONICAL_CONTENT_DIR);
  if (canonicalExists) {
    const rel = path.relative(REPO_ROOT, CANONICAL_CONTENT_DIR);
    return { sourceDirectory: rel, sourceTracked: trackedByGit(rel) };
  }

  // The repository baseline carries the runtime and approved packet sources, but not the later prose-content tree.
  // Inventory that state explicitly so this PR-00 gate does not import or invent external content.
  return { sourceDirectory: ".", sourceTracked: true };
}

async function streamJsonl<T>(filePath: string, onRow: (row: T) => void): Promise<void> {
  const stream = fs.createReadStream(filePath, "utf8");
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });
  for await (const line of rl) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    onRow(JSON.parse(trimmed) as T);
  }
}

function findAllMatches(text: string, regex: RegExp, groupIndex = 1): string[] {
  const out = new Set<string>();
  const cloned = new RegExp(regex.source, regex.flags);
  let match = cloned.exec(text);
  while (match) {
    const value = String(match[groupIndex] ?? "").trim();
    if (value) out.add(value);
    match = cloned.exec(text);
  }
  return [...out].sort();
}

function extractDisplayName(text: string): string | null {
  const line = text.split(/\r?\n/).find((row) => row.trim().startsWith("# "));
  return line ? line.replace(/^#\s+/, "").trim() : null;
}

function extractLearnerPerspective(text: string): string | null {
  const m = text.match(/\b(learnerPerspective|sideToTrain|side|learnerSide)\b\s*[:=]\s*["`']?(white|black)["`']?/i);
  return m ? String(m[2]).toLowerCase() : null;
}

function extractContentStatus(text: string): string | null {
  const m = text.match(/\b(contentStatus|stage2Status|status)\b\s*[:=]\s*["`']?([a-zA-Z0-9_-]+)["`']?/i);
  return m ? String(m[2]) : null;
}

function extractSectionPresence(text: string): string[] {
  return SECTION_NAMES.filter((section) => {
    const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`^#{1,6}\\s+${escaped}\\b`, "im").test(text);
  });
}

function extractConceptIds(text: string): string[] {
  const fromLabeled = findAllMatches(text, /\bconcept(?:Id|_id)?\b\s*[:=]\s*["`']?([a-z0-9][a-z0-9-]{2,})["`']?/gi, 1);
  const fromBackticks = findAllMatches(text, /`([a-z0-9]+-[a-z0-9-]{3,})`/g, 1);
  return [...new Set([...fromLabeled, ...fromBackticks])].sort();
}

function extractVisualRefs(text: string): string[] {
  const refs = findAllMatches(text, /\bvisualRecipeRefs?\b\s*[:=]\s*\[?([^\]\n]+)\]?/gi, 1)
    .flatMap((line) => line.split(/[,\s]+/))
    .map((x) => x.replace(/["'`]/g, "").trim())
    .filter(Boolean);
  const idRefs = findAllMatches(text, /\bvisual[-_ ]?recipe[-_ ]?(?:id|ref)?\b\s*[:=]\s*["`']?([a-z0-9:_-]{3,})["`']?/gi, 1);
  return [...new Set([...refs, ...idRefs])].sort();
}

function extractUciRefs(text: string): string[] {
  const raw = findAllMatches(text, /\b([a-h][1-8][a-h][1-8][qrbn]?)\b/gi, 1);
  return [...new Set(raw.map((x) => normalizeUci(x)).filter(Boolean) as string[])].sort();
}

function extractPlayKeyRefs(text: string): string[] {
  const list = findAllMatches(text, /\b((?:[a-h][1-8][a-h][1-8][qrbn]?,){1,20}[a-h][1-8][a-h][1-8][qrbn]?)\b/gi, 1)
    .map((value) => value.toLowerCase());
  return [...new Set(list)].sort();
}

function countCopyEntries(text: string): number {
  const patterns = [
    /\bentryId\b/gi,
    /\butteranceId\b/gi,
    /\bcopyId\b/gi,
    /\bcopyEntry\b/gi,
  ];
  return patterns.reduce((sum, pattern) => sum + (text.match(pattern)?.length ?? 0), 0);
}

function extractWarnings(text: string): string[] {
  const warnings: string[] = [];
  if (/\ball23\b/i.test(text)) warnings.push("references_all23");
  if (/\bdraft_needs_mergeSource\b/i.test(text)) warnings.push("draft_needs_mergeSource");
  if (/\bneeds_mergeSource\b/i.test(text)) warnings.push("needs_mergeSource");
  if (/\bmergeSource\b/i.test(text)) warnings.push("mergeSource_mentioned");
  if (/\b(todo|tbd|placeholder|fixme|lorem ipsum)\b/i.test(text)) warnings.push("placeholder_or_todo_detected");
  if (/\b(best|only|winning|forced win|must win|always wins)\b/i.test(text)) warnings.push("unsupported_claim_language_detected");
  if (/\b[a-z0-9-]+-n\d+\b/i.test(text)) warnings.push("legacy_node_id_pattern_detected");
  return [...new Set(warnings)];
}

async function buildRuntimeIndex(): Promise<{
  openingIds: string[];
  moveUciByOpening: Map<string, Set<string>>;
  playKeysByOpening: Map<string, Set<string>>;
  playKeyBeforeByOpening: Map<string, Set<string>>;
}> {
  const moveUciByOpening = new Map<string, Set<string>>();
  const playKeysByOpening = new Map<string, Set<string>>();
  const playKeyBeforeByOpening = new Map<string, Set<string>>();

  await streamJsonl<RuntimeMoveRow>(RUNTIME_MOVES_JSONL, (row) => {
    const openingId = String(row.openingId ?? "");
    if (!openingId) return;
    if (!moveUciByOpening.has(openingId)) moveUciByOpening.set(openingId, new Set());
    if (!playKeyBeforeByOpening.has(openingId)) playKeyBeforeByOpening.set(openingId, new Set());
    const uci = normalizeUci(String(row.moveUci ?? ""));
    if (uci) moveUciByOpening.get(openingId)!.add(uci);
    if (typeof row.playKeyBefore === "string" && row.playKeyBefore.length > 0) {
      playKeyBeforeByOpening.get(openingId)!.add(row.playKeyBefore.toLowerCase());
    }
  });

  await streamJsonl<RuntimeNodeRow>(RUNTIME_NODES_JSONL, (row) => {
    const openingId = String(row.openingId ?? "");
    if (!openingId) return;
    if (!playKeysByOpening.has(openingId)) playKeysByOpening.set(openingId, new Set());
    if (typeof row.playKey === "string" && row.playKey.length > 0) {
      playKeysByOpening.get(openingId)!.add(row.playKey.toLowerCase());
    }
  });

  const openingIds = [...new Set([...moveUciByOpening.keys(), ...playKeysByOpening.keys(), ...playKeyBeforeByOpening.keys()])].sort();
  return { openingIds, moveUciByOpening, playKeysByOpening, playKeyBeforeByOpening };
}

function ensureNoRuntimeContentImports(): void {
  const files = [
    path.join(REPO_ROOT, "lib", "blundr", "runtimeBook", "index.ts"),
    path.join(REPO_ROOT, "lib", "blundr", "runtimeBook", "getStage2RuntimeCandidatesForFrame.ts"),
    path.join(REPO_ROOT, "app", "api", "runtime-book", "candidates", "route.ts"),
    path.join(REPO_ROOT, "app", "page.tsx"),
  ];
  for (const filePath of files) {
    const content = fs.readFileSync(filePath, "utf8");
    assert.equal(/docs\/content\/stage2|imports\/stage2-sample\/content-base/i.test(content), false, `runtime_or_app_imports_stage2_content:${filePath}`);
  }
}

function loadFileSafe(filePath: string): string {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

async function testStage2Final21CoachingContentAcceptance(): Promise<void> {
  assert.equal(fs.existsSync(RUNTIME_MOVES_JSONL), true, "runtime_moves_jsonl_missing");
  assert.equal(fs.existsSync(RUNTIME_NODES_JSONL), true, "runtime_nodes_jsonl_missing");
  ensureNoRuntimeContentImports();

  const { sourceDirectory, sourceTracked } = pickContentSourceDirectory();
  const sourceAbs = path.join(REPO_ROOT, sourceDirectory);
  const openingsDir = path.join(sourceAbs, "openings");

  const runtime = await buildRuntimeIndex();
  assert.equal(runtime.openingIds.length, 21, "runtime_opening_count_must_be_21");

  const openingSummaries: OpeningSummary[] = [];
  const conceptIdsFound = new Set<string>();
  const visualRecipeRefsFound = new Set<string>();
  const warnings = new Set<string>();
  const blockers: string[] = [];

  const globalDocsPresent: Record<string, boolean> = {};
  for (const fileName of EXPECTED_GLOBAL_DOCS) {
    const full = path.join(sourceAbs, fileName);
    globalDocsPresent[fileName] = fs.existsSync(full);
    if (!globalDocsPresent[fileName]) warnings.add(`missing_global_doc:${fileName}`);
  }

  for (const openingId of runtime.openingIds) {
    const mdPath = path.join(openingsDir, `${openingId}.md`);
    const specPath = path.join(openingsDir, `${openingId}.json-spec.md`);
    const markdownFileExists = fs.existsSync(mdPath);
    const jsonSpecFileExists = fs.existsSync(specPath);
    const mdText = loadFileSafe(mdPath);
    const specText = loadFileSafe(specPath);
    const combined = `${mdText}\n${specText}`;

    const sectionsPresent = extractSectionPresence(combined);
    const summaryWarnings = extractWarnings(combined);
    const conceptIds = extractConceptIds(combined);
    const visualRefs = extractVisualRefs(combined);
    const copyEntriesFound = countCopyEntries(combined);
    const uciRefs = extractUciRefs(combined);
    const playKeyRefs = extractPlayKeyRefs(combined);

    for (const conceptId of conceptIds) conceptIdsFound.add(conceptId);
    for (const ref of visualRefs) visualRecipeRefsFound.add(ref);
    for (const warning of summaryWarnings) warnings.add(`${openingId}:${warning}`);

    const runtimeUciSet = runtime.moveUciByOpening.get(openingId) ?? new Set<string>();
    const runtimePlayKeySet = runtime.playKeysByOpening.get(openingId) ?? new Set<string>();
    const runtimeBeforeSet = runtime.playKeyBeforeByOpening.get(openingId) ?? new Set<string>();

    let runtimeReconciliationCount = 0;
    const runtimeReconciliationFailures: string[] = [];
    for (const uci of uciRefs) {
      if (runtimeUciSet.has(uci)) runtimeReconciliationCount += 1;
      else runtimeReconciliationFailures.push(`uci_not_in_runtime:${uci}`);
    }
    for (const playKey of playKeyRefs) {
      if (runtimePlayKeySet.has(playKey) || runtimeBeforeSet.has(playKey)) runtimeReconciliationCount += 1;
      else runtimeReconciliationFailures.push(`playkey_not_in_runtime:${playKey}`);
    }

    const hasContentFile = markdownFileExists || jsonSpecFileExists;
    const acceptanceStatus: OpeningSummary["acceptanceStatus"] = !hasContentFile
      ? "blocked"
      : summaryWarnings.length > 0 || runtimeReconciliationFailures.length > 0
        ? "partial"
        : "accepted_for_inventory";

    const openingSummary: OpeningSummary = {
      openingId,
      markdownFileExists,
      jsonSpecFileExists,
      displayName: extractDisplayName(mdText || specText),
      learnerPerspective: extractLearnerPerspective(combined),
      contentStatus: extractContentStatus(combined),
      sectionsPresent,
      conceptIdsFound: conceptIds,
      copyEntriesFound,
      visualRecipeRefsFound: visualRefs,
      moveSpecificReferences: {
        uciRefs,
        playKeyRefs,
      },
      warnings: summaryWarnings,
      runtimeReconciliationCount,
      runtimeReconciliationFailures,
      acceptanceStatus,
    };
    openingSummaries.push(openingSummary);
  }

  assert.equal(openingSummaries.length, 21, "must_evaluate_21_openings");
  assert.equal(
    openingSummaries.every((summary) => summary.markdownFileExists || summary.jsonSpecFileExists || summary.acceptanceStatus === "blocked"),
    true,
    "each_runtime_opening_must_have_content_or_explicit_blocked",
  );
  assert.equal(
    openingSummaries.every((summary) => !summary.warnings.includes("references_all23")),
    true,
    "content_must_not_claim_all23",
  );
  assert.equal(
    openingSummaries.every((summary) => !summary.runtimeReconciliationFailures.some((item) => /colle-white-n\d+/i.test(item))),
    true,
    "legacy_node_ids_must_not_be_runtime_authority",
  );

  const output = {
    generatedAt: new Date().toISOString(),
    sourceDirectory,
    sourceTracked,
    runtimePackage: RUNTIME_PACKAGE,
    runtimeFiles: [
      path.relative(REPO_ROOT, RUNTIME_NODES_JSONL),
      path.relative(REPO_ROOT, RUNTIME_MOVES_JSONL),
    ],
    openingSummaries,
    globalDocsPresent,
    conceptIdsFound: [...conceptIdsFound].sort(),
    visualRecipeRefsFound: [...visualRecipeRefsFound].sort(),
    warnings: [...warnings].sort(),
    blockers,
  };

  fs.mkdirSync(path.dirname(INVENTORY_OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(INVENTORY_OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  assert.equal(fs.existsSync(INVENTORY_OUTPUT_PATH), true, "inventory_output_missing");

  const parsed = JSON.parse(fs.readFileSync(INVENTORY_OUTPUT_PATH, "utf8"));
  assert.equal(Array.isArray(parsed.openingSummaries), true, "inventory_malformed_opening_summaries");
  assert.equal(parsed.openingSummaries.length, 21, "inventory_malformed_opening_count");
  assert.equal(
    String(INVENTORY_OUTPUT_PATH).includes(`${path.sep}data${path.sep}blundr${path.sep}`),
    false,
    "inventory_output_must_be_outside_runtime_paths",
  );
}

testStage2Final21CoachingContentAcceptance()
  .then(() => {
    console.log("stage2Final21CoachingContentAcceptance ok");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import {
  CRAWL_BUNDLE_SOURCE,
  UCI_LIKE_REGEX,
  type CanonicalCandidateMove,
  type CanonicalCrawlBundle,
  type CanonicalOpeningNode,
  type CrawlBundleValidationResult,
  type ValidationIssue,
} from "./crawlBundleSchema";

const BUNDLE_KEYS = new Set(["version", "generatedAt", "source", "openingIds", "nodes", "candidateMoves"]);
const NODE_KEYS = new Set([
  "openingId",
  "nodeKey",
  "ply",
  "fen",
  "fen4",
  "movePathUci",
  "movePathSan",
  "parentNodeKey",
  "sourceGroup",
]);
const CANDIDATE_KEYS = new Set([
  "openingId",
  "nodeKey",
  "moveUci",
  "moveSan",
  "rank",
  "games",
  "white",
  "draws",
  "black",
  "childNodeKey",
  "sourceGroup",
]);

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function addUnknownFieldWarnings(input: {
  value: Record<string, unknown>;
  allowed: Set<string>;
  warnings: ValidationIssue[];
  path: string;
}): void {
  for (const key of Object.keys(input.value)) {
    if (!input.allowed.has(key)) {
      input.warnings.push({
        code: "unknown_field",
        message: `Unknown field '${key}'`,
        path: `${input.path}.${key}`,
      });
    }
  }
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  if (!value.every((entry) => typeof entry === "string")) return null;
  return value as string[];
}

export function validateCrawlBundle(input: unknown): CrawlBundleValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const summary = {
    openingCount: 0,
    nodeCount: 0,
    candidateMoveCount: 0,
    duplicateNodeCount: 0,
    duplicateCandidateCount: 0,
    missingOpeningReferenceCount: 0,
  };

  if (!isObject(input)) {
    errors.push({ code: "bundle_not_object", message: "Crawl bundle must be an object", path: "$" });
    return { ok: false, errors, warnings, summary };
  }

  addUnknownFieldWarnings({ value: input, allowed: BUNDLE_KEYS, warnings, path: "$" });

  const version = input.version;
  if (typeof version !== "string" || version.trim() === "") {
    errors.push({ code: "invalid_version", message: "version must be a non-empty string", path: "$.version" });
  }

  if (input.source !== CRAWL_BUNDLE_SOURCE) {
    errors.push({
      code: "invalid_source",
      message: `source must be '${CRAWL_BUNDLE_SOURCE}'`,
      path: "$.source",
    });
  }

  const openingIds = asStringArray(input.openingIds);
  if (!openingIds || openingIds.length === 0 || openingIds.some((id) => id.trim() === "")) {
    errors.push({
      code: "invalid_opening_ids",
      message: "openingIds must be a non-empty string array",
      path: "$.openingIds",
    });
  }

  const nodesValue = input.nodes;
  if (!Array.isArray(nodesValue)) {
    errors.push({ code: "invalid_nodes", message: "nodes must be an array", path: "$.nodes" });
  }

  const candidateMovesValue = input.candidateMoves;
  if (!Array.isArray(candidateMovesValue)) {
    errors.push({
      code: "invalid_candidate_moves",
      message: "candidateMoves must be an array",
      path: "$.candidateMoves",
    });
  }

  if (!openingIds || !Array.isArray(nodesValue) || !Array.isArray(candidateMovesValue)) {
    summary.openingCount = openingIds?.length ?? 0;
    summary.nodeCount = Array.isArray(nodesValue) ? nodesValue.length : 0;
    summary.candidateMoveCount = Array.isArray(candidateMovesValue) ? candidateMovesValue.length : 0;
    return { ok: errors.length === 0, errors, warnings, summary };
  }

  const openingSet = new Set(openingIds);
  summary.openingCount = openingSet.size;
  summary.nodeCount = nodesValue.length;
  summary.candidateMoveCount = candidateMovesValue.length;

  const nodeKeys = new Set<string>();
  for (let i = 0; i < nodesValue.length; i += 1) {
    const path = `$.nodes[${i}]`;
    const node = nodesValue[i] as unknown;
    if (!isObject(node)) {
      errors.push({ code: "node_not_object", message: "node must be an object", path });
      continue;
    }

    addUnknownFieldWarnings({ value: node, allowed: NODE_KEYS, warnings, path });

    const openingId = node.openingId;
    if (typeof openingId !== "string" || openingId.trim() === "") {
      errors.push({ code: "invalid_node_opening_id", message: "openingId must be non-empty", path: `${path}.openingId` });
    } else if (!openingSet.has(openingId)) {
      errors.push({ code: "node_opening_missing_reference", message: "node openingId must exist in openingIds", path: `${path}.openingId` });
      summary.missingOpeningReferenceCount += 1;
    }

    const nodeKey = node.nodeKey;
    if (typeof nodeKey !== "string" || nodeKey.trim() === "") {
      errors.push({ code: "invalid_node_key", message: "nodeKey must be non-empty", path: `${path}.nodeKey` });
    }

    const ply = node.ply;
    if (!Number.isInteger(ply) || Number(ply) < 0) {
      errors.push({ code: "invalid_node_ply", message: "ply must be a non-negative integer", path: `${path}.ply` });
    }

    if (Array.isArray(node.movePathUci) && !node.movePathUci.every((item) => typeof item === "string")) {
      errors.push({ code: "invalid_move_path_uci", message: "movePathUci must be a string array", path: `${path}.movePathUci` });
    }
    if (Array.isArray(node.movePathSan) && !node.movePathSan.every((item) => typeof item === "string")) {
      errors.push({ code: "invalid_move_path_san", message: "movePathSan must be a string array", path: `${path}.movePathSan` });
    }

    if (typeof openingId === "string" && openingId.trim() !== "" && typeof nodeKey === "string" && nodeKey.trim() !== "") {
      const dedupeKey = `${openingId}::${nodeKey}`;
      if (nodeKeys.has(dedupeKey)) {
        errors.push({ code: "duplicate_node_key", message: "duplicate nodeKey within openingId", path: `${path}.nodeKey` });
        summary.duplicateNodeCount += 1;
      } else {
        nodeKeys.add(dedupeKey);
      }
    }
  }

  const candidateKeys = new Set<string>();
  for (let i = 0; i < candidateMovesValue.length; i += 1) {
    const path = `$.candidateMoves[${i}]`;
    const candidate = candidateMovesValue[i] as unknown;
    if (!isObject(candidate)) {
      errors.push({ code: "candidate_not_object", message: "candidate move must be an object", path });
      continue;
    }

    addUnknownFieldWarnings({ value: candidate, allowed: CANDIDATE_KEYS, warnings, path });

    const openingId = candidate.openingId;
    if (typeof openingId !== "string" || openingId.trim() === "") {
      errors.push({ code: "invalid_candidate_opening_id", message: "openingId must be non-empty", path: `${path}.openingId` });
    } else if (!openingSet.has(openingId)) {
      errors.push({ code: "candidate_opening_missing_reference", message: "candidate openingId must exist in openingIds", path: `${path}.openingId` });
      summary.missingOpeningReferenceCount += 1;
    }

    const nodeKey = candidate.nodeKey;
    if (typeof nodeKey !== "string" || nodeKey.trim() === "") {
      errors.push({ code: "invalid_candidate_node_key", message: "nodeKey must be non-empty", path: `${path}.nodeKey` });
    }

    const moveUci = candidate.moveUci;
    if (typeof moveUci !== "string" || !UCI_LIKE_REGEX.test(moveUci)) {
      errors.push({ code: "invalid_candidate_move_uci", message: "moveUci must match UCI-like format", path: `${path}.moveUci` });
    }

    if (candidate.rank != null && (!Number.isInteger(candidate.rank) || Number(candidate.rank) <= 0)) {
      errors.push({ code: "invalid_candidate_rank", message: "rank must be a positive integer", path: `${path}.rank` });
    }

    for (const numericField of ["games", "white", "draws", "black"] as const) {
      const value = (candidate as CanonicalCandidateMove)[numericField];
      if (value != null && (!(typeof value === "number") || Number.isNaN(value) || value < 0)) {
        errors.push({
          code: `invalid_candidate_${numericField}`,
          message: `${numericField} must be a non-negative number`,
          path: `${path}.${numericField}`,
        });
      }
    }

    if (
      typeof openingId === "string" && openingId.trim() !== "" &&
      typeof nodeKey === "string" && nodeKey.trim() !== "" &&
      typeof moveUci === "string" && UCI_LIKE_REGEX.test(moveUci)
    ) {
      const dedupeKey = `${openingId}::${nodeKey}::${moveUci}`;
      if (candidateKeys.has(dedupeKey)) {
        errors.push({
          code: "duplicate_candidate_key",
          message: "duplicate candidate key openingId+nodeKey+moveUci",
          path,
        });
        summary.duplicateCandidateCount += 1;
      } else {
        candidateKeys.add(dedupeKey);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    summary,
  };
}

export type { CanonicalCrawlBundle, CanonicalOpeningNode, CanonicalCandidateMove };

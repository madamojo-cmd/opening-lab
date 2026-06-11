import { UCI_LIKE_REGEX, type ValidationIssue } from "./crawlBundleSchema";
import {
  COPY_BUNDLE_SOURCE,
  type CopyBundle,
  type CopyBundleValidationResult,
  type CopyDifficulty,
  type CopyEntry,
  type CopyStatus,
  type CopySurface,
} from "./copyBundleSchema";

const BUNDLE_KEYS = new Set(["version", "generatedAt", "locale", "source", "entries"]);
const ENTRY_KEYS = new Set([
  "entryId",
  "openingId",
  "lineId",
  "nodeKey",
  "moveUci",
  "conceptId",
  "difficulty",
  "surface",
  "title",
  "body",
  "hint",
  "visualRecipeRefs",
  "evidenceIds",
  "status",
]);

const ALLOWED_DIFFICULTY = new Set<CopyDifficulty>(["beginner", "intermediate", "advanced"]);
const ALLOWED_SURFACE = new Set<CopySurface>(["assisted", "plain_hint", "plain_show_more", "review"]);
const ALLOWED_STATUS = new Set<CopyStatus>(["draft", "approved", "disabled"]);

const PLACEHOLDER_PATTERNS = [
  /\btodo\b/i,
  /\btbd\b/i,
  /\bplaceholder\b/i,
  /lorem ipsum/i,
  /copy goes here/i,
];

const INTERNAL_LABEL_PATTERNS = [
  /active piece development/i,
  /avoid blocking center pawn/i,
  /stable continuation/i,
  /minor piece development/i,
  /capture or recapture/i,
  /verified_top2/i,
  /stockfish_validated/i,
  /continuation_candidate_source/i,
  /claim_validation_failed/i,
  /safety fallback/i,
];

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

function checkTextField(input: {
  text: string | undefined;
  path: string;
  errors: ValidationIssue[];
  summary: CopyBundleValidationResult["summary"];
}): void {
  if (typeof input.text !== "string") return;
  for (const pattern of PLACEHOLDER_PATTERNS) {
    if (pattern.test(input.text)) {
      input.errors.push({
        code: "placeholder_text",
        message: "placeholder text is not allowed",
        path: input.path,
      });
      input.summary.placeholderIssueCount += 1;
      break;
    }
  }

  for (const pattern of INTERNAL_LABEL_PATTERNS) {
    if (pattern.test(input.text)) {
      input.errors.push({
        code: "internal_label_text",
        message: "raw/internal label text is not allowed in visible copy",
        path: input.path,
      });
      input.summary.internalLabelIssueCount += 1;
      break;
    }
  }
}

export function validateCopyBundle(input: unknown): CopyBundleValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const summary: CopyBundleValidationResult["summary"] = {
    entryCount: 0,
    approvedCount: 0,
    draftCount: 0,
    disabledCount: 0,
    placeholderIssueCount: 0,
    internalLabelIssueCount: 0,
  };

  if (!isObject(input)) {
    errors.push({ code: "bundle_not_object", message: "Copy bundle must be an object", path: "$" });
    return { ok: false, errors, warnings, summary };
  }

  addUnknownFieldWarnings({ value: input, allowed: BUNDLE_KEYS, warnings, path: "$" });

  if (typeof input.version !== "string" || input.version.trim() === "") {
    errors.push({ code: "invalid_version", message: "version must be a non-empty string", path: "$.version" });
  }
  if (typeof input.locale !== "string" || input.locale.trim() === "") {
    errors.push({ code: "invalid_locale", message: "locale must be a non-empty string", path: "$.locale" });
  }
  if (input.source !== COPY_BUNDLE_SOURCE) {
    errors.push({ code: "invalid_source", message: `source must be '${COPY_BUNDLE_SOURCE}'`, path: "$.source" });
  }
  if (!Array.isArray(input.entries)) {
    errors.push({ code: "invalid_entries", message: "entries must be an array", path: "$.entries" });
    return { ok: false, errors, warnings, summary };
  }

  summary.entryCount = input.entries.length;

  const seenEntryIds = new Set<string>();
  for (let i = 0; i < input.entries.length; i += 1) {
    const path = `$.entries[${i}]`;
    const entry = input.entries[i] as unknown;
    if (!isObject(entry)) {
      errors.push({ code: "entry_not_object", message: "entry must be an object", path });
      continue;
    }

    addUnknownFieldWarnings({ value: entry, allowed: ENTRY_KEYS, warnings, path });

    const entryId = entry.entryId;
    if (typeof entryId !== "string" || entryId.trim() === "") {
      errors.push({ code: "invalid_entry_id", message: "entryId must be non-empty", path: `${path}.entryId` });
    } else if (seenEntryIds.has(entryId)) {
      errors.push({ code: "duplicate_entry_id", message: "entryId must be unique", path: `${path}.entryId` });
    } else {
      seenEntryIds.add(entryId);
    }

    if (entry.moveUci != null) {
      if (typeof entry.moveUci !== "string" || !UCI_LIKE_REGEX.test(entry.moveUci)) {
        errors.push({ code: "invalid_move_uci", message: "moveUci must match UCI-like format", path: `${path}.moveUci` });
      }
    }

    if (entry.difficulty != null && !ALLOWED_DIFFICULTY.has(entry.difficulty as CopyDifficulty)) {
      errors.push({ code: "invalid_difficulty", message: "difficulty has invalid value", path: `${path}.difficulty` });
    }

    if (entry.surface != null && !ALLOWED_SURFACE.has(entry.surface as CopySurface)) {
      errors.push({ code: "invalid_surface", message: "surface has invalid value", path: `${path}.surface` });
    }

    if (entry.status != null && !ALLOWED_STATUS.has(entry.status as CopyStatus)) {
      errors.push({ code: "invalid_status", message: "status has invalid value", path: `${path}.status` });
    }

    for (const textField of ["title", "body", "hint"] as const) {
      const value = (entry as CopyEntry)[textField];
      if (value != null && typeof value !== "string") {
        errors.push({
          code: `invalid_${textField}`,
          message: `${textField} must be a string`,
          path: `${path}.${textField}`,
        });
      }
      checkTextField({ text: typeof value === "string" ? value : undefined, path: `${path}.${textField}`, errors, summary });
    }

    for (const arrField of ["visualRecipeRefs", "evidenceIds"] as const) {
      const value = (entry as CopyEntry)[arrField];
      if (value != null && asStringArray(value) == null) {
        errors.push({
          code: `invalid_${arrField}`,
          message: `${arrField} must be a string array`,
          path: `${path}.${arrField}`,
        });
      }
    }

    const status = (entry.status as CopyStatus | undefined) ?? "draft";
    if (status === "approved") summary.approvedCount += 1;
    if (status === "draft") summary.draftCount += 1;
    if (status === "disabled") summary.disabledCount += 1;

    const hasVisibleText = [entry.title, entry.body, entry.hint].some((value) => typeof value === "string" && value.trim() !== "");

    if (status === "approved" && !hasVisibleText) {
      errors.push({
        code: "approved_entry_missing_visible_text",
        message: "approved entries must contain at least one of title/body/hint",
        path,
      });
    }
    // Disabled entries are allowed to omit visible text by design.
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    summary,
  };
}

export type { CopyBundle, CopyEntry };

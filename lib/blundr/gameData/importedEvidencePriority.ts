export type ImportedEvidencePriorityOutcome =
  | "followed_known_repertoire"
  | "alternate_unlocked_continuation"
  | "deviated_from_repertoire"
  | "missed_known_move";

export type ImportedEvidencePriorityRecord = {
  userId: string;
  positionKey: string;
  openingId: string | null;
  moveOrderKey: string | null;
  outcome: ImportedEvidencePriorityOutcome;
  importWeight: number;
  observedAt: string;
  status: "active" | "gated_pending" | "resolved" | "deleted";
};

export type ImportedEvidencePriority = {
  positionKey: string;
  openingId: string;
  moveOrderKey: string;
  boost: number;
  missCount: number;
  positiveCount: number;
  hasNegativeEvidence: boolean;
  lastObservedAt: string;
};

const MAX_IMPORT_BOOST = 1.5;

function parseIso(value: string): number {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function recencyFactor(observedAt: string, now: string): number {
  const ageDays = Math.max(
    0,
    (parseIso(now) - parseIso(observedAt)) / 86_400_000,
  );
  if (ageDays <= 7) return 1;
  if (ageDays <= 30) return 0.7;
  if (ageDays <= 90) return 0.35;
  return 0.15;
}

export function buildImportedEvidencePriorityMap(input: {
  records: readonly ImportedEvidencePriorityRecord[];
  userId: string;
  now: string;
}): Map<string, ImportedEvidencePriority> {
  const grouped = new Map<string, ImportedEvidencePriority>();
  for (const record of input.records) {
    if (
      record.userId !== input.userId ||
      record.status !== "active" ||
      !record.openingId ||
      !record.moveOrderKey ||
      !record.positionKey
    )
      continue;
    const key = record.positionKey;
    const current =
      grouped.get(key) ??
      ({
        positionKey: record.positionKey,
        openingId: record.openingId,
        moveOrderKey: record.moveOrderKey,
        boost: 0,
        missCount: 0,
        positiveCount: 0,
        hasNegativeEvidence: false,
        lastObservedAt: record.observedAt,
      } satisfies ImportedEvidencePriority);
    const negative =
      record.outcome === "missed_known_move" ||
      record.outcome === "deviated_from_repertoire";
    const factor = recencyFactor(record.observedAt, input.now);
    if (negative) {
      current.missCount += 1;
      current.hasNegativeEvidence = true;
      current.boost += Math.max(0, record.importWeight) * factor;
    } else {
      current.positiveCount += 1;
      current.boost += Math.min(0, record.importWeight) * factor;
    }
    if (parseIso(record.observedAt) > parseIso(current.lastObservedAt))
      current.lastObservedAt = record.observedAt;
    current.boost = Math.max(0, Math.min(MAX_IMPORT_BOOST, current.boost));
    grouped.set(key, current);
  }
  return grouped;
}

export function shouldPromoteImportedEvidenceToDailyPriority(
  evidence: ImportedEvidencePriority,
): boolean {
  return evidence.hasNegativeEvidence && evidence.boost > 0;
}

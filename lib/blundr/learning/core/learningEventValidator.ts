import {
  BLUNDR_CONTRACT_VERSION,
  type LearningEventV2,
} from "@/lib/blundr/contracts";

export type LearningEventValidation =
  | { valid: true; event: LearningEventV2 }
  | { valid: false; errors: string[] };

export function validateLearningEvent(event: unknown): LearningEventValidation {
  const errors: string[] = [];
  if (!event || typeof event !== "object")
    return { valid: false, errors: ["event_not_object"] };
  const value = event as Partial<LearningEventV2>;
  if (value.schemaVersion !== BLUNDR_CONTRACT_VERSION)
    errors.push("unsupported_schema_version");
  for (const key of [
    "eventId",
    "sessionId",
    "userId",
    "occurredAt",
    "taxonomy",
    "idempotencyKey",
    "source",
    "contentVersion",
    "classifierVersion",
  ]) {
    if (
      typeof value[key as keyof LearningEventV2] !== "string" ||
      !String(value[key as keyof LearningEventV2]).trim()
    )
      errors.push(`missing_${key}`);
  }
  if (typeof value.firstAttempt !== "boolean")
    errors.push("invalid_first_attempt");
  if (value.deletedAt !== null && typeof value.deletedAt !== "string")
    errors.push("invalid_deleted_at");
  if (errors.length) return { valid: false, errors };
  return { valid: true, event: value as LearningEventV2 };
}

export const IMPORT_WORKER_ROUTE_BUDGET_MS = 230_000;
export const IMPORT_WORKER_MIN_JOB_START_MS = 70_000;
export const IMPORT_BATCH_CHECKPOINT_BUFFER_MS = 45_000;
export const IMPORT_PROVIDER_TIMEOUT_BUFFER_MS = 45_000;

export function importWorkerDeadline(nowMs = Date.now()): number {
  return nowMs + IMPORT_WORKER_ROUTE_BUDGET_MS;
}

export function remainingImportWorkerMs(
  deadlineAt: number | null | undefined,
  nowMs = Date.now(),
): number {
  if (!deadlineAt) return Number.POSITIVE_INFINITY;
  return deadlineAt - nowMs;
}

export function hasImportBatchBudget(input: {
  deadlineAt?: number | null;
  nowMs?: number;
  minRemainingMs?: number;
}): boolean {
  return (
    remainingImportWorkerMs(input.deadlineAt, input.nowMs) >
    (input.minRemainingMs ?? IMPORT_BATCH_CHECKPOINT_BUFFER_MS)
  );
}

export function shouldStartImportJob(input: {
  deadlineAt?: number | null;
  nowMs?: number;
  minRemainingMs?: number;
}): boolean {
  return (
    remainingImportWorkerMs(input.deadlineAt, input.nowMs) >
    (input.minRemainingMs ?? IMPORT_WORKER_MIN_JOB_START_MS)
  );
}

export function createImportProviderAbortSignal(input: {
  deadlineAt?: number | null;
  nowMs?: number;
  timeoutBufferMs?: number;
}): AbortSignal | undefined {
  if (!input.deadlineAt) return undefined;
  const remainingMs = remainingImportWorkerMs(
    input.deadlineAt,
    input.nowMs ?? Date.now(),
  );
  const timeoutMs = Math.max(
    1,
    remainingMs - (input.timeoutBufferMs ?? IMPORT_PROVIDER_TIMEOUT_BUFFER_MS),
  );
  return AbortSignal.timeout(timeoutMs);
}

export function sanitizeImportWorkerError(error: unknown): string {
  if (error instanceof DOMException && error.name === "TimeoutError")
    return "network_timeout";
  if (error instanceof DOMException && error.name === "AbortError")
    return "network_timeout";
  const message = error instanceof Error ? error.message : "";
  const code = message.trim().toLowerCase();
  return [
    "account_not_found",
    "rate_limited",
    "provider_unavailable",
    "network_timeout",
    "malformed_provider_payload",
    "invalid_game",
    "lease_lost",
  ].includes(code)
    ? code
    : "unknown";
}

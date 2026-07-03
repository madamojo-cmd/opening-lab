import type { BackendError, BackendResult } from "./backendTypes";

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

export function createBackendError(input: BackendError): BackendError {
  return {
    code: normalizeText(input.code) || "backend_error",
    message: normalizeText(input.message) || "Unknown backend error.",
    cause: input.cause,
    retryable: input.retryable,
    status: typeof input.status === "number" ? input.status : undefined,
  };
}

export function normalizeBackendError(error: unknown, fallback: BackendError = { code: "backend_error", message: "Unknown backend error." }): BackendError {
  if (!error) return createBackendError(fallback);
  if (typeof error === "object" && error && "code" in error && "message" in error) {
    const candidate = error as Partial<BackendError>;
    return createBackendError({
      code: candidate.code ?? fallback.code,
      message: candidate.message ?? fallback.message,
      cause: candidate.cause ?? error,
      retryable: candidate.retryable ?? fallback.retryable,
      status: candidate.status ?? fallback.status,
    });
  }
  if (error instanceof Error) {
    return createBackendError({
      code: fallback.code,
      message: error.message || fallback.message,
      cause: error,
      retryable: fallback.retryable,
      status: fallback.status,
    });
  }
  return createBackendError({
    code: fallback.code,
    message: normalizeText(error) || fallback.message,
    cause: error,
    retryable: fallback.retryable,
    status: fallback.status,
  });
}

export function backendOk<T>(data: T): BackendResult<T> {
  return { ok: true, data };
}

export function backendErr<T = never>(error: BackendError): BackendResult<T> {
  return { ok: false, error: createBackendError(error) };
}

export function isBackendResult<T>(value: BackendResult<T> | unknown): value is BackendResult<T> {
  return Boolean(value && typeof value === "object" && "ok" in value);
}


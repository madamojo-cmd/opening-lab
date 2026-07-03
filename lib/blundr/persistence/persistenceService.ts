import type { CurrentBlundrUser } from "../accounts/accountTypes";
import { resolveBlundrAccountMode } from "../backend/backendMode";
import { hasSupabaseCredentials, readBlundrBackendEnv } from "../backend/backendEnv";
import type { BlundrAccountMode } from "../accounts/accountTypes";
import type { BlundrPersistenceAdapter } from "./persistenceAdapter";
import { createBlundrLocalPersistenceAdapter } from "./localPersistenceAdapter";
import { createBlundrSupabasePersistenceAdapter } from "./supabasePersistenceAdapter";

export type BlundrPersistenceServiceInput = {
  user?: CurrentBlundrUser | null;
  mode?: BlundrAccountMode;
  accessToken?: string | null;
  allowLocalFallback?: boolean;
};

function normalizeText(value: unknown): string {
  return String(value ?? "").trim();
}

function shouldUseLocalFallback(input: BlundrPersistenceServiceInput, envHasSupabase: boolean, mode: BlundrAccountMode): boolean {
  if (mode === "local_demo") return true;
  if (!envHasSupabase) return true;
  if (input.allowLocalFallback === false) return false;
  const accessToken = normalizeText(input.accessToken ?? input.user?.accessToken ?? null);
  return !accessToken;
}

export function resolveBlundrPersistenceAdapter(input: BlundrPersistenceServiceInput = {}): BlundrPersistenceAdapter {
  const env = readBlundrBackendEnv();
  const mode = input.mode ?? resolveBlundrAccountMode({ env, user: input.user ?? null, allowLocalFallback: input.allowLocalFallback ?? true });
  const envHasSupabase = hasSupabaseCredentials(env);
  if (shouldUseLocalFallback(input, envHasSupabase, mode)) {
    return createBlundrLocalPersistenceAdapter(mode === "developer_admin" ? "developer_admin" : "local_demo");
  }

  const accessToken = normalizeText(input.accessToken ?? input.user?.accessToken ?? null) || null;
  return createBlundrSupabasePersistenceAdapter({
    accessToken,
    mode,
  });
}

export function getBlundrPersistenceAdapter(input: BlundrPersistenceServiceInput = {}): BlundrPersistenceAdapter {
  return resolveBlundrPersistenceAdapter(input);
}

export function isBlundrLocalPersistenceAdapter(adapter: BlundrPersistenceAdapter): boolean {
  return adapter.mode === "local_demo" || adapter.mode === "developer_admin";
}

export function isBlundrSupabasePersistencePreferred(input: BlundrPersistenceServiceInput = {}): boolean {
  const env = readBlundrBackendEnv();
  return hasSupabaseCredentials(env) && !shouldUseLocalFallback(input, true, input.mode ?? resolveBlundrAccountMode({ env, user: input.user ?? null, allowLocalFallback: input.allowLocalFallback ?? true }));
}

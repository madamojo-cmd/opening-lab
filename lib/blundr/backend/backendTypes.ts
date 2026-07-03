import type { BlundrAccountMode } from "../accounts/accountTypes";

export type BackendError = {
  code: string;
  message: string;
  cause?: unknown;
  retryable?: boolean;
  status?: number;
};

export type BackendResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: BackendError };

export type BackendUserIdentity = {
  userId: string;
  email?: string | null;
  mode: BlundrAccountMode;
  isAuthenticated: boolean;
  isAdmin: boolean;
  accessToken?: string | null;
  provider?: string | null;
};

export type BackendRuntimeContext = {
  mode: BlundrAccountMode;
  devToolsEnabled: boolean;
  hasSupabaseCredentials: boolean;
  storageModeSetting: string;
};


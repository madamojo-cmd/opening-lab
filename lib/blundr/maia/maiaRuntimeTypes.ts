import type { MaiaSkillLevel } from "./maiaTypes";

export type MaiaRuntimeStatus =
  | "ready"
  | "disabled"
  | "missing_lc0_path"
  | "missing_weights_path"
  | "weights_not_found"
  | "lc0_not_found"
  | "startup_failed"
  | "uci_not_ready"
  | "timeout"
  | "error";

export interface MaiaRuntimeConfig {
  enabled: boolean;
  lc0Path: string | null;
  weightsPath: string | null;
  skillLevel: MaiaSkillLevel;
  timeoutMs: number;
  nodes: number;
  backend?: string | null;
  maxConcurrentRequests: number;
  cacheEnabled: boolean;
}

export interface MaiaRuntimeHealth {
  status: MaiaRuntimeStatus;
  ready: boolean;
  providerName: string;
  providerVersion: string;
  enabled: boolean;
  configured: boolean;
  lc0Configured: boolean;
  weightsConfigured: boolean;
  lc0Exists: boolean;
  cacheEnabled: boolean;
  maxConcurrentRequests: number;
  lc0Path: string | null;
  weightsPath: string | null;
  weightsExists: boolean;
  timeoutMs: number;
  nodes: number;
  lastError: string | null;
  checkedAt: number;
}

export interface MaiaRuntimeMoveRequest {
  requestId: number;
  fen: string;
  fen4: string;
  legalMovesUci: string[];
  skillLevel: MaiaSkillLevel;
  timeoutMs: number;
  ratingBandId?: string | null;
  requestedRating?: number | null;
}

export interface MaiaRuntimeMoveResult {
  status: MaiaRuntimeStatus;
  requestId: number;
  fen4: string;
  skillLevel: MaiaSkillLevel;
  bestMoveUci: string | null;
  ponderUci?: string | null;
  rawBestMoveLine?: string | null;
  legal: boolean;
  errorReason: string | null;
  runtimeMs: number;
}

import type { MaiaSkillLevel } from "./maiaTypes";
import type {
  MaiaRemoteHealthEvidence,
  MaiaRemoteProvenance,
} from "./maiaRemoteContract";

export type MaiaRuntimeStatus =
  | "ready"
  | "disabled"
  | "missing_lc0_path"
  | "missing_weights_path"
  | "missing_remote_url"
  | "missing_remote_token"
  | "insecure_remote_url"
  | "remote_unreachable"
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
  transport?: "local" | "remote";
  remoteUrl?: string | null;
  remoteHealthUrl?: string | null;
  remoteToken?: string | null;
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
  transport?: "local" | "remote";
  remoteConfigured?: boolean;
  lastError: string | null;
  checkedAt: number;
  remoteEvidence?: MaiaRemoteHealthEvidence | null;
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
  provenance?: MaiaRemoteProvenance | null;
}

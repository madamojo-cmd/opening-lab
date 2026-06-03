import type {
  MaiaMoveCandidate,
  MaiaOpponentReplyDecision,
  MaiaOpponentReplyResult,
  MaiaProviderStatus,
  MaiaSkillLevel,
} from "./maiaTypes";

const DEFAULT_SKILL_LEVEL: MaiaSkillLevel = "maia-1500";

function normalizeSkillInput(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

export function resolveMaiaSkillLevel(input: {
  userExperienceLevel?: string | null;
  blundrTrainingLevel?: string | null;
  appDifficultyLevel?: string | null;
  continuationDifficulty?: string | null;
  defaultSkillLevel?: MaiaSkillLevel;
}): MaiaSkillLevel {
  const tokens = [
    normalizeSkillInput(input.userExperienceLevel),
    normalizeSkillInput(input.blundrTrainingLevel),
    normalizeSkillInput(input.appDifficultyLevel),
    normalizeSkillInput(input.continuationDifficulty),
  ].join(" ");

  if (/new|beginner|novice|starter/.test(tokens)) return "maia-1100";
  if (/casual|easy|light/.test(tokens)) return "maia-1300";
  if (/intermediate|club|medium/.test(tokens)) return "maia-1500";
  if (/advanced|hard|strong/.test(tokens)) return "maia-1700";
  if (/expert|master|elite/.test(tokens)) return "maia-1900";
  return input.defaultSkillLevel ?? DEFAULT_SKILL_LEVEL;
}

function normalizeUci(uci: unknown): string | null {
  const value = String(uci ?? "").trim().toLowerCase();
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value) ? value : null;
}

function candidateSortScore(candidate: MaiaMoveCandidate): number {
  const rank = Number.isFinite(Number(candidate.rank)) ? Number(candidate.rank) : Number.POSITIVE_INFINITY;
  const likelihood = Number.isFinite(Number(candidate.humanLikelihood)) ? Number(candidate.humanLikelihood) : -1;
  const policyScore = Number.isFinite(Number(candidate.policyScore)) ? Number(candidate.policyScore) : -1;
  return (-likelihood * 1000) + rank - policyScore;
}

export function selectMaiaOpponentReply(
  result: MaiaOpponentReplyResult | null | undefined,
  legalMoves: string[],
): MaiaMoveCandidate | null {
  if (!result) return null;
  if (result.stale) return null;
  if (result.status !== "ready") return null;
  const legal = new Set(legalMoves.map((move) => String(move).toLowerCase()));
  const pool = Array.isArray(result.candidates) ? result.candidates : [];
  const legalCandidates = pool
    .map((candidate) => ({ ...candidate, uci: normalizeUci(candidate.uci) }))
    .filter((candidate): candidate is MaiaMoveCandidate & { uci: string } => Boolean(candidate.uci) && legal.has(candidate.uci));
  if (!legalCandidates.length) return null;
  legalCandidates.sort((a, b) => candidateSortScore(a) - candidateSortScore(b));
  return legalCandidates[0] ?? null;
}

export function buildMaiaOpponentReplyDecision(input: {
  trainingMode: "restricted" | "continuation";
  userExplicitlyEnteredContinuation: boolean;
  sideToMove: "w" | "b";
  opponentColor: "w" | "b";
  branchCompleteActive: boolean;
  continuationAnalysisStatus?: string | null;
  continuationRuntimeStatus?: string | null;
  selectedLineExhausted?: boolean;
  hasUserContinuationMove?: boolean;
  terminalPosition: boolean;
  legalMovesCount: number;
  providerStatus: MaiaProviderStatus;
  staleRequest?: boolean;
  fallbackRequested?: boolean;
  skillLevel?: MaiaSkillLevel | null;
  selectedCandidate?: MaiaMoveCandidate | null;
}): MaiaOpponentReplyDecision {
  if (input.trainingMode !== "continuation") {
    return {
      allowed: false,
      reason: "not_continuation_mode",
      providerUsed: false,
      selectedMoveUci: null,
      selectedMoveSan: null,
      selectedMoveSource: "none",
      skillLevel: input.skillLevel ?? null,
      humanLikelihood: null,
      candidateCount: 0,
      fallbackReason: null,
    };
  }
  if (!input.userExplicitlyEnteredContinuation) {
    return {
      allowed: false,
      reason: "continue_not_clicked",
      providerUsed: false,
      selectedMoveUci: null,
      selectedMoveSan: null,
      selectedMoveSource: "none",
      skillLevel: input.skillLevel ?? null,
      humanLikelihood: null,
      candidateCount: 0,
      fallbackReason: null,
    };
  }
  if (input.branchCompleteActive) {
    return {
      allowed: false,
      reason: "branch_complete_active",
      providerUsed: false,
      selectedMoveUci: null,
      selectedMoveSan: null,
      selectedMoveSource: "none",
      skillLevel: input.skillLevel ?? null,
      humanLikelihood: null,
      candidateCount: 0,
      fallbackReason: null,
    };
  }
  if (input.sideToMove !== input.opponentColor) {
    return {
      allowed: false,
      reason: "side_to_move_user",
      providerUsed: false,
      selectedMoveUci: null,
      selectedMoveSan: null,
      selectedMoveSource: "none",
      skillLevel: input.skillLevel ?? null,
      humanLikelihood: null,
      candidateCount: 0,
      fallbackReason: null,
    };
  }
  if (input.terminalPosition) {
    return {
      allowed: false,
      reason: "terminal_position",
      providerUsed: false,
      selectedMoveUci: null,
      selectedMoveSan: null,
      selectedMoveSource: "none",
      skillLevel: input.skillLevel ?? null,
      humanLikelihood: null,
      candidateCount: 0,
      fallbackReason: null,
    };
  }
  if (input.legalMovesCount <= 0) {
    return {
      allowed: false,
      reason: "no_legal_moves",
      providerUsed: false,
      selectedMoveUci: null,
      selectedMoveSan: null,
      selectedMoveSource: "none",
      skillLevel: input.skillLevel ?? null,
      humanLikelihood: null,
      candidateCount: 0,
      fallbackReason: null,
    };
  }
  if (input.staleRequest) {
    return {
      allowed: false,
      reason: "stale_request",
      providerUsed: false,
      selectedMoveUci: null,
      selectedMoveSan: null,
      selectedMoveSource: "none",
      skillLevel: input.skillLevel ?? null,
      humanLikelihood: null,
      candidateCount: 0,
      fallbackReason: null,
    };
  }
  if (input.providerStatus === "unavailable" || input.providerStatus === "disabled") {
    return {
      allowed: false,
      reason: "provider_unavailable",
      providerUsed: false,
      selectedMoveUci: null,
      selectedMoveSan: null,
      selectedMoveSource: "fallback",
      skillLevel: input.skillLevel ?? null,
      humanLikelihood: null,
      candidateCount: 0,
      fallbackReason: input.fallbackRequested ? "fallback_used" : null,
    };
  }

  const selected = input.selectedCandidate ?? null;
  return {
    allowed: true,
    reason: "allowed",
    providerUsed: true,
    selectedMoveUci: selected?.uci ?? null,
    selectedMoveSan: selected?.san ?? null,
    selectedMoveSource: selected ? "maia" : "none",
    skillLevel: input.skillLevel ?? null,
    humanLikelihood: selected?.humanLikelihood ?? null,
    candidateCount: selected ? 1 : 0,
    fallbackReason: null,
  };
}

export function classifyMaiaProviderStatus(input: {
  isAvailable: boolean;
  timedOut?: boolean;
  errored?: boolean;
}): MaiaProviderStatus {
  if (input.timedOut) return "timeout";
  if (input.errored) return "error";
  if (!input.isAvailable) return "unavailable";
  return "ready";
}

export function withMaiaTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<{ ok: true; value: T } | { ok: false; reason: "timeout" }> {
  return new Promise((resolve) => {
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      resolve({ ok: false, reason: "timeout" });
    }, Math.max(1, timeoutMs));
    promise.then((value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve({ ok: true, value });
    }).catch(() => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve({ ok: false, reason: "timeout" });
    });
  });
}

export function evaluateMaiaSanityGuard(input: {
  enabled: boolean;
  cpLoss?: number | null;
  maxAllowedCpLoss: number;
}): { allowed: boolean; result: "allowed" | "blocked" | "sanity_guard_unavailable"; blockedReason: string | null } {
  if (!input.enabled) return { allowed: true, result: "sanity_guard_unavailable", blockedReason: null };
  if (!Number.isFinite(Number(input.cpLoss))) return { allowed: true, result: "sanity_guard_unavailable", blockedReason: null };
  if (Number(input.cpLoss) > input.maxAllowedCpLoss) {
    return { allowed: false, result: "blocked", blockedReason: "maia_sanity_guard_rejected_candidate" };
  }
  return { allowed: true, result: "allowed", blockedReason: null };
}

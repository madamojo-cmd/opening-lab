import "server-only";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import type {
  GameImportJob,
  ImportCursor,
  ImportMetrics,
  ImportJobStatus,
} from "./gameDataTypes";

const jobs = new Map<string, GameImportJob>();

export class ImportJobRepository {
  async nextPending(limit = 5): Promise<GameImportJob[]> {
    const client = createBlundrSupabaseAdminClient();
    if (!client)
      return [...jobs.values()]
        .filter((job) => job.status === "queued")
        .slice(0, limit);
    const result = await client
      .from("blundr_game_import_jobs")
      .select("*")
      .in("status", ["queued", "leased"])
      .order("created_at", { ascending: true })
      .limit(limit);
    return (result.data ?? []).map(mapJob);
  }
  async enqueue(input: {
    userId: string;
    provider: GameImportJob["provider"];
    cursor: ImportCursor;
    correlationId: string;
  }): Promise<GameImportJob> {
    const now = new Date().toISOString();
    const client = createBlundrSupabaseAdminClient();
    if (!client) {
      const existing = [...jobs.values()].find(
        (job) =>
          job.userId === input.userId &&
          job.provider === input.provider &&
          ["queued", "leased", "running"].includes(job.status),
      );
      if (existing) return existing;
      const localJob: GameImportJob = {
        id: `job-${crypto.randomUUID()}`,
        userId: input.userId,
        provider: input.provider,
        status: "queued",
        cursor: input.cursor,
        attemptCount: 0,
        leaseOwner: null,
        leaseExpiresAt: null,
        correlationId: input.correlationId,
        counts: {
          fetched: 0,
          accepted: 0,
          duplicate: 0,
          excluded: 0,
          matched: 0,
          gated: 0,
          analyzed: 0,
          findings: 0,
        },
        errorCode: null,
        createdAt: now,
        updatedAt: now,
      };
      jobs.set(localJob.id, localJob);
      return localJob;
    }
    const existing = await this.active(input.userId, input.provider);
    if (existing) return existing;
    const job: GameImportJob = {
      id: `job-${crypto.randomUUID()}`,
      userId: input.userId,
      provider: input.provider,
      status: "queued",
      cursor: input.cursor,
      attemptCount: 0,
      leaseOwner: null,
      leaseExpiresAt: null,
      correlationId: input.correlationId,
      counts: {
        fetched: 0,
        accepted: 0,
        duplicate: 0,
        excluded: 0,
        matched: 0,
        gated: 0,
        analyzed: 0,
        findings: 0,
      },
      errorCode: null,
      createdAt: now,
      updatedAt: now,
    };
    const result = await client
      .from("blundr_game_import_jobs")
      .insert(toRow(job))
      .select("*")
      .single();
    if (result.error || !result.data)
      throw new Error("import_job_enqueue_failed");
    return mapJob(result.data);
  }

  async active(
    userId: string,
    provider: GameImportJob["provider"],
  ): Promise<GameImportJob | null> {
    const client = createBlundrSupabaseAdminClient();
    if (!client)
      return (
        [...jobs.values()].find(
          (job) =>
            job.userId === userId &&
            job.provider === provider &&
            ["queued", "leased", "running"].includes(job.status),
        ) ?? null
      );
    const result = await client
      .from("blundr_game_import_jobs")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", provider)
      .in("status", ["queued", "leased", "running"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return result.data ? mapJob(result.data) : null;
  }

  async lease(
    jobId: string,
    workerId: string,
    now = new Date(),
    ttlMs = 60_000,
  ): Promise<GameImportJob | null> {
    const expiry = new Date(now.valueOf() + ttlMs).toISOString();
    const client = createBlundrSupabaseAdminClient();
    if (!client) {
      const job = jobs.get(jobId);
      if (
        !job ||
        (job.leaseExpiresAt && Date.parse(job.leaseExpiresAt) > now.valueOf())
      )
        return null;
      const next = {
        ...job,
        status: "leased" as const,
        leaseOwner: workerId,
        leaseExpiresAt: expiry,
        attemptCount: job.attemptCount + 1,
        updatedAt: now.toISOString(),
      };
      jobs.set(jobId, next);
      return next;
    }
    const result = await client
      .from("blundr_game_import_jobs")
      .update({
        status: "leased",
        lease_owner: workerId,
        lease_expires_at: expiry,
        attempt_count: 1,
        updated_at: now.toISOString(),
      })
      .eq("id", jobId)
      .or(`lease_expires_at.is.null,lease_expires_at.lt.${now.toISOString()}`)
      .in("status", ["queued", "leased", "running"])
      .select("*")
      .maybeSingle();
    return result.data ? mapJob(result.data) : null;
  }

  async update(
    jobId: string,
    patch: Partial<
      Pick<
        GameImportJob,
        | "status"
        | "cursor"
        | "counts"
        | "errorCode"
        | "leaseOwner"
        | "leaseExpiresAt"
      >
    >,
  ): Promise<void> {
    const now = new Date().toISOString();
    const client = createBlundrSupabaseAdminClient();
    if (!client) {
      const job = jobs.get(jobId);
      if (job) jobs.set(jobId, { ...job, ...patch, updatedAt: now });
      return;
    }
    await client
      .from("blundr_game_import_jobs")
      .update({ ...toPatch(patch), updated_at: now })
      .eq("id", jobId);
  }
}

function toRow(job: GameImportJob) {
  return {
    id: job.id,
    user_id: job.userId,
    provider: job.provider,
    status: job.status,
    cursor: job.cursor,
    attempt_count: job.attemptCount,
    lease_owner: job.leaseOwner,
    lease_expires_at: job.leaseExpiresAt,
    correlation_id: job.correlationId,
    fetched_count: job.counts.fetched,
    accepted_count: job.counts.accepted,
    duplicate_count: job.counts.duplicate,
    excluded_count: job.counts.excluded,
    matched_count: job.counts.matched,
    gated_count: job.counts.gated,
    analyzed_count: job.counts.analyzed,
    finding_count: job.counts.findings,
    error_code: job.errorCode,
    created_at: job.createdAt,
    updated_at: job.updatedAt,
  };
}
function toPatch(
  patch: Partial<
    Pick<
      GameImportJob,
      | "status"
      | "cursor"
      | "counts"
      | "errorCode"
      | "leaseOwner"
      | "leaseExpiresAt"
    >
  >,
) {
  return {
    ...(patch.status ? { status: patch.status } : {}),
    ...(patch.cursor ? { cursor: patch.cursor } : {}),
    ...(patch.errorCode ? { error_code: patch.errorCode } : {}),
    ...(patch.leaseOwner !== undefined
      ? { lease_owner: patch.leaseOwner }
      : {}),
    ...(patch.leaseExpiresAt !== undefined
      ? { lease_expires_at: patch.leaseExpiresAt }
      : {}),
    ...(patch.counts
      ? {
          fetched_count: patch.counts.fetched,
          accepted_count: patch.counts.accepted,
          duplicate_count: patch.counts.duplicate,
          excluded_count: patch.counts.excluded,
          matched_count: patch.counts.matched,
          gated_count: patch.counts.gated,
          analyzed_count: patch.counts.analyzed,
          finding_count: patch.counts.findings,
        }
      : {}),
  };
}
function mapJob(row: Record<string, unknown>): GameImportJob {
  const counts: ImportMetrics = {
    fetched: Number(row.fetched_count ?? 0),
    accepted: Number(row.accepted_count ?? 0),
    duplicate: Number(row.duplicate_count ?? 0),
    excluded: Number(row.excluded_count ?? 0),
    matched: Number(row.matched_count ?? 0),
    gated: Number(row.gated_count ?? 0),
    analyzed: Number(row.analyzed_count ?? 0),
    findings: Number(row.finding_count ?? 0),
  };
  return {
    id: String(row.id),
    userId: String(row.user_id),
    provider: row.provider as GameImportJob["provider"],
    status: row.status as ImportJobStatus,
    cursor: row.cursor as ImportCursor,
    attemptCount: Number(row.attempt_count ?? 0),
    leaseOwner: row.lease_owner ? String(row.lease_owner) : null,
    leaseExpiresAt: row.lease_expires_at ? String(row.lease_expires_at) : null,
    correlationId: String(row.correlation_id),
    counts,
    errorCode: row.error_code as GameImportJob["errorCode"],
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

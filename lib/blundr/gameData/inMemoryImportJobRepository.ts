import type { GameImportJob, ImportCursor } from "./gameDataTypes";

export class InMemoryImportJobRepository {
  private readonly jobs = new Map<string, GameImportJob>();

  nextPending(limit = 5): GameImportJob[] {
    return [...this.jobs.values()]
      .filter(
        (job) =>
          job.status === "queued" ||
          (job.status === "retryable_error" && job.attemptCount < 5),
      )
      .slice(0, limit);
  }

  recoverStranded(now = new Date()): void {
    for (const [jobId, job] of this.jobs) {
      if (
        (job.status === "leased" || job.status === "running") &&
        job.leaseExpiresAt &&
        Date.parse(job.leaseExpiresAt) <= now.valueOf()
      ) {
        this.jobs.set(jobId, {
          ...job,
          status: "queued",
          leaseOwner: null,
          leaseExpiresAt: null,
          updatedAt: now.toISOString(),
        });
      }
    }
  }

  update(jobId: string, patch: Partial<GameImportJob>): GameImportJob {
    const job = this.jobs.get(jobId);
    if (!job) throw new Error(`import_job_not_found:${jobId}`);
    const next = { ...job, ...patch };
    this.jobs.set(jobId, next);
    return next;
  }

  enqueue(input: {
    userId: string;
    provider: GameImportJob["provider"];
    cursor: ImportCursor;
    correlationId: string;
  }): GameImportJob {
    const existing = [...this.jobs.values()].find(
      (job) =>
        job.userId === input.userId &&
        job.provider === input.provider &&
        ["queued", "leased", "running"].includes(job.status),
    );
    if (existing) return existing;
    const now = new Date().toISOString();
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
    this.jobs.set(job.id, job);
    return job;
  }

  lease(
    jobId: string,
    workerId: string,
    now = new Date(),
    ttlMs = 60_000,
  ): GameImportJob | null {
    const job = this.jobs.get(jobId);
    if (
      !job ||
      (job.leaseExpiresAt && Date.parse(job.leaseExpiresAt) > now.valueOf())
    )
      return null;
    const leased = {
      ...job,
      status: "leased" as const,
      leaseOwner: workerId,
      leaseExpiresAt: new Date(now.valueOf() + ttlMs).toISOString(),
      attemptCount: job.attemptCount + 1,
      updatedAt: now.toISOString(),
    };
    this.jobs.set(jobId, leased);
    return leased;
  }
}

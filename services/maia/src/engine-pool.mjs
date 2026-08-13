import { UciWorker } from "./uci-worker.mjs";

const PROBE_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const PROBE_LEGAL_MOVES = new Set([
  "a2a3",
  "a2a4",
  "b2b3",
  "b2b4",
  "c2c3",
  "c2c4",
  "d2d3",
  "d2d4",
  "e2e3",
  "e2e4",
  "f2f3",
  "f2f4",
  "g2g3",
  "g2g4",
  "h2h3",
  "h2h4",
  "b1a3",
  "b1c3",
  "g1f3",
  "g1h3",
]);

export class CapacityError extends Error {
  constructor() {
    super("over_capacity");
    this.name = "CapacityError";
    this.code = "over_capacity";
  }
}

export class MaiaEnginePool {
  #workers = new Map();
  #active = false;
  #queue = [];
  #ready = false;
  #lastProbeAt = null;
  #lastError = null;
  #closed = false;

  constructor({ config, manifest, models, logger, workerFactory }) {
    this.config = config;
    this.manifest = manifest;
    this.models = models;
    this.logger = logger;
    this.workerFactory = workerFactory ?? ((options) => new UciWorker(options));
  }

  async initialize() {
    const skills = this.config.prewarmSkills ?? [this.config.healthProbeSkill];
    for (const skill of skills) {
      if (!this.models.has(skill)) throw new Error("prewarm_skill_invalid");
      const result = await this.#runDirect(
        {
          skillLevel: skill,
          fen: PROBE_FEN,
          timeoutMs: this.config.requestTimeoutMs,
        },
        true,
      );
      if (!PROBE_LEGAL_MOVES.has(result.bestMoveUci)) {
        throw new Error("startup_probe_illegal_move");
      }
    }
    this.#ready = true;
    this.#lastProbeAt = new Date().toISOString();
    this.#lastError = null;
  }

  async bestMove(request) {
    if (this.#closed || !this.#ready) throw new Error("engine_pool_not_ready");
    const release = await this.#acquire();
    try {
      return await this.#runDirect(request, false);
    } finally {
      release();
    }
  }

  health() {
    const loadedSkills = [];
    let processesReady = true;
    for (const [skill, entry] of this.#workers) {
      loadedSkills.push(skill);
      if (!entry.worker.ready) processesReady = false;
    }
    return {
      ready: this.#ready && !this.#closed && processesReady,
      lastProbeAt: this.#lastProbeAt,
      lastError: this.#lastError,
      activeRequests: this.#active ? 1 : 0,
      queuedRequests: this.#queue.length,
      loadedSkills: loadedSkills.sort(),
    };
  }

  async #runDirect(request, startupProbe) {
    const entry = await this.#workerFor(request.skillLevel);
    try {
      const result = await entry.worker.bestMove(
        request.fen,
        Math.min(request.timeoutMs, this.config.requestTimeoutMs),
      );
      entry.lastUsed = Date.now();
      return result;
    } catch (error) {
      this.#workers.delete(request.skillLevel);
      await entry.worker.close().catch(() => undefined);
      this.#lastError = String(error?.code ?? error?.message ?? "engine_error");
      if (startupProbe) this.#ready = false;
      throw error;
    }
  }

  async #workerFor(skillLevel) {
    const existing = this.#workers.get(skillLevel);
    if (existing?.worker.ready) return existing;
    if (existing) {
      this.#workers.delete(skillLevel);
      await existing.worker.close().catch(() => undefined);
    }
    if (this.#workers.size >= this.config.maxWarmWorkers) {
      const oldest = [...this.#workers.entries()].sort(
        ([, left], [, right]) => left.lastUsed - right.lastUsed,
      )[0];
      if (oldest) {
        this.#workers.delete(oldest[0]);
        await oldest[1].worker.close().catch(() => undefined);
      }
    }
    const model = this.models.get(skillLevel);
    if (!model) throw new Error("model_not_found");
    const worker = this.workerFactory({
      binaryPath: this.config.lc0Path,
      weightsPath: model.path,
      backend: this.config.backend,
      startupTimeoutMs: this.config.startupTimeoutMs,
      expectedEngineVersion: this.manifest.engine.version,
      expectedEngineCommit: this.manifest.engine.commit,
      logger: this.logger,
    });
    await worker.start();
    const entry = { worker, lastUsed: Date.now() };
    this.#workers.set(skillLevel, entry);
    return entry;
  }

  #acquire() {
    if (!this.#active) {
      this.#active = true;
      return Promise.resolve(() => this.#release());
    }
    if (this.#queue.length >= this.config.queueLimit) {
      throw new CapacityError();
    }
    return new Promise((resolve) => this.#queue.push(resolve));
  }

  #release() {
    const next = this.#queue.shift();
    if (next) {
      next(() => this.#release());
      return;
    }
    this.#active = false;
  }

  async close() {
    this.#closed = true;
    this.#ready = false;
    const workers = [...this.#workers.values()].map((entry) => entry.worker);
    this.#workers.clear();
    await Promise.allSettled(workers.map((worker) => worker.close()));
  }
}

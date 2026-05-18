import type { MoveQualityEngineLine } from "@/lib/blundr/teaching/moveQualityGate";
import { MOVE_QUALITY_TARGET_DEPTH, MOVE_QUALITY_TIMEOUT_MS, MOVE_QUALITY_TOP_N } from "@/lib/blundr/teaching/moveQualityGate";

type ParsedInfo = {
  rank: number;
  uci: string;
  scoreCp?: number;
  mate?: number;
  pv?: string[];
};

function parseInfoLine(line: string): ParsedInfo | null {
  if (!line.startsWith("info ")) return null;
  const pvMatch = line.match(/\bpv\s+(.+)$/);
  if (!pvMatch) return null;
  const pv = pvMatch[1].trim().split(/\s+/).filter(Boolean);
  const uci = pv[0];
  if (!uci || uci.length < 4) return null;

  const multipvMatch = line.match(/\bmultipv\s+(\d+)/);
  const cpMatch = line.match(/\bscore\s+cp\s+(-?\d+)/);
  const mateMatch = line.match(/\bscore\s+mate\s+(-?\d+)/);

  const rank = multipvMatch ? Number(multipvMatch[1]) : 1;
  const scoreCp = cpMatch ? Number(cpMatch[1]) : undefined;
  const mate = mateMatch ? Number(mateMatch[1]) : undefined;

  return {
    rank,
    uci: uci.trim().toLowerCase(),
    scoreCp,
    mate,
    pv,
  };
}

async function resolveStockfishWorkerPath(): Promise<string | null> {
  try {
    const response = await fetch("/stockfish/manifest.json", { cache: "no-store" });
    const manifest = (await response.json()) as { enginePath?: unknown };
    if (typeof manifest.enginePath === "string" && manifest.enginePath.trim()) {
      return manifest.enginePath;
    }
  } catch {}
  return null;
}

export async function getStockfishTopMovesForValidation(input: {
  fen: string;
  multipv?: number;
  depth?: number;
  timeoutMs?: number;
}): Promise<MoveQualityEngineLine[]> {
  if (typeof window === "undefined" || typeof Worker === "undefined") {
    throw new Error("Stockfish validation is unavailable outside browser worker runtime.");
  }

  const enginePath = await resolveStockfishWorkerPath();
  if (!enginePath) {
    throw new Error("Stockfish worker path is unavailable.");
  }

  const multipv = Math.max(1, Math.min(4, input.multipv ?? MOVE_QUALITY_TOP_N));
  const depth = Math.max(6, Math.min(24, input.depth ?? MOVE_QUALITY_TARGET_DEPTH));
  const timeoutMs = Math.max(1200, input.timeoutMs ?? MOVE_QUALITY_TIMEOUT_MS);

  return await new Promise<MoveQualityEngineLine[]>((resolve, reject) => {
    let worker: Worker | null = null;
    let finished = false;
    const linesByRank = new Map<number, MoveQualityEngineLine>();

    const cleanup = () => {
      if (worker) {
        worker.onmessage = null;
        worker.onerror = null;
      }
      try {
        worker?.terminate();
      } catch {}
      worker = null;
    };

    const finish = (result?: MoveQualityEngineLine[], error?: Error) => {
      if (finished) return;
      finished = true;
      window.clearTimeout(timeout);
      cleanup();
      if (error) {
        reject(error);
        return;
      }
      resolve(result ?? []);
    };

    const timeout = window.setTimeout(() => {
      const sorted = Array.from(linesByRank.values()).sort((a, b) => a.rank - b.rank).slice(0, multipv);
      if (multipv >= 2 && !sorted.some((line) => line.rank === 2)) {
        finish(undefined, new Error("Stockfish MultiPV top-two output unavailable."));
        return;
      }
      finish(sorted);
    }, timeoutMs);

    try {
      worker = new Worker(enginePath);
    } catch {
      finish(undefined, new Error("Failed to initialize Stockfish worker."));
      return;
    }

    const send = (command: string) => {
      try {
        worker?.postMessage(command);
      } catch {}
    };

    worker.onerror = () => {
      finish(undefined, new Error("Stockfish worker crashed during validation."));
    };

    worker.onmessage = (event: MessageEvent<unknown>) => {
      const line = String(event.data ?? "");
      const parsed = parseInfoLine(line);
      if (parsed && parsed.rank <= multipv) {
        linesByRank.set(parsed.rank, {
          rank: parsed.rank,
          uci: parsed.uci,
          scoreCp: parsed.scoreCp,
          mate: parsed.mate,
          pv: parsed.pv,
        });
      }

      if (line.startsWith("bestmove")) {
        const sorted = Array.from(linesByRank.values()).sort((a, b) => a.rank - b.rank).slice(0, multipv);
        if (!sorted.length) {
          finish(undefined, new Error("Stockfish returned no validation lines."));
          return;
        }
        if (multipv >= 2 && !sorted.some((entry) => entry.rank === 2)) {
          finish(undefined, new Error("Stockfish MultiPV top-two output unavailable."));
          return;
        }
        finish(sorted);
      }
    };

    send("uci");
    send("ucinewgame");
    send("setoption name UCI_LimitStrength value false");
    send(`setoption name MultiPV value ${multipv}`);
    send("isready");
    send(`position fen ${input.fen}`);
    send(`go depth ${depth}`);
  });
}

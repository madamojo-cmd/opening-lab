import { Chess } from "chess.js";
import { getStockfishTopMovesForValidation } from "@/lib/blundr/engine/stockfishValidation";
import { applyMove } from "./miniGameMoveRules";
import { normalizeFen } from "./miniGameFenBuilder";
import { normalizeText } from "../miniGameUtils";
import type {
  MiniGameEngineAnalysis,
  MiniGameEngineCandidateDescriptor,
  MiniGameEngineScore,
  MiniGameEngineTopMove,
} from "./miniGameEngineQualityTypes";
import { getMiniGameStockfishEngineVersionToken } from "./miniGameEngineCache";

type ParsedInfo = {
  rank: number;
  uci: string;
  cp?: number;
  mate?: number;
  pv?: string[];
};

type EngineLike = {
  sendCommand: (command: string) => void;
  listener?: (line: string) => void;
};

function normalizeUci(value: unknown): string {
  return normalizeText(value).toLowerCase().replace(/\s+/g, "");
}

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

  return {
    rank: multipvMatch ? Number(multipvMatch[1]) : 1,
    uci: normalizeUci(uci),
    cp: cpMatch ? Number(cpMatch[1]) : undefined,
    mate: mateMatch ? Number(mateMatch[1]) : undefined,
    pv,
  };
}

function mapLinesToTopMoves(fen: string, lines: ParsedInfo[]): MiniGameEngineTopMove[] {
  return lines
    .filter((line) => Number.isFinite(line.rank) && line.rank >= 1 && line.uci)
    .sort((a, b) => a.rank - b.rank)
    .map((line) => ({
      rank: line.rank,
      moveUci: line.uci,
      cp: line.cp,
      mate: line.mate,
      san: applyMove(fen, line.uci)?.san ?? undefined,
    }))
    .slice(0, 6);
}

function resolveSideToMove(fen: string): "w" | "b" {
  try {
    return new Chess(normalizeFen(fen)).turn() as "w" | "b";
  } catch {
    return "w";
  }
}

function buildAnalysisResult(input: {
  fen: string;
  depth: number;
  multipv: number;
  providerStatus: MiniGameEngineAnalysis["providerStatus"];
  lines: ParsedInfo[];
}): MiniGameEngineAnalysis {
  const normalizedFen = normalizeFen(input.fen);
  const topMoves = mapLinesToTopMoves(normalizedFen, input.lines).slice(0, input.multipv);
  const bestMoveUci = topMoves[0]?.moveUci ?? null;
  const bestMoveSan = bestMoveUci ? applyMove(normalizedFen, bestMoveUci)?.san ?? null : null;
  return {
    fen: normalizedFen,
    sideToMove: new Chess(normalizedFen).turn() as "w" | "b",
    depth: input.depth,
    multipv: input.multipv,
    providerStatus: input.providerStatus,
    topMoves,
    bestMoveUci,
    bestMoveSan,
  };
}

function browserEngineReady(): boolean {
  return typeof window !== "undefined" && typeof Worker !== "undefined";
}

async function analyzeWithBrowserStockfish(input: { fen: string; depth: number; multipv: number }): Promise<MiniGameEngineAnalysis> {
  try {
    const topMoves = await getStockfishTopMovesForValidation({
      fen: normalizeFen(input.fen),
      depth: input.depth,
      multipv: input.multipv,
    });
    const lines: ParsedInfo[] = topMoves.map((line) => ({
      rank: line.rank,
      uci: normalizeUci(line.uci),
      cp: line.scoreCp,
      mate: line.mate,
      pv: line.pv,
    }));
    return buildAnalysisResult({
      fen: input.fen,
      depth: input.depth,
      multipv: input.multipv,
      providerStatus: lines.length ? "ready" : "error",
      lines,
    });
  } catch {
    return {
      fen: normalizeFen(input.fen),
      sideToMove: resolveSideToMove(input.fen),
      depth: input.depth,
      multipv: input.multipv,
      providerStatus: "unavailable",
      topMoves: [],
      bestMoveUci: null,
      bestMoveSan: null,
    };
  }
}

let nodeEnginePromise: Promise<EngineLike | null> | null = null;
let nodeAnalysisQueue: Promise<unknown> = Promise.resolve();

async function resolveNodeEngine(): Promise<EngineLike | null> {
  if (typeof window !== "undefined") return null;
  if (!nodeEnginePromise) {
    nodeEnginePromise = (async () => {
      try {
        const nodeRequire = eval("require") as (id: string) => unknown;
        const initStockfish = nodeRequire("stockfish") as (enginePath?: string) => Promise<EngineLike>;
        return await initStockfish("lite-single");
      } catch {
        return null;
      }
    })();
  }
  return nodeEnginePromise;
}

async function analyzeWithNodeStockfish(input: { fen: string; depth: number; multipv: number }): Promise<MiniGameEngineAnalysis> {
  const engine = await resolveNodeEngine();
  if (!engine) {
    return {
      fen: normalizeFen(input.fen),
      sideToMove: resolveSideToMove(input.fen),
      depth: input.depth,
      multipv: input.multipv,
      providerStatus: "unavailable",
      topMoves: [],
      bestMoveUci: null,
      bestMoveSan: null,
    };
  }

  return await new Promise<MiniGameEngineAnalysis>((resolve) => {
    const lines = new Map<number, ParsedInfo>();
    let finished = false;
    const timeoutMs = Math.max(5000, input.depth * 700);
    const timeout = setTimeout(() => {
      if (finished) return;
      finished = true;
      resolve(buildAnalysisResult({
        fen: input.fen,
        depth: input.depth,
        multipv: input.multipv,
        providerStatus: lines.size ? "ready" : "error",
        lines: [...lines.values()],
      }));
    }, timeoutMs);

    engine.listener = (line: string) => {
      if (finished) return;
      const parsed = parseInfoLine(String(line ?? ""));
      if (parsed && parsed.rank >= 1 && parsed.rank <= input.multipv) {
        lines.set(parsed.rank, parsed);
      }

      if (String(line ?? "").startsWith("bestmove")) {
        finished = true;
        clearTimeout(timeout);
        const sortedLines = [...lines.values()].sort((a, b) => a.rank - b.rank);
        resolve(buildAnalysisResult({
          fen: input.fen,
          depth: input.depth,
          multipv: input.multipv,
          providerStatus: sortedLines.length ? "ready" : "error",
          lines: sortedLines,
        }));
      }
    };

    try {
      engine.sendCommand("uci");
      engine.sendCommand("ucinewgame");
      engine.sendCommand("setoption name UCI_LimitStrength value false");
      engine.sendCommand(`setoption name MultiPV value ${input.multipv}`);
      engine.sendCommand("isready");
      engine.sendCommand(`position fen ${normalizeFen(input.fen)}`);
      engine.sendCommand(`go depth ${input.depth}`);
    } catch {
      finished = true;
      clearTimeout(timeout);
      resolve({
        fen: normalizeFen(input.fen),
        sideToMove: resolveSideToMove(input.fen),
        depth: input.depth,
        multipv: input.multipv,
        providerStatus: "error",
        topMoves: [],
        bestMoveUci: null,
        bestMoveSan: null,
      });
    }
  });
}

async function analyzeWithQueue(input: { fen: string; depth: number; multipv: number }): Promise<MiniGameEngineAnalysis> {
  const next = async () => {
    if (browserEngineReady()) {
      return analyzeWithBrowserStockfish(input);
    }
    return analyzeWithNodeStockfish(input);
  };

  nodeAnalysisQueue = nodeAnalysisQueue.then(next, next);
  return (await nodeAnalysisQueue) as MiniGameEngineAnalysis;
}

export async function analyzeMiniGamePositionWithStockfish(input: { fen: string; depth: number; multipv: number }): Promise<MiniGameEngineAnalysis> {
  return analyzeWithQueue(input);
}

export function getMiniGameStockfishVersionLabel(): string {
  return getMiniGameStockfishEngineVersionToken();
}

export function normalizeEvaluationForMoverPerspective(score: MiniGameEngineScore | null | undefined, flip = false): MiniGameEngineScore | null {
  if (!score) return null;
  if (typeof score.mate === "number") {
    return { mate: flip ? -score.mate : score.mate };
  }
  if (typeof score.cp === "number") {
    return { cp: flip ? -score.cp : score.cp };
  }
  return null;
}

export async function evaluateMiniGameMoveWithStockfish(input: {
  fen: string;
  moveUci: string;
  depth: number;
  multipv: number;
}): Promise<MiniGameEngineScore | null> {
  const normalizedFen = normalizeFen(input.fen);
  const normalizedMove = normalizeUci(input.moveUci);
  const primaryPosition = await analyzeMiniGamePositionWithStockfish({
    fen: normalizedFen,
    depth: input.depth,
    multipv: input.multipv,
  });
  const exact = primaryPosition.topMoves.find((move) => normalizeUci(move.moveUci) === normalizedMove);
  if (exact) {
    return normalizeEvaluationForMoverPerspective(exact);
  }

  const applied = applyMove(normalizedFen, normalizedMove);
  if (!applied) {
    return null;
  }

  const after = await analyzeMiniGamePositionWithStockfish({
    fen: applied.fen,
    depth: input.depth,
    multipv: 1,
  });
  const afterEval = after.topMoves[0] ?? null;
  if (!afterEval) {
    return null;
  }

  return normalizeEvaluationForMoverPerspective(afterEval, true);
}

import { Chess } from 'chess.js';
import type { Move } from 'chess.js';
import type { GeneratorContext, SourceFrame } from '../types';
import { clone } from '../analysis/chessUtils';

export function candidatePositions(ctx: GeneratorContext, label: string): Array<{ chess: Chess; frame: SourceFrame }> {
  const rng = ctx.rng.fork(label); const frames = rng.shuffle(ctx.sourceFrames); const out: Array<{ chess: Chess; frame: SourceFrame }> = [];
  for (const frame of frames) {
    let chess: Chess; try { chess = new Chess(frame.fen); } catch { continue; }
    const observed = frame.candidateMoves?.filter((c) => (chess.moves({ verbose: true }) as Move[]).some((m) => `${m.from}${m.to}${m.promotion ?? ''}` === c.uci)) ?? [];
    if (observed.length) { const choice = rng.pick(observed.slice(0, Math.min(5, observed.length))); const move = (chess.moves({ verbose: true }) as Move[]).find((m) => `${m.from}${m.to}${m.promotion ?? ''}` === choice.uci); if (move) chess.move(move); }
    const extra = 4 + rng.int(12);
    for (let i = 0; i < extra && !chess.isGameOver(); i += 1) { const moves = chess.moves({ verbose: true }) as Move[]; const quiet = moves.filter((m) => !m.captured && !/[+#]/.test(m.san)); if (!quiet.length) break; chess.move(rng.pick(quiet)); }
    out.push({ chess, frame });
    if (out.length >= Math.max(ctx.maxPerGame * 30, 200)) break;
  }
  return out;
}
export function alternatives(chess: Chess, primary: Move, reason: string): Array<{ move: Move; why: string }> {
  return (chess.moves({ verbose: true }) as Move[]).filter((m) => `${m.from}${m.to}${m.promotion ?? ''}` !== `${primary.from}${primary.to}${primary.promotion ?? ''}` && !/[+#]/.test(m.san)).slice(0, 3).map((move) => ({ move, why: `${move.san} does not create the verified before/after feature: ${reason}.` }));
}

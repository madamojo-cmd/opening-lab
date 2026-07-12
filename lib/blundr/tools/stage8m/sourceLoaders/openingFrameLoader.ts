import { createReadStream, existsSync } from 'node:fs';
import { createInterface } from 'node:readline';
import { Chess } from 'chess.js';
import type { SourceFrame } from '../types';

interface OpeningRow { nodeId: string; openingId?: string; playSequenceUci?: string; ply?: number; }
export async function loadOpeningFrames(jsonlPath?: string, limit = 10000): Promise<SourceFrame[]> {
  if (!jsonlPath || !existsSync(jsonlPath)) return [];
  const frames: SourceFrame[] = []; const seen = new Set<string>(); const lines = createInterface({ input: createReadStream(jsonlPath), crlfDelay: Infinity });
  for await (const line of lines) { if (!line.trim()) continue; let row: OpeningRow; try { row = JSON.parse(line); } catch { continue; } if (seen.has(row.nodeId)) continue;
    const chess = new Chess(); let legal = true; for (const token of (row.playSequenceUci ?? '').split(/\s+/).filter(Boolean)) { const move = (chess.moves({ verbose: true }) as Array<{ from: string; to: string; promotion?: string }>).find((m) => `${m.from}${m.to}${m.promotion ?? ''}` === token); if (!move) { legal = false; break; } chess.move({ from: move.from, to: move.to, promotion: move.promotion }); }
    if (legal) { seen.add(row.nodeId); frames.push({ sourceId: row.nodeId, kind: 'opening_frame', fen: chess.fen(), openingId: row.openingId, generatedAtPly: row.ply }); } if (frames.length >= limit) break;
  }
  return frames;
}

import { createReadStream, existsSync } from 'node:fs'; import { createInterface } from 'node:readline';
export interface CandidateMoveStat { uci: string; san?: string; totalGames: number; playPct?: number; }
interface Row extends CandidateMoveStat { nodeId: string; }
export async function loadCandidateMoves(path?: string, relevantNodeIds?: Set<string>): Promise<Map<string, CandidateMoveStat[]>> { const out = new Map<string, CandidateMoveStat[]>(); if (!path || !existsSync(path)) return out; const lines = createInterface({ input: createReadStream(path), crlfDelay: Infinity });
  for await (const line of lines) { if (!line.trim()) continue; let row: Row; try { row = JSON.parse(line); } catch { continue; } if (relevantNodeIds && !relevantNodeIds.has(row.nodeId)) continue; const list = out.get(row.nodeId) ?? []; const existing = list.find((x) => x.uci === row.uci); if (!existing || row.totalGames > existing.totalGames) { if (existing) list.splice(list.indexOf(existing), 1); list.push({ uci: row.uci, san: row.san, totalGames: row.totalGames, playPct: row.playPct }); list.sort((a, b) => b.totalGames - a.totalGames); out.set(row.nodeId, list.slice(0, 12)); } }
  return out; }

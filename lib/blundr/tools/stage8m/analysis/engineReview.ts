export interface EngineReview { reviewed: boolean; bestMoveUci?: string; centipawnGap?: number; provider: 'stockfish' | 'none'; }
export function unavailableEngineReview(): EngineReview { return { reviewed: false, provider: 'none' }; }

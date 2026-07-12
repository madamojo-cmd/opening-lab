export interface TablebaseReview { reviewed: boolean; wdl?: 'win' | 'draw' | 'loss'; dtz?: number; provider: 'syzygy' | 'none'; }
export function unavailableTablebaseReview(): TablebaseReview { return { reviewed: false, provider: 'none' }; }

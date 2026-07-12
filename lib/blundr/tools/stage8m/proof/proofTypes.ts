export type { KeySquareProof, ImbalanceProof, KingRaceProof, PawnStructureDelta } from '../types';
export interface EndgameProof { family: string; ruleSentence: string; searchDepth: number; principalVariation: string[]; bestScore: number; nextBestScore: number; }
export interface PawnWarProof { beforePassers: string[]; afterPassers: string[]; searchDepth: number; principalVariation: string[]; bestScore: number; alternativeScores: number[]; }

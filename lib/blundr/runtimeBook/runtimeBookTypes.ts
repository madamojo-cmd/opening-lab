export type Stage2RuntimeBookRawNodeRow = {
  nodeId?: string;
  openingId: string;
  displayName?: string;
  learnerPerspective?: string;
  playKey?: string;
  playSequenceUci?: string;
  ply?: number;
  sideToMove?: string;
  source?: string;
  profileId?: string;
  whiteWins?: number;
  draws?: number;
  blackWins?: number;
  totalGames?: number;
  openingEco?: string;
  openingName?: string;
  trainerCutoff?: boolean;
  needsLichessData?: boolean;
  fetchedAt?: string;
  rawPath?: string;
  crawlSet?: string;
  [key: string]: unknown;
};

export type Stage2RuntimeBookRawMoveRow = {
  openingId: string;
  playKeyBefore?: string;
  moveUci?: string;
  moveSan?: string;
  totalGames?: number;
  playPct?: number;
  profiles?: string;
  profile?: string;
  sources?: string;
  source?: string;
  rank?: number;
  runtimeCandidate?: boolean;
  [key: string]: unknown;
};

export type Stage2RuntimeBookNode = Stage2RuntimeBookRawNodeRow & {
  openingId: string;
  playKey?: string;
  ply?: number;
};

export type Stage2RuntimeBookMove = Stage2RuntimeBookRawMoveRow & {
  openingId: string;
  playKeyBefore?: string;
  moveUci?: string;
  moveSan?: string;
  rank?: number;
  totalGames?: number;
  playPct?: number;
};

export type Stage2RuntimeBookIndex = {
  packageRoot: string;
  runtimeDir: string;
  nodeCount: number;
  moveCount: number;
  openingIds: string[];
  maxPlyByOpening: Record<string, number>;
  nodeIndexByOpeningAndPlayKey: Map<string, Stage2RuntimeBookNode>;
  moveIndexByOpeningAndPlayKeyBefore: Map<string, Stage2RuntimeBookMove[]>;
};

export type Stage2RuntimeBookLoadResult = {
  packageRoot: string;
  runtimeDir: string;
  nodeFilePath: string;
  moveFilePath: string;
  nodes: Stage2RuntimeBookNode[];
  moves: Stage2RuntimeBookMove[];
};

export type Stage2RuntimeBookMoveQueryInput = {
  openingId: string;
  playKeyBefore: string;
};

export type Stage2RuntimeBookCandidate = {
  uci: string;
  san?: string;
  source: "book";
  supported: true;
  runtimeBookSource: "stage2-runtime-book";
  rank?: number;
  totalGames?: number;
  playPct?: number;
  profile?: string;
  profiles?: string;
  sourceDetail?: string;
  sources?: string;
};

export type Stage2RuntimeCandidatesForFrameResult = {
  openingId: string;
  playKeyBefore: string;
  candidates: Stage2RuntimeBookCandidate[];
  hasRuntimeBookCandidates: boolean;
  bookExhausted: boolean;
};

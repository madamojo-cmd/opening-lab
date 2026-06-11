export type SampleStage2Mode = "assisted" | "plain";

export type SampleStage2TargetContext = {
  openingId: string;
  nodeKey?: string;
  playKey?: string;
  moveUci: string;
  mode?: SampleStage2Mode;
  showMoreRevealed?: boolean;
};

export type SampleStage2CrawlNode = {
  openingId: string;
  nodeKey: string;
  playKey?: string;
  playSequenceUci?: string | string[];
  ply?: number;
  sideToMove?: string;
  totalGames?: number;
  source?: string;
  profileId?: string;
  [key: string]: unknown;
};

export type SampleStage2CrawlCandidateMove = {
  openingId: string;
  nodeKey: string;
  moveUci: string;
  moveSan?: string;
  rank?: number;
  games?: number;
  playKey?: string;
  blundrUse?: string;
  [key: string]: unknown;
};

export type SampleStage2CrawlBundle = {
  source?: string;
  openingIds: string[];
  nodes: SampleStage2CrawlNode[];
  candidateMoves: SampleStage2CrawlCandidateMove[];
  [key: string]: unknown;
};

export type SampleStage2CopyStatus = "draft" | "approved" | "disabled";

export type SampleStage2CopyEntry = {
  entryId: string;
  openingId?: string;
  lineId?: string;
  nodeKey?: string;
  moveUci?: string;
  conceptId?: string;
  difficulty?: string;
  surface?: string;
  title?: string;
  body?: string;
  hint?: string;
  visualRecipeRefs?: string[];
  status?: SampleStage2CopyStatus;
  [key: string]: unknown;
};

export type SampleStage2CopyBundle = {
  source?: string;
  entries: SampleStage2CopyEntry[];
  [key: string]: unknown;
};

export type SampleStage2PacketStatus = "matched" | "no_match" | "blocked";

export type SampleStage2Packet = {
  status: SampleStage2PacketStatus;
  openingId: string;
  nodeKey?: string;
  playKey?: string;
  moveUci: string;
  conceptId?: string;
  copy?: {
    entryId: string;
    title?: string;
    body?: string;
    hint?: string;
    difficulty?: string;
    surface?: string;
  };
  visualRecipeRefs?: string[];
  sampleOnly: true;
  source: "stage2_sample_colle";
  blockers?: string[];
};

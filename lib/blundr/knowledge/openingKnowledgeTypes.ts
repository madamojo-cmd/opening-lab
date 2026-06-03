export interface OpeningKnowledgeItem {
  id: string;
  openingKey: string;
  lineKey?: string;
  fen?: string;
  moves?: string[];
  conceptTags: string[];
  summary: string;
  plansForWhite?: string[];
  plansForBlack?: string[];
  commonMistakes?: string[];
  tacticalMotifs?: string[];
  strategicThemes?: string[];
  provenance: Array<{
    sourceType: "curated_note" | "engine_checked_line" | "master_game" | "opening_book";
    sourceLabel: string;
    confidence: "high" | "medium" | "low";
  }>;
}

export interface OpeningKnowledgeContext {
  provider: "opening_knowledge";
  status: "not_applicable" | "found" | "not_found" | "unavailable" | "error";
  items: OpeningKnowledgeItem[];
  matchedBy: Array<"openingKey" | "lineKey" | "fen" | "moves" | "conceptTags">;
  warnings: string[];
}

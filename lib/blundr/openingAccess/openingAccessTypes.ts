import type {
  OpeningAccessDecision,
  OpeningAccessSnapshot,
} from "@/lib/blundr/contracts";

export type OpeningAccessRequest = {
  userId: string;
  openingId: string;
  repertoireSide: "white" | "black";
  now?: string;
};
export type OpeningAccessRepository = {
  get(input: OpeningAccessRequest): OpeningAccessSnapshot | null;
};
export type { OpeningAccessDecision, OpeningAccessSnapshot };

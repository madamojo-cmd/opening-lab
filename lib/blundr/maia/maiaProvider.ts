import type { MaiaOpponentReplyRequest, MaiaOpponentReplyResult } from "./maiaTypes";

export interface MaiaProvider {
  readonly name: string;
  readonly version: string;
  isAvailable(): boolean;
  getOpponentReplies(request: MaiaOpponentReplyRequest): Promise<MaiaOpponentReplyResult>;
}

export const unavailableMaiaProvider: MaiaProvider = {
  name: "maia-unavailable",
  version: "0.0.0",
  isAvailable: () => false,
  getOpponentReplies: async (request) => ({
    status: "unavailable",
    requestId: request.requestId,
    fen4: request.fen4,
    skillLevel: request.skillLevel,
    candidates: [],
    selectedCandidate: null,
    errorReason: "provider_unavailable",
    providerMs: 0,
  }),
};

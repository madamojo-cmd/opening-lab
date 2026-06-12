import { getRuntimeBookMoves } from "./getRuntimeBookMoves";
import { adaptRuntimeBookCandidates } from "./runtimeBookCandidateAdapter";
import type {
  Stage2RuntimeBookIndex,
  Stage2RuntimeCandidatesForFrameResult,
} from "./runtimeBookTypes";

export function getStage2RuntimeCandidatesForFrame(input: {
  index: Stage2RuntimeBookIndex;
  openingId: string;
  playKeyBefore: string;
}): Stage2RuntimeCandidatesForFrameResult {
  const openingId = String(input.openingId ?? "");
  const playKeyBefore = String(input.playKeyBefore ?? "");
  if (!openingId || !playKeyBefore) {
    return {
      openingId,
      playKeyBefore,
      candidates: [],
      hasRuntimeBookCandidates: false,
      bookExhausted: true,
    };
  }

  const rawMoves = getRuntimeBookMoves(input.index, { openingId, playKeyBefore });
  const candidates = adaptRuntimeBookCandidates(rawMoves);
  return {
    openingId,
    playKeyBefore,
    candidates,
    hasRuntimeBookCandidates: candidates.length > 0,
    bookExhausted: candidates.length === 0,
  };
}

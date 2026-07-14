import { Chess } from "chess.js";
import {
  createPositionIdentity,
  type IdentityInput,
  type PositionIdentity,
} from "@/lib/blundr/contracts";

export { createPositionIdentity };
export type { IdentityInput, PositionIdentity };

export function canonicalizeFen(fen: string): string {
  const chess = new Chess(fen);
  return chess.fen();
}

export function createValidatedPositionIdentity(
  input: IdentityInput,
): PositionIdentity {
  return createPositionIdentity({
    ...input,
    canonicalFen: canonicalizeFen(input.canonicalFen),
  });
}

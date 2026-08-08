import "server-only";

import { createHash } from "node:crypto";
import { Chess } from "chess.js";
import { createPositionIdentity } from "@/lib/blundr/contracts";
import { getOpeningSide } from "@/lib/blundr/repertoire/repertoireOpeningPool";
import {
  buildRuntimeOpeningIdentityLines,
  loadStage2RuntimeTrainableRepertoire,
} from "@/lib/blundr/openings/runtimeLineBodyLoader";
import { resolveStage2CanonicalOpeningId } from "@/lib/blundr/openings/openingIdentity";
import { validateRestrictedRuntimeLineSession } from "@/lib/blundr/runtime/restrictedRuntimeLineAuthority";

export type VerifiedTrainerRuntimeLine = {
  openingId: string;
  lineId: string;
  lineKey: string;
  sequenceUci: string[];
  userColor: "w" | "b";
  startingFen: string;
  terminalFen: string;
  lineDigest: string;
  targets: Array<{
    target_id: string;
    target_fingerprint: string;
    opening_id: string;
    position_key: string;
    canonical_fen: string;
    expected_move_uci: string;
    move_order_key: string;
    full_ply: number;
  }>;
};

/**
 * Resolves an exact, shipped restricted line.  Callers never supply a move
 * sequence, FEN, colour, or line key: those are all derived from the verified
 * runtime line body on the server.
 */
export async function resolveVerifiedTrainerRuntimeLine(input: {
  openingId: unknown;
  lineId: unknown;
}): Promise<VerifiedTrainerRuntimeLine | null> {
  const openingId = resolveStage2CanonicalOpeningId(
    String(input.openingId ?? ""),
  );
  const requestedLineId = String(input.lineId ?? "").trim();
  if (!openingId || !requestedLineId) return null;
  const repertoire = await loadStage2RuntimeTrainableRepertoire(openingId);
  const line = buildRuntimeOpeningIdentityLines(repertoire).find(
    (candidate) => candidate.lineId === requestedLineId,
  );
  if (!line) return null;
  const userColor = getOpeningSide(openingId) === "black" ? "b" : "w";
  const startingFen = new Chess().fen();
  const lineKey = `${line.lineId}:${line.playKey}`;
  const validated = validateRestrictedRuntimeLineSession({
    selectedRuntimeLineId: line.lineId,
    selectedRuntimeLineKey: lineKey,
    selectedPlaySequenceUci: line.playSequenceUci,
    startingFen,
    userColor,
    // The validator requires a session ID, but this value is not persisted or
    // exposed; the actual session ID is generated only after resolution.
    sessionId: "server-preflight",
  });
  if (!validated.ok) return null;
  const game = new Chess(validated.startingFen);
  const targets: VerifiedTrainerRuntimeLine["targets"] = [];
  for (let fullPly = 0; fullPly < validated.sequence.length; fullPly += 1) {
    const expectedMoveUci = validated.sequence[fullPly];
    if (game.turn() === userColor) {
      const moveOrderKey =
        validated.sequence.slice(0, fullPly).join(",") || "startpos";
      const position = createPositionIdentity({
        canonicalFen: game.fen(),
        openingId,
        expectedMoveUci,
        repertoireSide: userColor === "b" ? "black" : "white",
        moveOrderKey,
      });
      const ordinal = targets.length + 1;
      const targetFingerprint = createHash("sha256")
        .update(
          `${ordinal}:${openingId}:${position.positionKey}:${expectedMoveUci}:${moveOrderKey}`,
        )
        .digest("hex");
      targets.push({
        target_id: `trainer-target:${ordinal}:${targetFingerprint.slice(0, 24)}`,
        target_fingerprint: targetFingerprint,
        opening_id: openingId,
        position_key: position.positionKey,
        canonical_fen: position.canonicalFen,
        expected_move_uci: expectedMoveUci,
        move_order_key: moveOrderKey,
        full_ply: fullPly,
      });
    }
    const move = game.move({
      from: expectedMoveUci.slice(0, 2),
      to: expectedMoveUci.slice(2, 4),
      promotion:
        expectedMoveUci.length > 4 ? expectedMoveUci.slice(4, 5) : undefined,
    });
    if (!move) return null;
  }
  if (targets.length !== validated.totalLearnerMoves) return null;
  const lineDigest = createHash("sha256")
    .update(targets.map((target) => target.target_fingerprint).join(":"))
    .digest("hex");
  return {
    openingId,
    lineId: validated.selectedLineId,
    lineKey: validated.selectedLineKey,
    sequenceUci: validated.sequence,
    userColor,
    startingFen: validated.startingFen,
    terminalFen: validated.finalFen,
    lineDigest,
    targets,
  };
}

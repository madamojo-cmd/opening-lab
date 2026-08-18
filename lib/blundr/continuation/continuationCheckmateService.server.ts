import "server-only";

import { createHash } from "node:crypto";

import type { CurrentBlundrUser } from "@/lib/blundr/accounts/accountTypes";
import { createBlundrSupabaseAdminClient } from "@/lib/blundr/backend/supabaseAdminClient";
import { resolveVerifiedTrainerRuntimeLine } from "@/lib/blundr/trainerCompletion/trainerRuntimeLine.server";
import { verifyContinuationCheckmatePath } from "./continuationCheckmateAuthority";

const CHECKMATE_VERIFICATION_VERSION = "chess.js-server-v1";

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export async function commitContinuationCheckmate(input: {
  user: CurrentBlundrUser;
  trainerSessionId: unknown;
  pathUci: readonly unknown[];
}): Promise<{
  status: "inserted" | "duplicate";
  evidenceId: string;
  trainerSessionId: string;
}> {
  const trainerSessionId = text(input.trainerSessionId);
  if (!trainerSessionId || !Array.isArray(input.pathUci)) {
    throw new Error("continuation_checkmate_invalid");
  }

  const admin = createBlundrSupabaseAdminClient();
  if (!admin) {
    throw new Error("continuation_checkmate_persistence_unavailable");
  }

  const loaded = await admin
    .from("blundr_trainer_sessions_v2")
    .select(
      "session_id,user_id,opening_id,line_id,line_fingerprint,state,current_cursor,line_length,terminal_completion_id,completed_at",
    )
    .eq("session_id", trainerSessionId)
    .eq("user_id", input.user.userId)
    .maybeSingle();
  if (loaded.error) {
    throw new Error("continuation_checkmate_persistence_unavailable");
  }

  const session = loaded.data;
  if (
    !session ||
    session.state !== "completed" ||
    Number(session.current_cursor) !== Number(session.line_length) ||
    !text(session.terminal_completion_id) ||
    !session.completed_at
  ) {
    throw new Error("continuation_trainer_terminal_unverified");
  }

  const line = await resolveVerifiedTrainerRuntimeLine({
    openingId: session.opening_id,
    lineId: session.line_id,
  });
  if (!line || line.lineDigest !== text(session.line_fingerprint)) {
    throw new Error("continuation_runtime_line_unverified");
  }

  const verified = verifyContinuationCheckmatePath({
    terminalFen: line.terminalFen,
    userColor: line.userColor,
    pathUci: input.pathUci,
  });

  const terminalCompletionId = text(session.terminal_completion_id);
  const identityMaterial = [
    input.user.userId,
    trainerSessionId,
    terminalCompletionId,
    verified.pathUci.join(","),
  ].join(":");
  const completionId = `continuation-checkmate:${sha256(identityMaterial)}`;
  const requestFingerprint = sha256(
    [
      identityMaterial,
      line.openingId,
      line.terminalFen,
      verified.completedFen,
      verified.matingMoveUci,
      CHECKMATE_VERIFICATION_VERSION,
    ].join(":"),
  );

  const result = await admin.rpc("blundr_commit_continuation_checkmate_v1", {
    p_user_id: input.user.userId,
    p_completion: {
      completion_id: completionId,
      trainer_session_id: trainerSessionId,
      terminal_completion_id: terminalCompletionId,
      opening_id: line.openingId,
      path_uci: verified.pathUci,
      terminal_fen: line.terminalFen,
      checkmate_fen: verified.completedFen,
      mating_move_uci: verified.matingMoveUci,
      request_fingerprint: requestFingerprint,
      verification_version: CHECKMATE_VERIFICATION_VERSION,
    },
  });
  if (result.error || !result.data) {
    throw new Error(
      text(result.error?.message) ||
        "continuation_checkmate_persistence_unavailable",
    );
  }

  return result.data as {
    status: "inserted" | "duplicate";
    evidenceId: string;
    trainerSessionId: string;
  };
}

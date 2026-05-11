import { NextRequest, NextResponse } from "next/server";

import {
  buildFeaturePacket,
  recommendationPending,
  ruleVisualSelector,
  verifyVisualOutput,
  type FeaturePacketInput,
} from "@/lib/blundr";
import { buildAdaptiveContext } from "@/lib/blundr/coaching/adaptiveContext";

export const dynamic = "force-dynamic";

function firstMove(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

function candidateMovesFromBody(body: any): FeaturePacketInput["candidateMoves"] {
  const out: NonNullable<FeaturePacketInput["candidateMoves"]> = [];
  const expected = firstMove(body.expectedMove ?? body.expectedMoves);
  if (expected) {
    out.push(expected as any);
  }
  if (Array.isArray(body.expectedMoves)) {
    out.push(...body.expectedMoves);
  }
  if (body.stockfish?.bestMove) {
    out.push(body.stockfish.bestMove);
  }
  if (body.stockfishSummary?.bestMove) {
    out.push(body.stockfishSummary.bestMove);
  }
  if (body.clientEngine?.pvs?.[0]) {
    out.push(body.clientEngine.pvs[0]);
  }
  if (body.engine?.pvs?.[0]) {
    out.push(body.engine.pvs[0]);
  }
  if (Array.isArray(body.candidateMoves)) {
    out.push(...body.candidateMoves);
  }
  return out;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  try {
    const packet = buildFeaturePacket({
      fen: String(body.fen ?? ""),
      openingName: body.openingName,
      userColor: body.userColor,
      selectedView: "plan",
      expectedMove: firstMove(body.expectedMove ?? body.expectedMoves) as any,
      expectedMoves: Array.isArray(body.expectedMoves) ? body.expectedMoves : undefined,
      stockfishBestMove: body.stockfish?.bestMove ?? body.stockfishSummary?.bestMove ?? body.clientEngine?.pvs?.[0] ?? body.engine?.pvs?.[0],
      engine: body.engine ?? body.stockfishSummary,
      clientEngine: body.clientEngine,
      candidateMoves: candidateMovesFromBody(body),
    });

    const selected = ruleVisualSelector(packet);
    const verified = verifyVisualOutput(selected, packet, { mode: "runtime" });
    const concept = typeof verified.debug?.concept === "string" ? verified.debug.concept : verified.context?.concept;
    const selectedMove = typeof verified.debug?.selectedMove === "string" ? verified.debug.selectedMove : verified.context?.selectedMove;
    const context = buildAdaptiveContext({
      base: verified.context ?? {
        headline: verified.headline,
        body: verified.mainExplanation,
        next: verified.nextPlan,
        concept,
        selectedMove,
      },
      concept,
      selectedMove,
      trainingPhase: body.trainingPhase ?? body.trainingMode,
      userRatingBucket: body.userRatingBucket ?? body.ratingLabel ?? body.ratingPool,
      memory: body.coachingMemory,
    });

    return NextResponse.json({
      ...verified,
      context,
      debug: {
        ...(verified.debug ?? {}),
        source: "ruleVisualSelector",
        fallbackUsed: Boolean(verified.fallback),
        packet: {
          candidateMoves: packet.derived.candidateMoves.map((move) => move.move),
          candidateSquares: packet.derived.candidateSquares,
          candidateArrows: packet.derived.candidateArrows.length,
          candidateClaims: packet.derived.candidateClaims.map((claim) => claim.type),
        },
      },
    });
  } catch (error) {
    const fallback = recommendationPending(
      {
        fen: String(body.fen ?? ""),
        openingName: body.openingName,
        userColor: body.userColor,
        expectedMove: firstMove(body.expectedMove ?? body.expectedMoves) as any,
        candidateMoves: candidateMovesFromBody(body),
      },
      error instanceof Error ? error.message : "visual model failed",
    );

    return NextResponse.json({
      ...fallback,
      suppress: Array.from(new Set([...(fallback.suppress ?? []), "recommendation_pending"])),
      debug: {
        ...(fallback.debug ?? {}),
        source: "fallback",
        fallbackUsed: true,
      },
    });
  }
}

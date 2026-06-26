import { NextResponse } from "next/server";

import { MaiaLc0RuntimeAdapter } from "@/lib/blundr/maia/maiaLc0RuntimeAdapter";
import { readMaiaRuntimeConfig } from "@/lib/blundr/maia/maiaRuntimeConfig";
import { validateOpponentReplyPayload } from "@/lib/blundr/maia/opponentReplyPayload";

function jsonNoStore(body: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function buildUnavailableResponse(request: any, errorReason: string, providerMs: number | null = null): Response {
  return jsonNoStore({
    status: "unavailable",
    requestId: Number(request?.requestId ?? 0) || 0,
    fen4: String(request?.fen4 ?? ""),
    skillLevel: String(request?.skillLevel ?? "maia-1500"),
    candidates: [],
    selectedCandidate: null,
    errorReason,
    providerMs,
  }, { status: 503 });
}

export async function POST(request: Request): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return jsonNoStore({ error: "invalid_json" }, { status: 400 });
  }

  const validated = validateOpponentReplyPayload(body);
  if (validated.ok === false) {
    return jsonNoStore({ error: validated.reason }, { status: 400 });
  }

  const payload = validated.value;
  try {
    const config = readMaiaRuntimeConfig();
    const adapter = new MaiaLc0RuntimeAdapter(config);
    const runtime = await adapter.getBestMove(payload);

    const candidate = runtime.bestMoveUci
      ? {
          uci: runtime.bestMoveUci,
          san: null,
          from: runtime.bestMoveUci.slice(0, 2),
          to: runtime.bestMoveUci.slice(2, 4),
          humanLikelihood: null,
          rank: 1,
          policyScore: null,
          skillLevel: payload.skillLevel,
          source: "maia" as const,
        }
      : null;

    const providerStatus =
      runtime.status === "ready"
        ? "ready"
        : runtime.status === "disabled"
          ? "disabled"
          : runtime.status === "timeout"
            ? "timeout"
            : "unavailable";

    return jsonNoStore({
      status: providerStatus,
      requestId: payload.requestId,
      fen4: payload.fen4,
      skillLevel: payload.skillLevel,
      ratingBandId: payload.ratingBandId ?? null,
      requestedRating: payload.requestedRating ?? null,
      candidates: candidate && runtime.legal ? [candidate] : [],
      selectedCandidate: candidate && runtime.legal ? candidate : null,
      errorReason: runtime.errorReason,
      providerMs: runtime.runtimeMs,
    });
  } catch (error) {
    return buildUnavailableResponse(payload, error instanceof Error && /timeout/i.test(error.message) ? "timeout" : "provider_error");
  }
}

export async function GET(): Promise<Response> {
  return jsonNoStore({ error: "method_not_allowed" }, { status: 405 });
}

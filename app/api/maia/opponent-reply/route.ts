import { NextResponse } from "next/server";

import type { MaiaSkillLevel } from "@/lib/blundr/maia/maiaTypes";
import type { MaiaRuntimeMoveRequest } from "@/lib/blundr/maia/maiaRuntimeTypes";
import { MaiaLc0RuntimeAdapter } from "@/lib/blundr/maia/maiaLc0RuntimeAdapter";
import { readMaiaRuntimeConfig } from "@/lib/blundr/maia/maiaRuntimeConfig";

const SKILLS = new Set<MaiaSkillLevel>([
  "maia-1100",
  "maia-1200",
  "maia-1300",
  "maia-1400",
  "maia-1500",
  "maia-1600",
  "maia-1700",
  "maia-1800",
  "maia-1900",
]);

function jsonNoStore(body: unknown, init?: ResponseInit): NextResponse {
  const response = NextResponse.json(body, init);
  response.headers.set("Cache-Control", "no-store");
  return response;
}

function normalizeUci(uci: unknown): string | null {
  const value = String(uci ?? "").trim().toLowerCase();
  return /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(value) ? value : null;
}

export function validateOpponentReplyPayload(body: any): { ok: true; value: MaiaRuntimeMoveRequest } | { ok: false; reason: string } {
  const requestId = Number(body?.requestId);
  if (!Number.isFinite(requestId)) return { ok: false, reason: "invalid_request_id" };

  const fen = String(body?.fen ?? "").trim();
  const fen4 = String(body?.fen4 ?? "").trim();
  if (!fen || !fen4) return { ok: false, reason: "invalid_fen" };

  const skillLevel = String(body?.skillLevel ?? "") as MaiaSkillLevel;
  if (!SKILLS.has(skillLevel)) return { ok: false, reason: "invalid_skill_level" };

  const timeoutMs = Math.max(250, Math.min(5000, Number(body?.timeoutMs ?? 1500)));
  const legalMovesRaw = Array.isArray(body?.legalMovesUci) ? body.legalMovesUci : [];
  if (!legalMovesRaw.length || legalMovesRaw.length > 512) return { ok: false, reason: "invalid_legal_moves" };
  const legalMovesUci = legalMovesRaw.map(normalizeUci).filter(Boolean) as string[];
  if (!legalMovesUci.length) return { ok: false, reason: "invalid_legal_moves" };

  return {
    ok: true,
    value: {
      requestId,
      fen,
      fen4,
      legalMovesUci,
      skillLevel,
      timeoutMs,
    },
  };
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
    candidates: candidate && runtime.legal ? [candidate] : [],
    selectedCandidate: candidate && runtime.legal ? candidate : null,
    errorReason: runtime.errorReason,
    providerMs: runtime.runtimeMs,
  });
}

export async function GET(): Promise<Response> {
  return jsonNoStore({ error: "method_not_allowed" }, { status: 405 });
}

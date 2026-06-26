import assert from "node:assert/strict";

import { POST } from "../../app/api/maia/opponent-reply/route";
import { validateOpponentReplyPayload } from "../../lib/blundr/maia/opponentReplyPayload";
import { MaiaLc0RuntimeAdapter } from "../../lib/blundr/maia/maiaLc0RuntimeAdapter";

function jsonRequest(payload: unknown): Request {
  return new Request("http://localhost/api/maia/opponent-reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function readJson(response: Response): Promise<any> {
  return response.json();
}

async function testDisabledAndInvalid() {
  process.env.MAIA_ENABLED = "false";
  const disabled = await POST(jsonRequest({
    requestId: 1,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci: ["e2e4"],
    skillLevel: "maia-1500",
    timeoutMs: 1500,
  }));
  const d = await readJson(disabled);
  assert.equal(d.status, "disabled", "disabled_route_returns_disabled");
  assert.equal(d.errorReason, "disabled", "disabled_route_returns_disabled_reason");

  const invalid = await POST(jsonRequest({ bad: true }));
  assert.equal(invalid.status, 400, "invalid_payload_returns_400");

  const invalidFen = await POST(jsonRequest({
    requestId: 2,
    fen: "bad fen",
    fen4: "bad fen",
    legalMovesUci: ["e2e4"],
    skillLevel: "maia-1500",
    timeoutMs: 1500,
  }));
  assert.equal(invalidFen.status, 400, "invalid_fen_returns_400");

  const validated = validateOpponentReplyPayload({
    requestId: 1,
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
    legalMovesUci: ["e2e4"],
    skillLevel: "maia-1500",
    timeoutMs: 1500,
  });
  assert.equal(validated.ok, true);
}

async function testRouteShapesWithMockedRuntime() {
  const original = MaiaLc0RuntimeAdapter.prototype.getBestMove;
  try {
    MaiaLc0RuntimeAdapter.prototype.getBestMove = async function (request: any): Promise<any> {
      return {
        status: "ready",
        requestId: request.requestId,
        fen4: request.fen4,
        skillLevel: request.skillLevel,
        bestMoveUci: "e2e4",
        legal: true,
        errorReason: null,
        runtimeMs: 42,
      };
    };

    const ready = await POST(jsonRequest({
      requestId: 9,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
      legalMovesUci: ["e2e4"],
      skillLevel: "maia-1500",
      timeoutMs: 1500,
    }));
    const r = await readJson(ready);
    assert.equal(r.status, "ready", "runtime_ready_returns_maia_candidate");
    assert.equal(r.selectedCandidate?.uci, "e2e4");

    MaiaLc0RuntimeAdapter.prototype.getBestMove = async function (request: any): Promise<any> {
      return {
        status: "timeout",
        requestId: request.requestId,
        fen4: request.fen4,
        skillLevel: request.skillLevel,
        bestMoveUci: null,
        legal: false,
        errorReason: "timeout",
        runtimeMs: 1500,
      };
    };
    const timeout = await POST(jsonRequest({
      requestId: 10,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
      legalMovesUci: ["e2e4"],
      skillLevel: "maia-1500",
      timeoutMs: 1500,
    }));
    const t = await readJson(timeout);
    assert.equal(t.status, "timeout", "timeout_returns_timeout_payload");

    MaiaLc0RuntimeAdapter.prototype.getBestMove = async function (request: any): Promise<any> {
      return {
        status: "error",
        requestId: request.requestId,
        fen4: request.fen4,
        skillLevel: request.skillLevel,
        bestMoveUci: "h7h5",
        legal: false,
        errorReason: "bestmove_illegal",
        runtimeMs: 88,
      };
    };
    const illegal = await POST(jsonRequest({
      requestId: 11,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
      legalMovesUci: ["e2e4"],
      skillLevel: "maia-1500",
      timeoutMs: 1500,
    }));
    const i = await readJson(illegal);
    assert.equal(i.selectedCandidate, null, "illegal_bestmove_returns_no_candidate");
    assert.equal(Array.isArray(i.candidates), true);

    assert.equal(typeof i.status, "string");
    assert.equal(typeof i.requestId, "number");
    assert.equal(typeof i.fen4, "string", "response_shape_matches_MaiaOpponentReplyResult");
  } finally {
    MaiaLc0RuntimeAdapter.prototype.getBestMove = original;
  }
}

async function testRouteFallbackOnUnexpectedError() {
  const original = MaiaLc0RuntimeAdapter.prototype.getBestMove;
  try {
    MaiaLc0RuntimeAdapter.prototype.getBestMove = async function (): Promise<any> {
      throw new Error("unexpected_maia_failure");
    };
    const response = await POST(jsonRequest({
      requestId: 12,
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      fen4: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -",
      legalMovesUci: ["e2e4"],
      skillLevel: "maia-1500",
      timeoutMs: 1500,
    }));
    const payload = await readJson(response);
    assert.equal(response.status, 503, "unexpected_maia_error_returns_stable_fallback");
    assert.equal(payload.status, "unavailable");
    assert.equal(payload.errorReason, "provider_error");
  } finally {
    MaiaLc0RuntimeAdapter.prototype.getBestMove = original;
  }
}

async function main() {
  await testDisabledAndInvalid();
  await testRouteShapesWithMockedRuntime();
  await testRouteFallbackOnUnexpectedError();
  console.log("maiaApiRoute ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

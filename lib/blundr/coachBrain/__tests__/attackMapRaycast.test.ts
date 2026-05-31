import assert from "node:assert/strict";
import { getPieceAttacksFrom, getSliderRayInfo } from "../attackMap";

export function testAttackMapRaycast(): void {
  const fenDirect = "r1bqk2r/ppp2ppp/2np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";
  const direct = getPieceAttacksFrom(fenDirect, "c4");
  assert.equal(direct.includes("f7"), true);

  const fenBlocked = "r1bqk2r/ppp2ppp/2np1n2/2bpp3/2B1P3/2PP1N2/PP3PPP/RNBQK2R w KQkq - 0 6";
  const blocked = getPieceAttacksFrom(fenBlocked, "c4");
  assert.equal(blocked.includes("f7"), false);

  const rays = getSliderRayInfo(fenBlocked, "c4");
  assert.equal(rays.direct.includes("d5"), true);
  assert.equal(rays.direct.includes("g0"), false);
  assert.equal(Array.isArray(rays.xray), true);
}

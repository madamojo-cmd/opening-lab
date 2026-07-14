import { describe, expect, it } from "vitest";
import { normalizeRuntimeCastlingUci } from "@/lib/blundr/runtime/uciNormalization";

describe("runtime authority integration seam", () => {
  it("normalizes castling notation at the shared runtime boundary", () => {
    expect(normalizeRuntimeCastlingUci("e1g1")).toBe("e1g1");
    expect(normalizeRuntimeCastlingUci("e1h1")).toBe("e1g1");
  });
});

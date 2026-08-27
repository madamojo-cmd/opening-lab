import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  loadReviewMistakeSnapshot,
  loadReviewMistakeSolution,
} from "../reviewMistakeRepository.server";

type Filter = { op: "eq" | "is" | "in"; column: string; value: unknown };

class FakeQuery {
  public readonly table: string;
  public selectColumns: string | null = null;
  public readonly filters: Filter[] = [];

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string) {
    this.selectColumns = columns;
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push({ op: "eq", column, value });
    return this;
  }

  is(column: string, value: unknown) {
    this.filters.push({ op: "is", column, value });
    return this;
  }

  in(column: string, value: unknown) {
    this.filters.push({ op: "in", column, value });
    return this;
  }

  order() {
    return this;
  }

  limit() {
    return this;
  }

  async maybeSingle(): Promise<{ data: unknown; error: unknown }> {
    return { data: null, error: null };
  }
}

class FakeAdminClient {
  public readonly queries: FakeQuery[] = [];
  constructor(private readonly responders: Record<string, (q: FakeQuery) => unknown>) {}

  from(table: string) {
    const query = new FakeQuery(table);
    this.queries.push(query);
    const responder = this.responders[table];
    query.maybeSingle = async () => {
      try {
        return { data: responder ? responder(query) : null, error: null };
      } catch (error: unknown) {
        return { data: null, error };
      }
    };
    return query;
  }
}

describe("Review mistake repository", () => {
  it("filters snapshot reads by user_id and does not select expected move", async () => {
    process.env.BLUNDR_FEATURE_LEARNING_CORE_V2_READ = "true";
    const userId = "user-a";
    const mistakeId = "pos-1234abcd";

    const fake = new FakeAdminClient({
      blundr_weakness_projection: (q) => {
        expect(
          q.filters.some(
            (f) =>
              f.op === "eq" && f.column === "user_id" && f.value === userId,
          ),
        ).toBe(true);
        return {
          position_key: mistakeId,
          opening_id: "italian-white",
          play_key: "mainline",
          category: "opening_move",
          lifecycle_state: "active",
          lapse_count: 3,
          last_evidence_at: "2026-08-25T00:00:00.000Z",
          updated_at: "2026-08-25T00:01:00.000Z",
        };
      },
      blundr_learning_events: (q) => {
        expect(
          q.filters.some(
            (f) =>
              f.op === "eq" && f.column === "user_id" && f.value === userId,
          ),
        ).toBe(true);
        expect(q.selectColumns).toBeTruthy();
        expect(q.selectColumns?.includes("expected_move_uci")).toBe(true);
        return {
          position_key: mistakeId,
          canonical_fen:
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          expected_move_uci: "e2e4",
          repertoire_side: "white",
          opening_id: "italian-white",
          move_order_key: "mainline",
          occurred_at: "2026-08-25T00:00:00.000Z",
          deleted_at: null,
        };
      },
    });

    const result = await loadReviewMistakeSnapshot({
      userId,
      mistakeId,
      adminClient: fake as unknown as never,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.mistakeId).toBe(mistakeId);
      expect(result.data.repertoireSide).toBe("white");
      expect(result.data.missCount).toBe(3);
      expect("expectedMoveUci" in result.data).toBe(false);
    }
  });

  it("filters solution reads by user_id and selects expected move only on solution path", async () => {
    process.env.BLUNDR_FEATURE_LEARNING_CORE_V2_READ = "true";
    const userId = "user-a";
    const otherUserId = "user-b";
    const mistakeId = "pos-1234abcd";

    const fake = new FakeAdminClient({
      blundr_weakness_projection: (q) => {
        expect(
          q.filters.some(
            (f) =>
              f.op === "eq" && f.column === "user_id" && f.value === userId,
          ),
        ).toBe(true);
        expect(
          q.filters.some(
            (f) =>
              f.op === "eq" &&
              f.column === "user_id" &&
              f.value === otherUserId,
          ),
        ).toBe(false);
        return {
          position_key: mistakeId,
          opening_id: "italian-white",
          play_key: "mainline",
          category: "opening_move",
          lifecycle_state: "active",
          lapse_count: 3,
          last_evidence_at: "2026-08-25T00:00:00.000Z",
          updated_at: "2026-08-25T00:01:00.000Z",
        };
      },
      blundr_learning_events: (q) => {
        expect(q.selectColumns).toBeTruthy();
        expect(q.selectColumns?.includes("expected_move_uci")).toBe(true);
        return {
          position_key: mistakeId,
          canonical_fen:
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
          expected_move_uci: "e2e4",
          repertoire_side: "white",
          opening_id: "italian-white",
          move_order_key: "mainline",
          occurred_at: "2026-08-25T00:00:00.000Z",
          deleted_at: null,
        };
      },
    });

    const result = await loadReviewMistakeSolution({
      userId,
      mistakeId,
      adminClient: fake as unknown as never,
    });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.expectedMoveUci).toBe("e2e4");
  });

  it("rejects direct access to a superseded historical expected move", async () => {
    process.env.BLUNDR_FEATURE_LEARNING_CORE_V2_READ = "true";
    const userId = "user-a";
    const mistakeId = "pos-1234abcd";

    const fake = new FakeAdminClient({
      blundr_weakness_projection: () => ({
        position_key: mistakeId,
        opening_id: "italian-white",
        play_key: "mainline",
        category: "opening_move",
        lifecycle_state: "active",
        lapse_count: 3,
        last_evidence_at: "2026-08-25T00:00:00.000Z",
        updated_at: "2026-08-25T00:01:00.000Z",
      }),
      blundr_learning_events: () => ({
        position_key: mistakeId,
        canonical_fen:
          "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        expected_move_uci: "d2d4",
        repertoire_side: "white",
        opening_id: "italian-white",
        move_order_key: "mainline",
        occurred_at: "2026-08-25T00:00:00.000Z",
        deleted_at: null,
      }),
    });

    const snapshot = await loadReviewMistakeSnapshot({
      userId,
      mistakeId,
      adminClient: fake as unknown as never,
    });
    expect(snapshot).toEqual({ ok: false, error: "not_found" });

    const solution = await loadReviewMistakeSolution({
      userId,
      mistakeId,
      adminClient: fake as unknown as never,
    });
    expect(solution).toEqual({ ok: false, error: "not_found" });
  });
});

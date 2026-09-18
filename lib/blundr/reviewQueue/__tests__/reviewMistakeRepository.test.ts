import assert from "node:assert/strict";
import test from "node:test";

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
  constructor(
    private readonly responders: Record<string, (q: FakeQuery) => unknown>,
  ) {}

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

test("Review mistake repository filters snapshot reads by user_id and does not select expected move", async () => {
  process.env.BLUNDR_FEATURE_LEARNING_CORE_V2_READ = "true";
  const userId = "user-a";
  const mistakeId = "pos-1234abcd";

  const fake = new FakeAdminClient({
    blundr_weakness_projection: (q) => {
      assert.equal(
        q.filters.some(
          (f) => f.op === "eq" && f.column === "user_id" && f.value === userId,
        ),
        true,
      );
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
      assert.equal(
        q.filters.some(
          (f) => f.op === "eq" && f.column === "user_id" && f.value === userId,
        ),
        true,
      );
      assert.ok(q.selectColumns);
      assert.equal(q.selectColumns?.includes("expected_move_uci"), true);
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
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.data.mistakeId, mistakeId);
    assert.equal(result.data.repertoireSide, "white");
    assert.equal(result.data.missCount, 3);
    assert.equal("expectedMoveUci" in result.data, false);
  }
});

test("Review mistake repository filters solution reads by user_id and selects expected move only on solution path", async () => {
  process.env.BLUNDR_FEATURE_LEARNING_CORE_V2_READ = "true";
  const userId = "user-a";
  const otherUserId = "user-b";
  const mistakeId = "pos-1234abcd";

  const fake = new FakeAdminClient({
    blundr_weakness_projection: (q) => {
      assert.equal(
        q.filters.some(
          (f) => f.op === "eq" && f.column === "user_id" && f.value === userId,
        ),
        true,
      );
      assert.equal(
        q.filters.some(
          (f) =>
            f.op === "eq" && f.column === "user_id" && f.value === otherUserId,
        ),
        false,
      );
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
      assert.ok(q.selectColumns);
      assert.equal(q.selectColumns?.includes("expected_move_uci"), true);
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
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.data.expectedMoveUci, "e2e4");
});

test("Review mistake repository rejects direct access to a superseded historical expected move", async () => {
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
      canonical_fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
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
  assert.deepEqual(snapshot, { ok: false, error: "not_found" });

  const solution = await loadReviewMistakeSolution({
    userId,
    mistakeId,
    adminClient: fake as unknown as never,
  });
  assert.deepEqual(solution, { ok: false, error: "not_found" });
});

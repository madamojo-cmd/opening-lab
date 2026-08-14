import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
}));

vi.mock("server-only", () => ({}));
vi.mock("@/lib/blundr/backend/supabaseAdminClient", () => ({
  createBlundrSupabaseAdminClient: mocks.createClient,
}));

import { ProductionDailyRepository } from "./productionDailyRepository.server";

type QueryResult = {
  data: Record<string, unknown> | null;
  error: { message: string } | null;
};

function createQuery(result: QueryResult) {
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn(async () => result),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  return builder;
}

function createClient(results: QueryResult[]) {
  const queue = [...results];
  return {
    from: vi.fn(() => {
      const result = queue.shift();
      if (!result) throw new Error("Unexpected table query");
      return createQuery(result);
    }),
  };
}

const deckRow = {
  deck_id: "deck-1",
  local_date: "2026-08-14",
  public_cards: [{ cardFingerprint: "card-1" }],
  server_cards: [{ cardFingerprint: "card-1", answer: "g1f3" }],
  composer_version: "daily-board-first-v4",
  runtime_package_id: "runtime-test",
  profile_version: "default-free",
};

const sessionRow = {
  session_id: "session-1",
  deck_id: "deck-1",
  user_id: "user-1",
  state: {
    currentIndex: 0,
    completedCardIds: [],
    revealedCardIds: [],
  },
  state_version: 3,
  completed_at: null,
  updated_at: "2026-08-14T12:00:00.000Z",
};

beforeEach(() => {
  mocks.createClient.mockReset();
  process.env.NODE_ENV = "test";
});

describe("ProductionDailyRepository owned-session lookup", () => {
  it("loads a reserved date with explicit deck and owned-session reads", async () => {
    const client = createClient([
      { data: deckRow, error: null },
      { data: sessionRow, error: null },
    ]);
    mocks.createClient.mockReturnValue(client);

    const session = await new ProductionDailyRepository().getByDate(
      "user-1",
      "2026-08-14",
    );

    expect(client.from.mock.calls.map(([table]) => table)).toEqual([
      "blundr_daily_decks",
      "blundr_daily_sessions",
    ]);
    expect(session).toMatchObject({
      sessionId: "session-1",
      deckId: "deck-1",
      userId: "user-1",
      dateKey: "2026-08-14",
      version: 3,
    });
  });

  it("loads an owned session without an ambiguous relationship embed", async () => {
    const client = createClient([
      { data: sessionRow, error: null },
      { data: deckRow, error: null },
    ]);
    mocks.createClient.mockReturnValue(client);

    const session = await new ProductionDailyRepository().getOwned(
      "session-1",
      "user-1",
    );

    expect(client.from.mock.calls.map(([table]) => table)).toEqual([
      "blundr_daily_sessions",
      "blundr_daily_decks",
    ]);
    expect(session).toMatchObject({
      sessionId: "session-1",
      deckId: "deck-1",
      userId: "user-1",
    });
  });

  it("does not misclassify a persistence failure as an expired deck", async () => {
    mocks.createClient.mockReturnValue(
      createClient([{ data: null, error: { message: "database down" } }]),
    );

    await expect(
      new ProductionDailyRepository().getOwned("session-1", "user-1"),
    ).rejects.toThrow("daily_session_persistence_unavailable");
  });
});

import { adaptChessComGame } from "./chessComGameAdapter";
import {
  boundedArchiveMonths,
  type ChessComArchiveCursor,
} from "./chessComArchiveCursor";
import { chessComHeaders, chessComRetryDecision } from "./chessComRatePolicy";
import type { ProviderFetch, ProviderRequestBounds } from "../../index";
import type { RawProviderGame } from "../../gameNormalizer";

export const CHESS_COM_HOST = "https://api.chess.com";

async function fetchJson(
  fetcher: ProviderFetch,
  url: string,
  init: RequestInit,
  attempt = 0,
): Promise<Response> {
  try {
    const response = await fetcher(url, init);
    const decision = chessComRetryDecision(response.status, attempt);
    if (decision.retry) {
      await new Promise((resolve) => setTimeout(resolve, decision.delayMs));
      return fetchJson(fetcher, url, init, attempt + 1);
    }
    return response;
  } catch (error) {
    const decision = chessComRetryDecision("network", attempt);
    if (!decision.retry) throw error;
    await new Promise((resolve) => setTimeout(resolve, decision.delayMs));
    return fetchJson(fetcher, url, init, attempt + 1);
  }
}

export class ChessComClient {
  constructor(private readonly fetcher: ProviderFetch = fetch) {}

  async verifyUsername(
    username: string,
  ): Promise<
    | { ok: true; id: string; username: string }
    | { ok: false; code: "account_not_found" | "provider_unavailable" }
  > {
    const normalized = username.trim().toLowerCase();
    const response = await fetchJson(
      this.fetcher,
      `${CHESS_COM_HOST}/pub/player/${encodeURIComponent(normalized)}`,
      { headers: chessComHeaders() },
    );
    if (response.status === 404)
      return { ok: false, code: "account_not_found" };
    if (!response.ok) return { ok: false, code: "provider_unavailable" };
    const body = (await response.json()) as {
      player_id?: number;
      username?: string;
    };
    if (!body.player_id || !body.username)
      return { ok: false, code: "account_not_found" };
    return {
      ok: true,
      id: String(body.player_id),
      username: body.username.toLowerCase(),
    };
  }

  async fetchArchivePage(
    username: string,
    month: string,
    cursor?: Pick<ChessComArchiveCursor, "etag" | "lastModified">,
  ): Promise<{
    games: readonly RawProviderGame[];
    nextCursor: string | null;
    notModified?: boolean;
  }> {
    const response = await fetchJson(
      this.fetcher,
      `${CHESS_COM_HOST}/pub/player/${encodeURIComponent(username)}/games/${month}`,
      { headers: chessComHeaders(cursor?.etag, cursor?.lastModified) },
    );
    if (response.status === 304)
      return { games: [], nextCursor: null, notModified: true };
    if (!response.ok) throw new Error(`chesscom_http_${response.status}`);
    const body = (await response.json()) as {
      games?: readonly Record<string, unknown>[];
    };
    const games: RawProviderGame[] = (body.games ?? [])
      .map((game) => adaptChessComGame(game, username))
      .filter((game): game is RawProviderGame => Boolean(game));
    return { games, nextCursor: null };
  }

  async *streamGames(
    username: string,
    bounds: ProviderRequestBounds,
  ): AsyncGenerator<RawProviderGame> {
    const months = boundedArchiveMonths(bounds.from, bounds.to, 13);
    let count = 0;
    for (const month of months) {
      if (bounds.signal?.aborted) return;
      const page = await this.fetchArchivePage(username, month);
      for (const game of page.games) {
        if (count++ >= bounds.maxGames) return;
        yield game;
      }
    }
  }
}

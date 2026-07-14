import { LICHESS_HEADERS, lichessRetryDelay } from "./lichessRatePolicy";
import { parseLichessNdjson } from "./lichessStreamParser";
import type {
  ProviderFetch,
  ProviderRequestBounds,
  RawProviderGame,
} from "../../index";

export const LICHESS_HOST = "https://lichess.org";

export class LichessClient {
  constructor(private readonly fetcher: ProviderFetch = fetch) {}

  async verifyUsername(
    username: string,
  ): Promise<
    | { ok: true; id: string }
    | { ok: false; code: "account_not_found" | "provider_unavailable" }
  > {
    const response = await this.fetcher(
      `${LICHESS_HOST}/api/user/${encodeURIComponent(username.trim())}`,
      {
        headers: {
          Accept: "application/json",
          "User-Agent": LICHESS_HEADERS["User-Agent"],
        },
      },
    );
    if (response.status === 404)
      return { ok: false, code: "account_not_found" };
    if (!response.ok) return { ok: false, code: "provider_unavailable" };
    const body = (await response.json()) as { id?: string; username?: string };
    return body.id
      ? { ok: true, id: body.id }
      : { ok: false, code: "account_not_found" };
  }

  async *streamGames(
    username: string,
    bounds: ProviderRequestBounds,
  ): AsyncGenerator<RawProviderGame> {
    const params = new URLSearchParams({
      max: String(Math.min(bounds.maxGames, 1000)),
      pgnInJson: "true",
      until: String(bounds.to.getTime()),
      since: String(bounds.from.getTime()),
      rated: "true",
      perfType: "blitz,rapid,classical",
    });
    let attempt = 0;
    while (true) {
      if (bounds.signal?.aborted) return;
      let response: Response;
      try {
        response = await this.fetcher(
          `${LICHESS_HOST}/api/games/user/${encodeURIComponent(username)}?${params}`,
          { headers: LICHESS_HEADERS, signal: bounds.signal },
        );
      } catch (error) {
        const delay = lichessRetryDelay("network", attempt++);
        if (delay === null || attempt > 4) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      if (!response.ok) {
        const delay = lichessRetryDelay(response.status, attempt++);
        if (delay === null || attempt > 4)
          throw new Error(`lichess_http_${response.status}`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      if (!response.body) return;
      let count = 0;
      for await (const game of parseLichessNdjson(response.body, username)) {
        if (count++ >= bounds.maxGames) return;
        yield game;
      }
      return;
    }
  }
}

import { adaptLichessGame } from "./lichessGameAdapter";
import type { RawProviderGame } from "../../gameNormalizer";

export async function* parseLichessNdjson(
  stream: ReadableStream<Uint8Array>,
  username: string,
  maxRecordBytes = 2_000_000,
): AsyncGenerator<RawProviderGame> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let bytes = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (buffer.length > maxRecordBytes) return;
      buffer += decoder.decode(chunk.value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        const trimmed = line.replace(/\r$/, "").trim();
        if (!trimmed) continue;
        if (trimmed.length > maxRecordBytes) return;
        const game = adaptLichessGame(trimmed, username);
        if (game) yield game;
      }
    }
    const finalLine = `${buffer}${decoder.decode()}`.trim();
    if (finalLine) {
      const game = adaptLichessGame(finalLine, username);
      if (game) yield game;
    }
  } finally {
    if (stream.locked) await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

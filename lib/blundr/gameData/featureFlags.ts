export function isGameDataEnabled(): boolean {
  return ["1", "true", "yes", "on"].includes(
    String(process.env.BLUNDR_GAME_DATA_ENABLED ?? "").toLowerCase(),
  );
}

export function isGameDataWorkerEnabled(): boolean {
  return ["1", "true", "yes", "on"].includes(
    String(process.env.BLUNDR_GAME_DATA_WORKER_ENABLED ?? "").toLowerCase(),
  );
}

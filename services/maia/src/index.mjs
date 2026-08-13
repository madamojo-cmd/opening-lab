import { once } from "node:events";

import { readConfig } from "./config.mjs";
import { MaiaEnginePool } from "./engine-pool.mjs";
import { createLogger } from "./logger.mjs";
import { loadManifest, verifyModelFiles } from "./manifest.mjs";
import { createMaiaServer } from "./server.mjs";

async function main() {
  const config = readConfig();
  const logger = createLogger(config.logLevel);
  const manifest = await loadManifest();
  const models = await verifyModelFiles(manifest, config.modelDir);
  const enginePool = new MaiaEnginePool({
    config,
    manifest,
    models,
    logger,
  });
  await enginePool.initialize();
  const server = createMaiaServer({
    config,
    manifest,
    models,
    enginePool,
    logger,
  });

  const shutdown = async (signal) => {
    logger.info("maia_shutdown_started", { signal });
    server.close();
    await Promise.race([
      once(server, "close"),
      new Promise((resolve) => setTimeout(resolve, 8_000)),
    ]);
    await enginePool.close();
    logger.info("maia_shutdown_complete", { signal });
  };
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.once(signal, () => {
      shutdown(signal)
        .catch((error) =>
          logger.error("maia_shutdown_failed", { message: error.message }),
        )
        .finally(() => process.exit(0));
    });
  }

  server.listen(config.port, config.host);
  await once(server, "listening");
  logger.info("maia_service_ready", {
    host: config.host,
    port: config.port,
    serviceVersion: manifest.serviceVersion,
    modelCount: models.size,
    engineVersion: manifest.engine.version,
  });
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: "error",
      event: "maia_startup_failed",
      code: String(error?.message ?? "startup_failed").slice(0, 160),
    }),
  );
  process.exit(1);
});

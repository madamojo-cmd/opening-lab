import { getServerFeatureFlags } from "@/lib/blundr/contracts/serverFeatureFlags";

export function isGameDataEnabled(): boolean {
  const flags = getServerFeatureFlags();
  return flags.game_data_connections && flags.provider_ingestion;
}

export function isGameDataWorkerEnabled(): boolean {
  return getServerFeatureFlags().provider_ingestion;
}

import type { ProviderAccountRecord } from "./gameDataTypes";

export function buildSuccessfulProviderSyncAccount(
  account: ProviderAccountRecord,
  syncedAt: string,
): Omit<ProviderAccountRecord, "createdAt" | "updatedAt"> {
  return {
    id: account.id,
    userId: account.userId,
    provider: account.provider,
    username: account.username,
    externalPlayerId: account.externalPlayerId,
    verificationState: "verified",
    connectedAt: account.connectedAt,
    lastSuccessfulSyncAt: syncedAt,
    nextEligibleSyncAt: account.nextEligibleSyncAt,
    sanitizedErrorCode: null,
  };
}

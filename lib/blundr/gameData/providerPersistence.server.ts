import "server-only";

export function requireProviderPersistence<T>(client: T | null): T | null {
  if (client || process.env.NODE_ENV === "test") return client;
  throw new Error("provider_persistence_unavailable");
}

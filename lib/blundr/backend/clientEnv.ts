export function isClientDevToolsEnabled(): boolean {
  return ["1", "true", "yes", "on"].includes(
    String(process.env.NEXT_PUBLIC_BLUNDR_DEV_TOOLS_ENABLED ?? "").toLowerCase(),
  );
}

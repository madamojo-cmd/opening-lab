export function isBlundrDebugEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_BLUNDR_DEBUG === "1") return true;
  if (typeof window === "undefined") return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") === "1" || params.get("blundrDebug") === "1") return true;
    return window.localStorage.getItem("blundr.debug.enabled") === "true";
  } catch {
    return false;
  }
}

export function setBlundrDebugEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem("blundr.debug.enabled", enabled ? "true" : "false");
  } catch {}
}

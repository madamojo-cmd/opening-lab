/**
 * Local builds without a configured Sentry DSN do not need to compile the
 * complete browser/server Sentry SDK graph. This module is selected only by
 * webpack for that exact no-telemetry case; Preview and Production keep the
 * real SDK and their existing configuration.
 */
export function init(): void {}
export function captureRouterTransitionStart(): void {}
export function captureRequestError(): void {}
export function captureException(): string | undefined { return undefined; }
export async function flush(): Promise<boolean> { return true; }

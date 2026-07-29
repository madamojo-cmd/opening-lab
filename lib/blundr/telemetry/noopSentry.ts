/**
 * Local builds without a configured Sentry DSN do not need to compile the
 * complete browser/server Sentry SDK graph. This module is selected only by
 * webpack for that exact no-telemetry case; Preview and Production keep the
 * real SDK and their existing configuration.
 */
export function init(): void {}
export function captureRouterTransitionStart(): void {}
export function captureRequestError(): void {}
export function captureException(): string | undefined {
  return undefined;
}
export async function flush(): Promise<boolean> {
  return true;
}

function identityWrapper<T>(value: T): T {
  return value;
}

// The Sentry/Next compiler injects these imports into generated route and
// component modules. Local no-telemetry builds still need the same module
// surface even though every wrapper is intentionally an identity function.
export const wrapServerComponentWithSentry = identityWrapper;
export const wrapClientComponentWithSentry = identityWrapper;
export const wrapPageComponentWithSentry = identityWrapper;
export const wrapGenerationFunctionWithSentry = identityWrapper;
export const wrapRouteHandlerWithSentry = identityWrapper;
export const wrapApiHandlerWithSentry = identityWrapper;
export const wrapMiddlewareWithSentry = identityWrapper;
export const wrapGetServerSidePropsWithSentry = identityWrapper;
export const wrapGetStaticPropsWithSentry = identityWrapper;
export const wrapGetInitialPropsWithSentry = identityWrapper;

import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

const projectRoot = path.resolve(__dirname);
const isDeploymentBuild =
  process.env.VERCEL === "1" ||
  process.env.CI === "1" ||
  process.env.CI === "true";
const isPreviewDeployment =
  isDeploymentBuild && process.env.VERCEL_ENV === "preview";

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  webpack(config, { dev }) {
    // The production compiler's filesystem cache can exceed the isolated
    // staging workspace quota before Next reaches type-checking. Keep the
    // build repeatable without allowing a multi-gigabyte cache to turn a
    // valid build into an ENOSPC failure. This does not disable source maps,
    // Sentry processing, or TypeScript checking.
    if (!dev) config.cache = false;
    return config;
  },
  experimental: {
    webpackBuildWorker: false,
    workerThreads: true,
  },
  turbopack: {
    root: projectRoot,
  },
};
const sentryBuildConfig = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  sourcemaps: {
    // Preserve production source-map uploads, but keep Preview deployments
    // bounded when the external Sentry processor is unavailable or slow.
    // Runtime Sentry telemetry remains enabled in Preview; only the optional
    // build-time upload is skipped there.
    disable:
      !process.env.SENTRY_AUTH_TOKEN ||
      !isDeploymentBuild ||
      isPreviewDeployment,
  },
  // Production retains the complete client upload. Preview skips source maps
  // above, so do not expand its optional upload set.
  widenClientFileUpload: !isPreviewDeployment,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
};

// Preview runtime telemetry is initialized by the Sentry runtime config files.
// Avoid the build-time webpack plugin there: Vercel Preview has repeatedly
// stalled after its client phase despite source-map upload being disabled.
// Production continues to use the complete Sentry build integration.
export default isPreviewDeployment
  ? nextConfig
  : withSentryConfig(nextConfig, sentryBuildConfig);

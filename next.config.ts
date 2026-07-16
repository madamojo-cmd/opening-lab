import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import path from "path";

const projectRoot = path.resolve(__dirname);
const isDeploymentBuild =
  process.env.VERCEL === "1" ||
  process.env.CI === "1" ||
  process.env.CI === "true";

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
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  sourcemaps: {
    // Keep staging/Vercel source-map upload enabled, but do not let local
    // .env.local credentials trigger an external Sentry upload during a
    // network-isolated developer build.
    disable: !process.env.SENTRY_AUTH_TOKEN || !isDeploymentBuild,
  },
  widenClientFileUpload: true,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});

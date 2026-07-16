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
  // Preview still uploads source maps, but widening the client upload makes
  // Sentry process every client source map and has repeatedly left otherwise
  // successful staging builds stuck after the Node and Edge uploads finish.
  // Keep the full upload for production deployments while bounding staging
  // processing to the normal client asset set.
  widenClientFileUpload: !isPreviewDeployment,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});

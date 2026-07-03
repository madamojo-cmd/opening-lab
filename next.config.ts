import type { NextConfig } from "next";
import path from "path";

const projectRoot = path.resolve(__dirname);

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    webpackBuildWorker: false,
  },
  turbopack: {
    root: projectRoot,
  },
};
export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Keep this independently deployable package from inheriting the app
  // workspace's tracing graph and instrumentation files on Vercel.
  outputFileTracingRoot: __dirname,
  turbopack: { root: __dirname },
  async redirects() {
    return [{ source: "/:path+", has: [{ type: "host", value: "www.blundr.io" }], destination: "https://blundr.io/:path*", permanent: true }];
  }
};

export default nextConfig;

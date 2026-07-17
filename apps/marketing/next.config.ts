import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: __dirname },
  async redirects() {
    return [{ source: "/:path+", has: [{ type: "host", value: "www.blundr.io" }], destination: "https://blundr.io/:path*", permanent: true }];
  }
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/samples/observatory", destination: "/", permanent: true },
      { source: "/samples/atlas", destination: "/blog", permanent: true },
      { source: "/samples/atlas/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },
};

export default nextConfig;

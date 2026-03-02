import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import "@/lib/env";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // optimizePackageImports for @phosphor-icons conflicts with Turbopack HMR
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);

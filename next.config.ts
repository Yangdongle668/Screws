import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  trailingSlash: true,
};

export default nextConfig;

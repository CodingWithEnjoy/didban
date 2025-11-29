import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "liara-s3.dastyar.io",
      },
    ],
  },
};

export default nextConfig;

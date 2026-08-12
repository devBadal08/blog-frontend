import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "192.168.1.15",
        port: "8000",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;

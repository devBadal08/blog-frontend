import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.supplychainbasics.com",
        pathname: "/storage/**",
      },
    ],
  },
};

export default nextConfig;

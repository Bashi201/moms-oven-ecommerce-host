import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: process.env.NODE_ENV === "development",   // ← disable optimizer only in dev

    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
      
      // Keep this for production later (when you deploy backend)
      // {
      //   protocol: "https",
      //   hostname: "your-api-domain.com",
      //   pathname: "/uploads/**",
      // },
    ],
  },
};

export default nextConfig;
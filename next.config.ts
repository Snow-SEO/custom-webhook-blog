import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' }
    ]
  },

    // Compiler options for modern JavaScript
  compiler: {
    // Remove console logs only when NODE_ENV is production
    removeConsole: process.env.NODE_ENV === "production",
  },

  allowedDevOrigins: [
    "localhost:3000",
    "*.ngrok-free.app",
    "*.a.free.pinggy.link"
  ],

  experimental: {
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;

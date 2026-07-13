import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the local IP to connect to the dev server
  allowedDevOrigins: ["172.21.32.1"],

  // Disable strict header checks for local development if needed
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
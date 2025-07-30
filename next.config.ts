import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";

const handleDevelopment = async () => {
  await setupDevPlatform();
};

const nextConfig: NextConfig = {
  /* config options here */
};

if (process.env.NODE_ENV === "development") {
  handleDevelopment();
}

export default nextConfig;

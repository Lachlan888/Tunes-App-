import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep verification builds separate from a developer's running app.
  distDir: process.env.TUNES_QA_BUILD === "1" ? ".next-qa" : ".next",
};

export default nextConfig;

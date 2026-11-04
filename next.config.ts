import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // react-pageflip nu suportă dubla montare din React Strict Mode
  reactStrictMode: false,
};

export default nextConfig;

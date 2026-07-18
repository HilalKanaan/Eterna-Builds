import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Serve modern, smaller formats and cache optimized images aggressively.
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31_536_000, // 1 year
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 64, 128, 256, 384],
  },
  // Trim client bundles: only pull the icons actually used from lucide-react.
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  compiler: {
    // Strip console.* in production (keep warnings/errors).
    removeConsole: { exclude: ["error", "warn"] },
  },
  poweredByHeader: false,
};

export default nextConfig;

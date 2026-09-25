import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only the isolated OSS build enables this; Vinext/Sites keeps its defaults.
  ...(process.env.NEXT_PUBLIC_STATIC_PRODUCTION === "1"
    ? { output: "export", trailingSlash: true, images: { unoptimized: true } }
    : {}),
};

export default nextConfig;

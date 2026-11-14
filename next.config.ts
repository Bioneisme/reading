import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: { "/api/story": ["./data/raw/cmudict.dict"] },
};

export default nextConfig;

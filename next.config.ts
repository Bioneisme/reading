import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: { "/api/story": ["./data/raw/cmudict.dict"] },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Uploads are served through the authenticated /api/files route with
    // plain <img> tags, so the Next image optimizer (sharp) is not needed.
    unoptimized: true,
  },
  poweredByHeader: false,
};

export default nextConfig;

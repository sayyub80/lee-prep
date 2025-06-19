import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    domains: [
      'images.pexels.com',
      'images.unsplash.com', // add this if you use Unsplash too
    ],
  },
};

export default nextConfig;

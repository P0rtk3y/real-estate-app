import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "**.realtor.com" },
      { protocol: "https", hostname: "**.yelpcdn.com" },
      { protocol: "https", hostname: "**.s1.ticketm.net" },
    ],
  },
};

export default nextConfig;

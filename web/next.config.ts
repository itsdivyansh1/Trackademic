import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["trackademic-bucket.s3.ap-south-1.amazonaws.com"],
    // Or use remotePatterns for more control
    remotePatterns: [
      {
        protocol: "https",
        hostname: "trackademic-bucket.s3.ap-south-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

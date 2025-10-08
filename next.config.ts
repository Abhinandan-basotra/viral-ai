import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("fluent-ffmpeg");
      config.externals.push("@ffmpeg-installer/ffmpeg");
      config.externals.push("@ffprobe-installer/ffprobe")
    }

    return config;
  },
};

export default nextConfig;

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // outputFileTracingRoot: path.resolve(__dirname, '../../'),  // Uncomment and add 'import path from "path"' if needed
  experimental: {
    // The Next 16 development filesystem cache can be left inconsistent when
    // VS Code stops a preview task while Turbopack is compacting its database.
    // Keep Turbopack enabled, but use its in-memory cache so every preview
    // starts from source instead of restoring potentially orphaned .sst files.
    turbopackFileSystemCacheForDev: false,
  },
  allowedDevOrigins: ['*.dev.coze.site'],
  async headers() {
    return [
      {
        source: '/campus-map/:map/:zoom/:x/:tile.webp',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

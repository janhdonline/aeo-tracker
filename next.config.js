/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/index',
        destination: '/industries',
      },
      {
        source: '/index/:industry',
        destination: '/industries/:industry',
      },
    ];
  },
};

module.exports = nextConfig;

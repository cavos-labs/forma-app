/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'https://formacr.com/api/auth/:path*',
      },
      {
        source: '/api/currency/:path*',
        destination: 'https://formacr.com/api/currency/:path*',
      },
      {
        source: '/api/users/:path*',
        destination: 'https://formacr.com/api/users/:path*',
      },
      {
        source: '/api/memberships/:path*',
        destination: 'https://formacr.com/api/memberships/:path*',
      },
      {
        source: '/api/payments/:path*',
        destination: 'https://formacr.com/api/payments/:path*',
      },
      {
        source: '/api/daily-workouts/:path*',
        destination: 'https://formacr.com/api/daily-workouts/:path*',
      },
      // General fallback for any other API routes
      {
        source: '/api/:path*',
        destination: 'https://formacr.com/api/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-api-key' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
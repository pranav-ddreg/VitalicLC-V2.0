import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hrms-lms.s3.ap-south-1.amazonaws.com',
        port: '*',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'devtest-ddreg.s3.ap-south-1.amazonaws.com',
        port: '*',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
        port: '*',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
    ],
    domains: [
      'lc-vitalic.s3.ap-south-1.amazonaws.com',
      'localhost',
      'lc.vitalicglobal.com',
      'lc-test.vitalicglobal.com',
      'devtest-ddreg.s3.ap-south-1.amazonaws.com',
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:9000/api/:path*', // Proxy to Backend
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false

    return config
  },
}

export default nextConfig

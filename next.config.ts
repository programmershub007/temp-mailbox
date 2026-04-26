import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/external/:path*',
        destination: 'https://api.internal.temp-mail.io/api/v3/:path*',
      },
    ]
  },
}

export default nextConfig
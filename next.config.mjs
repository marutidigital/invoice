/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bcskjlkaebiplahvfbid.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Allow @react-pdf/renderer to work without SSR issues
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals ?? []), 'canvas']
    }
    return config
  },
}

export default nextConfig


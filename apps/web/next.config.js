/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@readsy/ui', '@readsy/types', '@readsy/config'],
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig 
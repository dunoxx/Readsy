/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  i18n: {
    locales: ['pt', 'en', 'es'],
    defaultLocale: 'pt',
  },
}

module.exports = nextConfig 
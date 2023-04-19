/** @type {import('next').NextConfig} */
const nextConfig = {
  // experimental: {
    transpilePackages: ['@acme/hello'],
    transpilePackages: ['@acme/price'],
    transpilePackages: ['@acme/ui'],
  // },
}

module.exports = nextConfig

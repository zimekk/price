/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@acme/auto",
    "@acme/euro",
    "@acme/hello",
    "@acme/ross",
    "@acme/xkom",
    "@acme/ui",
  ],
};

module.exports = nextConfig;

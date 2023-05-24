/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@acme/euro",
    "@acme/hello",
    "@acme/ross",
    "@acme/xkom",
    "@acme/ui",
  ],
};

module.exports = nextConfig;

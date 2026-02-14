/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes are built-in — no proxy needed!
  experimental: {
    serverComponentsExternalPackages: ["unpdf", "mammoth"],
  },
};

module.exports = nextConfig;

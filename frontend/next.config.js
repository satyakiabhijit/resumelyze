/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes are built-in — no proxy needed!
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "mammoth"],
  },
};

module.exports = nextConfig;

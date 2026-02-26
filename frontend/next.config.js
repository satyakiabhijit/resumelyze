/** @type {import('next').NextConfig} */
const nextConfig = {
  // API routes are built-in — no proxy needed!
  experimental: {
    serverComponentsExternalPackages: ["unpdf", "mammoth"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
    ],
  },
};

module.exports = nextConfig;

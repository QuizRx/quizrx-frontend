/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Standalone output mode optimized for containerized deployments
  output: "standalone",
  // Remove the powered by header for security
  poweredByHeader: false,
  // Since we're deploying to Cloud Run, we don't need a custom asset prefix
  assetPrefix: "",
  // Configure for optimized Docker builds
  outputFileTracingRoot: process.cwd(),
  // Use default Next.js directory structure
  distDir: ".next",
  // Optimize image handling
  images: {
    formats: ["image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
  // Simple logging configuration without NODE_ENV dependency
  logging: {
    level: "warn",
  },
};

export default nextConfig;

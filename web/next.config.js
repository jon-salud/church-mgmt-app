/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Only enable static export for production builds
  ...(process.env.NODE_ENV === 'production' && { output: 'export' }),
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Skip API routes during static export since they require server-side processing
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Configure for GitHub Pages deployment
  // Replace 'jon-salud' with your actual GitHub username
  basePath: process.env.NODE_ENV === 'production' ? '/church-mgmt-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/church-mgmt-app/' : '',
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Use standard build instead of standalone to avoid Windows symlink issues
  // output: 'standalone',
  trailingSlash: false,
  experimental: {
    serverComponentsExternalPackages: [],
    // Disable static optimization for all pages
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Prevent static generation of pages
    disableOptimizedLoading: true,
  },
  // Force dynamic rendering for all pages
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Allow build to succeed even with export errors
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Configure for GitHub Pages deployment
  // Replace 'jon-salud' with your actual GitHub username
  basePath: process.env.NODE_ENV === 'production' ? '/church-mgmt-app' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/church-mgmt-app/' : '',
};

module.exports = nextConfig;

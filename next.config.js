/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prevent Next.js from trying to bundle server-only packages
  // that are only used in the Express API layer
  experimental: {
    serverComponentsExternalPackages: [
      'mongoose',
      'passkit-generator',
      '@parse/node-apn',
      'google-auth-library',
      'twilio',
      'web-push',
    ],
  },
};

module.exports = nextConfig;

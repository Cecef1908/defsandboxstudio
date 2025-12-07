/** @type {import('next').NextConfig} */
const path = require('path');
const nextConfig = {
  reactStrictMode: true,
  
  // Configuration des images externes (Firebase Storage, etc.)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
      },
    ],
  },

  // Variables d'environnement exposées au client
  env: {
    NEXT_PUBLIC_APP_VERSION: '2.0.0',
  },

  // Configuration du workspace
  outputFileTracingRoot: __dirname,

  // Exclure _old-app du build
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules', '**/_old-app/**'],
    };

    // Ajouter les aliases webpack pour corriger la résolution des modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname),
    };

    return config;
  },
};

module.exports = nextConfig;

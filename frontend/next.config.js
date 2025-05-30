/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable standalone output for Vercel deployment
  output: 'standalone',
  
  // Disable experimental features that can cause issues
  experimental: {
    esmExternals: 'loose',
    optimizeCss: false,
  },
  
  // Disable optimizations that require critters
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  // Disable built-in CSS optimization
  optimizeFonts: false,
  
  // Environment variables for cloud deployment
  env: {
    NEXT_PUBLIC_API_URL: process.env.NODE_ENV === 'production' 
      ? 'https://capora-backend.onrender.com'
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  },
  
  // API rewrites for development
  async rewrites() {
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://capora-backend.onrender.com'
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Image optimization for cloud deployment
  images: {
    domains: [
      'localhost',
      'capora-backend.onrender.com',
      'capora.vercel.app',
    ],
    unoptimized: true, // Disable optimization for free tier
    dangerouslyAllowSVG: true,
  },
  
  // Security headers for production
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 
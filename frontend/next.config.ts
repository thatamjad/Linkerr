import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable ESLint during build for Vercel deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript errors during build for Vercel deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Enable output for static export if needed
  output: 'standalone',
  
  // Image optimization
  images: {
    domains: ['localhost', 'your-backend-domain.com'],
    unoptimized: false
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  
  // Performance optimizations
  compress: true,
  
  // Security headers
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
        ],
      },
    ];
  },
};

export default nextConfig;

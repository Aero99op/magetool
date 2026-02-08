/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Static export for Cloudflare Pages
    output: 'export',

    // Disable image optimization for static export
    images: {
        unoptimized: true,
    },

    // Headers are configured in public/_headers for Cloudflare Pages

    // Note: API rewrites not supported in static export mode
    // Direct API calls to backend URLs are configured in src/lib/api.ts

    // Production optimizations
    poweredByHeader: false, // Hide X-Powered-By header

    // Compiler options
    compiler: {
        // Remove console.log in production
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    },
};

export default nextConfig;

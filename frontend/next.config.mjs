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

    // Webpack config for Transformers.js (client-side AI)
    webpack: (config, { isServer }) => {
        // Externalize onnxruntime-node (it's only for Node.js, not browser)
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
            };
        }

        // Mark onnxruntime-node as external to prevent bundling
        config.externals = config.externals || [];
        config.externals.push({
            'onnxruntime-node': 'commonjs onnxruntime-node',
            'sharp': 'commonjs sharp',
        });

        return config;
    },
};

export default nextConfig;

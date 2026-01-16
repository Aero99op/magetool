/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    images: {
        domains: ['localhost'],
    },

    // Security headers
    async headers() {
        return [
            {
                // Apply to all routes
                source: '/:path*',
                headers: [
                    {
                        key: 'X-DNS-Prefetch-Control',
                        value: 'on',
                    },
                    {
                        key: 'Strict-Transport-Security',
                        value: 'max-age=63072000; includeSubDomains; preload',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN', // Allows iframes from same origin (for AdSense)
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                    {
                        // Content Security Policy - AdSense compatible
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            // Scripts: Allow self, inline (for Next.js), and Google services
                            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://www.googletagservices.com https://adservice.google.com https://www.google-analytics.com https://www.googletagmanager.com",
                            // Styles: Allow self and inline (for styled-jsx, framer-motion)
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            // Fonts: Allow self and Google Fonts
                            "font-src 'self' https://fonts.gstatic.com data:",
                            // Images: Allow self, data URIs, blob, and common sources
                            "img-src 'self' data: blob: https: http://localhost:*",
                            // Connect: Allow API and analytics
                            "connect-src 'self' http://localhost:* https://localhost:* https://pagead2.googlesyndication.com https://www.google-analytics.com",
                            // Frames: Allow Google ads
                            "frame-src 'self' https://googleads.g.doubleclick.net https://www.google.com https://tpc.googlesyndication.com",
                            // Frame ancestors: Allow embedding
                            "frame-ancestors 'self'",
                            // Base URI
                            "base-uri 'self'",
                            // Form action
                            "form-action 'self'",
                            // Upgrade insecure requests in production
                            // "upgrade-insecure-requests", // Uncomment for production
                        ].join('; '),
                    },
                ],
            },
        ];
    },

    // API rewrites for backend proxy
    async rewrites() {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        return [
            {
                source: '/api/:path*',
                destination: `${apiUrl}/api/:path*`,
            },
            {
                source: '/temp/:path*',
                destination: `${apiUrl}/temp/:path*`,
            },
        ];
    },

    // Production optimizations
    poweredByHeader: false, // Hide X-Powered-By header

    // Compiler options
    compiler: {
        // Remove console.log in production
        removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
    },
};

export default nextConfig;

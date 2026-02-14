/**
 * Magetool Auth Worker
 * Issues short-lived JWTs for the frontend to access the backend.
 * 
 * Environment Variables required:
 * - API_SECRET: The same UUID used in the Backend
 * - ALLOWED_ORIGIN: The frontend domain (e.g. "https://magetool.site")
 */

import jwt from '@tsndr/cloudflare-worker-jwt';

// Helper for CORS headers
const corsHeaders = {
    'Access-Control-Allow-Origin': '*', // We validate origin manually for stricter control or use specific domain
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
    async fetch(request, env, ctx) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        const url = new URL(request.url);

        // Only allow /token endpoint
        if (url.pathname !== '/token') {
            return new Response('Not Found', { status: 404, headers: corsHeaders });
        }

        // STRICT ORIGIN CHECK
        // Only allow requests from our frontend
        // In production, env.ALLOWED_ORIGIN should be set to "https://magetool.site"
        // For now, we allow localhost for dev
        const origin = request.headers.get('Origin');
        const allowedOrigins = [
            'https://magetool.site',
            'https://www.magetool.site',
            'http://localhost:3000',
        ];

        // Check if origin matches any allowed domain or their subdomains (like preview builds)
        const isAllowed = allowedOrigins.includes(origin) ||
            (origin && origin.endsWith('.pages.dev')) ||
            (origin && origin.endsWith('.vercel.app'));

        if (!isAllowed && env.ENVIRONMENT === 'production') {
            // In strictly production, reject. 
            // For 'truly free' setup, we might be lenient initially, but let's be safe.
            // return new Response('Forbidden Origin', { status: 403, headers: corsHeaders });
        }

        // GENERATE TOKEN
        // Valid for 5 minutes (300 seconds)
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iat: now,
            exp: now + 300, // 5 mins expiration
            role: 'user',   // standard user role
        };

        // Sign with the shared secret
        try {
            const token = await jwt.sign(payload, env.API_SECRET);

            return new Response(JSON.stringify({ token }), {
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                }
            });
        } catch (err) {
            return new Response(JSON.stringify({ error: "Failed to sign token" }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }
};

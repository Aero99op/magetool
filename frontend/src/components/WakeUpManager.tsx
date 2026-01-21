'use client';

import { useEffect, useRef } from 'react';

// List of all backend URLs to wake up
const BACKEND_URLS = [
    // Primary Endpoints
    "https://spandan1234-magetool-backend-api.hf.space", // Hugging Face (Primary)
    "https://magetool-api.onrender.com",               // Render

    // Potential Future/Backup Endpoints (add here if needed)
    // "https://magetool-backup.zeabur.app",
];

/**
 * WakeUpManager Component
 * 
 * This invisible component mounts with the application and immediately sends
 * non-blocking "ping" requests to all registered backend services.
 * 
 * Goal: Ensure that by the time the user interacts with a tool, 
 * at least one backend server has woken up from its cold start.
 */
export function WakeUpManager() {
    const hasPinged = useRef(false);

    useEffect(() => {
        // Run only once on mount
        if (hasPinged.current) return;
        hasPinged.current = true;

        const pingAllServers = async () => {
            console.log('🚀 [WakeUpManager] Initiating rapid wake-up/pre-flight sequence...');

            // Fire all requests in parallel without awaiting them individually
            // We use Promise.allSettled to ensure one failure doesn't stop others
            // but we don't actually wait for the result to unblock the main thread.
            const pingPromises = BACKEND_URLS.map(async (url) => {
                try {
                    const cleanUrl = url.replace(/\/$/, ""); // Remove trailing slash
                    // Use 'no-cors' mode for fastest possible 'fire-and-forget'
                    // We don't care about reading the response, just hitting the server.
                    // Using /health/live as it's the lightest endpoint.
                    await fetch(`${cleanUrl}/health/live`, {
                        method: 'GET',
                        mode: 'no-cors',
                        priority: 'low',
                        cache: 'no-store'
                    });
                    console.log(`📡 [WakeUpManager] Ping sent to: ${cleanUrl}`);
                } catch (err) {
                    // Ignore errors silently - this is just a best-effort wake-up
                    console.debug(`[WakeUpManager] Ping failed for ${url}`, err);
                }
            });

            // Optional: Log completion for debugging (non-blocking)
            Promise.allSettled(pingPromises).then(() => {
                console.log('✅ [WakeUpManager] Wake-up sequence dispatch complete.');
            });
        };

        // Use requestIdleCallback if available to not block hydration/initial rendering
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => pingAllServers());
        } else {
            // Fallback for Safari/others: run after a small delay
            setTimeout(pingAllServers, 1000);
        }

    }, []);

    return null; // Renders nothing
}

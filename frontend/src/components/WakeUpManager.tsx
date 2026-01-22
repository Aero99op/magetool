'use client';

import { useEffect, useRef } from 'react';

// ONLY sleeping servers need wake-up
// 24/7 servers (HF, Northflank) are kept alive by keep-alive bot - no need to ping
const SLEEPING_BACKEND_URLS = [
    "https://magetool-api.onrender.com",    // Render (sleeps after 15 min)
    "https://magetool.zeabur.app",          // Zeabur (may sleep)
];

/**
 * WakeUpManager Component
 * 
 * This invisible component mounts with the application and sends
 * NON-BLOCKING wake-up pings ONLY to sleeping servers (Render, Zeabur).
 * 
 * 24/7 servers (HF, Northflank) are always awake via keep-alive bot,
 * so we don't waste time pinging them here.
 * 
 * Goal: Wake up sleeping servers in BACKGROUND while user starts
 * using the app with 24/7 servers INSTANTLY.
 */
export function WakeUpManager() {
    const hasPinged = useRef(false);

    useEffect(() => {
        // Run only once on mount
        if (hasPinged.current) return;
        hasPinged.current = true;

        const pingSleepingServers = async () => {
            console.log('🌅 [WakeUpManager] Waking up sleeping servers in background...');

            // Fire all requests in parallel - completely non-blocking
            const pingPromises = SLEEPING_BACKEND_URLS.map(async (url) => {
                try {
                    const cleanUrl = url.replace(/\/$/, "");
                    // Use 'no-cors' mode for fastest possible 'fire-and-forget'
                    await fetch(`${cleanUrl}/health/live`, {
                        method: 'GET',
                        mode: 'no-cors',
                        priority: 'low',
                        cache: 'no-store'
                    });
                    console.log(`📡 [WakeUpManager] Wake-up ping sent to: ${cleanUrl}`);
                } catch (err) {
                    // Ignore errors - this is best-effort background wake-up
                    console.debug(`[WakeUpManager] Wake-up ping failed for ${url}`, err);
                }
            });

            // Fire and forget - log completion for debugging
            Promise.allSettled(pingPromises).then(() => {
                console.log('✅ [WakeUpManager] Background wake-up pings dispatched.');
            });
        };

        // Use requestIdleCallback for zero impact on main thread
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => pingSleepingServers());
        } else {
            // Fallback: Small delay so it doesn't block initial render
            setTimeout(pingSleepingServers, 500);
        }

    }, []);

    return null; // Renders nothing
}

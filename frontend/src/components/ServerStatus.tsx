"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Server, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLastUsedServerName } from "../lib/api";

export function ServerStatus() {
    const [status, setStatus] = useState<"checking" | "waking" | "ready" | "error">("checking");
    const [seconds, setSeconds] = useState(0);
    const [activeServer, setActiveServer] = useState<string>("");

    useEffect(() => {
        let isMounted = true;
        const checkServer = async () => {
            const timerInterval = setInterval(() => {
                if (isMounted) setSeconds(s => s + 1);
            }, 1000);

            // Show "Waking up" message soon if not immediate
            const wakingTimeout = setTimeout(() => {
                if (isMounted) setStatus("waking");
            }, 1000);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://magetool-api.onrender.com";
            const MAX_RETRIES = 60; // 2 minutes (assuming 2s delay)
            let attempts = 0;

            while (attempts < MAX_RETRIES && isMounted) {
                try {
                    // Try to ping
                    await fetch(`${apiUrl}/health/live`, {
                        method: 'GET',
                        cache: 'no-store',
                        mode: 'cors'
                    });

                    // If success:
                    if (isMounted) {
                        clearTimeout(wakingTimeout);
                        setStatus("ready");
                        setActiveServer(getLastUsedServerName());

                        // Clear timer
                        clearInterval(timerInterval);

                        // Hide notification after short delay
                        setTimeout(() => {
                            if (isMounted) setStatus("checking"); // Hides top banner
                        }, 3000);
                    }
                    return; // Exit loop on success

                } catch (error) {
                    attempts++;
                    console.log(`Server wake-up attempt ${attempts}/${MAX_RETRIES} failed. Retrying...`);

                    if (isMounted && attempts > 2) {
                        // Only show waking status if it's taking more than a couple of seconds
                        setStatus("waking");
                    }

                    // Wait 2 seconds before retry
                    await new Promise(r => setTimeout(r, 2000));
                }
            }

            // If we reached here, it failed after all retries
            if (isMounted) {
                clearInterval(timerInterval);
                setStatus("error");
            }
        };

        checkServer();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <>
            {/* Top Notification: Only for Waking Up / Error */}
            <AnimatePresence>
                {(status === "waking" || status === "error") && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 pointer-events-none"
                    >
                        <div className="bg-background/80 backdrop-blur-md border border-border/50 rounded-full px-6 py-2 shadow-lg flex items-center gap-3 text-sm font-medium">
                            {status === "waking" && (
                                <>
                                    <div className="relative">
                                        <Server className="w-4 h-4 text-orange-500" />
                                        <Loader2 className="w-6 h-6 absolute -top-1 -left-1 text-orange-500/50 animate-spin" />
                                    </div>
                                    <span className="text-foreground/90">
                                        Server is waking up...
                                        <span className="ml-2 px-2 py-0.5 bg-muted rounded-md font-mono text-xs">
                                            {seconds}s
                                        </span>
                                    </span>
                                </>
                            )}
                            {status === "error" && (
                                <>
                                    <Activity className="w-4 h-4 text-red-500" />
                                    <span className="text-red-500">Servers are busy. Please refresh.</span>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Right Persistent Server Indicator */}
            <div className="fixed bottom-6 right-6 z-40 pointer-events-none opacity-40 hover:opacity-100 transition-opacity">
                <div className="bg-background/40 backdrop-blur-sm border border-border/20 rounded-lg px-3 py-1.5 flex items-center gap-2 text-[10px] font-medium tracking-wider uppercase text-foreground/50 border-white/5 shadow-sm">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'error' ? 'bg-red-500' : 'bg-green-500 animate-pulse'}`} />
                    <span>Region: Global</span>
                    <span className="opacity-20">|</span>
                    <span>Provider: <span className="text-foreground/80">{activeServer || 'Selecting...'}</span></span>
                </div>
            </div>
        </>
    );
}


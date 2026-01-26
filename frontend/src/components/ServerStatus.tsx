"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Server, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getLastUsedServerName } from "../lib/api";

// Primary 24/7 server for health check - always awake
const PRIMARY_INSTANT_SERVER = "https://spandan1234-magetool-backend-api.hf.space";

// ... existing imports
import { useAppMode } from "@/hooks/useAppMode";

// ... existing code

export function ServerStatus() {
    const { isMobileApp } = useAppMode();
    // ... existing state

    // Start with "ready" state - 24/7 servers are always ready
    const [status, setStatus] = useState<"checking" | "waking" | "ready" | "error">("ready");

    // ... existing useEffect
    const [seconds, setSeconds] = useState(0);
    // Default to HF as the instant provider - shown immediately
    const [activeServer, setActiveServer] = useState<string>("Hugging Face");

    useEffect(() => {
        let isMounted = true;

        const checkServer = async () => {
            // Quick verification that 24/7 server is responsive
            // This should be near-instant since HF is kept alive
            try {
                const response = await fetch(`${PRIMARY_INSTANT_SERVER}/health/live`, {
                    method: 'GET',
                    cache: 'no-store',
                    mode: 'cors'
                });

                if (isMounted && response.ok) {
                    setStatus("ready");
                    // Update with actual last used server name
                    const serverName = getLastUsedServerName();
                    if (serverName) setActiveServer(serverName);
                }
            } catch (error) {
                // If HF is somehow down, show waking status
                if (isMounted) {
                    console.log('[ServerStatus] Primary 24/7 server slow to respond, showing wake-up...');
                    setStatus("waking");

                    // Start timer
                    const timerInterval = setInterval(() => {
                        if (isMounted) setSeconds(s => s + 1);
                    }, 1000);

                    // Retry logic for edge case where 24/7 server is slow
                    let attempts = 0;
                    const MAX_RETRIES = 30;

                    while (attempts < MAX_RETRIES && isMounted) {
                        try {
                            await fetch(`${PRIMARY_INSTANT_SERVER}/health/live`, {
                                method: 'GET',
                                cache: 'no-store',
                            });

                            if (isMounted) {
                                clearInterval(timerInterval);
                                setStatus("ready");
                                setActiveServer(getLastUsedServerName() || "Hugging Face");
                            }
                            return;
                        } catch {
                            attempts++;
                            await new Promise(r => setTimeout(r, 2000));
                        }
                    }

                    // All retries failed
                    if (isMounted) {
                        clearInterval(timerInterval);
                        setStatus("error");
                    }
                }
            }
        };

        // Run health check immediately
        checkServer();

        // Periodically update server name (in case it switches)
        const nameUpdateInterval = setInterval(() => {
            if (isMounted) {
                const serverName = getLastUsedServerName();
                if (serverName && serverName !== activeServer) {
                    setActiveServer(serverName);
                }
            }
        }, 5000);

        return () => {
            isMounted = false;
            clearInterval(nameUpdateInterval);
        };
    }, []);

    // Hide completely on mobile app to prevent UI clutter
    if (isMobileApp) return null;

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
                    <span>Provider: <span className="text-foreground/80">{activeServer}</span></span>
                </div>
            </div>
        </>
    );
}

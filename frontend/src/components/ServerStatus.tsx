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
        const checkServer = async () => {
            const timerInterval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);

            const wakingTimeout = setTimeout(() => {
                setStatus("waking");
            }, 1500);

            try {
                // Initial check to see what's active
                setActiveServer(getLastUsedServerName());

                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://magetool-api.onrender.com";
                await fetch(`${apiUrl}/health/live`);

                clearTimeout(wakingTimeout);
                setStatus("ready");
                setActiveServer(getLastUsedServerName());

                // Hide the big "Ready" notification after 3s, but keep the small persistent one?
                // Actually, let's just transition to the small persistent indicator.
                setTimeout(() => {
                    setStatus("checking");
                }, 3000);

            } catch (error) {
                console.error("Server ping failed:", error);
                setStatus("error");
            } finally {
                clearInterval(timerInterval);
            }
        };

        checkServer();
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
                                    <span className="text-red-500">Connection error. Retrying...</span>
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


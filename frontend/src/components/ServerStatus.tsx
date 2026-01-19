"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, Server } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function ServerStatus() {
    const [status, setStatus] = useState<"checking" | "waking" | "ready" | "error">("checking");
    const [seconds, setSeconds] = useState(0);

    useEffect(() => {
        const checkServer = async () => {
            // Start a timer to track how long we've been waiting
            const timerInterval = setInterval(() => {
                setSeconds(s => s + 1);
            }, 1000);

            // If it takes more than 1 second, we assume it's waking up
            const wakingTimeout = setTimeout(() => {
                setStatus("waking");
            }, 1500);

            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                // Simple ping with a short timeout initially to detect if it's asleep fast? 
                // Actually, a sleeping server on Render just hangs until it wakes up.
                // So a simple fetch will hang for ~30s. Perfect for our "Waking" state.

                await fetch(`${apiUrl}/health/live`);

                clearTimeout(wakingTimeout);
                setStatus("ready");

                // Hide after 3 seconds of being ready
                setTimeout(() => {
                    setStatus("checking"); // Or null/hidden state, but "checking" with null return is fine
                    // Actually let's use a hidden state to unmount or hide
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

    // If ready and waiting to hide, or just checking initially (invisible), don't show unless it's taking time
    if (status === "checking" || (status === "ready" && seconds === 0)) return null;

    return (
        <AnimatePresence>
            {(status === "waking" || status === "ready") && (
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
                                    Server is waking up from cold start...
                                    <span className="ml-2 px-2 py-0.5 bg-muted rounded-md font-mono text-xs">
                                        {seconds}s
                                    </span>
                                </span>
                            </>
                        )}

                        {status === "ready" && (
                            <>
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <span className="text-foreground/90">Server is ready!</span>
                            </>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

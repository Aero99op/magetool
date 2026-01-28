"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FiShield, FiCheckCircle, FiAlertTriangle, FiLock, FiActivity } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ToolContent from "@/components/ToolContent";

export default function HashVerifier() {
    const [file, setFile] = useState<File | null>(null);
    const [calculating, setCalculating] = useState(false);
    const [hashes, setHashes] = useState<{ md5?: string; sha256?: string } | null>(null);
    const [expectedHash, setExpectedHash] = useState("");
    const [matchStatus, setMatchStatus] = useState<"idle" | "match" | "mismatch">("idle");

    const handleFilesSelected = async (files: File[]) => {
        if (files.length > 0) {
            const selectedFile = files[0];
            setFile(selectedFile);
            setHashes(null);
            setMatchStatus("idle");
            // Auto calculate
            calculateHash(selectedFile);
        }
    };

    const calculateHash = async (fileToHash: File) => {
        setCalculating(true);
        try {
            const arrayBuffer = await fileToHash.arrayBuffer();
            const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

            setHashes({ sha256: hashHex });
        } catch (e) {
            console.error(e);
            alert("Failed to calculate hash");
        } finally {
            setCalculating(false);
        }
    };

    const verifyHash = async () => {
        if (!hashes?.sha256 || !expectedHash) return;
        if (hashes.sha256.toLowerCase() === expectedHash.trim().toLowerCase()) {
            setMatchStatus("match");
        } else {
            setMatchStatus("mismatch");
        }
    };

    const reset = () => {
        setFile(null);
        setHashes(null);
        setExpectedHash("");
        setMatchStatus("idle");
    };

    // CONFIG PANEL
    const configPanel = (
        <div className="space-y-6">
            <div className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-800">
                <label className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2 block">Comparison Source</label>
                <input
                    type="text"
                    placeholder="Paste expected hash here..."
                    value={expectedHash}
                    onChange={(e) => setExpectedHash(e.target.value)}
                    className="w-full bg-black/40 border border-neutral-700/50 rounded-lg p-3 font-mono text-sm focus:border-emerald-500 outline-none transition-all placeholder:text-neutral-700"
                />
            </div>

            <button
                onClick={verifyHash}
                disabled={!hashes || !expectedHash}
                className={`w-full py-3 rounded-lg font-bold text-sm transition-all shadow-lg ${!hashes || !expectedHash ? "bg-neutral-800 text-gray-600 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
            >
                Verify Match
            </button>

            {matchStatus !== "idle" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg flex items-start gap-3 border ${matchStatus === "match"
                        ? "bg-emerald-900/20 border-emerald-500/30"
                        : "bg-red-900/20 border-red-500/30"
                        }`}
                >
                    {matchStatus === "match" ? (
                        <>
                            <FiCheckCircle className="text-emerald-500 mt-1 shrink-0" />
                            <div>
                                <h4 className="font-bold text-emerald-400 text-sm">Valid!</h4>
                                <p className="text-xs text-emerald-300/70 mt-1">Hashes match perfectly.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <FiAlertTriangle className="text-red-500 mt-1 shrink-0" />
                            <div>
                                <h4 className="font-bold text-red-500 text-sm">Mismatch!</h4>
                                <p className="text-xs text-red-300/70 mt-1">This file may be modified.</p>
                            </div>
                        </>
                    )}
                </motion.div>
            )}

            {/* Manual Reset */}
            {file && (
                <button onClick={reset} className="text-xs text-neutral-500 hover:text-white w-full text-center py-2">
                    Scan Another File
                </button>
            )}
        </div>
    );

    return (
        <ToolLayout
            title="File Integrity Guardian"
            subtitle="Secure client-side SHA-256 verification. Drag & drop to verify."
            supportedFormatsText="Supports any file type"
            maxFileSize={500} // Client side can handle larger, but let's stick to consistent UI
            onFilesSelected={handleFilesSelected}
            configPanel={configPanel}
            processingStage={calculating ? 'processing' : (hashes ? 'complete' : 'idle')}
            progress={calculating ? 50 : (hashes ? 100 : 0)}
            customContent={
                hashes && (
                    <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-4 fade-in">
                        <div className="flex items-center gap-2">
                            <FiShield className="text-emerald-500" />
                            <span className="text-sm font-semibold text-gray-300">File Analysis Result</span>
                        </div>
                        <div className="p-6 bg-black/30 border border-neutral-800 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-neutral-800 rounded-lg">
                                        <FiLock className="text-gray-400" /> {/* Changed from FiFile to FiLock as per original context */}
                                    </div>
                                    <div>
                                        <div className="text-sm text-white font-medium">{file?.name}</div>
                                        <div className="text-xs text-gray-500">{(file?.size || 0 / 1024).toFixed(1)} KB</div>
                                    </div>
                                </div>
                                {calculating && <FiActivity className="text-emerald-500 animate-spin" />}
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 font-bold uppercase">SHA-256 Hash</label>
                                <div className="font-mono text-xs break-all bg-black/50 p-3 rounded border border-neutral-800 text-emerald-400 select-all">
                                    {hashes.sha256}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        />
    );
}

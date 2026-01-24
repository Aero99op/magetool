"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FiShield, FiCheckCircle, FiAlertTriangle, FiFile, FiLock, FiActivity, FiSearch } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function HashVerifier() {
    const [file, setFile] = useState<File | null>(null);
    const [calculating, setCalculating] = useState(false);
    const [hashes, setHashes] = useState<{ md5?: string; sha256?: string } | null>(null);
    const [expectedHash, setExpectedHash] = useState("");
    const [matchStatus, setMatchStatus] = useState<"idle" | "match" | "mismatch">("idle");

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setFile(acceptedFiles[0]);
            setHashes(null); // Reset
            setMatchStatus("idle");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        multiple: false,
    });

    const calculateHash = async () => {
        if (!file) return;
        setCalculating(true);

        try {
            const arrayBuffer = await file.arrayBuffer();
            // Calculate SHA-256 (Native Web Crypto API)
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

        // Local Verification (Fast & Private)
        if (hashes.sha256.toLowerCase() === expectedHash.trim().toLowerCase()) {
            setMatchStatus("match");
        } else {
            setMatchStatus("mismatch");
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 selection:bg-green-500/30">

            {/* Background Ambience */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-emerald-600/10 blur-[150px] rounded-full" />
                <div className="absolute top-[50%] right-[20%] w-[25%] h-[25%] bg-green-500/5 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto relative z-10 space-y-12">

                <div className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-900/30 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-4"
                    >
                        <FiShield className="w-4 h-4" /> Secure Client-Side Verification
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold bg-gradient-to-br from-white via-green-100 to-emerald-500 bg-clip-text text-transparent"
                    >
                        File Integrity Guardian
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 text-lg md:text-xl"
                    >
                        Detect corruption and malware by verifying SHA-256 checksums instantly.
                    </motion.p>
                </div>

                {/* Dropzone Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div
                        {...getRootProps()}
                        className={`border-3 border-dashed rounded-3xl p-16 text-center transition-all cursor-pointer group relative overflow-hidden ${isDragActive
                            ? "border-emerald-500 bg-emerald-500/10 scale-[1.02]"
                            : "border-neutral-800 hover:border-emerald-500/50 hover:bg-neutral-900/60 bg-neutral-900/30 backdrop-blur-sm"
                            }`}
                    >
                        <input {...getInputProps()} />
                        {file ? (
                            <div className="flex flex-col items-center gap-6 relative z-10">
                                <div className="w-20 h-20 bg-neutral-800 rounded-2xl flex items-center justify-center text-4xl shadow-xl">
                                    📄
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-1">{file.name}</h3>
                                    <p className="text-gray-500 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); calculateHash(); }}
                                    disabled={calculating || !!hashes}
                                    className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all ${calculating ? "bg-neutral-800 cursor-wait" : hashes ? "bg-emerald-600/20 text-emerald-400 cursor-default" : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 hover:scale-105"
                                        }`}
                                >
                                    {calculating ? (
                                        <>
                                            <FiActivity className="animate-spin" /> Analyzing bits...
                                        </>
                                    ) : hashes ? (
                                        <>
                                            <FiCheckCircle /> Analysis Complete
                                        </>
                                    ) : (
                                        <>
                                            <FiSearch /> Analyze File
                                        </>
                                    )}
                                </button>
                                {!hashes && !calculating && (
                                    <p className="text-xs text-neutral-500 mt-2 hover:text-emerald-400 transition-colors" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                        Click to change file
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6 relative z-10">
                                <div className="w-24 h-24 mx-auto bg-neutral-800/50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FiShield className="w-10 h-10 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <div>
                                    <p className="text-2xl font-semibold text-gray-200 group-hover:text-white transition-colors">Drag & drop your suspicious file here</p>
                                    <p className="text-neutral-500 mt-2">or click to browse your system</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Results Area */}
                <AnimatePresence>
                    {hashes && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 space-y-8 backdrop-blur-md shadow-2xl">

                                {/* Visual Hash Representation */}
                                <div className="space-y-3">
                                    <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1 flex items-center gap-2">
                                        <FiLock className="w-3 h-3" /> Calculated SHA-256 Hash
                                    </label>
                                    <div className="font-mono text-sm break-all bg-black/60 p-5 rounded-2xl border border-neutral-800 text-emerald-400 select-all shadow-inner hover:border-emerald-500/30 transition-colors">
                                        {hashes.sha256}
                                    </div>
                                </div>

                                {/* Comparison Logic */}
                                <div className="bg-neutral-800/30 rounded-2xl p-6 space-y-6 border border-white/5">
                                    <h3 className="text-lg font-bold flex items-center gap-2">
                                        Verify Authenticity
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4 items-end">
                                        <div className="space-y-2">
                                            <label className="text-xs text-gray-500 uppercase font-bold tracking-wider ml-1">Expected Hash (from publisher)</label>
                                            <input
                                                type="text"
                                                placeholder="Paste the publisher's checksum here..."
                                                value={expectedHash}
                                                onChange={(e) => setExpectedHash(e.target.value)}
                                                className="w-full bg-black/40 border border-neutral-700 rounded-xl p-4 font-mono text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-neutral-600"
                                            />
                                        </div>
                                        <button
                                            onClick={verifyHash}
                                            disabled={!expectedHash}
                                            className={`h-[54px] px-8 rounded-xl font-bold transition-all ${!expectedHash ? "bg-neutral-800 text-gray-500" : "bg-white text-black hover:bg-gray-200"
                                                }`}
                                        >
                                            Verify
                                        </button>
                                    </div>

                                    {/* Match Result */}
                                    <AnimatePresence mode="wait">
                                        {matchStatus !== "idle" && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`p-6 rounded-xl flex items-center gap-5 border ${matchStatus === "match"
                                                    ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-900/20"
                                                    : "bg-red-500/10 border-red-500/30 shadow-lg shadow-red-900/20"
                                                    }`}
                                            >
                                                {matchStatus === "match" ? (
                                                    <>
                                                        <div className="p-3 bg-emerald-500 rounded-full text-black">
                                                            <FiCheckCircle className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-bold text-emerald-400">Match Confirmed</h4>
                                                            <p className="text-emerald-200/70 text-sm">This file is authentic and has not been tampered with.</p>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="p-3 bg-red-500 rounded-full text-white">
                                                            <FiAlertTriangle className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-xl font-bold text-red-500">Hash Mismatch</h4>
                                                            <p className="text-red-300/70 text-sm">Warning: This file differs from the source. It may be corrupted or modified.</p>
                                                        </div>
                                                    </>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

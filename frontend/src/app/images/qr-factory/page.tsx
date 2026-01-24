"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FiWifi, FiType, FiUser, FiDownload, FiShare2, FiZap, FiCode, FiCpu, FiLayers, FiGrid } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";

export default function QRExtreme() {
    const [activeTab, setActiveTab] = useState("text");
    const [loading, setLoading] = useState(false);
    const [qrUrl, setQrUrl] = useState<string | null>(null);

    // Customization
    const [fillColor, setFillColor] = useState("#00d9ff"); // Neon Blue default
    const [bgColor, setBgColor] = useState("#00000000");  // Transparent default
    const [bgHex, setBgHex] = useState("#0a0a0a"); // For UI input
    const [style, setStyle] = useState("rounded");

    // Data States
    const [textData, setTextData] = useState("");
    const [wifiData, setWifiData] = useState({ ssid: "", password: "", encryption: "WPA" });
    const [vcardData, setVcardData] = useState({ fn: "", tel: "", email: "", url: "" });

    // Auto-generate on mount
    useEffect(() => {
        // Optional: Generate default
    }, []);

    const generateQR = async () => {
        setLoading(true);
        // Add artificial delay for "processing" feel + allow UI to update
        await new Promise(r => setTimeout(r, 600));

        try {
            let finalData = "";
            if (activeTab === "text") {
                finalData = textData || "https://magetool.site";
            } else if (activeTab === "wifi") {
                finalData = `WIFI:S:${wifiData.ssid};T:${wifiData.encryption};P:${wifiData.password};;`;
            } else if (activeTab === "vcard") {
                finalData = `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardData.fn}\nTEL:${vcardData.tel}\nEMAIL:${vcardData.email}\nURL:${vcardData.url}\nEND:VCARD`;
            }

            // Client-Side Generation
            const url = await QRCode.toDataURL(finalData, {
                width: 1024,
                margin: 2,
                color: {
                    dark: fillColor,
                    light: bgHex // Use the hex value
                },
                errorCorrectionLevel: 'H'
            });

            setQrUrl(url);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        if (!qrUrl) return;
        const a = document.createElement("a");
        a.href = qrUrl;
        a.download = `magetool-qr-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // 2026 CONFIG PANEL
    const configPanel = (
        <div className="space-y-8 font-sans">
            {/* Cyberpunk Tab Switcher */}
            <div className="relative p-1 bg-[#111] rounded-xl border border-white/5 shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl pointer-events-none" />
                <div className="flex relative z-10">
                    {[
                        { id: "text", icon: FiType, label: "Text/Link" },
                        { id: "wifi", icon: FiWifi, label: "WiFi" },
                        { id: "vcard", icon: FiUser, label: "ID Card" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab.id
                                ? "bg-gradient-to-br from-[#222] to-[#111] text-[#00d9ff] shadow-[0_4px_12px_rgba(0,217,255,0.1)] border border-[#00d9ff]/20"
                                : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "drop-shadow-[0_0_8px_rgba(0,217,255,0.5)]" : ""}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inputs Container */}
            <div className="bg-[#111]/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 blur-2xl rounded-full -mr-10 -mt-10 pointer-events-none" />

                <AnimatePresence mode="wait">
                    {activeTab === "text" && (
                        <motion.div
                            key="text"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="relative group/input">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-2 block ml-1">Payload Data</label>
                                <textarea
                                    value={textData}
                                    onChange={(e) => setTextData(e.target.value)}
                                    placeholder="Enter your link or message here..."
                                    className="w-full bg-[#080808] border border-[#222] rounded-xl p-4 min-h-[120px] text-sm text-gray-200 focus:border-[#00d9ff] focus:ring-1 focus:ring-[#00d9ff]/50 outline-none transition-all resize-none placeholder:text-gray-700 font-mono shadow-inner"
                                />
                                <div className="absolute bottom-3 right-3 text-[10px] text-gray-700 font-mono">{textData.length} chars</div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "wifi" && (
                        <motion.div
                            key="wifi"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-5"
                        >
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] ml-1">Network SSID</label>
                                <input
                                    type="text"
                                    value={wifiData.ssid}
                                    onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                                    className="w-full bg-[#080808] border border-[#222] rounded-xl px-4 py-3 text-sm focus:border-[#00d9ff] focus:ring-1 focus:ring-[#00d9ff]/50 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] ml-1">Password</label>
                                <input
                                    type="text"
                                    value={wifiData.password}
                                    onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                                    className="w-full bg-[#080808] border border-[#222] rounded-xl px-4 py-3 text-sm focus:border-[#00d9ff] focus:ring-1 focus:ring-[#00d9ff]/50 outline-none transition-all"
                                />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "vcard" && (
                        <motion.div
                            key="vcard"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <input type="text" placeholder="Full Name" value={vcardData.fn} onChange={(e) => setVcardData({ ...vcardData, fn: e.target.value })} className="w-full bg-[#080808] border border-[#222] rounded-xl px-4 py-3 text-sm focus:border-[#00d9ff] outline-none" />
                            <input type="text" placeholder="Phone Number" value={vcardData.tel} onChange={(e) => setVcardData({ ...vcardData, tel: e.target.value })} className="w-full bg-[#080808] border border-[#222] rounded-xl px-4 py-3 text-sm focus:border-[#00d9ff] outline-none" />
                            <input type="text" placeholder="Email" value={vcardData.email} onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })} className="w-full bg-[#080808] border border-[#222] rounded-xl px-4 py-3 text-sm focus:border-[#00d9ff] outline-none" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Aesthetics Engine */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <FiCpu className="text-[#00d9ff]" />
                    <span className="text-xs font-bold text-white uppercase tracking-widest">Aesthetics Engine</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#111] p-3 rounded-xl border border-white/5 hover:border-[#00d9ff]/30 transition-colors">
                        <label className="text-[10px] text-gray-500 font-bold block mb-2">DATA COLOR</label>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 shadow-lg">
                                    <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-[150%] h-[150%] -m-[25%] cursor-pointer p-0 border-0" />
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 bg-black px-2 py-1 rounded">{fillColor}</span>
                        </div>
                    </div>

                    <div className="bg-[#111] p-3 rounded-xl border border-white/5 hover:border-[#00d9ff]/30 transition-colors">
                        <label className="text-[10px] text-gray-500 font-bold block mb-2">BG COLOR</label>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 shadow-lg">
                                    <input type="color" value={bgHex} onChange={(e) => setBgHex(e.target.value)} className="w-[150%] h-[150%] -m-[25%] cursor-pointer p-0 border-0" />
                                </div>
                            </div>
                            <span className="text-[10px] font-mono text-gray-400 bg-black px-2 py-1 rounded">{bgHex}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-[#111] p-4 rounded-xl border border-white/5">
                    <label className="text-[10px] text-gray-500 font-bold block mb-3">MODULE SHAPE</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStyle('square')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${style === 'square' ? 'bg-[#222] text-white border border-white/20 shadow-lg' : 'text-gray-600 border border-transparent hover:border-white/10'
                                }`}
                        >
                            <FiGrid /> Sharp
                        </button>
                        <button
                            onClick={() => setStyle('rounded')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${style === 'rounded' ? 'bg-[#222] text-white border border-white/20 shadow-lg' : 'text-gray-600 border border-transparent hover:border-white/10'
                                }`}
                        >
                            <FiLayers /> Fluid
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={generateQR}
                disabled={loading}
                className="w-full relative group overflow-hidden rounded-xl bg-gradient-to-r from-[#00d9ff] to-[#0066ff] p-[1px] shadow-[0_0_40px_rgba(0,217,255,0.3)] hover:shadow-[0_0_60px_rgba(0,217,255,0.5)] transition-shadow"
            >
                <div className="relative bg-[#050505] rounded-xl px-6 py-4 flex items-center justify-center gap-3 transition-all group-hover:bg-opacity-90">
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-[#00d9ff] border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <FiZap className="w-5 h-5 text-[#00d9ff] group-hover:text-white transition-colors" />
                    )}
                    <span className="font-bold text-white tracking-widest text-sm uppercase">Initialize Gen</span>
                </div>
            </button>
        </div>
    );

    // 2026 PREVIEW CONTENT
    const previewContent = (
        <div className="h-full min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden bg-[#050505] rounded-[32px] border border-[#222] shadow-2xl">
            {/* Holographic Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

            {/* Animated Glow Orbs */}
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-700" />

            {qrUrl ? (
                <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-sm mx-auto p-6">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="relative group perspective-1000"
                    >
                        {/* Glowing Frame */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-[#00d9ff] to-[#ff00ff] rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                        <div className="relative bg-white p-6 rounded-xl shadow-2xl transform transition-transform group-hover:bg-gray-50">
                            <img src={qrUrl} alt="QR Code" className="w-64 h-64 object-contain" />

                            {/* Scan Line Animation */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                <div className="w-full h-[2px] bg-[#00d9ff] shadow-[0_0_20px_#00d9ff] absolute top-0 left-0 animate-[scan_3s_linear_infinite]" />
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-3 w-full">
                        <button
                            onClick={downloadQR}
                            className="flex items-center justify-center gap-3 px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95"
                        >
                            <FiDownload className="w-5 h-5" />
                            <span className="tracking-widest uppercase text-sm">Download Asset</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 flex flex-col items-center justify-center text-center opacity-30">
                    <div className="w-32 h-32 border border-[#333] border-dashed rounded-3xl flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00d9ff]/10 to-transparent rounded-3xl" />
                        <FiCode className="w-10 h-10 text-[#00d9ff]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">System Idle</h3>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest max-w-[200px]">Awaiting Data Input sequence...</p>
                </div>
            )}
        </div>
    );

    return (
        <ToolLayout
            title="QR Code Factory"
            subtitle="Next-Gen Matrix Code Generator"
            onFilesSelected={() => { }}
            processingStage="complete"
            downloadReady={false}
            configPanel={configPanel}
            customContent={previewContent}
        />
    );
}

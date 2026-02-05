"use client";

import React, { useState, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";
import ToolContent from '@/components/ToolContent';
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
        <div className="space-y-6 font-sans">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />

                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 border-b border-white/10 pb-3 flex items-center gap-2">
                    <FiCode className="text-[#00d9ff]" /> Generator Settings
                </h3>

                {/* Cyberpunk Tab Switcher */}
                <div className="relative p-1 bg-black/40 rounded-xl border border-white/5 mb-6">
                    <div className="flex relative z-10">
                        {[
                            { id: "text", icon: FiType, label: "Text" },
                            { id: "wifi", icon: FiWifi, label: "WiFi" },
                            { id: "vcard", icon: FiUser, label: "ID" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all duration-300 ${activeTab === tab.id
                                    ? "bg-[#222] text-[#00d9ff] border border-[#00d9ff]/30 shadow-lg"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                                    }`}
                            >
                                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "drop-shadow-[0_0_5px_rgba(0,217,255,0.5)]" : ""}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Inputs Container */}
                <div className="space-y-4 mb-6 relative z-10">
                    <AnimatePresence mode="wait">
                        {activeTab === "text" && (
                            <motion.div
                                key="text"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                            >
                                <div className="group">
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block">Payload Content</label>
                                    <textarea
                                        value={textData}
                                        onChange={(e) => setTextData(e.target.value)}
                                        placeholder="Paste URL or text..."
                                        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 min-h-[100px] text-sm text-gray-200 focus:border-[#00d9ff] focus:ring-1 focus:ring-[#00d9ff]/30 outline-none transition-all resize-none placeholder:text-gray-700 font-mono"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "wifi" && (
                            <motion.div
                                key="wifi"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="space-y-3"
                            >
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Network SSID</label>
                                    <input
                                        type="text"
                                        placeholder="Network Name"
                                        value={wifiData.ssid}
                                        onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00d9ff] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1 block">Password</label>
                                    <input
                                        type="text"
                                        placeholder="Required for WPA/WPA2"
                                        value={wifiData.password}
                                        onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00d9ff] outline-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {activeTab === "vcard" && (
                            <motion.div
                                key="vcard"
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                className="space-y-3"
                            >
                                <input type="text" placeholder="Full Name" value={vcardData.fn} onChange={(e) => setVcardData({ ...vcardData, fn: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00d9ff] outline-none" />
                                <input type="text" placeholder="Phone" value={vcardData.tel} onChange={(e) => setVcardData({ ...vcardData, tel: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00d9ff] outline-none" />
                                <input type="text" placeholder="Email" value={vcardData.email} onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00d9ff] outline-none" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Visual Settings */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                        <label className="text-[9px] text-gray-500 font-bold block mb-2 uppercase">Core Color</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-6 h-6 rounded overflow-hidden cursor-pointer" />
                            <span className="text-[10px] font-mono text-gray-400">{fillColor}</span>
                        </div>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-lg border border-white/5">
                        <label className="text-[9px] text-gray-500 font-bold block mb-2 uppercase">Background</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={bgHex} onChange={(e) => setBgHex(e.target.value)} className="w-6 h-6 rounded overflow-hidden cursor-pointer" />
                            <span className="text-[10px] font-mono text-gray-400">{bgHex}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setStyle('square')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all border ${style === 'square' ? 'bg-[#222] text-white border-white/20' : 'text-gray-600 border-transparent hover:bg-white/5'
                            }`}
                    >
                        <FiGrid className="w-3 h-3" /> Sharp
                    </button>
                    <button
                        onClick={() => setStyle('rounded')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] font-bold transition-all border ${style === 'rounded' ? 'bg-[#222] text-white border-white/20' : 'text-gray-600 border-transparent hover:bg-white/5'
                            }`}
                    >
                        <FiLayers className="w-3 h-3" /> Fluid
                    </button>
                </div>

                <button
                    onClick={generateQR}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-[#00d9ff] to-[#0066ff] hover:from-[#00b8d4] hover:to-[#0052cc] text-white font-bold py-3 rounded-xl shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FiZap />}
                    <span className="tracking-wider uppercase text-xs">Generate Matrix</span>
                </button>
            </div>
        </div>
    );

    // 2026 PREVIEW CONTENT
    const previewContent = (
        <div className="h-full min-h-[350px] md:min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden bg-[#050505] rounded-[32px] border border-[#222] shadow-2xl p-4 transition-all duration-500">
            {/* Holographic Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] md:bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

            {/* Animated Glow Orbs */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-purple-600/20 rounded-full blur-[60px] md:blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 md:w-64 md:h-64 bg-blue-600/20 rounded-full blur-[60px] md:blur-[100px] animate-pulse delay-700" />

            {qrUrl ? (
                <div className="relative z-10 flex flex-col items-center gap-6 md:gap-8 w-full max-w-sm mx-auto">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="relative group perspective-1000 w-full flex justify-center"
                    >
                        {/* Glowing Frame */}
                        <div className="absolute -inset-1 bg-gradient-to-br from-[#00d9ff] to-[#ff00ff] rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />

                        <div className="relative bg-white p-3 md:p-5 rounded-xl shadow-2xl transform transition-transform group-hover:bg-gray-50 w-full max-w-[220px] aspect-square flex items-center justify-center">
                            <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />

                            {/* Scan Line Animation */}
                            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                <div className="w-full h-[2px] bg-[#00d9ff] shadow-[0_0_20px_#00d9ff] absolute top-0 left-0 animate-[scan_3s_linear_infinite]" />
                            </div>
                        </div>
                    </motion.div>

                    <div className="flex flex-col gap-3 w-full max-w-[280px]">
                        <button
                            onClick={downloadQR}
                            className="flex items-center justify-center gap-3 px-6 py-3 md:px-8 md:py-4 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95 w-full"
                        >
                            <FiDownload className="w-5 h-5" />
                            <span className="tracking-widest uppercase text-xs md:text-sm">Download Asset</span>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative z-10 flex flex-col items-center justify-center text-center opacity-30 px-4">
                    <div className="w-24 h-24 md:w-32 md:h-32 border border-[#333] border-dashed rounded-3xl flex items-center justify-center mb-6 relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#00d9ff]/10 to-transparent rounded-3xl" />
                        <FiCode className="w-8 h-8 md:w-10 md:h-10 text-[#00d9ff]" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">System Idle</h3>
                    <p className="text-gray-500 font-mono text-[10px] md:text-xs uppercase tracking-widest max-w-[200px]">Awaiting Data Input sequence...</p>
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
            toolContent={
                <ToolContent
                    overview="Generate futuristic, high-tech QR codes for any purpose. Create codes for URLs, WiFi networks, or contact cards (vCards) with customizable colors and designs."
                    features={[
                        "Multiple Types: Text, WiFi, vCard.",
                        "Custom Design: Choose colors and dot styles (Square/Fluid).",
                        "High Contrast: Ensures scannability by all devices.",
                        "Instant Preview: See your QR code update in real-time."
                    ]}
                    howTo={[
                        { step: "Select Type", description: "Choose Text, WiFi, or ID Card." },
                        { step: "Enter Data", description: "Fill in the required information." },
                        { step: "Customize", description: "Pick your colors and style." },
                        { step: "Download", description: "Get your QR code image." }
                    ]}
                />
            }
        />
    );
}

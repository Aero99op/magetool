"use client";

import React, { useState, useEffect } from "react";
import { FiWifi, FiType, FiUser, FiDownload, FiSettings, FiShare2, FiZap, FiCode } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function QRExtreme() {
    const [activeTab, setActiveTab] = useState("text"); // text, wifi, vcard
    const [loading, setLoading] = useState(false);
    const [qrBlob, setQrBlob] = useState<Blob | null>(null);
    const [qrUrl, setQrUrl] = useState<string | null>(null);

    // Customization
    const [fillColor, setFillColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [style, setStyle] = useState("square");

    // Data States
    const [textData, setTextData] = useState("");
    const [wifiData, setWifiData] = useState({ ssid: "", password: "", encryption: "WPA" });
    const [vcardData, setVcardData] = useState({ fn: "", tel: "", email: "", url: "" });

    const generateQR = async () => {
        setLoading(true);
        try {
            let finalData = "";

            if (activeTab === "text") {
                finalData = textData;
            } else if (activeTab === "wifi") {
                finalData = `WIFI:S:${wifiData.ssid};T:${wifiData.encryption};P:${wifiData.password};;`;
            } else if (activeTab === "vcard") {
                finalData = `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardData.fn}\nTEL:${vcardData.tel}\nEMAIL:${vcardData.email}\nURL:${vcardData.url}\nEND:VCARD`;
            }

            const formData = new FormData();
            formData.append("data", finalData);
            formData.append("type", activeTab);
            formData.append("fill_color", fillColor);
            formData.append("back_color", bgColor);
            formData.append("style", style);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/tools/qr/generate`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Failed to generate");

            const blob = await response.blob();
            setQrBlob(blob);
            setQrUrl(URL.createObjectURL(blob));

        } catch (e) {
            console.error(e);
            alert("Failed to generate QR Code");
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

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 md:px-8 selection:bg-blue-500/30">

            {/* Background Gradients */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">

                <div className="text-center mb-16 space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                    >
                        QR Factory
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto"
                    >
                        Generate enterprise-grade QR codes with stunning customization.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT: Controls Panel */}
                    <div className="lg:col-span-7 space-y-8">

                        {/* Tab Navigation */}
                        <div className="flex p-1.5 bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-neutral-800/50 w-full overflow-x-auto no-scrollbar">
                            {[
                                { id: "text", icon: FiType, label: "Text & Link" },
                                { id: "wifi", icon: FiWifi, label: "WiFi Access" },
                                { id: "vcard", icon: FiUser, label: "Contact Card" },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 relative whitespace-nowrap ${activeTab === tab.id ? "text-white shadow-lg shadow-blue-900/20" : "text-gray-500 hover:text-gray-300 hover:bg-neutral-800/50"
                                        }`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl"
                                            style={{ zIndex: -1 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <tab.icon className="w-4 h-4" /> {tab.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Main Input Card */}
                        <motion.div
                            layout
                            className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-6"
                        >
                            <AnimatePresence mode="wait">
                                {activeTab === "text" && (
                                    <motion.div
                                        key="text"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-3"
                                    >
                                        <label className="text-sm font-semibold text-gray-300 ml-1">Content</label>
                                        <textarea
                                            value={textData}
                                            onChange={(e) => setTextData(e.target.value)}
                                            placeholder="Enter website URL, plain text, or secret message..."
                                            className="w-full bg-black/40 border border-neutral-700/50 rounded-2xl p-5 min-h-[160px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600 resize-none text-lg"
                                        />
                                    </motion.div>
                                )}

                                {activeTab === "wifi" && (
                                    <motion.div
                                        key="wifi"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="grid gap-6"
                                    >
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-300 ml-1">Network Name (SSID)</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Home_Network_5G"
                                                value={wifiData.ssid}
                                                onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                                                className="w-full bg-black/40 border border-neutral-700/50 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-300 ml-1">Password</label>
                                                <input
                                                    type="text"
                                                    placeholder="Password"
                                                    value={wifiData.password}
                                                    onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                                                    className="w-full bg-black/40 border border-neutral-700/50 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-neutral-600"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-300 ml-1">Encryption</label>
                                                <div className="relative">
                                                    <select
                                                        value={wifiData.encryption}
                                                        onChange={(e) => setWifiData({ ...wifiData, encryption: e.target.value })}
                                                        className="w-full bg-black/40 border border-neutral-700/50 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="WPA">WPA/WPA2</option>
                                                        <option value="WEP">WEP</option>
                                                        <option value="nopass">No Password</option>
                                                    </select>
                                                    <FiSettings className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === "vcard" && (
                                    <motion.div
                                        key="vcard"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-4"
                                    >
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-300 ml-1">Full Name</label>
                                                <input type="text" placeholder="John Doe" value={vcardData.fn} onChange={(e) => setVcardData({ ...vcardData, fn: e.target.value })} className="w-full bg-black/40 border border-neutral-700/50 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-gray-300 ml-1">Phone</label>
                                                <input type="text" placeholder="+1 234 567 890" value={vcardData.tel} onChange={(e) => setVcardData({ ...vcardData, tel: e.target.value })} className="w-full bg-black/40 border border-neutral-700/50 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-300 ml-1">Email</label>
                                            <input type="email" placeholder="john@example.com" value={vcardData.email} onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })} className="w-full bg-black/40 border border-neutral-700/50 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-300 ml-1">Website</label>
                                            <input type="text" placeholder="https://mysite.com" value={vcardData.url} onChange={(e) => setVcardData({ ...vcardData, url: e.target.value })} className="w-full bg-black/40 border border-neutral-700/50 rounded-xl px-5 py-4 focus:outline-none focus:border-blue-500 transition-all" />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Customization Section */}
                            <div className="pt-6 border-t border-white/5">
                                <div className="flex items-center gap-2 mb-4">
                                    <FiSettings className="text-blue-400" />
                                    <span className="text-sm font-bold uppercase tracking-wider text-gray-400">Styling</span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                        <label className="text-xs text-gray-500 font-bold block mb-2">DOT COLOR</label>
                                        <div className="flex items-center gap-3">
                                            <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer bg-transparent border-none" />
                                            <span className="text-xs font-mono text-gray-300">{fillColor}</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded-xl border border-white/5">
                                        <label className="text-xs text-gray-500 font-bold block mb-2">BG COLOR</label>
                                        <div className="flex items-center gap-3">
                                            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-8 w-8 rounded cursor-pointer bg-transparent border-none" />
                                            <span className="text-xs font-mono text-gray-300">{bgColor}</span>
                                        </div>
                                    </div>
                                    <div className="bg-black/20 p-3 rounded-xl border border-white/5 col-span-2 md:col-span-1">
                                        <label className="text-xs text-gray-500 font-bold block mb-2">SHAPE</label>
                                        <div className="flex bg-black/40 rounded-lg p-1">
                                            <button onClick={() => setStyle('square')} className={`flex-1 py-1.5 text-xs rounded transition-all ${style === 'square' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Sharp</button>
                                            <button onClick={() => setStyle('rounded')} className={`flex-1 py-1.5 text-xs rounded transition-all ${style === 'rounded' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Round</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={generateQR}
                                disabled={loading}
                                className={`w-full py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 transition-all ${loading
                                        ? "bg-neutral-800 text-gray-500 cursor-not-allowed"
                                        : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white"
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Forging QR...</span>
                                    </>
                                ) : (
                                    <>
                                        <FiZap className="w-5 h-5" />
                                        <span>Generate QR Code</span>
                                    </>
                                )}
                            </motion.button>
                        </motion.div>
                    </div>

                    {/* RIGHT: Preview Panel */}
                    <div className="lg:col-span-5">
                        <motion.div
                            className="bg-neutral-900/30 backdrop-blur-xl border border-neutral-800 rounded-3xl p-8 h-full min-h-[500px] flex flex-col items-center justify-center relative overflow-hidden group"
                        >
                            {/* Decorative Elements */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                            {qrUrl ? (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="relative z-10 flex flex-col items-center gap-8"
                                >
                                    <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-blue-500/10 transform transition-transform group-hover:rotate-1 duration-500">
                                        <img src={qrUrl} alt="QR Code" className="w-64 h-64 object-contain" />
                                    </div>

                                    <div className="flex flex-col gap-3 w-full">
                                        <button
                                            onClick={downloadQR}
                                            className="flex items-center justify-center gap-2 px-8 py-4 bg-white text-black hover:bg-gray-100 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                        >
                                            <FiDownload className="w-5 h-5" /> Download PNG
                                        </button>
                                        <button
                                            onClick={() => { navigator.clipboard.writeText(qrUrl) }}
                                            className="flex items-center justify-center gap-2 px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-all"
                                        >
                                            <FiShare2 className="w-4 h-4" /> Copy Image URL
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="text-center space-y-4 opacity-50 relative z-10">
                                    <div className="w-32 h-32 border-4 border-dashed border-neutral-700 rounded-2xl mx-auto flex items-center justify-center">
                                        <FiCode className="w-12 h-12 text-neutral-600" />
                                    </div>
                                    <p className="text-neutral-500 font-mono text-sm max-w-[200px] mx-auto">
                                        Construct a QR code to visualize the preview
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}

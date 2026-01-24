"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { FiWifi, FiType, FiUser, FiDownload, FiSettings, FiShare2, FiZap, FiCode } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function QRExtreme() {
    const [activeTab, setActiveTab] = useState("text"); // text, wifi, vcard
    const [loading, setLoading] = useState(false);
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

    // CONFIGURATION PANEL CONTENT
    const configPanel = (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex p-1 bg-black/20 rounded-lg border border-white/5">
                {[
                    { id: "text", icon: FiType, label: "Text" },
                    { id: "wifi", icon: FiWifi, label: "WiFi" },
                    { id: "vcard", icon: FiUser, label: "Contact" },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab.id ? "bg-neutral-800 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Dynamic Inputs */}
            <AnimatePresence mode="wait">
                {activeTab === "text" && (
                    <motion.div
                        key="text"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-3"
                    >
                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2 block">Content</label>
                            <textarea
                                value={textData}
                                onChange={(e) => setTextData(e.target.value)}
                                placeholder="Enter text or URL..."
                                className="w-full bg-black/20 border border-neutral-700/50 rounded-lg p-3 min-h-[100px] text-sm focus:border-blue-500 outline-none transition-colors resize-none placeholder:text-neutral-600"
                            />
                        </div>
                    </motion.div>
                )}

                {activeTab === "wifi" && (
                    <motion.div
                        key="wifi"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Network Name</label>
                            <input
                                type="text"
                                placeholder="SSID"
                                value={wifiData.ssid}
                                onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                                className="w-full bg-black/20 border border-neutral-700/50 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Password</label>
                            <input
                                type="text"
                                placeholder="Password"
                                value={wifiData.password}
                                onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                                className="w-full bg-black/20 border border-neutral-700/50 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 block">Encryption</label>
                            <select
                                value={wifiData.encryption}
                                onChange={(e) => setWifiData({ ...wifiData, encryption: e.target.value })}
                                className="w-full bg-black/20 border border-neutral-700/50 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none transition-colors appearance-none cursor-pointer"
                            >
                                <option value="WPA">WPA/WPA2</option>
                                <option value="WEP">WEP</option>
                                <option value="nopass">None</option>
                            </select>
                        </div>
                    </motion.div>
                )}

                {activeTab === "vcard" && (
                    <motion.div
                        key="vcard"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="space-y-3"
                    >
                        <input type="text" placeholder="Full Name" value={vcardData.fn} onChange={(e) => setVcardData({ ...vcardData, fn: e.target.value })} className="w-full bg-black/20 border border-neutral-700/50 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none" />
                        <input type="text" placeholder="Phone" value={vcardData.tel} onChange={(e) => setVcardData({ ...vcardData, tel: e.target.value })} className="w-full bg-black/20 border border-neutral-700/50 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none" />
                        <input type="email" placeholder="Email" value={vcardData.email} onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })} className="w-full bg-black/20 border border-neutral-700/50 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none" />
                        <input type="text" placeholder="Website" value={vcardData.url} onChange={(e) => setVcardData({ ...vcardData, url: e.target.value })} className="w-full bg-black/20 border border-neutral-700/50 rounded-lg p-2.5 text-sm focus:border-blue-500 outline-none" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Styling Options */}
            <div className="pt-6 border-t border-white/5 space-y-4">
                <h4 className="text-sm font-semibold text-gray-400">Styling</h4>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Fill</label>
                        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-lg border border-neutral-800">
                            <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="h-6 w-6 rounded bg-transparent border-none cursor-pointer" />
                            <span className="text-xs font-mono text-gray-400">{fillColor}</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Background</label>
                        <div className="flex items-center gap-2 bg-black/20 p-1.5 rounded-lg border border-neutral-800">
                            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-6 w-6 rounded bg-transparent border-none cursor-pointer" />
                            <span className="text-xs font-mono text-gray-400">{bgColor}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Shape</label>
                    <div className="flex bg-black/20 rounded-lg p-1 border border-neutral-800">
                        <button onClick={() => setStyle('square')} className={`flex-1 py-1.5 text-xs rounded transition-all ${style === 'square' ? 'bg-neutral-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Sharp</button>
                        <button onClick={() => setStyle('rounded')} className={`flex-1 py-1.5 text-xs rounded transition-all ${style === 'rounded' ? 'bg-neutral-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Round</button>
                    </div>
                </div>
            </div>

            <button
                onClick={generateQR}
                disabled={loading}
                className={`w-full py-3 rounded-lg font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${loading
                    ? "bg-neutral-800 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 text-white"
                    }`}
            >
                {loading ? <span className="animate-pulse">Generating...</span> : "Generate Code"}
            </button>
        </div>
    );

    return (
        <ToolLayout
            title="QR Code Factory"
            subtitle="Generate enterprise-grade QR codes with WiFi, vCard, and specialized formats."
            onFilesSelected={() => { }} // Not used
            processingStage="complete"  // Shows custom content, hides upload zone
            downloadReady={false}       // Handled manually in customContent
            configPanel={configPanel}
            customContent={
                <div className="h-full min-h-[400px] flex items-center justify-center bg-black/20 rounded-2xl border border-dashed border-neutral-800 relative group overflow-hidden">
                    {/* Decorative BG */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />

                    {qrUrl ? (
                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300 relative z-10">
                            <div className="bg-white p-6 rounded-xl shadow-2xl inline-block">
                                <img src={qrUrl} alt="QR Code" className="w-64 h-64 object-contain" />
                            </div>
                            <div className="flex justify-center gap-4">
                                <button onClick={downloadQR} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium text-sm transition-colors shadow-lg">
                                    <FiDownload /> Download PNG
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center opacity-40 relative z-10">
                            <div className="w-20 h-20 border-2 border-dashed border-neutral-600 rounded-xl mx-auto flex items-center justify-center mb-4">
                                <FiCode className="w-8 h-8 text-neutral-500" />
                            </div>
                            <p className="text-sm font-mono text-neutral-500">Preview Area</p>
                        </div>
                    )}
                </div>
            }
        />
    );
}

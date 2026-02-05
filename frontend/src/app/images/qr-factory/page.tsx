"use client";

import React, { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import ToolContent from '@/components/ToolContent';
import { FiWifi, FiType, FiUser, FiDownload, FiZap, FiCode, FiLayers, FiGrid, FiCheck, FiCopy } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";

export default function QRExtreme() {
    const [activeTab, setActiveTab] = useState("text");
    const [loading, setLoading] = useState(false);
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Customization
    const [fillColor, setFillColor] = useState("#000000");
    const [bgHex, setBgHex] = useState("#ffffff");
    const [style, setStyle] = useState("rounded");

    // Data States
    const [textData, setTextData] = useState("");
    const [wifiData, setWifiData] = useState({ ssid: "", password: "", encryption: "WPA" });
    const [vcardData, setVcardData] = useState({ fn: "", tel: "", email: "", url: "" });

    const generateQR = async () => {
        setLoading(true);
        await new Promise(r => setTimeout(r, 400));

        try {
            let finalData = "";
            if (activeTab === "text") {
                finalData = textData || "https://magetool.in";
            } else if (activeTab === "wifi") {
                finalData = `WIFI:S:${wifiData.ssid};T:${wifiData.encryption};P:${wifiData.password};;`;
            } else if (activeTab === "vcard") {
                finalData = `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardData.fn}\nTEL:${vcardData.tel}\nEMAIL:${vcardData.email}\nURL:${vcardData.url}\nEND:VCARD`;
            }

            const url = await QRCode.toDataURL(finalData, {
                width: 1024,
                margin: 2,
                color: { dark: fillColor, light: bgHex },
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

    const copyToClipboard = async () => {
        if (!qrUrl) return;
        try {
            const response = await fetch(qrUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    };

    // Premium Config Panel - Apple/Google/Microsoft Level
    const configPanel = (
        <div className="space-y-6">
            {/* Section 1: Content Type */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-white">Content Type</h4>
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-full">Step 1</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: "text", icon: FiType, label: "Link", desc: "URL or text" },
                        { id: "wifi", icon: FiWifi, label: "WiFi", desc: "Network" },
                        { id: "vcard", icon: FiUser, label: "Contact", desc: "vCard" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`relative flex flex-col items-center justify-center p-4 rounded-2xl transition-all duration-200 group ${activeTab === tab.id
                                ? "bg-gradient-to-b from-white to-gray-100 text-gray-900 shadow-lg shadow-white/10"
                                : "bg-white/[0.03] hover:bg-white/[0.06] text-gray-400 hover:text-white border border-white/[0.05]"
                                }`}
                        >
                            <tab.icon className={`w-5 h-5 mb-2 transition-transform group-hover:scale-110 ${activeTab === tab.id ? "text-gray-900" : ""}`} />
                            <span className="text-xs font-semibold">{tab.label}</span>
                            <span className={`text-[9px] mt-0.5 ${activeTab === tab.id ? "text-gray-600" : "text-gray-600"}`}>{tab.desc}</span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Section 2: Content Input */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-white">Content</h4>
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-full">Step 2</span>
                </div>
                <AnimatePresence mode="wait">
                    {activeTab === "text" && (
                        <motion.div key="text" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                            <div className="relative">
                                <textarea
                                    value={textData}
                                    onChange={(e) => setTextData(e.target.value)}
                                    placeholder="Enter URL or text content..."
                                    className="w-full bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.08] hover:border-white/[0.12] focus:border-white/20 focus:bg-white/[0.05] rounded-2xl p-4 min-h-[120px] text-sm text-white outline-none transition-all duration-200 resize-none placeholder:text-gray-600"
                                />
                                <div className="absolute bottom-3 right-3 text-[10px] text-gray-600 font-mono">
                                    {textData.length} characters
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "wifi" && (
                        <motion.div key="wifi" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-[#111] px-2 text-[10px] text-gray-500 font-medium">Network Name</label>
                                <input type="text" value={wifiData.ssid} onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })} placeholder="MyWiFi" className="w-full bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] focus:border-white/20 rounded-xl px-4 py-3.5 text-sm text-white outline-none transition-all" />
                            </div>
                            <div className="relative">
                                <label className="absolute -top-2 left-3 bg-[#111] px-2 text-[10px] text-gray-500 font-medium">Password</label>
                                <input type="password" value={wifiData.password} onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })} placeholder="••••••••" className="w-full bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] focus:border-white/20 rounded-xl px-4 py-3.5 text-sm text-white outline-none transition-all" />
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "vcard" && (
                        <motion.div key="vcard" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
                            {[
                                { key: 'fn', label: 'Full Name', type: 'text', placeholder: 'John Doe' },
                                { key: 'tel', label: 'Phone', type: 'tel', placeholder: '+1 234 567 8900' },
                                { key: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
                            ].map((field) => (
                                <div key={field.key} className="relative">
                                    <label className="absolute -top-2 left-3 bg-[#111] px-2 text-[10px] text-gray-500 font-medium">{field.label}</label>
                                    <input
                                        type={field.type}
                                        value={vcardData[field.key as keyof typeof vcardData]}
                                        onChange={(e) => setVcardData({ ...vcardData, [field.key]: e.target.value })}
                                        placeholder={field.placeholder}
                                        className="w-full bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.12] focus:border-white/20 rounded-xl px-4 py-3.5 text-sm text-white outline-none transition-all"
                                    />
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Section 3: Appearance */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-white">Appearance</h4>
                    <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-1 rounded-full">Step 3</span>
                </div>

                {/* Color Pickers */}
                <div className="flex gap-3 mb-4">
                    <div className="flex-1 bg-white/[0.03] rounded-2xl p-3 border border-white/[0.05] hover:border-white/[0.1] transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/10 ring-offset-2 ring-offset-[#111]" style={{ backgroundColor: fillColor }}>
                                    <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="w-full h-full cursor-pointer opacity-0" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Foreground</p>
                                <p className="text-xs font-mono text-white">{fillColor.toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 bg-white/[0.03] rounded-2xl p-3 border border-white/[0.05] hover:border-white/[0.1] transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/10 ring-offset-2 ring-offset-[#111]" style={{ backgroundColor: bgHex }}>
                                    <input type="color" value={bgHex} onChange={(e) => setBgHex(e.target.value)} className="w-full h-full cursor-pointer opacity-0" />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">Background</p>
                                <p className="text-xs font-mono text-white">{bgHex.toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Style Toggle */}
                <div className="flex bg-white/[0.03] rounded-2xl p-1.5 border border-white/[0.05]">
                    <button
                        onClick={() => setStyle('square')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium transition-all duration-200 ${style === 'square'
                            ? 'bg-white text-gray-900 shadow-md'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <FiGrid className="w-4 h-4" /> Sharp Edges
                    </button>
                    <button
                        onClick={() => setStyle('rounded')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-medium transition-all duration-200 ${style === 'rounded'
                            ? 'bg-white text-gray-900 shadow-md'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <FiLayers className="w-4 h-4" /> Rounded
                    </button>
                </div>
            </section>

            {/* Generate Button */}
            <button
                onClick={generateQR}
                disabled={loading}
                className="w-full relative overflow-hidden bg-white hover:bg-gray-50 text-gray-900 font-semibold py-4 rounded-2xl shadow-lg shadow-white/10 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                {loading ? (
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                ) : (
                    <FiZap className="w-5 h-5" />
                )}
                <span className="text-sm">{loading ? 'Generating...' : 'Generate QR Code'}</span>
            </button>
        </div>
    );



    // Premium Preview Content
    const previewContent = (
        <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <AnimatePresence mode="wait">
                {qrUrl ? (
                    <motion.div
                        key="qr"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-6 w-full max-w-[320px]"
                    >
                        {/* QR Code Card */}
                        <div className="relative group">
                            {/* Subtle Glow */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            {/* QR Container */}
                            <div className="relative bg-white rounded-2xl p-4 shadow-2xl shadow-black/50">
                                <img
                                    src={qrUrl}
                                    alt="QR Code"
                                    className="w-48 h-48 md:w-56 md:h-56 object-contain"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 w-full">
                            <button
                                onClick={downloadQR}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black hover:bg-gray-100 rounded-xl font-semibold text-sm transition-all shadow-lg"
                            >
                                <FiDownload className="w-4 h-4" />
                                Download
                            </button>
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl font-medium text-sm transition-all"
                            >
                                {copied ? <FiCheck className="w-4 h-4 text-green-400" /> : <FiCopy className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>

                        {/* Regenerate hint */}
                        <p className="text-xs text-gray-500 text-center">
                            Tip: Change settings and regenerate anytime
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center text-center py-12 px-4"
                    >
                        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-5">
                            <FiCode className="w-8 h-8 text-gray-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-2">Your QR Code</h3>
                        <p className="text-sm text-gray-500 max-w-[200px]">
                            Enter content and click Generate to create your QR code
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    return (
        <ToolLayout
            title="QR Code Generator"
            subtitle="Create beautiful, scannable QR codes instantly"
            onFilesSelected={() => { }}
            processingStage="complete"
            downloadReady={false}
            configPanel={configPanel}
            customContent={previewContent}
            toolContent={
                <ToolContent
                    overview="Generate professional QR codes for URLs, WiFi networks, or contact cards. Customize colors and download in high resolution."
                    features={[
                        "Multiple formats: URL, WiFi, Contact Card (vCard)",
                        "Custom colors for foreground and background",
                        "High-resolution 1024px output",
                        "Instant generation, no upload needed"
                    ]}
                    howTo={[
                        { step: "Choose Type", description: "Select URL, WiFi, or Contact" },
                        { step: "Enter Content", description: "Add your link, network info, or contact details" },
                        { step: "Customize", description: "Pick colors and style" },
                        { step: "Download", description: "Get your QR code as a PNG image" }
                    ]}
                />
            }
        />
    );
}

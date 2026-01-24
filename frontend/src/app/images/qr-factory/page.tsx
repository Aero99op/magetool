"use client";

import React, { useState, useEffect } from "react";
import { FiWifi, FiType, FiUser, FiDownload, FiSettings, FiShare2, FiEye, FiEyeOff } from "react-icons/fi";

export default function QRExtreme() {
    const [activeTab, setActiveTab] = useState("text"); // text, wifi, vcard
    const [loading, setLoading] = useState(false);
    const [qrBlob, setQrBlob] = useState<Blob | null>(null);
    const [qrUrl, setQrUrl] = useState<string | null>(null);

    // Customization
    const [fillColor, setFillColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [style, setStyle] = useState("square"); // square, rounded

    // Data States
    const [textData, setTextData] = useState("");
    const [wifiData, setWifiData] = useState({ ssid: "", password: "", encryption: "WPA" });
    const [vcardData, setVcardData] = useState({ fn: "", tel: "", email: "", url: "" });

    // Hidden Message Mode
    const [hiddenMode, setHiddenMode] = useState(false);
    const [hiddenMessage, setHiddenMessage] = useState("");

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

            // If hidden mode is on, we actually just append it in a way that might not be visible to standard readers or just as a fun "Easter egg" concept. 
            // Real steganography in QR is complex, but for "Hidden Messages" we can use the trick of appending data after a null terminator or similar if the reader supports it, 
            // OR practically, we can just encode it normally but tell the user it's "tech-savvy".
            // actually, a better "Hidden" feature for a "Factory" is a false-flag QR.
            // But for this simple implementation, let's stick to the generated content.

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
        <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-12">
            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* LEFT: Controls */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                            QR Code Factory
                        </h1>
                        <p className="text-gray-400">Generate Pro-Grade QR Codes. WiFi, vCard, & More.</p>
                    </div>

                    {/* Type Selector */}
                    <div className="flex gap-4 p-1 bg-neutral-900 rounded-xl w-fit">
                        {[
                            { id: "text", icon: FiType, label: "Text" },
                            { id: "wifi", icon: FiWifi, label: "WiFi" },
                            { id: "vcard", icon: FiUser, label: "Contact" },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${activeTab === tab.id ? "bg-neutral-800 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                <tab.icon />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Inputs */}
                    <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-2xl space-y-6">

                        {activeTab === "text" && (
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">Content</label>
                                <textarea
                                    value={textData}
                                    onChange={(e) => setTextData(e.target.value)}
                                    placeholder="Enter text, URL, or secret message..."
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 min-h-[150px] focus:outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        )}

                        {activeTab === "wifi" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400">Network Name (SSID)</label>
                                    <input
                                        type="text"
                                        value={wifiData.ssid}
                                        onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 mt-1 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Password</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={wifiData.password}
                                            onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 mt-1 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Encryption</label>
                                    <select
                                        value={wifiData.encryption}
                                        onChange={(e) => setWifiData({ ...wifiData, encryption: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 mt-1 focus:outline-none focus:border-blue-500"
                                    >
                                        <option value="WPA">WPA/WPA2</option>
                                        <option value="WEP">WEP</option>
                                        <option value="nopass">None</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {activeTab === "vcard" && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-400">Full Name</label>
                                        <input
                                            type="text"
                                            value={vcardData.fn}
                                            onChange={(e) => setVcardData({ ...vcardData, fn: e.target.value })}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 mt-1 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-400">Phone</label>
                                        <input
                                            type="text"
                                            value={vcardData.tel}
                                            onChange={(e) => setVcardData({ ...vcardData, tel: e.target.value })}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 mt-1 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Email</label>
                                    <input
                                        type="email"
                                        value={vcardData.email}
                                        onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 mt-1 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400">Website</label>
                                    <input
                                        type="text"
                                        value={vcardData.url}
                                        onChange={(e) => setVcardData({ ...vcardData, url: e.target.value })}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 mt-1 focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Customization Toggle */}
                        <div className="pt-4 border-t border-neutral-800">
                            <details className="group">
                                <summary className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white pb-2 selection:bg-transparent">
                                    <FiSettings /> <span>Visual Customization</span>
                                </summary>
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Dot Color</label>
                                        <div className="flex items-center gap-2 mt-2">
                                            <input type="color" value={fillColor} onChange={(e) => setFillColor(e.target.value)} className="h-10 w-10 bg-transparent border-0 cursor-pointer" />
                                            <span className="text-sm font-mono">{fillColor}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Background</label>
                                        <div className="flex items-center gap-2 mt-2">
                                            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="h-10 w-10 bg-transparent border-0 cursor-pointer" />
                                            <span className="text-sm font-mono">{bgColor}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Style</label>
                                        <select
                                            value={style}
                                            onChange={(e) => setStyle(e.target.value)}
                                            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-2 mt-2 text-sm"
                                        >
                                            <option value="square">Square (Standard)</option>
                                            <option value="rounded">Rounded (Soft)</option>
                                        </select>
                                    </div>
                                </div>
                            </details>
                        </div>

                    </div>

                    <button
                        onClick={generateQR}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${loading ? "bg-neutral-800 text-gray-500 cursor-not-allowed" : "bg-white text-black hover:bg-gray-200 hover:scale-[1.02]"
                            }`}
                    >
                        {loading ? "Generating..." : "Generate QR Code"}
                    </button>
                </div>

                {/* RIGHT: Preview */}
                <div className="flex flex-col justify-center items-center bg-neutral-900/30 rounded-3xl border-2 border-dashed border-neutral-800 p-8 relative min-h-[500px]">

                    {qrUrl ? (
                        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-300">
                            <div className="bg-white p-4 rounded-xl shadow-2xl inline-block">
                                <img src={qrUrl} alt="QR Code" className="w-64 h-64 object-contain" />
                            </div>
                            <div className="flex justify-center gap-4">
                                <button onClick={downloadQR} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors">
                                    <FiDownload /> Download PNG
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-600">
                            <div className="w-64 h-64 bg-neutral-900 rounded-xl mb-4 mx-auto animate-pulse flex items-center justify-center">
                                <span className="text-4xl opacity-20">?</span>
                            </div>
                            <p>Your QR Code will appear here</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

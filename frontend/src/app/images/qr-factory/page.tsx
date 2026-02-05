"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FiWifi, FiLink, FiUser, FiDownload, FiZap, FiCopy, FiCheck, FiSquare, FiCircle } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import ToolContent from '@/components/ToolContent';

type ContentType = "link" | "wifi" | "vcard";

export default function QRFactory() {
    const [activeTab, setActiveTab] = useState<ContentType>("link");
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Customization
    const [fillColor, setFillColor] = useState("#000000");
    const [bgColor, setBgColor] = useState("#ffffff");
    const [style, setStyle] = useState<"square" | "rounded">("rounded");

    // Data States
    const [textData, setTextData] = useState("");
    const [wifiData, setWifiData] = useState({ ssid: "", password: "", encryption: "WPA" });
    const [vcardData, setVcardData] = useState({ fn: "", tel: "", email: "" });

    // Auto-generate with debounce
    const [autoGenerate, setAutoGenerate] = useState(true);

    const generateQR = useCallback(async () => {

        try {
            let finalData = "";
            if (activeTab === "link") {
                finalData = textData || "https://magetool.in";
            } else if (activeTab === "wifi") {
                if (!wifiData.ssid) {
                    finalData = "WIFI:S:MyNetwork;T:WPA;P:password123;;";
                } else {
                    finalData = `WIFI:S:${wifiData.ssid};T:${wifiData.encryption};P:${wifiData.password};;`;
                }
            } else if (activeTab === "vcard") {
                if (!vcardData.fn) {
                    finalData = "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD";
                } else {
                    finalData = `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardData.fn}\nTEL:${vcardData.tel}\nEMAIL:${vcardData.email}\nEND:VCARD`;
                }
            }

            const url = await QRCode.toDataURL(finalData, {
                width: 1024,
                margin: 2,
                color: { dark: fillColor, light: bgColor },
                errorCorrectionLevel: 'H'
            });

            setQrUrl(url);
        } catch (e) {
            console.error(e);
        }
    }, [activeTab, textData, wifiData, vcardData, fillColor, bgColor]);

    // Auto-generate on mount and when dependencies change
    useEffect(() => {
        if (autoGenerate) {
            const timer = setTimeout(() => {
                generateQR();
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [autoGenerate, generateQR]);

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
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    };

    const tabs = [
        { id: "link" as ContentType, icon: FiLink, label: "Link / URL" },
        { id: "wifi" as ContentType, icon: FiWifi, label: "WiFi" },
        { id: "vcard" as ContentType, icon: FiUser, label: "Contact" },
    ];

    const colorPresets = [
        { name: "Classic", fg: "#000000", bg: "#ffffff" },
        { name: "Ocean", fg: "#0f172a", bg: "#e0f2fe" },
        { name: "Forest", fg: "#14532d", bg: "#dcfce7" },
        { name: "Royal", fg: "#581c87", bg: "#f3e8ff" },
        { name: "Sunset", fg: "#9a3412", bg: "#ffedd5" },
        { name: "Dark", fg: "#ffffff", bg: "#18181b" },
    ];

    return (
        <div className="qr-factory-container">
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="qr-header"
            >
                <h1 className="qr-title">
                    <span className="qr-title-icon">✨</span>
                    QR Code Generator
                </h1>
                <p className="qr-subtitle">Create beautiful, scannable QR codes instantly</p>
            </motion.header>

            {/* Main Grid */}
            <div className="qr-main-grid">
                {/* Left: Configuration Panel */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="qr-config-panel"
                >
                    {/* Type Tabs */}
                    <div className="qr-tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`qr-tab ${activeTab === tab.id ? 'qr-tab-active' : ''}`}
                            >
                                <tab.icon className="qr-tab-icon" />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Input */}
                    <div className="qr-input-section">
                        <AnimatePresence mode="wait">
                            {activeTab === "link" && (
                                <motion.div
                                    key="link"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    <textarea
                                        value={textData}
                                        onChange={(e) => setTextData(e.target.value)}
                                        placeholder="Enter URL or any text..."
                                        className="qr-textarea"
                                        rows={3}
                                    />
                                </motion.div>
                            )}

                            {activeTab === "wifi" && (
                                <motion.div
                                    key="wifi"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="qr-form-grid"
                                >
                                    <input
                                        type="text"
                                        value={wifiData.ssid}
                                        onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                                        placeholder="Network name (SSID)"
                                        className="qr-input"
                                    />
                                    <input
                                        type="password"
                                        value={wifiData.password}
                                        onChange={(e) => setWifiData({ ...wifiData, password: e.target.value })}
                                        placeholder="Password"
                                        className="qr-input"
                                    />
                                    <select
                                        value={wifiData.encryption}
                                        onChange={(e) => setWifiData({ ...wifiData, encryption: e.target.value })}
                                        className="qr-select"
                                    >
                                        <option value="WPA">WPA/WPA2</option>
                                        <option value="WEP">WEP</option>
                                        <option value="nopass">No Password</option>
                                    </select>
                                </motion.div>
                            )}

                            {activeTab === "vcard" && (
                                <motion.div
                                    key="vcard"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="qr-form-grid"
                                >
                                    <input
                                        type="text"
                                        value={vcardData.fn}
                                        onChange={(e) => setVcardData({ ...vcardData, fn: e.target.value })}
                                        placeholder="Full Name"
                                        className="qr-input"
                                    />
                                    <input
                                        type="tel"
                                        value={vcardData.tel}
                                        onChange={(e) => setVcardData({ ...vcardData, tel: e.target.value })}
                                        placeholder="Phone Number"
                                        className="qr-input"
                                    />
                                    <input
                                        type="email"
                                        value={vcardData.email}
                                        onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
                                        placeholder="Email Address"
                                        className="qr-input"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Color Presets */}
                    <div className="qr-colors-section">
                        <h3 className="qr-section-title">Color Theme</h3>
                        <div className="qr-color-presets">
                            {colorPresets.map((preset) => (
                                <button
                                    key={preset.name}
                                    onClick={() => {
                                        setFillColor(preset.fg);
                                        setBgColor(preset.bg);
                                    }}
                                    className={`qr-preset-btn ${fillColor === preset.fg && bgColor === preset.bg ? 'qr-preset-active' : ''}`}
                                    title={preset.name}
                                >
                                    <div
                                        className="qr-preset-swatch"
                                        style={{
                                            background: `linear-gradient(135deg, ${preset.fg} 50%, ${preset.bg} 50%)`
                                        }}
                                    />
                                    <span className="qr-preset-name">{preset.name}</span>
                                </button>
                            ))}
                        </div>

                        {/* Custom Colors */}
                        <div className="qr-custom-colors">
                            <div className="qr-color-picker">
                                <label>Foreground</label>
                                <div className="qr-color-input-wrap">
                                    <input
                                        type="color"
                                        value={fillColor}
                                        onChange={(e) => setFillColor(e.target.value)}
                                        className="qr-color-input"
                                    />
                                    <span className="qr-color-hex">{fillColor.toUpperCase()}</span>
                                </div>
                            </div>
                            <div className="qr-color-picker">
                                <label>Background</label>
                                <div className="qr-color-input-wrap">
                                    <input
                                        type="color"
                                        value={bgColor}
                                        onChange={(e) => setBgColor(e.target.value)}
                                        className="qr-color-input"
                                    />
                                    <span className="qr-color-hex">{bgColor.toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Style Toggle */}
                    <div className="qr-style-section">
                        <h3 className="qr-section-title">QR Style</h3>
                        <div className="qr-style-toggle">
                            <button
                                onClick={() => setStyle('square')}
                                className={`qr-style-btn ${style === 'square' ? 'qr-style-active' : ''}`}
                            >
                                <FiSquare className="qr-style-icon" />
                                Sharp
                            </button>
                            <button
                                onClick={() => setStyle('rounded')}
                                className={`qr-style-btn ${style === 'rounded' ? 'qr-style-active' : ''}`}
                            >
                                <FiCircle className="qr-style-icon" />
                                Rounded
                            </button>
                        </div>
                    </div>

                    {/* Auto-update Note */}
                    <div className="qr-auto-note">
                        <FiZap className="qr-auto-icon" />
                        <span>QR updates automatically as you type</span>
                    </div>
                </motion.div>

                {/* Right: QR Preview */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="qr-preview-panel"
                >
                    <div className="qr-preview-container">
                        <AnimatePresence mode="wait">
                            {qrUrl ? (
                                <motion.div
                                    key="qr"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="qr-code-wrapper"
                                >
                                    {/* QR Code Card */}
                                    <div className="qr-code-card">
                                        <img
                                            src={qrUrl}
                                            alt="Generated QR Code"
                                            className="qr-code-image"
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="qr-actions">
                                        <button onClick={downloadQR} className="qr-action-btn qr-download-btn">
                                            <FiDownload />
                                            <span>Download PNG</span>
                                        </button>
                                        <button onClick={copyToClipboard} className="qr-action-btn qr-copy-btn">
                                            {copied ? <FiCheck className="qr-copied-icon" /> : <FiCopy />}
                                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                                        </button>
                                    </div>

                                    <p className="qr-tip">Scan with any camera app • High resolution 1024px</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="qr-empty-state"
                                >
                                    <div className="qr-empty-icon">📱</div>
                                    <h3>Your QR Code</h3>
                                    <p>Enter content on the left and click Generate</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* SEO Content */}
            <div className="qr-seo-content">
                <ToolContent
                    overview="Generate professional QR codes for URLs, WiFi networks, or contact cards. Customize colors and download in high resolution."
                    features={[
                        "Multiple formats: URL, WiFi, Contact Card (vCard)",
                        "Custom colors with preset themes",
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
            </div>

            {/* Styles */}
            <style jsx>{`
                .qr-factory-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 24px 20px 60px;
                }

                /* Header */
                .qr-header {
                    text-align: center;
                    margin-bottom: 32px;
                }

                .qr-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary, #fff);
                    margin-bottom: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                }

                .qr-title-icon {
                    font-size: 1.5rem;
                }

                .qr-subtitle {
                    font-size: 1rem;
                    color: var(--text-secondary, #9ca3af);
                }

                /* Main Grid */
                .qr-main-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    align-items: start;
                }

                /* Config Panel */
                .qr-config-panel {
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 20px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                /* Tabs */
                .qr-tabs {
                    display: flex;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.02);
                    padding: 6px;
                    border-radius: 14px;
                }

                .qr-tab {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px 16px;
                    border: none;
                    border-radius: 10px;
                    background: transparent;
                    color: var(--text-secondary, #9ca3af);
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .qr-tab:hover {
                    color: var(--text-primary, #fff);
                    background: rgba(255, 255, 255, 0.05);
                }

                .qr-tab-active {
                    background: linear-gradient(135deg, #fff, #f0f0f0) !important;
                    color: #111 !important;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                }

                .qr-tab-icon {
                    width: 18px;
                    height: 18px;
                }

                /* Input Section */
                .qr-input-section {
                    min-height: 120px;
                }

                .qr-textarea {
                    width: 100%;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: var(--text-primary, #fff);
                    font-size: 0.9rem;
                    resize: none;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .qr-textarea:focus {
                    border-color: rgba(255, 255, 255, 0.25);
                }

                .qr-textarea::placeholder {
                    color: var(--text-secondary, #6b7280);
                }

                .qr-form-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .qr-input, .qr-select {
                    width: 100%;
                    padding: 14px 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    color: var(--text-primary, #fff);
                    font-size: 0.9rem;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .qr-input:focus, .qr-select:focus {
                    border-color: rgba(255, 255, 255, 0.25);
                }

                .qr-input::placeholder {
                    color: var(--text-secondary, #6b7280);
                }

                .qr-select option {
                    background: #1a1a1a;
                    color: #fff;
                }

                /* Colors Section */
                .qr-colors-section {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .qr-section-title {
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-secondary, #9ca3af);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }

                .qr-color-presets {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 8px;
                }

                .qr-preset-btn {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                    padding: 8px 4px;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .qr-preset-btn:hover {
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 255, 255, 0.15);
                }

                .qr-preset-active {
                    border-color: rgba(255, 255, 255, 0.4) !important;
                    background: rgba(255, 255, 255, 0.08) !important;
                }

                .qr-preset-swatch {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .qr-preset-name {
                    font-size: 0.65rem;
                    color: var(--text-secondary, #9ca3af);
                }

                .qr-custom-colors {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                    margin-top: 8px;
                }

                .qr-color-picker {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .qr-color-picker label {
                    font-size: 0.75rem;
                    color: var(--text-secondary, #9ca3af);
                }

                .qr-color-input-wrap {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                }

                .qr-color-input {
                    width: 28px;
                    height: 28px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    background: transparent;
                }

                .qr-color-input::-webkit-color-swatch-wrapper {
                    padding: 0;
                }

                .qr-color-input::-webkit-color-swatch {
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 6px;
                }

                .qr-color-hex {
                    font-size: 0.75rem;
                    font-family: monospace;
                    color: var(--text-primary, #fff);
                }

                /* Style Section */
                .qr-style-section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .qr-style-toggle {
                    display: flex;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.02);
                    padding: 6px;
                    border-radius: 12px;
                }

                .qr-style-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 12px;
                    border: none;
                    border-radius: 8px;
                    background: transparent;
                    color: var(--text-secondary, #9ca3af);
                    font-size: 0.85rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .qr-style-btn:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .qr-style-active {
                    background: #fff !important;
                    color: #111 !important;
                }

                .qr-style-icon {
                    width: 16px;
                    height: 16px;
                }

                /* Auto-update Note */
                .qr-auto-note {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 14px 20px;
                    background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05));
                    border: 1px solid rgba(34, 197, 94, 0.2);
                    border-radius: 12px;
                    color: #22c55e;
                    font-size: 0.875rem;
                    font-weight: 500;
                }

                .qr-auto-icon {
                    width: 18px;
                    height: 18px;
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                /* Preview Panel */
                .qr-preview-panel {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .qr-preview-container {
                    width: 100%;
                    max-width: 340px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .qr-code-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    width: 100%;
                }

                .qr-code-card {
                    background: #fff;
                    padding: 20px;
                    border-radius: 20px;
                    box-shadow: 
                        0 20px 40px rgba(0, 0, 0, 0.4),
                        0 0 0 1px rgba(255, 255, 255, 0.1);
                    transition: transform 0.3s, box-shadow 0.3s;
                }

                .qr-code-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 
                        0 30px 50px rgba(0, 0, 0, 0.5),
                        0 0 60px rgba(100, 150, 255, 0.1),
                        0 0 0 1px rgba(255, 255, 255, 0.15);
                }

                .qr-code-image {
                    width: 240px;
                    height: 240px;
                    display: block;
                }

                .qr-actions {
                    display: flex;
                    gap: 12px;
                    width: 100%;
                }

                .qr-action-btn {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 20px;
                    border: none;
                    border-radius: 12px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .qr-download-btn {
                    background: linear-gradient(135deg, #fff, #e5e5e5);
                    color: #111;
                }

                .qr-download-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
                }

                .qr-copy-btn {
                    background: rgba(255, 255, 255, 0.08);
                    color: var(--text-primary, #fff);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                }

                .qr-copy-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                }

                .qr-copied-icon {
                    color: #22c55e;
                }

                .qr-tip {
                    font-size: 0.75rem;
                    color: var(--text-secondary, #6b7280);
                    text-align: center;
                }

                .qr-empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 40px;
                    text-align: center;
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px dashed rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                }

                .qr-empty-icon {
                    font-size: 3rem;
                    margin-bottom: 16px;
                }

                .qr-empty-state h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-primary, #fff);
                    margin-bottom: 8px;
                }

                .qr-empty-state p {
                    font-size: 0.85rem;
                    color: var(--text-secondary, #9ca3af);
                }

                /* SEO Content */
                .qr-seo-content {
                    margin-top: 48px;
                    padding-top: 32px;
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                }

                /* Responsive - Tablet */
                @media (max-width: 900px) {
                    .qr-main-grid {
                        grid-template-columns: 1fr;
                        gap: 24px;
                    }

                    .qr-preview-panel {
                        order: -1;
                    }

                    .qr-code-image {
                        width: 200px;
                        height: 200px;
                    }

                    .qr-color-presets {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }

                /* Responsive - Mobile */
                @media (max-width: 600px) {
                    .qr-factory-container {
                        padding: 16px 16px 40px;
                    }

                    .qr-header {
                        margin-bottom: 20px;
                    }

                    .qr-title {
                        font-size: 1.5rem;
                    }

                    .qr-subtitle {
                        font-size: 0.875rem;
                    }

                    .qr-config-panel {
                        padding: 16px;
                        gap: 16px;
                    }

                    .qr-tabs {
                        flex-direction: column;
                    }

                    .qr-tab {
                        padding: 10px 14px;
                    }

                    .qr-color-presets {
                        grid-template-columns: repeat(3, 1fr);
                    }

                    .qr-custom-colors {
                        grid-template-columns: 1fr;
                    }

                    .qr-code-image {
                        width: 180px;
                        height: 180px;
                    }

                    .qr-actions {
                        flex-direction: column;
                    }

                    .qr-generate-btn {
                        padding: 14px 20px;
                        font-size: 0.9rem;
                    }
                }

                /* Small Mobile */
                @media (max-width: 400px) {
                    .qr-code-card {
                        padding: 16px;
                    }

                    .qr-code-image {
                        width: 160px;
                        height: 160px;
                    }

                    .qr-tab-icon {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
}

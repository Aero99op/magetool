'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, AlertTriangle, Monitor, Share } from 'lucide-react';
import { useState, useEffect } from 'react';

interface InstallAppModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
    const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop'>('desktop');

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (/android/.test(userAgent)) {
            setPlatform('android');
        } else if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
        } else {
            setPlatform('desktop');
        }
    }, []);

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '/Magetool.apk';
        link.download = 'Magetool.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 10000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '20px',
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(5px)',
                    }}
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            background: 'var(--bg-deep)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '24px',
                            padding: '30px',
                            maxWidth: '450px',
                            width: '100%',
                            position: 'relative',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        }}
                    >
                        <button
                            onClick={onClose}
                            style={{
                                position: 'absolute',
                                top: '20px',
                                right: '20px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <div
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-blue-dark))',
                                    borderRadius: '16px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px',
                                }}
                            >
                                {platform === 'desktop' ? <Monitor size={32} color="white" /> : <Smartphone size={32} color="white" />}
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
                                Install Magetool
                            </h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                {platform === 'desktop'
                                    ? 'Install directly on your Computer for a native experience.'
                                    : 'Get the full experience on your device. Faster, ad-free, and works offline!'}
                            </p>
                        </div>

                        {platform === 'android' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <button
                                    onClick={handleDownload}
                                    className="btn btn-primary"
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        padding: '14px',
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    <Download size={20} />
                                    Download Android APK
                                </button>

                                <div
                                    style={{
                                        background: 'rgba(255, 193, 7, 0.1)',
                                        border: '1px solid rgba(255, 193, 7, 0.3)',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        fontSize: '0.9rem',
                                        color: '#ffc107',
                                        display: 'flex',
                                        gap: '12px',
                                        alignItems: 'start',
                                        textAlign: 'left'
                                    }}
                                >
                                    <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <div>
                                        <strong>Android Note:</strong> You might need to allow "Unknown Sources" to install this standalone APK.
                                    </div>
                                </div>
                            </div>
                        )}

                        {platform === 'ios' && (
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'left',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-primary)',
                                    lineHeight: '1.6',
                                    border: '1px solid var(--glass-border)',
                                }}
                            >
                                <p style={{ marginBottom: '12px' }}><strong>To install on iOS:</strong></p>
                                <ol style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <li>Tap the <strong>Share</strong> button <Share size={16} style={{ display: 'inline' }} /> in Safari.</li>
                                    <li>Scroll down and tap <strong>"Add to Home Screen"</strong> ➕.</li>
                                    <li>Tap <strong>Add</strong> in the top right corner.</li>
                                </ol>
                            </div>
                        )}

                        {platform === 'desktop' && (
                            <div
                                style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    textAlign: 'left',
                                    fontSize: '0.95rem',
                                    color: 'var(--text-primary)',
                                    lineHeight: '1.6',
                                    border: '1px solid var(--glass-border)',
                                }}
                            >
                                <p style={{ marginBottom: '12px' }}><strong>To install on Desktop (Chrome/Edge):</strong></p>
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        1. Look for the <strong>Install Icon</strong> <Download size={16} /> in your specific browser address bar (top right).
                                    </li>
                                    <li>
                                        2. Click it and select <strong>"Install Magetool"</strong>.
                                    </li>
                                </ul>
                                <p style={{ marginTop: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', fontStyle: 'italic' }}>
                                    It will open in its own window and work just like a native app!
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

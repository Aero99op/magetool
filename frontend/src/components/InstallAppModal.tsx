'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface InstallAppModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
    const [isAndroid, setIsAndroid] = useState(false);

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        setIsAndroid(/android/.test(userAgent));
    }, []);

    // If direct download is preferred, we can just link to it, but a modal helps explain "Unknown Sources"
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
                                <Smartphone size={32} color="white" />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
                                Install Magetool App
                            </h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Get the full experience on your device. Faster, ad-free, and works offline!
                            </p>
                        </div>

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
                                    <strong>Note:</strong> Since this is a direct download, your phone might ask to
                                    "Allow installation from unknown sources". Please click <strong>Allow</strong> to install.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

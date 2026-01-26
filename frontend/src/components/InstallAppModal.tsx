'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Smartphone, Monitor, AlertTriangle, Share } from 'lucide-react';
import { useState, useEffect } from 'react';

interface InstallAppModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InstallAppModal({ isOpen, onClose }: InstallAppModalProps) {
    const [platform, setPlatform] = useState<'android' | 'ios' | 'desktop' | 'unknown'>('unknown');

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

    const handleAndroidDownload = () => {
        const link = document.createElement('a');
        link.href = '/Magetool.apk';
        link.download = 'Magetool.apk';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleWindowsDownload = () => {
        // Direct link to the hosted Installer on Hugging Face Datasets (Permanent Storage)
        window.open('https://huggingface.co/datasets/Spandan1234/magetool-files/resolve/main/MagetoolSetup.exe', '_blank');
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
                            background: 'rgba(20, 20, 20, 0.95)', // Darker, more premium background
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            padding: '40px', // More breathing room
                            maxWidth: '600px', // Wider on desktop for better presence
                            width: '90%', // Mobile responsive
                            position: 'relative',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', // Deeper shadow
                            backdropFilter: 'blur(20px)', // Glassmorphism
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

                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                                Get Magetool
                            </h2>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Choose your platform for the best experience.
                            </p>
                        </div>

                        {/* Dual Options Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>

                            {/* Android Option */}
                            <button
                                onClick={handleAndroidDownload}
                                style={{
                                    background: platform === 'android' ? 'rgba(var(--neon-blue-rgb), 0.1)' : 'rgba(255,255,255,0.03)',
                                    border: platform === 'android' ? '1px solid var(--neon-blue)' : '1px solid var(--glass-border)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    color: 'white'
                                }}
                            >
                                <Smartphone size={40} color={platform === 'android' ? 'var(--neon-blue)' : '#888'} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Android</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Download APK</div>
                                </div>
                            </button>

                            {/* Windows Option */}
                            <button
                                onClick={handleWindowsDownload}
                                style={{
                                    background: platform === 'desktop' ? 'rgba(var(--neon-purple-rgb), 0.1)' : 'rgba(255,255,255,0.03)',
                                    border: platform === 'desktop' ? '1px solid var(--neon-purple)' : '1px solid var(--glass-border)',
                                    borderRadius: '16px',
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    color: 'white'
                                }}
                            >
                                <Monitor size={40} color={platform === 'desktop' ? 'var(--neon-purple)' : '#888'} />
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>Windows</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Download Installer</div>
                                </div>
                            </button>
                        </div>

                        {/* Smart Footer / Instructions */}
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                            {platform === 'ios' ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <strong>iOS User?</strong>
                                    <span>Tap <Share size={12} style={{ display: 'inline' }} /> Share -&gt; "Add to Home Screen"</span>
                                </div>
                            ) : (
                                <div>
                                    <strong>Native Experience</strong><br />
                                    Fast, Secure, and Ad-Free. <br />
                                    100% Free & Open Source.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

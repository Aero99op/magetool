'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Music, Scissors, Volume2, Activity, Search } from 'lucide-react';

const tools = [
    { name: 'Audio Converter', href: '/audio/converter', icon: Music, description: 'Convert between MP3, WAV, AAC, etc.' },
    { name: 'Audio Trimmer', href: '/audio/trimmer', icon: Scissors, description: 'Cut and trim audio files' },
    { name: 'Volume Booster', href: '/audio/volume', icon: Volume2, description: 'Adjust volume levels' },
    { name: 'BPM Detector', href: '/audio/bpm', icon: Activity, description: 'Detect tempo and BPM' },
    { name: 'Song Identifier', href: '/audio/identify', icon: Search, description: 'Identify songs with AI', isAI: true },
];

export default function AudioPage() {
    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '48px' }}
            >
                <h1 style={{ background: 'linear-gradient(135deg, #FFFFFF, #00FFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '2rem', fontWeight: 700 }}>Audio Tools</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                    Convert, trim, and enhance your audio files
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {tools.map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                        <motion.div
                            key={tool.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                        >
                            <Link
                                href={tool.href}
                                className="glass-card glass-card-hover"
                                style={{ display: 'block', padding: '20px', height: '100%' }}
                            >
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '10px',
                                        background: 'rgba(0, 255, 255, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Icon size={22} color="#00FFFF" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tool.name}</span>
                                            {tool.isAI && (
                                                <span style={{
                                                    fontSize: '0.6rem',
                                                    fontWeight: 700,
                                                    padding: '2px 5px',
                                                    background: 'rgba(0, 255, 255, 0.2)',
                                                    borderRadius: '3px',
                                                    color: '#00FFFF',
                                                }}>AI</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{tool.description}</p>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

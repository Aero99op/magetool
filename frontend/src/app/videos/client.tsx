'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Video, RotateCw, Merge, Film, Gauge,
    VolumeX, Music, Scissors, Archive, FileSearch, Sparkles
} from 'lucide-react';

const tools = [
    { name: 'Video Converter', href: '/videos/converter', icon: Video, description: 'Convert between MP4, MKV, AVI, etc.' },
    { name: 'Video Rotator', href: '/videos/rotate', icon: RotateCw, description: 'Rotate or flip your videos' },
    { name: 'Video Merger', href: '/videos/merger', icon: Merge, description: 'Combine multiple videos into one' },
    { name: 'Video to GIF', href: '/videos/to-gif', icon: Film, description: 'Convert videos to animated GIFs' },
    { name: 'Speed Changer', href: '/videos/speed', icon: Gauge, description: 'Speed up or slow down videos' },
    { name: 'Mute Video', href: '/videos/mute', icon: VolumeX, description: 'Remove audio from videos' },
    { name: 'Add Music', href: '/videos/add-music', icon: Music, description: 'Add background music to videos' },
    { name: 'Extract Audio', href: '/videos/extract-audio', icon: Music, description: 'Convert video to MP3' },
    { name: 'Video Trimmer', href: '/videos/trimmer', icon: Scissors, description: 'Cut video segments' },
    { name: 'Video Compressor', href: '/videos/compressor', icon: Archive, description: 'Reduce file size' },
    { name: 'Video Metadata', href: '/videos/metadata', icon: FileSearch, description: 'View video information' },
    { name: 'AI Video Finder', href: '/videos/ai-finder', icon: Sparkles, description: 'Reverse video search', isAI: true },
];

export default function VideosPageClient() {
    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '48px' }}
            >
                <h1 style={{ background: 'linear-gradient(135deg, #FFFFFF, #0099FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontSize: '2rem', fontWeight: 700 }}>Video Tools</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                    Convert, download, trim, and compress your videos
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
                                        background: 'rgba(0, 153, 255, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Icon size={22} color="#0099FF" />
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

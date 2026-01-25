'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Image, Video, Music, FileText, ArrowRight, Smartphone } from 'lucide-react';
import AdSlot from '@/components/AdSlot';
import { wakeUpServers } from '@/lib/api';

const categories = [
    {
        title: 'Image Tools',
        description: 'Convert, resize, crop, remove backgrounds, and more',
        icon: Image,
        href: '/images',
        color: 'var(--neon-blue)',
        rgbVar: '--neon-blue-rgb',
        tools: ['Converter', 'Cropper', 'Resizer', 'Background Remover', 'Upscaler', 'QR Code Factory'],
    },
    {
        title: 'Video Tools',
        description: 'Convert, trim, compress, and download videos',
        icon: Video,
        href: '/videos',
        color: 'var(--neon-blue-dark)',
        rgbVar: '--neon-blue-dark-rgb',
        tools: ['Converter', 'YouTube Downloader', 'Trimmer', 'Compressor'],
    },
    {
        title: 'Audio Tools',
        description: 'Convert, trim, boost volume, detect BPM',
        icon: Music,
        href: '/audio',
        color: 'var(--neon-cyan)',
        rgbVar: '--neon-cyan-rgb',
        tools: ['Converter', 'Trimmer', 'Volume Booster', 'BPM Detector'],
    },
    {
        title: 'Document Tools',
        description: 'Convert documents, merge PDFs, extract text',
        icon: FileText,
        href: '/documents',
        color: 'var(--text-primary)',
        rgbVar: '--accent-rgb', // Use accent (black/neon) for documents background
        tools: ['Converter', 'PDF Merge', 'PDF Split', 'Text Editor', 'Hash Verifier'],
    },
];

export default function HomePage() {
    // Lazy Wake Strategy: Wake up servers when user lands on home page
    useEffect(() => {
        wakeUpServers();
    }, []);

    return (
        <div className="container">
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{
                    textAlign: 'center',
                    padding: '60px 0 80px',
                }}
            >
                <h1
                    style={{
                        fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                        fontWeight: 800,
                        marginBottom: '16px',
                        background: 'var(--gradient-title)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    Magetool
                </h1>
                <p
                    style={{
                        fontSize: '1.25rem',
                        color: 'var(--text-secondary)',
                        maxWidth: '600px',
                        margin: '0 auto 32px',
                    }}
                >
                    Enterprise-grade file conversion and manipulation. Fast, reliable, and completely free.
                </p>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link href="/images/converter" className="btn btn-primary">
                        Start Converting
                        <ArrowRight size={18} />
                    </Link>
                    <button
                        onClick={() => document.getElementById('get-app-btn')?.click()}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Smartphone size={18} />
                        Download App
                    </button>
                </div>
            </motion.section>

            {/* Categories Grid */}
            <section id="tools" style={{ paddingBottom: '80px' }}>
                <h2
                    style={{
                        textAlign: 'center',
                        marginBottom: '40px',
                        fontSize: '1.75rem',
                    }}
                >
                    Choose Your Category
                </h2>
                <div className="grid grid-cols-2" style={{ gap: '24px' }}>
                    {categories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <motion.div
                                key={category.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >
                                <Link
                                    href={category.href}
                                    className="glass-card glass-card-hover"
                                    style={{
                                        display: 'block',
                                        padding: '32px',
                                        height: '100%',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '56px',
                                            height: '56px',
                                            borderRadius: '12px',
                                            background: `rgba(var(${// @ts-ignore
                                                category.rgbVar}), 0.1)`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: '20px',
                                        }}
                                    >
                                        <Icon size={28} color={category.color} />
                                    </div>
                                    <h3
                                        style={{
                                            fontSize: '1.25rem',
                                            fontWeight: 600,
                                            marginBottom: '8px',
                                            color: category.color,
                                        }}
                                    >
                                        {category.title}
                                    </h3>
                                    <p
                                        style={{
                                            color: 'var(--text-secondary)',
                                            marginBottom: '16px',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {category.description}
                                    </p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {category.tools.map((tool) => (
                                            <span
                                                key={tool}
                                                style={{
                                                    fontSize: '0.75rem',
                                                    padding: '4px 10px',
                                                    borderRadius: '4px',
                                                    background: 'var(--bg-elevated)',
                                                    color: 'var(--text-muted)',
                                                }}
                                            >
                                                {tool}
                                            </span>
                                        ))}
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </section>

            {/* Ad Section - Between Categories and Features */}
            <div style={{ padding: '40px 0' }}>
                <AdSlot variant="horizontal" />
            </div>

            {/* Features Section */}
            <motion.section
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                style={{
                    padding: '60px 0',
                    borderTop: '1px solid var(--glass-border)',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '32px',
                        textAlign: 'center',
                    }}
                >
                    <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🚀</div>
                        <h4 style={{ marginBottom: '8px' }}>Lightning Fast</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Optimized processing for quick results
                        </p>
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔒</div>
                        <h4 style={{ marginBottom: '8px' }}>Secure & Private</h4>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                            Files are deleted automatically after processing
                        </p>
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💎</div>
                        <h4 style={{ marginBottom: '8px' }}>Premium Quality</h4>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                            Enterprise-grade output with no compromises
                        </p>
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🆓</div>
                        <h4 style={{ marginBottom: '8px' }}>Completely Free</h4>
                        <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
                            No signup, no watermarks, no limits
                        </p>
                    </div>
                </div>
            </motion.section>
        </div>
    );
}

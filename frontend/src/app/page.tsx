'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Image, Video, Music, FileText, ArrowRight, Smartphone } from 'lucide-react';
import AdSlot from '@/components/AdSlot';
import { wakeUpServers } from '@/lib/api';
import InstallAppModal from '@/components/InstallAppModal';
import { useState } from 'react';

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
    const [showInstallModal, setShowInstallModal] = useState(false);

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
                        onClick={() => setShowInstallModal(true)}
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
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Files are deleted automatically after processing
                        </p>
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💎</div>
                        <h4 style={{ marginBottom: '8px' }}>Premium Quality</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Enterprise-grade output with no compromises
                        </p>
                    </div>
                    <div>
                        <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🆓</div>
                        <h4 style={{ marginBottom: '8px' }}>Completely Free</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            No signup, no watermarks, no limits
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* Premium All-in-One Card Area */}
            <motion.section
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ padding: '80px 0' }}
            >
                <div style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '32px',
                    padding: 'clamp(30px, 5vw, 60px)',
                    position: 'relative',
                    overflow: 'hidden',
                    backdropFilter: 'blur(20px)',
                }}>
                    {/* Background Decorative Elements */}
                    <div style={{
                        position: 'absolute', top: -100, right: -100, width: '400px', height: '400px',
                        background: 'radial-gradient(circle, rgba(0,217,255,0.15) 0%, transparent 70%)',
                        filter: 'blur(80px)', pointerEvents: 'none'
                    }} />
                    <div style={{
                        position: 'absolute', bottom: -100, left: -100, width: '300px', height: '300px',
                        background: 'radial-gradient(circle, rgba(255, 0, 128, 0.08) 0%, transparent 70%)',
                        filter: 'blur(80px)', pointerEvents: 'none'
                    }} />

                    <div className="card-grid">
                        {/* Left Side: The Vision */}
                        <div className="card-content">
                            <span style={{
                                display: 'inline-block',
                                padding: '6px 16px',
                                borderRadius: '20px',
                                background: 'rgba(0, 217, 255, 0.1)',
                                color: 'var(--neon-blue)',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                marginBottom: '24px'
                            }}>
                                ✨ The Magetool Promise
                            </span>
                            <h2 style={{
                                fontSize: 'clamp(2rem, 4vw, 3rem)',
                                fontWeight: 800,
                                marginBottom: '24px',
                                lineHeight: 1.1,
                                background: 'var(--gradient-title)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                Your Complete<br />Media Toolkit
                            </h2>
                            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.6, maxWidth: '500px' }}>
                                Magetool isn't just a website; it's your creative companion.
                                We've packed enterprise-grade power into a beautiful, free dashboard
                                that respects your privacy and fuels your workflow.
                            </p>
                            <Link href="/images/editor" className="btn btn-primary" style={{ display: 'inline-flex', padding: '14px 32px', borderRadius: '12px' }}>
                                Explore The Studio <ArrowRight size={20} style={{ marginLeft: 8 }} />
                            </Link>
                        </div>

                        {/* Right Side: The Features Stack */}
                        <div className="features-stack">
                            {/* Feature 1 */}
                            <motion.div
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="feature-card"
                            >
                                <div className="feature-icon icon-blue">
                                    <Image size={24} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>Pixel Perfect</h4>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>AI background removal, forensic analysis, and granular photo editing.</p>
                                </div>
                            </motion.div>

                            {/* Feature 2 */}
                            <motion.div
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="feature-card"
                            >
                                <div className="feature-icon icon-gold">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>Document Mastery</h4>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>Convert, merge, and split PDFs securely. Zero server uploads for max privacy.</p>
                                </div>
                            </motion.div>

                            {/* Feature 3 */}
                            <motion.div
                                whileHover={{ scale: 1.02, x: 5 }}
                                className="feature-card"
                            >
                                <div className="feature-icon icon-red">
                                    <Video size={24} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-primary)' }}>Media Studio</h4>
                                    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>Compress 4K videos, trim audio clips, and optimize content for social.</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    .card-grid {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 80px;
                        align-items: center;
                    }
                    
                    .features-stack {
                        display: flex;
                        flex-direction: column;
                        gap: 24px;
                    }

                    .feature-card {
                        background: var(--glass-bg);
                        padding: 24px;
                        border-radius: 24px;
                        border: 1px solid var(--glass-border);
                        display: flex;
                        gap: 24px;
                        align-items: center; /* Centered alignment looks cleaner */
                        transition: all 0.3s ease;
                    }

                    .feature-icon {
                        width: 56px;
                        height: 56px;
                        border-radius: 16px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        flex-shrink: 0;
                    }

                    .icon-blue { background: rgba(0, 217, 255, 0.1); color: var(--neon-blue); }
                    .icon-gold { background: rgba(255, 215, 0, 0.1); color: #FFD700; }
                    .icon-red { background: rgba(255, 107, 107, 0.1); color: #FF6B6B; }

                    @media (max-width: 900px) {
                        .card-grid {
                            grid-template-columns: 1fr;
                            gap: 48px;
                        }
                        .feature-card {
                            padding: 20px;
                            gap: 16px;
                            align-items: flex-start;
                        }
                    }
                `}</style>
            </motion.section>

            <InstallAppModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
        </div>
    );
}

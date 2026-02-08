'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Image as ImageIcon,
    Video,
    Music,
    FileText,
    ArrowRight,
    Smartphone,
    Zap,
    Shield,
    Cpu,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

import AdSlot from '@/components/AdSlot';
import { wakeUpServers } from '@/lib/api';
import InstallAppModal from '@/components/InstallAppModal';
import SectionWrapper from '@/components/ui/SectionWrapper';
import PremiumCard from '@/components/ui/PremiumCard';
import ToolsMarquee from '@/components/ui/ToolsMarquee';

const categories = [
    {
        title: 'Image Tools',
        description: 'Edit, convert, and enhance photos with AI precision.',
        icon: ImageIcon,
        href: '/images',
        color: 'var(--neon-blue)',
        gradient: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(0, 217, 255, 0.02))',
        tools: ['Background Remover', 'AI Upscaler', 'Converter', 'Cropper']
    },
    {
        title: 'Video Studio',
        description: 'Compress, trim, and transform videos in seconds.',
        icon: Video,
        href: '/videos',
        color: 'var(--neon-purple)',
        gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.02))',
        tools: ['Compressor', 'Converter', 'Trimmer', 'To GIF']
    },
    {
        title: 'Audio Lab',
        description: 'Crystal clear audio conversion and manipulation.',
        icon: Music,
        href: '/audio',
        color: 'var(--neon-cyan)',
        gradient: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 255, 255, 0.02))',
        tools: ['Volume Booster', 'Converter', 'BPM Detector']
    },
    {
        title: 'Documents',
        description: 'Secure PDF tools for professional workflows.',
        icon: FileText,
        href: '/documents',
        color: 'var(--text-primary)',
        gradient: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02))',
        tools: ['PDF Merge', 'PDF Split', 'Converter']
    },
];

const features = [
    { icon: Zap, title: "Lightning Fast", desc: "Local-first processing speed." },
    { icon: Shield, title: "100% Secure", desc: "Files never leave your device." },
    { icon: Cpu, title: "AI Powered", desc: "Next-gen algorithms." },
    { icon: Sparkles, title: "Free Forever", desc: "No hidden costs." },
];

export default function HomePage() {
    const [showInstallModal, setShowInstallModal] = useState(false);

    // Lazy Wake Strategy
    useEffect(() => {
        wakeUpServers();
    }, []);

    return (
        <>
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                minHeight: '90vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                paddingTop: '60px'
            }}>
                {/* Hero Background Glow */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '100%',
                    maxWidth: '800px',
                    height: '800px',
                    background: 'radial-gradient(circle, rgba(var(--neon-blue-rgb), 0.15) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    zIndex: -1,
                }} />

                <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '6px 16px',
                            borderRadius: '99px',
                            background: 'rgba(var(--neon-blue-rgb), 0.1)',
                            border: '1px solid rgba(var(--neon-blue-rgb), 0.2)',
                            color: 'var(--neon-blue)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            marginBottom: '24px',
                            boxShadow: '0 0 20px rgba(var(--neon-blue-rgb), 0.2)',
                        }}>
                            <Sparkles size={14} />
                            <span>The Future of Online Tools is Here</span>
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(3rem, 8vw, 5rem)',
                            lineHeight: 1.1,
                            marginBottom: '24px',
                            letterSpacing: '-0.02em',
                        }}>
                            <span className="text-gradient">Ultimate</span> <br />
                            <span style={{ color: 'var(--text-primary)' }}>Creative Toolkit.</span>
                        </h1>

                        <p style={{
                            fontSize: 'clamp(1.1rem, 2vw, 1.25rem)',
                            color: 'var(--text-secondary)',
                            maxWidth: '600px',
                            margin: '0 auto 40px',
                            lineHeight: 1.6
                        }}>
                            Magetool combines enterprise-grade power with stunning simplicity.
                            Convert, edit, and create like a pro — completely free.
                        </p>

                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/images/converter">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn btn-primary"
                                    style={{ padding: '16px 32px', borderRadius: '16px', fontSize: '1.1rem' }}
                                >
                                    Start Creating <ArrowRight size={20} />
                                </motion.button>
                            </Link>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowInstallModal(true)}
                                className="btn btn-secondary"
                                style={{ padding: '16px 32px', borderRadius: '16px', fontSize: '1.1rem' }}
                            >
                                <Smartphone size={20} /> Get App
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Elements (Decorative) */}
                <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    style={{ position: 'absolute', top: '20%', left: '10%', opacity: 0.3, zIndex: 0 }}
                >
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, #FF0080, #7928CA)', transform: 'rotate(-15deg)' }} />
                </motion.div>
                <motion.div
                    animate={{ y: [0, 25, 0] }}
                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    style={{ position: 'absolute', bottom: '20%', right: '10%', opacity: 0.3, zIndex: 0 }}
                >
                    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'linear-gradient(135deg, #00D9FF, #0055FF)', transform: 'rotate(20deg)' }} />
                </motion.div>
            </section>

            {/* Feature Stats / Trust Badges */}
            <SectionWrapper>
                <div className="container">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '24px',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '24px',
                        padding: '32px',
                        backdropFilter: 'blur(10px)',
                    }}>
                        {features.map((feature, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    padding: '12px',
                                    background: 'rgba(var(--accent-rgb), 0.05)',
                                    borderRadius: '12px',
                                    color: 'var(--neon-blue)'
                                }}>
                                    <feature.icon size={24} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>{feature.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SectionWrapper>

            {/* Auto-Scrolling Tools Marquee */}
            <ToolsMarquee
                title="Popular Tools"
                subtitle="Click any tool to get started instantly"
            />

            {/* Main Tools Grid */}
            <SectionWrapper className="container" id="tools" delay={0.2}>
                <div style={{ marginBottom: '80px', marginTop: '100px' }}>
                    <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                        <h2 className="tool-title" style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
                            Everything You Need.
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                            Four powerful suites. One magical platform.
                        </p>
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: '32px' }}>
                        {categories.map((cat, i) => (
                            <Link key={cat.title} href={cat.href} style={{ textDecoration: 'none' }}>
                                <PremiumCard
                                    className="tool-card-hover"
                                    hoverEffect={true}
                                    delay={i * 0.1}
                                >
                                    <div style={{ padding: '40px', height: '100%', background: cat.gradient }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            marginBottom: '24px'
                                        }}>
                                            <div style={{
                                                width: '64px',
                                                height: '64px',
                                                borderRadius: '16px',
                                                background: 'rgba(255,255,255,0.05)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: cat.color
                                            }}>
                                                <cat.icon size={32} />
                                            </div>
                                            <div style={{
                                                padding: '8px',
                                                borderRadius: '50%',
                                                background: 'rgba(255,255,255,0.05)',
                                                color: 'var(--text-muted)'
                                            }}>
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>

                                        <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                                            {cat.title}
                                        </h3>
                                        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', minHeight: '48px' }}>
                                            {cat.description}
                                        </p>

                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {cat.tools.map(tool => (
                                                <span key={tool} style={{
                                                    fontSize: '0.8rem',
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    border: '1px solid var(--glass-border)',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    {tool}
                                                </span>
                                            ))}
                                            <span style={{
                                                fontSize: '0.8rem',
                                                padding: '6px 12px',
                                                color: cat.color,
                                                fontWeight: 600
                                            }}>
                                                + more
                                            </span>
                                        </div>
                                    </div>
                                </PremiumCard>
                            </Link>
                        ))}
                    </div>
                </div>
            </SectionWrapper>

            {/* Ad Slot */}
            <div className="container" style={{ marginBottom: '100px' }}>
                <AdSlot variant="horizontal" />
            </div>

            {/* Why Magetool? (Premium Layout) */}
            <SectionWrapper className="container" delay={0.3}>
                <div style={{
                    position: 'relative',
                    borderRadius: '40px',
                    overflow: 'hidden',
                    padding: '80px 40px',
                    border: '1px solid var(--glass-border)',
                    textAlign: 'center'
                }}>
                    {/* Background Mesh */}
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: -1,
                        background: 'linear-gradient(180deg, rgba(var(--neon-blue-rgb), 0.05) 0%, rgba(var(--neon-purple-rgb), 0.05) 100%)'
                    }} />

                    <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                        Why Creators Choose <span style={{ color: 'var(--neon-blue)' }}>Magetool</span>
                    </h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto 60px' }}>
                        We built Magetool because we were tired of tools that were ugly, slow, or expensive.
                        We fixed all three.
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '32px',
                        textAlign: 'left'
                    }}>
                        <div className="glass-card" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ marginBottom: '16px', color: 'var(--success)' }}><CheckCircle2 size={32} /></div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>Privacy First</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Most tools process files locally in your browser using WebAssembly.
                                Server-side tasks delete files instantly after processing.
                            </p>
                        </div>
                        <div className="glass-card" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ marginBottom: '16px', color: 'var(--warning)' }}><Zap size={32} /></div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>No Limits</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                Convert as many files as you want. No "3 FREE per day" paywalls here.
                                We are supported by minimal, non-intrusive ads.
                            </p>
                        </div>
                        <div className="glass-card" style={{ padding: '32px', background: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ marginBottom: '16px', color: 'var(--neon-blue)' }}><Cpu size={32} /></div>
                            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '12px' }}>TopTier Technology</h4>
                            <p style={{ color: 'var(--text-secondary)' }}>
                                We use FFmpeg.wasm, TensorFlow.js, and specialized Rust microservices
                                to deliver desktop-class performance.
                            </p>
                        </div>
                    </div>
                </div>
            </SectionWrapper>

            <InstallAppModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />

            <style jsx global>{`
                @media (max-width: 768px) {
                    .grid-cols-2 {
                        grid-template-columns: 1fr !important;
                    }
                    .tool-title {
                        font-size: 2rem !important;
                    }
                }
            `}</style>
        </>
    );
}

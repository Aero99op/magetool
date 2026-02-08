'use client';

import { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Image, Video, FileText, Music, Scissors, Wand2,
    FileImage, LayoutGrid, Type, Palette, QrCode, Sparkles
} from 'lucide-react';

// Tool items to display
const TOOLS = [
    { name: 'Image Converter', href: '/images/converter', icon: Image },
    { name: 'Video Compressor', href: '/videos/compressor', icon: Video },
    { name: 'PDF Merger', href: '/pdfs/merge', icon: FileText },
    { name: 'Audio Converter', href: '/audio/converter', icon: Music },
    { name: 'Video Cutter', href: '/videos/cutter', icon: Scissors },
    { name: 'Background Remover', href: '/images/background-remover', icon: Wand2, isAI: true },
    { name: 'Video to Frames', href: '/videos/frames', icon: FileImage },
    { name: 'Collage Maker', href: '/images/collage', icon: LayoutGrid },
    { name: 'OCR Scanner', href: '/images/ocr', icon: Type, isAI: true },
    { name: 'Color Palette', href: '/images/color-palette', icon: Palette },
    { name: 'QR Factory', href: '/images/qr-factory', icon: QrCode },
    { name: 'AI Upscaler', href: '/images/upscaler', icon: Sparkles, isAI: true },
];

interface ToolsMarqueeProps {
    title?: string;
    subtitle?: string;
    speed?: number; // pixels per second
    direction?: 'left' | 'right';
}

export default function ToolsMarquee({
    title = "Popular Tools",
    subtitle = "Discover our most-used file processing tools",
    speed = 30,
    direction = 'left'
}: ToolsMarqueeProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [animationDuration, setAnimationDuration] = useState(20);

    useEffect(() => {
        if (containerRef.current) {
            const contentWidth = containerRef.current.scrollWidth / 2;
            setAnimationDuration(contentWidth / speed);
        }
    }, [speed]);

    // Double the tools array for seamless loop
    const doubledTools = [...TOOLS, ...TOOLS];

    return (
        <section style={{
            padding: '80px 0',
            background: 'linear-gradient(180deg, transparent 0%, rgba(var(--neon-blue-rgb), 0.03) 50%, transparent 100%)',
            overflow: 'hidden',
            position: 'relative',
        }}>
            {/* Section Header */}
            <div style={{
                textAlign: 'center',
                marginBottom: '50px',
                padding: '0 20px',
            }}>
                <span style={{
                    display: 'inline-block',
                    padding: '8px 16px',
                    background: 'rgba(147, 51, 234, 0.1)',
                    borderRadius: '100px',
                    color: '#a855f7',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                    marginBottom: '20px',
                    border: '1px solid rgba(147, 51, 234, 0.2)',
                    backdropFilter: 'blur(10px)',
                }}>
                    ✨ Infinite Possibilities
                </span>
                <h2 style={{
                    fontSize: 'clamp(2rem, 5vw, 3rem)',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    marginBottom: '16px',
                    letterSpacing: '-0.02em',
                }}>
                    Powering Your Workflow
                </h2>
                <p style={{
                    color: 'var(--text-muted)',
                    fontSize: '1.1rem',
                    maxWidth: '600px',
                    margin: '0 auto',
                    lineHeight: 1.6,
                }}>
                    Access professional-grade tools directly in your browser. Fast, secure, and free.
                </p>
            </div>

            {/* Gradient Overlays - Wider fade for cinema effect */}
            <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '150px',
                background: 'linear-gradient(90deg, var(--bg-primary) 0%, transparent 100%)',
                zIndex: 10,
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '150px',
                background: 'linear-gradient(270deg, var(--bg-primary) 0%, transparent 100%)',
                zIndex: 10,
                pointerEvents: 'none',
            }} />

            {/* Marquee Container */}
            <div
                className="marquee-container"
                ref={containerRef}
                style={{
                    display: 'flex',
                    width: 'fit-content',
                    animation: `marquee-${direction} ${animationDuration}s linear infinite`,
                    paddingLeft: '20px',
                }}
            >
                {doubledTools.map((tool, index) => (
                    <Link
                        key={`${tool.name}-${index}`}
                        href={tool.href}
                        style={{ textDecoration: 'none' }}
                    >
                        <motion.div
                            whileHover={{
                                scale: 1.05,
                                y: -4,
                                boxShadow: tool.isAI ? '0 0 25px rgba(168, 85, 247, 0.4)' : '0 0 25px rgba(0, 217, 255, 0.4)',
                                borderColor: tool.isAI ? 'rgba(168, 85, 247, 0.5)' : 'rgba(0, 217, 255, 0.5)',
                                background: tool.isAI ? 'rgba(168, 85, 247, 0.1)' : 'rgba(0, 217, 255, 0.1)'
                            }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '18px 28px',
                                margin: '0 12px',
                                background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                borderRadius: '100px',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                                whiteSpace: 'nowrap',
                                backdropFilter: 'blur(12px)',
                                minWidth: 'max-content',
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: tool.isAI ? 'rgba(168, 85, 247, 0.2)' : 'rgba(0, 217, 255, 0.1)',
                                color: tool.isAI ? '#d8b4fe' : '#00D9FF'
                            }}>
                                <tool.icon size={18} strokeWidth={2.5} />
                            </div>

                            <span style={{
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                fontWeight: 600,
                                letterSpacing: '0.3px',
                            }}>
                                {tool.name}
                            </span>

                            {tool.isAI && (
                                <span style={{
                                    padding: '4px 8px',
                                    background: 'linear-gradient(135deg, #9333ea, #db2777)',
                                    borderRadius: '12px',
                                    fontSize: '0.65rem',
                                    color: '#fff',
                                    fontWeight: 700,
                                    boxShadow: '0 2px 10px rgba(147, 51, 234, 0.3)',
                                }}>
                                    AI PRO
                                </span>
                            )}
                        </motion.div>
                    </Link>
                ))}
            </div>

            {/* CSS Animation */}
            <style jsx global>{`
                .marquee-container:hover {
                    animation-play-state: paused !important;
                }
                @keyframes marquee-left {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                @keyframes marquee-right {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </section>
    );
}

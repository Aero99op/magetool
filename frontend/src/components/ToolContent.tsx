'use client';

import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

export interface ToolContentProps {
    overview: string;
    features: string[];
    howTo: { step: string; description: string }[];
}

export default function ToolContent({ overview, features, howTo }: ToolContentProps) {
    return (
        <section className="tool-content-section" style={{ marginTop: '80px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '60px' }}>

            {/* 1. Overview Section - Hero Style */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 80px' }}
            >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '20px', border: '1px solid rgba(0, 217, 255, 0.2)', marginBottom: '24px' }}>
                    <Sparkles size={14} className="text-neon-blue" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--neon-blue)', letterSpacing: '0.5px' }}>PREMIUM TOOLKIT</span>
                </div>
                <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, marginBottom: '20px', background: 'linear-gradient(to right, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Why Use This Tool?
                </h2>
                <p style={{ fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
                    {overview}
                </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                {/* 2. How To Use - Vertical Timeline */}
                <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '4px', height: '24px', background: 'var(--neon-blue)', borderRadius: '2px', display: 'block' }} />
                        How It Works
                    </h3>

                    <div style={{ position: 'relative', paddingLeft: '20px' }}>
                        {/* Connecting Line */}
                        <div style={{ position: 'absolute', left: '27px', top: '20px', bottom: '40px', width: '2px', background: 'linear-gradient(to bottom, var(--neon-blue), transparent)' }} />

                        <div className="space-y-12">
                            {howTo.map((item, index) => (
                                <div key={index} style={{ position: 'relative', display: 'grid', gridTemplateColumns: '40px 1fr', gap: '24px' }}>
                                    {/* Number Circle */}
                                    <div style={{
                                        width: '40px', height: '40px',
                                        borderRadius: '50%',
                                        background: '#0a0a0a',
                                        border: '2px solid var(--neon-blue)',
                                        color: 'var(--neon-blue)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: 700, fontSize: '1.1rem',
                                        zIndex: 10,
                                        boxShadow: '0 0 15px rgba(0, 217, 255, 0.3)'
                                    }}>
                                        {index + 1}
                                    </div>

                                    {/* Content Card */}
                                    <div className="glass-card glass-card-hover" style={{ padding: '24px', background: 'linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)' }}>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', color: '#fff' }}>{item.step}</h4>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* 3. Features - Modern Grid */}
                <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '4px', height: '24px', background: 'var(--neon-purple)', borderRadius: '2px', display: 'block' }} />
                        Key Features
                    </h3>

                    <div style={{ display: 'grid', gap: '16px' }}>
                        {features.map((feature, index) => (
                            <div key={index}
                                className="glass-card feature-card"
                                style={{
                                    padding: '20px',
                                    display: 'flex',
                                    gap: '16px',
                                    alignItems: 'flex-start',
                                    transition: 'transform 0.2s',
                                    borderLeft: '3px solid transparent'
                                }}
                            >
                                <CheckCircle2 size={24} className="text-neon-purple flex-shrink-0" style={{ marginTop: '2px' }} />
                                <div>
                                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, fontSize: '1rem' }}>
                                        {feature}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pro Tip Box */}
                    <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(var(--neon-blue-rgb), 0.05)', borderRadius: '16px', border: '1px dashed rgba(var(--neon-blue-rgb), 0.2)' }}>
                        <h4 style={{ color: 'var(--neon-blue)', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                            Did you know?
                        </h4>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            All processing happens locally in your browser for maximum privacy. Your files never leave your device.
                        </p>
                    </div>
                </motion.div>
            </div>

            <style jsx>{`
                .feature-card:hover {
                    transform: translateX(5px);
                    background: rgba(255,255,255,0.03);
                    border-left-color: var(--neon-purple);
                }
            `}</style>
        </section>
    );
}

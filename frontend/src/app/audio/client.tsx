'use client';

import Link from 'next/link';
import { Music, Scissors, Volume2, Activity, Search } from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import PremiumCard from '@/components/ui/PremiumCard';

const tools = [
    { name: 'Audio Converter', href: '/audio/converter', icon: Music, description: 'Convert between MP3, WAV, AAC, etc.' },
    { name: 'Audio Trimmer', href: '/audio/trimmer', icon: Scissors, description: 'Cut and trim audio files' },
    { name: 'Volume Booster', href: '/audio/volume', icon: Volume2, description: 'Adjust volume levels' },
    { name: 'BPM Detector', href: '/audio/bpm', icon: Activity, description: 'Detect tempo and BPM' },
    { name: 'Song Identifier', href: '/audio/identify', icon: Search, description: 'Identify songs with AI', isAI: true },
];

export default function AudioPageClient() {
    return (
        <SectionWrapper className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 className="tool-title" style={{
                    backgroundImage: 'linear-gradient(135deg, #FFF, var(--neon-cyan))'
                }}>
                    Audio Foundry
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    Process audio with crystal clear precision.
                    Convert, boost, and analyze your tracks.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                {tools.map((tool, index) => {
                    const Icon = tool.icon;
                    return (
                        <Link key={tool.href} href={tool.href} style={{ textDecoration: 'none' }}>
                            <PremiumCard
                                delay={index * 0.05}
                                style={{ height: '100%' }}
                            >
                                <div style={{ padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        background: 'rgba(0, 255, 255, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        border: '1px solid rgba(0, 255, 255, 0.2)',
                                        color: 'var(--neon-cyan)'
                                    }}>
                                        <Icon size={28} />
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{tool.name}</h3>
                                            {tool.isAI && (
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    fontWeight: 800,
                                                    padding: '2px 6px',
                                                    background: 'rgba(0, 255, 255, 0.2)',
                                                    borderRadius: '4px',
                                                    color: '#00FFFF',
                                                    border: '1px solid rgba(0, 255, 255, 0.3)'
                                                }}>AI</span>
                                            )}
                                        </div>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                            {tool.description}
                                        </p>
                                    </div>
                                </div>
                            </PremiumCard>
                        </Link>
                    );
                })}
            </div>
        </SectionWrapper>
    );
}

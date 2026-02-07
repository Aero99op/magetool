'use client';

import Link from 'next/link';
import {
    Video, RotateCw, Merge, Film, Gauge,
    VolumeX, Music, Scissors, Archive, FileSearch, Sparkles, Images
} from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import PremiumCard from '@/components/ui/PremiumCard';

const tools = [
    { name: 'Video Converter', href: '/videos/converter', icon: Video, description: 'Convert between MP4, MKV, AVI, etc.' },
    { name: 'Video Rotator', href: '/videos/rotate', icon: RotateCw, description: 'Rotate or flip your videos' },
    { name: 'Video Merger', href: '/videos/merger', icon: Merge, description: 'Combine multiple videos into one' },
    { name: 'Video to GIF', href: '/videos/to-gif', icon: Film, description: 'Convert videos to animated GIFs' },
    { name: 'Video to Frames', href: '/videos/to-frames', icon: Images, description: 'Extract all frames as images (ZIP)' },
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
        <SectionWrapper className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 className="tool-title">Video Studio</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    Professional video editing suite in your browser.
                    Convert, edit, and enhance with zero quality loss.
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
                                        background: 'rgba(0, 153, 255, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        border: '1px solid rgba(0, 153, 255, 0.2)',
                                        color: 'var(--neon-blue)'
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

'use client';

import Link from 'next/link';
import {
    ImageIcon, Crop, Maximize, Camera, Grid, Eraser,
    Sparkles, ScanText, Droplets, FileImage, Palette,
    LayoutGrid, Eye, Pen, Reply, Star, QrCode, Sliders, PenTool
} from 'lucide-react';
import SectionWrapper from '@/components/ui/SectionWrapper';
import PremiumCard from '@/components/ui/PremiumCard';

const tools = [
    { name: 'Design Studio', href: '/images/design-studio', icon: PenTool, description: 'Canva-like design editor with templates' },
    { name: 'Advanced Photo Editor', href: '/images/editor', icon: Sliders, description: 'Pro Editor: Filters, Collage, Adjustments' },
    { name: 'Format Converter', href: '/images/converter', icon: ImageIcon, description: 'Convert between JPG, PNG, WebP, etc.' },
    { name: 'Resizer', href: '/images/resizer', icon: Maximize, description: 'Resize to exact dimensions' },
    { name: 'Cropper', href: '/images/cropper', icon: Crop, description: 'Crop with aspect ratio presets' },
    { name: 'Background Remover', href: '/images/background-remover', icon: Eraser, description: 'Remove backgrounds with AI', isAI: true },
    { name: 'AI Upscaler', href: '/images/upscaler', icon: Sparkles, description: 'Enhance low-res images', isAI: true },
    { name: 'OCR Scanner', href: '/images/ocr', icon: ScanText, description: 'Extract text from images', isAI: true },
    { name: 'Passport Photo', href: '/images/passport-photo', icon: Camera, description: 'Create passport-size photos' },
    { name: 'Images to PDF', href: '/images/images-to-pdf', icon: FileImage, description: 'Convert multiple images into a PDF' },
    { name: 'Image Size Adjuster', href: '/images/size-adjuster', icon: Maximize, description: 'Increase or decrease file size in KB/MB' },
    { name: 'Meme Generator', href: '/images/meme-generator', icon: Palette, description: 'Create freestyle memes with text and emojis' },
    { name: 'Watermark Remover', href: '/images/watermark-remove', icon: Droplets, description: 'Remove watermarks', isAI: true },
    { name: 'Watermark Adder', href: '/images/watermark-add', icon: Pen, description: 'Add text/logo watermarks' },
    { name: 'Color Palette', href: '/images/color-palette', icon: Palette, description: 'Extract dominant colors' },
    { name: 'Image Splitter', href: '/images/splitter', icon: LayoutGrid, description: 'Split into grid segments' },
    { name: 'Blur Face', href: '/images/blur-face', icon: Eye, description: 'Anonymize faces', isAI: true },
    { name: 'Favicon Generator', href: '/images/favicon', icon: Star, description: 'Create multi-size favicons' },
    { name: 'Negative/Invert', href: '/images/negative', icon: Reply, description: 'Invert colors and effects' },
    { name: 'QR Code Factory', href: '/images/qr-factory', icon: QrCode, description: 'Generate custom QR codes' },
];

export default function ImagesPageClient() {
    return (
        <SectionWrapper className="container" style={{ paddingTop: '100px', paddingBottom: '80px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 className="tool-title">Image Lab</h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    The ultimate toolkit for your photos.
                    AI-powered editing, conversion, and enhancement.
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
                                        background: 'rgba(0, 217, 255, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        border: '1px solid rgba(0, 217, 255, 0.2)',
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

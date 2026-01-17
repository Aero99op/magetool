'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ImageIcon, Crop, Maximize, Camera, Grid, Eraser,
    Sparkles, ScanText, Droplets, FileImage, Palette,
    LayoutGrid, Eye, Pen, Reply, Star
} from 'lucide-react';

const tools = [
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
];

export default function ImagesPage() {
    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '48px' }}
            >
                <h1 className="tool-title">Image Tools</h1>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
                    Convert, resize, edit, and enhance your images with our powerful tools
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
                                        background: 'rgba(0, 217, 255, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <Icon size={22} color="#00D9FF" />
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

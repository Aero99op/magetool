'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
    Image,
    Video,
    Music,
    FileText,
    Menu,
    X,
    ChevronDown,
    Github,
    HelpCircle,
    Sparkles,
} from 'lucide-react';

interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    color: string;
    tools: {
        name: string;
        href: string;
        isAI?: boolean;
    }[];
}

const navItems: NavItem[] = [
    {
        label: 'Images',
        href: '/images',
        icon: Image,
        color: '#00D9FF',
        tools: [
            { name: 'Format Converter', href: '/images/converter' },
            { name: 'Cropper', href: '/images/cropper' },
            { name: 'Resizer', href: '/images/resizer' },
            { name: 'Passport Photo Maker', href: '/images/passport-photo' },
            { name: 'Collage Maker', href: '/images/collage' },
            { name: 'Background Remover', href: '/images/background-remover', isAI: true },
            { name: 'AI Upscaler', href: '/images/upscaler', isAI: true },
            { name: 'OCR (Image to Text)', href: '/images/ocr', isAI: true },
            { name: 'AI Image Checker', href: '/images/ai-checker', isAI: true },
            { name: 'Watermark Remover', href: '/images/watermark-remove', isAI: true },
            { name: 'Watermark Adder', href: '/images/watermark-add' },
            { name: 'EXIF Scrubber', href: '/images/exif-scrubber' },
            { name: 'Color Palette Extractor', href: '/images/color-palette' },
            { name: 'Image Splitter', href: '/images/splitter' },
            { name: 'Blur Face/License Plate', href: '/images/blur-face', isAI: true },
            { name: 'SVG Converter', href: '/images/svg-converter' },
            { name: 'Meme Generator', href: '/images/meme-generator' },
            { name: 'Negative/Invert', href: '/images/negative' },
            { name: 'Favicon Generator', href: '/images/favicon' },
        ],
    },
    {
        label: 'Videos',
        href: '/videos',
        icon: Video,
        color: '#0099FF',
        tools: [
            { name: 'Universal Converter', href: '/videos/converter' },
            { name: 'Video Rotator', href: '/videos/rotate' },
            { name: 'Video Merger', href: '/videos/merger' },
            { name: 'Video to GIF', href: '/videos/to-gif' },
            { name: 'Speed Changer', href: '/videos/speed' },
            { name: 'Mute Video', href: '/videos/mute' },
            { name: 'Add Music', href: '/videos/add-music' },
            { name: 'Extract Audio', href: '/videos/extract-audio' },
            { name: 'Video Trimmer', href: '/videos/trimmer' },
            { name: 'Video Compressor', href: '/videos/compressor' },
            { name: 'Video Metadata Finder', href: '/videos/metadata' },
            { name: 'AI Video Finder', href: '/videos/ai-finder', isAI: true },
        ],
    },
    {
        label: 'Audio',
        href: '/audio',
        icon: Music,
        color: '#00FFFF',
        tools: [
            { name: 'Universal Converter', href: '/audio/converter' },
            { name: 'Audio Trimmer', href: '/audio/trimmer' },
            { name: 'Volume Booster', href: '/audio/volume' },
            { name: 'BPM Detector', href: '/audio/bpm' },
            { name: 'Song Identifier', href: '/audio/identify', isAI: true },
        ],
    },
    {
        label: 'Documents',
        href: '/documents',
        icon: FileText,
        color: '#FFFFFF',
        tools: [
            { name: 'Universal Converter', href: '/documents/converter' },
            { name: 'PDF Merger', href: '/documents/pdf-merge' },
            { name: 'PDF Splitter', href: '/documents/pdf-split' },
            { name: 'PDF Compressor', href: '/documents/pdf-compress' },
            { name: 'PDF Password Protector', href: '/documents/pdf-protect' },
            { name: 'PDF Unlocker', href: '/documents/pdf-unlock' },
            { name: 'File to Image', href: '/documents/to-image' },
            { name: 'Data Converter (CSV/JSON/XML)', href: '/documents/data-convert' },
            { name: 'Metadata Editor', href: '/documents/metadata' },
            { name: 'Text Editor', href: '/documents/text-editor' },
            { name: 'File Size Adjuster', href: '/documents/size-adjuster' },
        ],
    },
];

export default function Header() {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
        setActiveDropdown(null);
    }, [pathname]);

    const toggleDropdown = (label: string) => {
        setActiveDropdown(activeDropdown === label ? null : label);
    };

    return (
        <header
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '60px',
                zIndex: 1000,
                background: 'rgba(15, 15, 15, 0.8)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(0, 217, 255, 0.2)',
            }}
        >
            <div
                className="container"
                style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                {/* Logo */}
                <Link
                    href="/"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: 700,
                        fontSize: '1.25rem',
                    }}
                >
                    <div
                        style={{
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #00D9FF, #0099FF)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Sparkles size={20} color="#0F0F0F" />
                    </div>
                    <span
                        style={{
                            background: 'linear-gradient(135deg, #FFFFFF, #00D9FF)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                        }}
                    >
                        Magetool
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav
                    ref={dropdownRef}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                    className="desktop-nav"
                >
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname?.startsWith(item.href);
                        const isOpen = activeDropdown === item.label;

                        return (
                            <div key={item.label} className="dropdown" style={{ position: 'relative' }}>
                                <button
                                    onClick={() => toggleDropdown(item.label)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        background: isActive ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: isActive ? item.color : 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)';
                                        e.currentTarget.style.color = item.color;
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive && !isOpen) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                                        }
                                    }}
                                >
                                    <Icon size={18} />
                                    {item.label}
                                    <ChevronDown
                                        size={14}
                                        style={{
                                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                            transition: 'transform 0.2s ease',
                                        }}
                                    />
                                </button>

                                {/* Dropdown Menu */}
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            transition={{ duration: 0.2 }}
                                            style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: '0',
                                                marginTop: '8px',
                                                minWidth: '260px',
                                                maxHeight: '70vh',
                                                overflowY: 'auto',
                                                background: 'rgba(26, 26, 26, 0.95)',
                                                backdropFilter: 'blur(20px)',
                                                WebkitBackdropFilter: 'blur(20px)',
                                                border: '1px solid rgba(0, 255, 255, 0.2)',
                                                borderRadius: '12px',
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                                                padding: '8px 0',
                                                zIndex: 1001,
                                            }}
                                        >
                                            {item.tools.map((tool) => (
                                                <Link
                                                    key={tool.href}
                                                    href={tool.href}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        padding: '10px 16px',
                                                        color: tool.isAI ? '#00FFFF' : 'rgba(255, 255, 255, 0.7)',
                                                        fontSize: '0.875rem',
                                                        transition: 'all 0.15s ease',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(0, 217, 255, 0.1)';
                                                        e.currentTarget.style.color = '#00D9FF';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = tool.isAI ? '#00FFFF' : 'rgba(255, 255, 255, 0.7)';
                                                    }}
                                                >
                                                    {tool.name}
                                                    {tool.isAI && (
                                                        <span
                                                            style={{
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700,
                                                                padding: '2px 6px',
                                                                background: 'rgba(0, 255, 255, 0.2)',
                                                                borderRadius: '3px',
                                                            }}
                                                        >
                                                            AI
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </nav>

                {/* Right Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost"
                        style={{ padding: '8px' }}
                        title="GitHub"
                    >
                        <Github size={20} />
                    </a>
                    <button
                        className="btn btn-ghost"
                        style={{ padding: '8px' }}
                        title="Help"
                    >
                        <HelpCircle size={20} />
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="btn btn-ghost mobile-menu-toggle"
                        style={{ padding: '8px', display: 'none' }}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'fixed',
                            top: '60px',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(15, 15, 15, 0.98)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            overflowY: 'auto',
                            padding: '20px',
                            zIndex: 999,
                        }}
                        className="mobile-menu"
                    >
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <div key={item.label} style={{ marginBottom: '24px' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            color: item.color,
                                            fontWeight: 600,
                                            marginBottom: '12px',
                                            fontSize: '1.1rem',
                                        }}
                                    >
                                        <Icon size={22} />
                                        {item.label}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '32px' }}>
                                        {item.tools.map((tool) => (
                                            <Link
                                                key={tool.href}
                                                href={tool.href}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '10px 12px',
                                                    color: tool.isAI ? '#00FFFF' : 'rgba(255, 255, 255, 0.6)',
                                                    fontSize: '0.9rem',
                                                    borderRadius: '8px',
                                                }}
                                            >
                                                {tool.name}
                                                {tool.isAI && (
                                                    <span
                                                        style={{
                                                            fontSize: '0.65rem',
                                                            fontWeight: 700,
                                                            padding: '2px 6px',
                                                            background: 'rgba(0, 255, 255, 0.2)',
                                                            borderRadius: '3px',
                                                        }}
                                                    >
                                                        AI
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Responsive Styles */}
            <style jsx global>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
        </header>
    );
}

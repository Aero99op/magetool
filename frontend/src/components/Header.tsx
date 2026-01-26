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
    HelpCircle,
    Sparkles,
    Sun,
    Moon,
    Smartphone,
} from 'lucide-react';
import InstallAppModal from './InstallAppModal';
import { useAppMode } from '@/hooks/useAppMode';

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
        color: 'var(--neon-blue)',
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
            { name: 'Images to PDF', href: '/images/images-to-pdf' },
            { name: 'Image Size Adjuster', href: '/images/size-adjuster' },
            { name: 'Negative/Invert', href: '/images/negative' },
            { name: 'Favicon Generator', href: '/images/favicon' },
            { name: 'QR Code Factory', href: '/images/qr-factory' },
        ],
    },
    {
        label: 'Videos',
        href: '/videos',
        icon: Video,
        color: 'var(--neon-blue-dark)',
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
        color: 'var(--neon-cyan)',
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
        color: 'var(--text-primary)',
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
            { name: 'Hash Verifier', href: '/documents/hash-verifier' },
        ],
    },
];

export default function Header() {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const { isMobileApp } = useAppMode();

    // Initialize Theme
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

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
                background: 'var(--header-bg)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderBottom: '1px solid var(--glass-border)',
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
                            background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-blue-dark))',
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
                            background: 'var(--gradient-logo-text)',
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
                                        background: isActive ? 'rgba(var(--accent-rgb), 0.1)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: isActive ? item.color : 'var(--text-secondary)',
                                        fontSize: '0.9rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
                                        e.currentTarget.style.color = item.color;
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isActive && !isOpen) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'var(--text-secondary)';
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
                                                background: 'var(--bg-surface)',
                                                backdropFilter: 'blur(20px)',
                                                WebkitBackdropFilter: 'blur(20px)',
                                                border: '1px solid var(--glass-border)',
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
                                                        color: tool.isAI ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                                                        fontSize: '0.875rem',
                                                        transition: 'all 0.15s ease',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
                                                        e.currentTarget.style.color = 'var(--neon-blue)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.background = 'transparent';
                                                        e.currentTarget.style.color = tool.isAI ? 'var(--neon-cyan)' : 'var(--text-secondary)';
                                                    }}
                                                >
                                                    {tool.name}
                                                    {tool.isAI && (
                                                        <span
                                                            style={{
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700,
                                                                padding: '2px 6px',
                                                                background: 'rgba(var(--neon-cyan-rgb), 0.2)',
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
                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        className="btn btn-ghost"
                        style={{ padding: '8px', color: theme === 'light' ? '#0F0F0F' : 'inherit' }}
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? (
                            <Moon size={20} className="text-gray-400 hover:text-white transition-colors" />
                        ) : (
                            <Sun size={20} className="text-orange-500 hover:text-orange-600 transition-colors" />
                        )}
                    </button>

                    <Link
                        href="/support"
                        className="btn btn-ghost"
                        style={{ padding: '8px', color: theme === 'light' ? '#0F0F0F' : 'inherit' }}
                        title="Help & Support"
                    >
                        <HelpCircle size={20} />
                    </Link>


                    {/* Mobile Menu Toggle - HIDE on Mobile App (since we have bottom nav) */}
                    {!isMobileApp && (
                        <button
                            className="btn btn-ghost mobile-menu-toggle"
                            style={{ padding: '8px' }}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    )}

                    {/* Get App Button - HIDE on Mobile App */}
                    {!isMobileApp && (
                        <button
                            id="get-app-btn"
                            className="btn btn-primary"
                            style={{
                                padding: '8px 16px',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'linear-gradient(135deg, var(--neon-purple), var(--neon-blue))',
                                border: 'none',
                            }}
                            onClick={() => setShowInstallModal(true)}
                        >
                            <Smartphone size={16} />
                            <span className="desktop-nav">Get App</span>
                        </button>
                    )}
                </div>
            </div>

            <InstallAppModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />

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
                            background: 'var(--bg-deep)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            overflowY: 'auto',
                            padding: '20px',
                            paddingBottom: '100px',
                            zIndex: 10000,
                        }}
                        className="mobile-menu"
                    >
                        {/* Get App Button (Mobile Only) */}
                        <button
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                marginBottom: '24px',
                                padding: '16px',
                                background: 'linear-gradient(135deg, var(--neon-purple), var(--neon-blue))',
                            }}
                            onClick={() => {
                                setMobileMenuOpen(false);
                                setShowInstallModal(true);
                            }}
                        >
                            <Smartphone size={20} />
                            Get App
                        </button>

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
                                                    color: tool.isAI ? 'var(--neon-cyan)' : 'var(--text-secondary)',
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
                                                            background: 'rgba(var(--neon-cyan-rgb), 0.2)',
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
        .mobile-menu-toggle {
          display: none;
        }
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

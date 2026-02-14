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
    Activity,
    Settings,
    Palette,
} from 'lucide-react';
import InstallAppModal from './InstallAppModal';
import SettingsModal from '@/components/SettingsModal';
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
            { name: 'Design Studio', href: '/images/design-studio' },
            { name: 'Advanced Photo Editor', href: '/images/editor' },
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
            { name: 'PPT Watermark Remover', href: '/documents/ppt-watermark-remove' },
            { name: 'Structure Visualizer', href: '/documents/structure-visualizer' },
        ],
    },
];

export default function Header() {
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [animationsEnabled, setAnimationsEnabled] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const { isMobileApp } = useAppMode();

    // Initialize Theme & Animations
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        }

        const savedAnim = localStorage.getItem('animationsEnabled');
        if (savedAnim !== null) {
            const isEnabled = savedAnim === 'true';
            setAnimationsEnabled(isEnabled);
            document.documentElement.setAttribute('data-animate', isEnabled ? 'on' : 'off');
        } else {
            // Default on
            document.documentElement.setAttribute('data-animate', 'on');
        }
    }, []);

    // Scroll Effect
    // Scroll Effect
    useEffect(() => {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateScrollDir = () => {
            const scrollY = window.scrollY;
            setScrolled(scrollY > 20);
            ticking = false;
        };

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollDir);
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
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
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 'var(--header-height)',
                    zIndex: 1000,
                    background: scrolled ? 'var(--header-bg)' : 'transparent',
                    backdropFilter: scrolled ? 'blur(20px)' : 'none',
                    WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
                    borderBottom: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent',
                    transition: 'all 0.3s ease',
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
                            gap: '12px',
                            fontWeight: 800,
                            fontSize: '1.5rem',
                            letterSpacing: '-0.03em',
                        }}
                    >
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                width: '40px',
                                height: '40px',
                                background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 0 20px rgba(var(--neon-blue-rgb), 0.3)',
                            }}
                        >
                            <Sparkles size={22} color="#ffffff" strokeWidth={2.5} />
                        </motion.div>
                        <span className="text-gradient">
                            Magetool
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav
                        ref={dropdownRef}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
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
                                            gap: '8px',
                                            padding: '8px 16px',
                                            background: isActive || isOpen ? 'rgba(var(--accent-rgb), 0.08)' : 'transparent',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: isActive || isOpen ? item.color : 'var(--text-secondary)',
                                            fontSize: '0.95rem',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.08)';
                                            e.currentTarget.style.color = item.color;
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isActive && !isOpen) {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'var(--text-secondary)';
                                            }
                                        }}
                                    >
                                        <Icon size={18} strokeWidth={2.5} />
                                        {item.label}
                                        <ChevronDown
                                            size={14}
                                            style={{
                                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.2s ease',
                                                strokeWidth: 3,
                                                opacity: 0.6,
                                            }}
                                        />
                                    </button>

                                    {/* Dropdown Menu */}
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 'calc(100% + 12px)',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    minWidth: '280px',
                                                    maxHeight: '70vh',
                                                    overflowY: 'auto',
                                                    background: 'var(--bg-card)',
                                                    backdropFilter: 'blur(30px)',
                                                    WebkitBackdropFilter: 'blur(30px)',
                                                    border: '1px solid var(--glass-border-light)',
                                                    borderRadius: '16px',
                                                    boxShadow: 'var(--shadow-elevated)',
                                                    padding: '8px',
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
                                                            padding: '12px 16px',
                                                            color: tool.isAI ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                                                            fontSize: '0.9rem',
                                                            fontWeight: 500,
                                                            transition: 'all 0.15s ease',
                                                            borderRadius: '8px',
                                                            marginBottom: '2px',
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.08)';
                                                            e.currentTarget.style.color = item.color;
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
                                                                    fontSize: '0.7rem',
                                                                    fontWeight: 800,
                                                                    padding: '2px 6px',
                                                                    background: 'rgba(var(--neon-cyan-rgb), 0.15)',
                                                                    color: 'var(--neon-cyan)',
                                                                    borderRadius: '4px',
                                                                    border: '1px solid rgba(var(--neon-cyan-rgb), 0.2)',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="btn btn-ghost"
                            style={{
                                padding: '10px',
                                color: theme === 'light' ? 'var(--text-primary)' : 'var(--text-secondary)',
                                borderRadius: '50%'
                            }}
                            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            <AnimatePresence mode="wait">
                                {theme === 'dark' ? (
                                    <motion.div
                                        key="moon"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Moon size={20} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="sun"
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Sun size={20} className="text-orange-500" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                        {/* Animation Toggle */}
                        <button
                            onClick={() => {
                                const newValue = !animationsEnabled;
                                setAnimationsEnabled(newValue);
                                localStorage.setItem('animationsEnabled', String(newValue));
                                document.documentElement.setAttribute('data-animate', newValue ? 'on' : 'off');
                            }}
                            className="btn btn-ghost desktop-only-action"
                            style={{
                                padding: '10px',
                                color: animationsEnabled ? 'var(--neon-green)' : 'var(--text-muted)',
                                borderRadius: '50%'
                            }}
                            title={animationsEnabled ? 'Disable Animations' : 'Enable Animations'}
                        >
                            {animationsEnabled ? <Activity size={20} /> : <Activity size={20} style={{ opacity: 0.5 }} />}
                        </button>

                        {/* Visual Customization Button */}
                        <button
                            onClick={() => setShowSettingsModal(true)}
                            className="btn btn-ghost desktop-only-action"
                            style={{
                                padding: '10px',
                                color: 'var(--text-secondary)',
                                borderRadius: '50%'
                            }}
                            title="Visual Customization"
                        >
                            <Palette size={20} />
                        </button>

                        <Link
                            href="/support"
                            className="btn btn-ghost desktop-only-action"
                            style={{ padding: '10px', borderRadius: '50%' }}
                            title="Help & Support"
                        >
                            <HelpCircle size={20} />
                        </Link>

                        {/* Desktop: Get App */}
                        {!isMobileApp && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="btn btn-primary desktop-nav"
                                style={{
                                    padding: '10px 20px',
                                    fontSize: '0.9rem',
                                    borderRadius: '99px',
                                }}
                                onClick={() => setShowInstallModal(true)}
                            >
                                <Smartphone size={16} />
                                <span>Get App</span>
                            </motion.button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="btn btn-ghost mobile-menu-toggle"
                            style={{ padding: '10px' }}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                <InstallAppModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
                <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />

                {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            style={{
                                position: 'fixed',
                                top: 'var(--header-height)',
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: 'var(--bg-deep)',
                                backdropFilter: 'blur(40px)',
                                WebkitBackdropFilter: 'blur(40px)',
                                overflowY: 'auto',
                                padding: '24px',
                                paddingBottom: '100px',
                                zIndex: 10000,
                            }}
                            className="mobile-menu"
                        >
                            {/* Get App Button (Mobile Only) */}
                            <motion.button
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="btn btn-primary"
                                style={{
                                    width: '100%',
                                    marginBottom: '32px',
                                    padding: '16px',
                                    borderRadius: '16px',
                                }}
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    setShowInstallModal(true);
                                }}
                            >
                                <Smartphone size={20} />
                                Get App
                            </motion.button>

                            {/* Mobile Actions Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
                                <button
                                    onClick={() => {
                                        setMobileMenuOpen(false);
                                        setShowSettingsModal(true);
                                    }}
                                    className="btn btn-secondary"
                                    style={{ padding: '12px', fontSize: '0.9rem' }}
                                >
                                    <Palette size={18} /> Theme Settings
                                </button>
                                <button
                                    onClick={() => {
                                        const newValue = !animationsEnabled;
                                        setAnimationsEnabled(newValue);
                                        localStorage.setItem('animationsEnabled', String(newValue));
                                        document.documentElement.setAttribute('data-animate', newValue ? 'on' : 'off');
                                    }}
                                    className="btn"
                                    style={{
                                        padding: '12px', fontSize: '0.9rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: animationsEnabled ? 'var(--neon-green)' : 'var(--text-muted)',
                                        border: '1px solid var(--glass-border)'
                                    }}
                                >
                                    <Activity size={18} /> {animationsEnabled ? 'Animations On' : 'Animations Off'}
                                </button>
                            </div>

                            {navItems.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={item.label}
                                        initial={{ x: 50, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        style={{ marginBottom: '32px' }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                color: item.color,
                                                fontWeight: 700,
                                                marginBottom: '16px',
                                                fontSize: '1.25rem',
                                                letterSpacing: '-0.02em',
                                            }}
                                        >
                                            <Icon size={24} />
                                            {item.label}
                                        </div>
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                            gap: '8px'
                                        }}>
                                            {item.tools.map((tool) => (
                                                <Link
                                                    key={tool.href}
                                                    href={tool.href}
                                                    onClick={() => setMobileMenuOpen(false)}
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                        padding: '12px',
                                                        background: 'var(--bg-surface)',
                                                        border: '1px solid var(--glass-border)',
                                                        borderRadius: '12px',
                                                        color: tool.isAI ? 'var(--neon-cyan)' : 'var(--text-secondary)',
                                                        fontSize: '0.85rem',
                                                        fontWeight: 500,
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    {tool.name}
                                                    {tool.isAI && (
                                                        <span
                                                            style={{
                                                                fontSize: '0.6rem',
                                                                fontWeight: 800,
                                                                marginTop: '4px',
                                                                color: 'var(--neon-cyan)',
                                                                textTransform: 'uppercase',
                                                            }}
                                                        >
                                                            AI Powered
                                                        </span>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                <style jsx global>{`
                    .mobile-menu-toggle {
                        display: none;
                    }
                    @media (max-width: 1024px) {
                        .desktop-nav,
                        .desktop-only-action {
                            display: none !important;
                        }
                        .mobile-menu-toggle {
                            display: flex !important;
                        }
                    }
                `}</style>
            </motion.header>
        </>
    );
}

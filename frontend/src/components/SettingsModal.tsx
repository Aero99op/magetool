'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Monitor, Moon, Sun, Sparkles, Zap, Aperture, Activity, Check, Cpu, Grid, Trees, Mountain, Flower2, Cog, Ship, Plane, Diamond, Droplets, Bug, TrainFront } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type AnimationMode = 'rain' | 'dataflow' | 'anime' | 'blackhole' | 'circuit' | 'netscape' | 'jungle' | 'mountains' | 'zen' | 'forge' | 'seaside' | 'galactic' | 'planes' | 'kites' | 'ink' | 'spiderweb' | 'vande-bharat';
type Theme = 'light' | 'dark';


export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const [theme, setTheme] = useState<Theme>('dark');
    const [animLight, setAnimLight] = useState<AnimationMode>('rain');
    const [animDark, setAnimDark] = useState<AnimationMode>('dataflow');
    const [animationsEnabled, setAnimationsEnabled] = useState(true);

    useEffect(() => {
        if (isOpen) {
            // Load current settings
            const currentTheme = document.documentElement.getAttribute('data-theme') as Theme || 'dark';
            const currentAnim = document.documentElement.getAttribute('data-animate') !== 'off';
            const savedAnimLight = document.documentElement.getAttribute('data-anim-light') as AnimationMode || 'rain';
            const savedAnimDark = document.documentElement.getAttribute('data-anim-dark') as AnimationMode || 'dataflow';

            setTheme(currentTheme);
            setAnimationsEnabled(currentAnim);
            setAnimLight(savedAnimLight);
            setAnimDark(savedAnimDark);
        }
    }, [isOpen]);

    const handleThemeChange = (newTheme: Theme) => {
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const handleLightAnimChange = (mode: AnimationMode) => {
        setAnimLight(mode);
        localStorage.setItem('animModeLight', mode);
        document.documentElement.setAttribute('data-anim-light', mode);
    };

    const handleDarkAnimChange = (mode: AnimationMode) => {
        setAnimDark(mode);
        localStorage.setItem('animModeDark', mode);
        document.documentElement.setAttribute('data-anim-dark', mode);
    };

    const handleAnimToggle = (enabled: boolean) => {
        setAnimationsEnabled(enabled);
        localStorage.setItem('animationsEnabled', String(enabled));
        document.documentElement.setAttribute('data-animate', enabled ? 'on' : 'off');
    };

    const ModeButton = ({ mode, current, onClick, label, desc, icon: Icon, color }: any) => (
        <button
            onClick={() => onClick(mode)}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '12px',
                border: current === mode ? '2px solid var(--primary)' : '1px solid var(--glass-border)',
                background: current === mode ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--bg-surface)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
            }}
        >
            <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
            }}>
                <Icon size={18} color="white" />
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{desc}</div>
            </div>
            {current === mode && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--primary)' }}>
                    <Check size={16} />
                </div>
            )}
        </button>
    );

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!mounted) return null;

    // Use a portal to render outside the header context (which has transforms)
    // This ensures position: fixed works relative to the viewport
    if (typeof document === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>

                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(5, 5, 10, 0.7)',
                            backdropFilter: 'blur(8px)',
                            zIndex: -1
                        }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{
                            position: 'relative',
                            width: '100%', maxWidth: '420px',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '24px',
                            padding: '24px',
                            boxShadow: 'var(--shadow-elevated)',
                            maxHeight: 'min(85vh, 800px)',
                            overflowY: 'auto',
                            display: 'flex', flexDirection: 'column'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>Appearance</h2>
                            <button onClick={onClose} className="btn btn-ghost" style={{ padding: '8px', borderRadius: '50%' }}><X size={20} /></button>
                        </div>

                        {/* Animation Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>Background Effects</h3>
                            <button
                                onClick={() => handleAnimToggle(!animationsEnabled)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', borderRadius: '99px',
                                    background: animationsEnabled ? 'rgba(var(--neon-green-rgb), 0.15)' : 'var(--bg-surface)',
                                    color: animationsEnabled ? 'var(--neon-green)' : 'var(--text-muted)',
                                    border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer'
                                }}
                            >
                                <Activity size={14} />{animationsEnabled ? 'On' : 'Off'}
                            </button>
                        </div>

                        <div style={{ opacity: animationsEnabled ? 1 : 0.5, pointerEvents: animationsEnabled ? 'auto' : 'none', transition: 'opacity 0.2s' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                {/* Light Mode Settings */}
                                <div>
                                    <h4 style={{ fontSize: '0.85rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                        <Sun size={14} /> Light Mode Pref
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <ModeButton
                                            mode="rain" current={animLight} onClick={handleLightAnimChange}
                                            label="Rain" desc="Storm" icon={Sparkles} color="linear-gradient(135deg, #94a3b8, #64748b)"
                                        />
                                        <ModeButton
                                            mode="dataflow" current={animLight} onClick={handleLightAnimChange}
                                            label="Data" desc="Blueprint" icon={Monitor} color="linear-gradient(135deg, #3b82f6, #60a5fa)"
                                        />
                                        <ModeButton
                                            mode="anime" current={animLight} onClick={handleLightAnimChange}
                                            label="Anime" desc="Action" icon={Zap} color="#000000"
                                        />
                                        <ModeButton
                                            mode="blackhole" current={animLight} onClick={handleLightAnimChange}
                                            label="Void" desc="Singularity" icon={Aperture} color="#8b5cf6"
                                        />
                                        <ModeButton
                                            mode="circuit" current={animLight} onClick={handleLightAnimChange}
                                            label="Circuit" desc="Logic" icon={Cpu} color="#475569"
                                        />
                                        <ModeButton
                                            mode="netscape" current={animLight} onClick={handleLightAnimChange}
                                            label="Retro" desc="Horizon" icon={Grid} color="#f59e0b"
                                        />
                                        <ModeButton
                                            mode="jungle" current={animLight} onClick={handleLightAnimChange}
                                            label="Jungle" desc="Nature" icon={Trees} color="#16a34a"
                                        />
                                        <ModeButton
                                            mode="mountains" current={animLight} onClick={handleLightAnimChange}
                                            label="Peaks" desc="Himalaya" icon={Mountain} color="#3b82f6"
                                        />
                                        <ModeButton
                                            mode="zen" current={animLight} onClick={handleLightAnimChange}
                                            label="Sakura" desc="Zen" icon={Flower2} color="#f472b6"
                                        />
                                        <ModeButton
                                            mode="forge" current={animLight} onClick={handleLightAnimChange}
                                            label="Steam" desc="Industry" icon={Cog} color="#d97706"
                                        />
                                        <ModeButton
                                            mode="seaside" current={animLight} onClick={handleLightAnimChange}
                                            label="Seaside" desc="Travel" icon={Ship} color="#0ea5e9"
                                        />
                                        <ModeButton
                                            mode="galactic" current={animLight} onClick={handleLightAnimChange}
                                            label="Galactic" desc="Space" icon={Sparkles} color="#6d28d9"
                                        />
                                        <ModeButton
                                            mode="planes" current={animLight} onClick={handleLightAnimChange}
                                            label="Planes" desc="Paper" icon={Plane} color="#94a3b8"
                                        />
                                        <ModeButton
                                            mode="kites" current={animLight} onClick={handleLightAnimChange}
                                            label="Kites" desc="Festival" icon={Diamond} color="#ef4444"
                                        />
                                        <ModeButton
                                            mode="ink" current={animLight} onClick={handleLightAnimChange}
                                            label="Ink" desc="Flow" icon={Droplets} color="#ec4899"
                                        />
                                        <ModeButton
                                            mode="spiderweb" current={animLight} onClick={handleLightAnimChange}
                                            label="Web" desc="Connect" icon={Bug} color="#64748b"
                                        />
                                        <ModeButton
                                            mode="vande-bharat" current={animLight} onClick={handleLightAnimChange}
                                            label="Vande Bharat" desc="Train" icon={TrainFront} color="#2563eb"
                                        />
                                    </div>
                                </div>

                                {/* Dark Mode Settings */}
                                <div>
                                    <h4 style={{ fontSize: '0.85rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                                        <Moon size={14} /> Dark Mode Pref
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <ModeButton
                                            mode="dataflow" current={animDark} onClick={handleDarkAnimChange}
                                            label="Data" desc="Cyber" icon={Monitor} color="linear-gradient(135deg, #0ea5e9, #3b82f6)"
                                        />
                                        <ModeButton
                                            mode="rain" current={animDark} onClick={handleDarkAnimChange}
                                            label="Rain" desc="Storm" icon={Sparkles} color="linear-gradient(135deg, #334155, #1e293b)"
                                        />
                                        <ModeButton
                                            mode="blackhole" current={animDark} onClick={handleDarkAnimChange}
                                            label="Hole" desc="Cosmic" icon={Aperture} color="#6d28d9"
                                        />
                                        <ModeButton
                                            mode="anime" current={animDark} onClick={handleDarkAnimChange}
                                            label="Anime" desc="Lines" icon={Zap} color="#ffffff"
                                        />
                                        <ModeButton
                                            mode="circuit" current={animDark} onClick={handleDarkAnimChange}
                                            label="Circuit" desc="System" icon={Cpu} color="#00d9ff"
                                        />
                                        <ModeButton
                                            mode="netscape" current={animDark} onClick={handleDarkAnimChange}
                                            label="Retro" desc="Vapor" icon={Grid} color="#d946ef"
                                        />
                                        <ModeButton
                                            mode="jungle" current={animDark} onClick={handleDarkAnimChange}
                                            label="Forest" desc="Night" icon={Trees} color="#047857"
                                        />
                                        <ModeButton
                                            mode="mountains" current={animDark} onClick={handleDarkAnimChange}
                                            label="Summit" desc="Aurora" icon={Mountain} color="#6366f1"
                                        />
                                        <ModeButton
                                            mode="zen" current={animDark} onClick={handleDarkAnimChange}
                                            label="Spirit" desc="Energy" icon={Flower2} color="#e879f9"
                                        />
                                        <ModeButton
                                            mode="forge" current={animDark} onClick={handleDarkAnimChange}
                                            label="Foundry" desc="Metal" icon={Cog} color="#94a3b8"
                                        />
                                        <ModeButton
                                            mode="seaside" current={animDark} onClick={handleDarkAnimChange}
                                            label="Coast" desc="Night" icon={Ship} color="#1e293b"
                                        />
                                        <ModeButton
                                            mode="galactic" current={animDark} onClick={handleDarkAnimChange}
                                            label="Galactic" desc="Space" icon={Sparkles} color="#4c1d95"
                                        />
                                        <ModeButton
                                            mode="planes" current={animDark} onClick={handleDarkAnimChange}
                                            label="Planes" desc="Flight" icon={Plane} color="#cbd5e1"
                                        />
                                        <ModeButton
                                            mode="kites" current={animDark} onClick={handleDarkAnimChange}
                                            label="Kites" desc="Sky" icon={Diamond} color="#f87171"
                                        />
                                        <ModeButton
                                            mode="ink" current={animDark} onClick={handleDarkAnimChange}
                                            label="Ink" desc="Fluid" icon={Droplets} color="#db2777"
                                        />
                                        <ModeButton
                                            mode="spiderweb" current={animDark} onClick={handleDarkAnimChange}
                                            label="Web" desc="Network" icon={Bug} color="#94a3b8"
                                        />
                                        <ModeButton
                                            mode="vande-bharat" current={animDark} onClick={handleDarkAnimChange}
                                            label="Vande Bharat" desc="Journey" icon={TrainFront} color="#ea580c"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}

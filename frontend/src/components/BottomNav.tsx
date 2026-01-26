'use client';

import Link from 'next/link';
import { Home, Grid, Folder, Settings } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    const navItems = [
        { icon: Home, label: 'Home', path: '/' },
        { icon: Grid, label: 'Tools', path: '/#tools' }, // Scrolls to tools section
        // { icon: Folder, label: 'Files', path: '/files' }, // Future feature
        { icon: Settings, label: 'Settings', path: '/support' }, // Support/Settings
    ];

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                height: '65px',
                background: 'var(--bg-card)',
                borderTop: '1px solid var(--glass-border)',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                zIndex: 1000,
                paddingBottom: 'safe-area-inset-bottom', // iOS safe area
                backdropFilter: 'blur(10px)',
            }}
        >
            {navItems.map((item) => (
                <Link
                    key={item.label}
                    href={item.path}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        color: isActive(item.path) ? 'var(--neon-blue)' : 'var(--text-secondary)',
                        textDecoration: 'none',
                        width: '100%',
                        height: '100%',
                        position: 'relative',
                    }}
                >
                    {isActive(item.path) && (
                        <motion.div
                            layoutId="bottom-nav-highlight"
                            style={{
                                position: 'absolute',
                                top: 0,
                                width: '40px',
                                height: '2px',
                                background: 'var(--neon-blue)',
                                boxShadow: '0 0 10px var(--neon-blue)',
                            }}
                        />
                    )}
                    <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
                    <span style={{ fontSize: '10px', fontWeight: isActive(item.path) ? 600 : 400 }}>
                        {item.label}
                    </span>
                </Link>
            ))}
        </div>
    );
}

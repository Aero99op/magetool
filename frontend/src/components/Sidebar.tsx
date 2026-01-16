'use client';

import Link from 'next/link';
import AdBanner from './AdBanner';

const QUICK_LINKS = [
    { href: '/images/converter', icon: '🖼️', label: 'Image Converter' },
    { href: '/videos/compressor', icon: '🎬', label: 'Video Compressor' },
    { href: '/documents/pdf-merge', icon: '📄', label: 'PDF Merge' },
    { href: '/audio/converter', icon: '🎵', label: 'Audio Converter' },
];

const POPULAR_TOOLS = [
    { href: '/images/background-remover', icon: '✨', label: 'Remove BG' },
    { href: '/images/upscaler', icon: '🔍', label: 'AI Upscale' },
    { href: '/videos/to-gif', icon: '🎞️', label: 'Video to GIF' },
    { href: '/documents/pdf-compress', icon: '📦', label: 'Compress PDF' },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            {/* Ad Space */}
            <AdBanner slot="sidebar" />

            {/* Quick Links */}
            <div className="sidebar-section">
                <h3 className="sidebar-title">Quick Tools</h3>
                <nav className="sidebar-nav">
                    {QUICK_LINKS.map((link) => (
                        <Link key={link.href} href={link.href} className="sidebar-link">
                            <span className="link-icon">{link.icon}</span>
                            <span className="link-label">{link.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Popular Tools */}
            <div className="sidebar-section">
                <h3 className="sidebar-title">
                    <span className="fire-icon">🔥</span>
                    Popular
                </h3>
                <nav className="sidebar-nav">
                    {POPULAR_TOOLS.map((link) => (
                        <Link key={link.href} href={link.href} className="sidebar-link popular">
                            <span className="link-icon">{link.icon}</span>
                            <span className="link-label">{link.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            <style jsx>{`
                .sidebar {
                    width: 280px;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    padding: 20px;
                    background: rgba(255,255,255,0.02);
                    border-right: 1px solid rgba(255,255,255,0.06);
                    height: calc(100vh - 70px);
                    position: sticky;
                    top: 70px;
                    overflow-y: auto;
                }
                
                .sidebar-section {
                    background: rgba(255,255,255,0.03);
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                
                .sidebar-title {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255,255,255,0.5);
                    margin-bottom: 12px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                
                .fire-icon {
                    font-size: 0.85rem;
                }
                
                .sidebar-nav {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .sidebar-link {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    color: rgba(255,255,255,0.7);
                    text-decoration: none;
                    font-size: 0.875rem;
                    transition: all 0.2s ease;
                }
                
                .sidebar-link:hover {
                    background: rgba(0, 217, 255, 0.1);
                    color: #00D9FF;
                    transform: translateX(4px);
                }
                
                .sidebar-link.popular {
                    color: rgba(255, 200, 100, 0.8);
                }
                
                .sidebar-link.popular:hover {
                    background: rgba(255, 200, 100, 0.1);
                    color: #FFD700;
                }
                
                .link-icon {
                    font-size: 1.1rem;
                }
                
                .link-label {
                    font-weight: 500;
                }
                
                @media (max-width: 1024px) {
                    .sidebar {
                        display: none;
                    }
                }
            `}</style>
        </aside>
    );
}

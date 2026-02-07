'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Github, Twitter, Heart } from 'lucide-react';

const FOOTER_LINKS = {
    tools: [
        { href: '/images', label: 'Image Tools' },
        { href: '/videos', label: 'Video Tools' },
        { href: '/audio', label: 'Audio Tools' },
        { href: '/documents', label: 'Document Tools' },
    ],
    popular: [
        { href: '/images/background-remover', label: 'Remove Background' },
        { href: '/videos/compressor', label: 'Compress Video' },
        { href: '/documents/pdf-merge', label: 'Merge PDF' },
        { href: '/images/upscaler', label: 'AI Upscale' },
    ],
    legal: [
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/support', label: 'Contact Support' },
    ]
};

export default function Footer() {
    return (
        <footer
            style={{
                position: 'relative',
                marginTop: '100px',
                borderTop: '1px solid var(--glass-border)',
                background: 'linear-gradient(180deg, var(--bg-deep) 0%, var(--bg-surface) 100%)',
                overflow: 'hidden',
                zIndex: 10,
            }}
        >
            {/* Ambient Glow */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: '20%',
                width: '60%',
                height: '1px',
                background: 'linear-gradient(90deg, transparent, var(--neon-blue), transparent)',
                opacity: 0.5,
                boxShadow: '0 0 50px 10px var(--neon-blue)',
            }} />

            <div className="container" style={{ padding: '80px 24px 40px' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '60px',
                    marginBottom: '80px',
                }}>
                    {/* Brand Section */}
                    <div style={{ maxWidth: '300px' }}>
                        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                            <div style={{
                                width: '32px',
                                height: '32px',
                                background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Sparkles size={18} color="#ffffff" />
                            </div>
                            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                Magetool
                            </span>
                        </Link>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '24px' }}>
                            Top-tier file processing power, available directly in your browser.
                            Secure, fast, and always free.
                        </p>
                        <div style={{ display: 'flex', gap: '16px' }}>
                            <a href="#" className="social-link"><Github size={20} /></a>
                            <a href="#" className="social-link"><Twitter size={20} /></a>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div>
                        <h4 className="footer-heading">Product</h4>
                        <div className="footer-list">
                            {FOOTER_LINKS.tools.map((link) => (
                                <Link key={link.href} href={link.href} className="footer-link">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-heading">Popular</h4>
                        <div className="footer-list">
                            {FOOTER_LINKS.popular.map((link) => (
                                <Link key={link.href} href={link.href} className="footer-link">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="footer-heading">Company</h4>
                        <div className="footer-list">
                            {FOOTER_LINKS.legal.map((link) => (
                                <Link key={link.href} href={link.href} className="footer-link">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '32px',
                    borderTop: '1px solid var(--glass-border)',
                    flexWrap: 'wrap',
                    gap: '16px',
                }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        © {new Date().getFullYear()} Magetool Inc. All rights reserved.
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <span>Made with</span>
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Heart size={14} fill="#EF4444" color="#EF4444" />
                        </motion.div>
                        <span>for the creators.</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .footer-heading {
                    font-size: 0.85rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--text-muted);
                    margin-bottom: 24px;
                }
                
                .footer-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .footer-link {
                    color: var(--text-secondary);
                    transition: all 0.2s ease;
                }
                
                .footer-link:hover {
                    color: var(--neon-blue);
                    transform: translateX(4px);
                }

                .social-link {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--bg-surface);
                    border: 1px solid var(--glass-border);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--text-secondary);
                    transition: all 0.2s ease;
                }

                .social-link:hover {
                    background: var(--neon-blue);
                    color: #fff;
                    border-color: var(--neon-blue);
                    transform: translateY(-2px);
                }
            `}</style>
        </footer>
    );
}

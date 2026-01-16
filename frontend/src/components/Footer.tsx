'use client';

import Link from 'next/link';

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
};

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-inner">
                <div className="footer-main">
                    {/* Brand */}
                    <div className="footer-brand">
                        <Link href="/" className="footer-logo">
                            <span className="logo-spark">⚡</span>
                            <span className="logo-text">Magetool</span>
                        </Link>
                        <p className="footer-tagline">
                            Fast, free, and secure file tools.
                        </p>
                    </div>

                    {/* Links */}
                    <div className="footer-links">
                        <div className="link-group">
                            <span className="link-title">Tools</span>
                            {FOOTER_LINKS.tools.map((link) => (
                                <Link key={link.href} href={link.href} className="footer-link">
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        <div className="link-group">
                            <span className="link-title">Popular</span>
                            {FOOTER_LINKS.popular.map((link) => (
                                <Link key={link.href} href={link.href} className="footer-link">
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Mini Ad Slot */}
                    <div className="footer-ad-slot">
                        <div className="ad-mini">
                            <span className="ad-label">Ad</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="footer-bottom">
                    <span className="copyright">© {new Date().getFullYear()} Magetool</span>
                    <span className="made-with">Made with 💙</span>
                </div>
            </div>

            <style jsx>{`
                .footer {
                    margin-top: 80px;
                    border-top: 1px solid rgba(255,255,255,0.04);
                    background: linear-gradient(180deg, transparent, rgba(0,0,0,0.2));
                }
                
                .footer-inner {
                    max-width: 1280px;
                    margin: 0 auto;
                    padding: 48px 24px 24px;
                }
                
                .footer-main {
                    display: flex;
                    gap: 48px;
                    flex-wrap: wrap;
                }
                
                .footer-brand {
                    flex: 1;
                    min-width: 200px;
                }
                
                .footer-logo {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    text-decoration: none;
                    margin-bottom: 12px;
                }
                
                .logo-spark {
                    font-size: 1.25rem;
                }
                
                .logo-text {
                    font-size: 1.1rem;
                    font-weight: 700;
                    background: linear-gradient(135deg, #fff, #00D9FF);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .footer-tagline {
                    color: rgba(255,255,255,0.4);
                    font-size: 0.85rem;
                }
                
                .footer-links {
                    display: flex;
                    gap: 64px;
                }
                
                .link-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .link-title {
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255,255,255,0.3);
                    margin-bottom: 4px;
                }
                
                .footer-link {
                    color: rgba(255,255,255,0.5);
                    text-decoration: none;
                    font-size: 0.85rem;
                    transition: color 0.2s ease;
                }
                
                .footer-link:hover {
                    color: #00D9FF;
                }
                
                .footer-ad-slot {
                    margin-left: auto;
                }
                
                .ad-mini {
                    width: 160px;
                    height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.02);
                    border: 1px dashed rgba(255,255,255,0.08);
                    border-radius: 8px;
                }
                
                .ad-label {
                    font-size: 0.65rem;
                    color: rgba(255,255,255,0.2);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                
                .footer-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 24px;
                    margin-top: 32px;
                    border-top: 1px solid rgba(255,255,255,0.04);
                }
                
                .copyright, .made-with {
                    color: rgba(255,255,255,0.25);
                    font-size: 0.75rem;
                }
                
                @media (max-width: 768px) {
                    .footer-inner {
                        padding: 32px 16px 20px;
                    }
                    
                    .footer-main {
                        flex-direction: column;
                        gap: 32px;
                    }
                    
                    .footer-links {
                        gap: 32px;
                    }
                    
                    .footer-ad-slot {
                        margin-left: 0;
                    }
                    
                    .ad-mini {
                        width: 100%;
                        height: 60px;
                    }
                    
                    .footer-bottom {
                        flex-direction: column;
                        gap: 8px;
                        text-align: center;
                    }
                }
            `}</style>
        </footer>
    );
}

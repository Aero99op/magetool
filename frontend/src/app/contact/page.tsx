import type { Metadata } from 'next';
import { Mail, MessageCircle, Github, Twitter } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Contact Us - Magetool',
    description: 'Get in touch with the Magetool team. We love hearing from our users!',
};

export default function ContactPage() {
    return (
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', maxWidth: '800px' }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                <h1 className="tool-title" style={{ fontSize: '3rem', marginBottom: '24px' }}>
                    Let's <span className="text-gradient">Talk.</span>
                </h1>
                <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                    Have a question, a feature request, or just want to say hi? We're all ears.
                </p>
            </div>

            <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    margin: '0 auto 32px',
                    background: 'linear-gradient(135deg, var(--neon-blue), var(--neon-purple))',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(0,217,255,0.3)'
                }}>
                    <Mail size={40} color="#fff" />
                </div>

                <h2 style={{ fontSize: '2rem', marginBottom: '16px' }}>Email Us Directly</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
                    We try to respond to all inquiries within 24 hours.
                </p>

                <a
                    href="mailto:spandanpatra9160@gmail.com"
                    className="btn btn-primary"
                    style={{
                        fontSize: '1.2rem',
                        padding: '16px 40px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}
                >
                    <Mail size={24} />
                    spandanpatra9160@gmail.com
                </a>

                <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid var(--glass-border)' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
                        Connect with us on social media
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '24px' }}>
                        <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} aria-label="Github">
                            <Github size={24} />
                        </a>
                        <a href="#" style={{ color: 'var(--text-secondary)', transition: 'color 0.2s' }} aria-label="Twitter">
                            <Twitter size={24} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

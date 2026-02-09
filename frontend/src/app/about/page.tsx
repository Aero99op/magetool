import type { Metadata } from 'next';
import { Shield, Zap, Heart, Globe, Lock, Code } from 'lucide-react';

export const metadata: Metadata = {
    title: 'About Us - The Magetool Story',
    description: 'Learn why we built Magetool: The privacy-first, client-side media toolkit for everyone.',
};

export default function AboutPage() {
    return (
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '80px', maxWidth: '900px' }}>
            {/* Hero Section */}
            <section style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h1 className="tool-title" style={{ fontSize: '3.5rem', marginBottom: '24px' }}>
                    We Believe in <span className="text-gradient">Privacy & Power.</span>
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                    Magetool was born from a simple frustration: Why do I have to upload my private files to a server just to convert a video?
                </p>
            </section>

            {/* Our Story */}
            <div className="glass-card" style={{ padding: '48px', marginBottom: '60px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Heart className="text-gradient" size={32} style={{ color: '#ff4d4d' }} />
                    Our Story
                </h2>
                <div style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '1.1rem' }}>
                    <p style={{ marginBottom: '24px' }}>
                        In 2024, our founder needed to compress a sensitive PDF document. Every tool online asked to "Upload" the file.
                        That didn't feel right. What happens to the file after? Who sees it? Is it deleted?
                    </p>
                    <p style={{ marginBottom: '24px' }}>
                        That's when the idea for <strong>Magetool</strong> was sparked. We wanted to build a suite of professional-grade media tools
                        that run <strong>entirely in your browser</strong>.
                    </p>
                    <p>
                        Today, Magetool serves thousands of users who value their privacy. When you use our Video Converter or PDF Merger,
                        your files <strong>never leave your device</strong>. The heavy lifting is done by your own computer's processor,
                        powered by advanced WebAssembly technology.
                    </p>
                </div>
            </div>

            {/* Core Values Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px', marginBottom: '80px' }}>
                <div className="glass-card" style={{ padding: '32px' }}>
                    <Shield size={40} style={{ color: 'var(--neon-blue)', marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Privacy First</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        We don't want your data. Seriously. Our architecture is designed so we physically cannot see your files even if we wanted to.
                    </p>
                </div>
                <div className="glass-card" style={{ padding: '32px' }}>
                    <Zap size={40} style={{ color: 'var(--neon-purple)', marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Lightning Fast</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        By processing files on your device, we eliminate upload and download times. For many tasks, it's instant.
                    </p>
                </div>
                <div className="glass-card" style={{ padding: '32px' }}>
                    <Globe size={40} style={{ color: 'var(--neon-green)', marginBottom: '20px' }} />
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '16px' }}>Truly Free</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        We believe basic digital tools should be accessible to everyone. No "3 files per day" limits. No watermarks.
                    </p>
                </div>
            </div>

            {/* Tech Stack Section (E-E-A-T booster) */}
            <section style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '32px', textAlign: 'center' }}>Built with Modern Tech</h2>
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    flexWrap: 'wrap'
                }}>
                    {['Next.js 14', 'WebAssembly', 'FFmpeg', 'Rust', 'TensorFlow.js', 'React'].map((tech) => (
                        <span key={tech} style={{
                            padding: '12px 24px',
                            borderRadius: '99px',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: 'var(--text-primary)'
                        }}>
                            {tech}
                        </span>
                    ))}
                </div>
            </section>
        </div>
    );
}

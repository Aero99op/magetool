import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Zap,
    Shield,
    HelpCircle,
    Lightbulb,
    ArrowRight
} from 'lucide-react';

interface FAQ {
    question: string;
    answer: string;
}

interface Step {
    title: string;
    description: string;
}

interface ContentSectionProps {
    title: string;
    description: string;
    features: string[];
    benefits: { title: string; description: string; icon?: any }[];
    howTo: Step[];
    faqs: FAQ[];
}

export default function ContentSection({
    title,
    description,
    features,
    benefits,
    howTo,
    faqs
}: ContentSectionProps) {
    return (
        <section className="container" style={{ marginBottom: '80px', marginTop: '80px' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                {/* Introduction */}
                <div style={{ marginBottom: '60px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                        {title}
                    </h2>
                    <p style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                        {description}
                    </p>
                </div>

                {/* Features Grid */}
                <div style={{ marginBottom: '80px' }}>
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Zap className="text-gradient" size={28} />
                        Key Features
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '24px'
                    }}>
                        {features.map((feature, i) => (
                            <div key={i} className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <CheckCircle2 size={24} style={{ color: 'var(--neon-green)', flexShrink: 0 }} />
                                <span style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* How To Use */}
                <div style={{ marginBottom: '80px' }}>
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Lightbulb className="text-gradient" size={28} />
                        How to Use
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {howTo.map((step, i) => (
                            <div key={i} className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
                                <div style={{
                                    position: 'absolute',
                                    top: '-20px',
                                    right: '-20px',
                                    fontSize: '8rem',
                                    fontWeight: 900,
                                    color: 'rgba(255,255,255,0.03)',
                                    zIndex: 0
                                }}>
                                    {i + 1}
                                </div>
                                <div style={{ position: 'relative', zIndex: 1 }}>
                                    <h4 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                                        {i + 1}. {step.title}
                                    </h4>
                                    <p style={{ color: 'var(--text-secondary)' }}>
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Choose Us (Benefits) */}
                <div style={{ marginBottom: '80px' }}>
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Shield className="text-gradient" size={28} />
                        Why Use Magetool?
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
                        {benefits.map((benefit, i) => (
                            <div key={i}>
                                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                                    {benefit.title}
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                                    {benefit.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <HelpCircle className="text-gradient" size={28} />
                        Frequency Asked Questions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {faqs.map((faq, i) => (
                            <div key={i} className="glass-card" style={{ padding: '24px' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-primary)' }}>
                                    {faq.question}
                                </h4>
                                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}

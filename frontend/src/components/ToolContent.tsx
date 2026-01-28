import { motion } from 'framer-motion';
import { HelpCircle, Star, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface FAQ {
    question: string;
    answer: string;
}

export interface ToolContentProps {
    overview: string;
    features: string[];
    howTo: { step: string; description: string }[];
    faqs: FAQ[];
}

export default function ToolContent({ overview, features, howTo, faqs }: ToolContentProps) {
    return (
        <section className="tool-content-section" style={{ marginTop: '60px', borderTop: '1px solid var(--glass-border)', paddingTop: '40px' }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content (Overview + How To) */}
                <div className="lg:col-span-2 space-y-12">

                    {/* Overview */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                            <BookOpen className="text-neon-blue" size={24} />
                            Overview
                        </h2>
                        <div className="glass-card p-6 text-text-secondary leading-relaxed">
                            {overview}
                        </div>
                    </motion.div>

                    {/* How To Steps */}
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Star className="text-neon-blue" size={24} />
                            How to Use
                        </h2>
                        <div className="space-y-4">
                            {howTo.map((item, index) => (
                                <div key={index} className="glass-card p-6 flex gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-blue/10 flex items-center justify-center text-neon-blue font-bold">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg mb-2">{item.step}</h3>
                                        <p className="text-text-secondary text-sm">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar (Features + FAQs) */}
                <div className="space-y-12">

                    {/* Features List */}
                    <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <h3 className="text-xl font-bold mb-4">Features</h3>
                        <div className="glass-card p-6">
                            <ul className="space-y-3">
                                {features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3 text-sm text-text-secondary">
                                        <span className="text-neon-green mt-1">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>

                    {/* FAQs */}
                    <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <HelpCircle className="text-neon-blue" size={20} />
                            FAQ
                        </h3>
                        <div className="space-y-3">
                            {faqs.map((faq, index) => (
                                <FAQItem key={index} question={faq.question} answer={faq.answer} />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* JSON-LD Schema for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'FAQPage',
                        mainEntity: faqs.map(faq => ({
                            '@type': 'Question',
                            name: faq.question,
                            acceptedAnswer: {
                                '@type': 'Answer',
                                text: faq.answer
                            }
                        }))
                    })
                }}
            />
        </section>
    );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="glass-card overflow-hidden transition-all duration-200">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 text-left font-medium hover:text-neon-blue transition-colors"
                style={{ background: 'transparent', border: 'none', color: 'inherit' }}
            >
                {question}
                {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isOpen && (
                <div className="p-4 pt-0 text-sm text-text-secondary border-t border-glass-border">
                    {answer}
                </div>
            )}
        </div>
    );
}

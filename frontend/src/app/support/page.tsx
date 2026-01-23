'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
    HelpCircle,
    Mail,
    ChevronDown,
    AlertTriangle,
    Zap,
    Clock,
    Image,
    Video,
    Music,
    FileText,
    Server,
    Wifi,
    RefreshCw,
    Download,
    Upload,
    Shield,
    Sparkles,
    MessageCircle,
    Bug,
    Lightbulb,
    CheckCircle,
} from 'lucide-react';

interface FAQ {
    question: string;
    answer: string;
    category: string;
    icon: LucideIcon;
}

const faqs: FAQ[] = [
    // Server & Processing Issues
    {
        category: 'Server & Processing',
        icon: Server,
        question: 'Why is processing slow or timing out?',
        answer: `This commonly happens when servers are in "sleep mode" (free tier limitation). Here's what you can do:

• First request may be slow - servers need 15-30 seconds to wake up
• Reload the page and try again
• For large files, especially videos, allow more time
• Peak hours (9-11 AM IST) may have higher traffic

Pro Tip: Visit the home page first to wake up the servers automatically! 🚀`,
    },
    {
        category: 'Server & Processing',
        icon: Clock,
        question: 'Request failed with timeout error?',
        answer: `This usually happens when:

• File size is too large (especially videos >100MB)
• Servers are still waking up
• Network connection is unstable

How to fix:
1. Reduce file size or compress it first
2. Wait 30 seconds and retry
3. Try a different browser
4. If it keeps failing, contact us!`,
    },
    {
        category: 'Server & Processing',
        icon: RefreshCw,
        question: 'Processing stuck and not progressing?',
        answer: `This can be frustrating! It happens when:

• Server response is slow
• Processing is happening in the background but progress isn't updating

Solutions:
1. Don't refresh the page! Processing may be happening in the background
2. Wait up to 60 seconds - our servers retry for that duration
3. If still stuck after 60s, refresh and try again
4. Check if your network is stable`,
    },

    // Image Tools Issues
    {
        category: 'Image Tools',
        icon: Image,
        question: 'Background Remover not working properly?',
        answer: `This is an AI-powered feature that may struggle with tricky images:

For best results:
• Use images with a clear subject (person, object clearly visible)
• High contrast backgrounds work better
• Busy/messy backgrounds may cause issues
• 4K+ images might have scaling problems

If results aren't perfect:
1. Crop the image to focus only on the subject
2. Try a photo with better lighting
3. Use PNG format for transparency`,
    },
    {
        category: 'Image Tools',
        icon: Sparkles,
        question: 'Why is AI Upscaler taking so long?',
        answer: `AI processing requires heavy computation! 

Expected processing times:
• Small images (< 1MB): 10-30 seconds
• Medium (1-5MB): 30-60 seconds  
• Large (5MB+): 60-120 seconds

Speed tips:
• Smaller images process faster
• Off-peak hours (late night) give faster results
• If it fails, try a smaller resolution first

Remember: Quality takes time! 💎`,
    },
    {
        category: 'Image Tools',
        icon: Image,
        question: 'Image converter not supporting my format?',
        answer: `Supported formats:
✅ JPG/JPEG, PNG, WebP, GIF, BMP, TIFF, ICO, AVIF

Not Supported:
❌ RAW formats (CR2, NEF, ARW) - use specialized software
❌ PSD files - export from Photoshop first
❌ AI/SVG to raster - use SVG Converter tool instead

Pro tip: PNG is best for quality, WebP for web optimization!`,
    },

    // Video Tools Issues  
    {
        category: 'Video Tools',
        icon: Video,
        question: 'Video conversion failing or output corrupted?',
        answer: `Video processing is the heaviest operation we handle:

Common causes:
• File size > 100MB - compress first
• Corrupted source video
• Unsupported codec (rare formats)
• Timeout due to long processing time

Solutions:
1. Use video compressor first
2. Trim to a smaller clip and try
3. Export in a different format and try again
4. MP4 (H.264) is the most reliable format`,
    },
    {
        category: 'Video Tools',
        icon: Video,
        question: 'Video to GIF quality is poor?',
        answer: `GIF is a limited format (max 256 colors):

For better results:
• Short clips work best (5-10 seconds ideal)
• Lower resolution = smaller file, better playback
• High contrast content looks better in GIF
• Dark/night videos will struggle

Alternatives:
• Try WebP animation (better quality, same file size)
• Share short video clips as MP4 instead`,
    },
    {
        category: 'Video Tools',
        icon: Music,
        question: 'Extracted audio quality is poor?',
        answer: `Audio quality depends on the source video:

Tips:
• 320kbps MP3 gives the best quality
• Output can't exceed the source video's audio quality
• Some videos have poor source audio
• AAC/M4A formats offer slightly better quality

If output quality is low, check your source video first!`,
    },

    // Audio Tools Issues
    {
        category: 'Audio Tools',
        icon: Music,
        question: 'Audio converter not supporting my format?',
        answer: `Supported Audio Formats:
✅ MP3, WAV, AAC, FLAC, OGG, M4A, WMA

File size limits:
• Max 50MB recommended for audio files
• Larger files may timeout

Format recommendations:
• MP3 - universal compatibility
• FLAC - lossless quality
• AAC - good quality, small size`,
    },
    {
        category: 'Audio Tools',
        icon: Music,
        question: 'BPM Detector giving incorrect readings?',
        answer: `BPM detection is algorithmic and not 100% accurate:

Best accuracy with:
• Music with clear beats (EDM, pop, rock)
• At least 30 seconds of audio
• Clean audio without too much noise

May be inaccurate with:
• Complex rhythms (jazz, classical)
• Very slow or fast songs
• Songs with tempo changes
• Heavily distorted audio`,
    },

    // Document Tools Issues
    {
        category: 'Document Tools',
        icon: FileText,
        question: 'PDF Merger not working?',
        answer: `Common causes of PDF issues:

Problems:
• Password protected PDFs - unlock them first!
• Corrupted PDF files
• Very large PDFs (>50MB each)
• Scanned PDFs with no text layer

Solutions:
1. Use PDF Unlocker for protected files
2. Check files individually
3. Compress large PDFs first
4. Maximum 10 files at once recommended`,
    },
    {
        category: 'Document Tools',
        icon: Shield,
        question: 'Forgot my PDF password after protecting?',
        answer: `Once a password is set, even we cannot unlock it! 🔒

Important:
• Store your passwords safely
• We don't store any passwords (for privacy)
• Lost password = locked file forever

Recovery is impossible - this is a security feature, not a bug!`,
    },

    // General Issues
    {
        category: 'General',
        icon: Download,
        question: 'Download button not working?',
        answer: `This is usually a browser issue:

Try these:
1. Disable pop-up blocker
2. Try a different browser (Chrome recommended)
3. Check file download permissions
4. Is your device storage full?

For mobile users:
• Check your "Downloads" folder
• Check download location in browser settings`,
    },
    {
        category: 'General',
        icon: Upload,
        question: 'File upload failing?',
        answer: `Upload issues and limits:

File size limits:
• Images: 50MB max
• Videos: 100MB max (for processing)
• Audio: 50MB max
• Documents: 25MB max

Solutions:
1. Check your file size
2. Verify the format is supported
3. Ensure stable internet connection
4. Clear browser cache`,
    },
    {
        category: 'General',
        icon: Wifi,
        question: 'Website loading slowly?',
        answer: `Performance tips:

Quick fixes:
1. Clear browser cache
2. Disable extensions and try again  
3. Try a different browser
4. Switch from mobile data to WiFi (or vice versa)

On our end:
• We use free tier servers, cold starts may occur
• Peak hours may be slower
• Thanks for your patience with our free service! �`,
    },
    {
        category: 'General',
        icon: AlertTriangle,
        question: 'A feature is not working at all?',
        answer: `Generic troubleshooting steps:

1. Refresh the page (Ctrl+F5 for hard refresh)
2. Clear browser cache and cookies
3. Try in incognito/private mode
4. Try a different device or browser
5. Wait a bit and try again

Still not working?
Email us with:
• What the issue is (screenshot if possible)
• Browser name and version
• Device info (mobile/desktop)`,
    },
];

const categories = [
    { name: 'All', icon: HelpCircle },
    { name: 'Server & Processing', icon: Server },
    { name: 'Image Tools', icon: Image },
    { name: 'Video Tools', icon: Video },
    { name: 'Audio Tools', icon: Music },
    { name: 'Document Tools', icon: FileText },
    { name: 'General', icon: Zap },
];

export default function SupportPage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const filteredFaqs = activeCategory === 'All'
        ? faqs
        : faqs.filter(faq => faq.category === activeCategory);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
            {/* Hero Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                style={{ textAlign: 'center', marginBottom: '60px' }}
            >
                <div
                    style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 24px',
                        background: 'linear-gradient(135deg, #00D9FF, #0099FF)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <HelpCircle size={40} color="#0F0F0F" />
                </div>
                <h1
                    style={{
                        fontSize: 'clamp(2rem, 4vw, 3rem)',
                        fontWeight: 800,
                        marginBottom: '16px',
                        background: 'linear-gradient(135deg, #FFFFFF, #00D9FF)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    Help & Support
                </h1>
                <p
                    style={{
                        fontSize: '1.1rem',
                        color: 'rgba(255, 255, 255, 0.7)',
                        maxWidth: '600px',
                        margin: '0 auto',
                    }}
                >
                    Having trouble? Find solutions in our FAQs or contact us directly 📧
                </p>
            </motion.section>

            {/* Quick Stats */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '60px',
                }}
            >
                <div
                    className="glass-card"
                    style={{
                        padding: '24px',
                        textAlign: 'center',
                    }}
                >
                    <CheckCircle size={32} color="#00FF88" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
                        99.9%
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        Uptime Target
                    </div>
                </div>
                <div
                    className="glass-card"
                    style={{
                        padding: '24px',
                        textAlign: 'center',
                    }}
                >
                    <Zap size={32} color="#FFD700" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
                        4 Servers
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        Load Balanced
                    </div>
                </div>
                <div
                    className="glass-card"
                    style={{
                        padding: '24px',
                        textAlign: 'center',
                    }}
                >
                    <Clock size={32} color="#00D9FF" style={{ marginBottom: '12px' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' }}>
                        &lt;24h
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                        Response Time
                    </div>
                </div>
            </motion.div>

            {/* Main Content Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 380px',
                    gap: '40px',
                    alignItems: 'start',
                }}
                className="support-grid"
            >
                {/* FAQs Section */}
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px',
                        }}
                    >
                        <MessageCircle size={28} color="#00D9FF" />
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                            Frequently Asked Questions
                        </h2>
                    </div>

                    {/* Category Filter */}
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '8px',
                            marginBottom: '24px',
                        }}
                    >
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            const isActive = activeCategory === cat.name;
                            return (
                                <button
                                    key={cat.name}
                                    onClick={() => setActiveCategory(cat.name)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '8px 16px',
                                        background: isActive
                                            ? 'linear-gradient(135deg, rgba(0, 217, 255, 0.3), rgba(0, 153, 255, 0.3))'
                                            : 'rgba(255, 255, 255, 0.05)',
                                        border: isActive
                                            ? '1px solid rgba(0, 217, 255, 0.5)'
                                            : '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '20px',
                                        color: isActive ? '#00D9FF' : 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Icon size={16} />
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>

                    {/* FAQ List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {filteredFaqs.map((faq, index) => {
                            const Icon = faq.icon;
                            const isOpen = openFaq === index;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="glass-card"
                                    style={{
                                        overflow: 'hidden',
                                        border: isOpen
                                            ? '1px solid rgba(0, 217, 255, 0.3)'
                                            : '1px solid rgba(255, 255, 255, 0.1)',
                                    }}
                                >
                                    <button
                                        onClick={() => toggleFaq(index)}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '16px',
                                            padding: '20px',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '10px',
                                                background: 'rgba(0, 217, 255, 0.1)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon size={20} color="#00D9FF" />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div
                                                style={{
                                                    fontSize: '0.7rem',
                                                    color: 'rgba(0, 217, 255, 0.8)',
                                                    marginBottom: '4px',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.5px',
                                                }}
                                            >
                                                {faq.category}
                                            </div>
                                            <div
                                                style={{
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    color: '#FFFFFF',
                                                }}
                                            >
                                                {faq.question}
                                            </div>
                                        </div>
                                        <ChevronDown
                                            size={20}
                                            color="rgba(255, 255, 255, 0.5)"
                                            style={{
                                                transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                                                transition: 'transform 0.3s ease',
                                                flexShrink: 0,
                                            }}
                                        />
                                    </button>
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <div
                                                    style={{
                                                        padding: '0 20px 20px 76px',
                                                        color: 'rgba(255, 255, 255, 0.75)',
                                                        fontSize: '0.95rem',
                                                        lineHeight: '1.7',
                                                        whiteSpace: 'pre-line',
                                                    }}
                                                >
                                                    {faq.answer}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.section>

                {/* Contact Section - Sidebar */}
                <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    style={{ position: 'sticky', top: '100px' }}
                >
                    {/* Contact Card */}
                    <div
                        className="glass-card"
                        style={{
                            padding: '32px',
                            marginBottom: '24px',
                            background: 'linear-gradient(135deg, rgba(0, 217, 255, 0.1), rgba(0, 153, 255, 0.05))',
                            border: '1px solid rgba(0, 217, 255, 0.2)',
                        }}
                    >
                        <div
                            style={{
                                width: '60px',
                                height: '60px',
                                margin: '0 auto 20px',
                                background: 'linear-gradient(135deg, #00D9FF, #0099FF)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Mail size={28} color="#0F0F0F" />
                        </div>
                        <h3
                            style={{
                                textAlign: 'center',
                                fontSize: '1.25rem',
                                fontWeight: 700,
                                marginBottom: '12px',
                            }}
                        >
                            Contact Us
                        </h3>
                        <p
                            style={{
                                textAlign: 'center',
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.9rem',
                                marginBottom: '24px',
                            }}
                        >
                            Didn't find a solution in the FAQs? Email us directly and we'll help you out! 🤝
                        </p>
                        <a
                            href="mailto:spandanpatra9160@gmail.com"
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                justifyContent: 'center',
                                gap: '10px',
                                padding: '14px 20px',
                            }}
                        >
                            <Mail size={18} />
                            Send Email
                        </a>
                        <div
                            style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                borderRadius: '8px',
                                textAlign: 'center',
                                fontSize: '0.85rem',
                                color: 'rgba(255, 255, 255, 0.6)',
                                wordBreak: 'break-all',
                            }}
                        >
                            📧 spandanpatra9160@gmail.com
                        </div>
                    </div>

                    {/* Bug Report Card */}
                    <div
                        className="glass-card"
                        style={{
                            padding: '24px',
                            marginBottom: '24px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Bug size={24} color="#FF6B6B" />
                            <h4 style={{ fontWeight: 600 }}>Report a Bug</h4>
                        </div>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem', marginBottom: '16px' }}>
                            Please include in your email:
                        </p>
                        <ul
                            style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}
                        >
                            {[
                                'What error you encountered',
                                'Screenshot (if possible)',
                                'Browser name & version',
                                'Device type (mobile/desktop)',
                                'Steps to reproduce',
                            ].map((item, i) => (
                                <li
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '0.85rem',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                    }}
                                >
                                    <span style={{ color: '#00D9FF' }}>•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Feature Request Card */}
                    <div
                        className="glass-card"
                        style={{
                            padding: '24px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Lightbulb size={24} color="#FFD700" />
                            <h4 style={{ fontWeight: 600 }}>Suggest a Feature</h4>
                        </div>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.85rem' }}>
                            Want a new tool or improvement to an existing one? Let us know - we're actively developing new features! 🚀
                        </p>
                    </div>
                </motion.aside>
            </div>

            {/* Responsive Styles */}
            <style jsx global>{`
                @media (max-width: 900px) {
                    .support-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock } from 'lucide-react';

interface InterstitialAdProps {
    isOpen: boolean;
    onClose: () => void;
    onSkip?: () => void;
    skipDelay?: number; // seconds before skip button appears
}

export default function InterstitialAd({
    isOpen,
    onClose,
    onSkip,
    skipDelay = 5
}: InterstitialAdProps) {
    const [countdown, setCountdown] = useState(skipDelay);
    const [canSkip, setCanSkip] = useState(false);
    const [adLoaded, setAdLoaded] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setCountdown(skipDelay);
            setCanSkip(false);
            return;
        }

        // Start countdown when ad opens
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanSkip(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen, skipDelay]);

    // Initialize AdSense ad when component mounts
    useEffect(() => {
        if (isOpen && typeof window !== 'undefined') {
            try {
                // Push ad to AdSense
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
                setAdLoaded(true);
            } catch (e) {
                console.error('AdSense error:', e);
            }
        }
    }, [isOpen]);

    const handleSkip = useCallback(() => {
        if (canSkip) {
            onSkip?.();
            onClose();
        }
    }, [canSkip, onSkip, onClose]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.95)',
                    zIndex: 50000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px',
                }}
            >
                {/* Header with Skip/Countdown */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                }}>
                    {!canSkip ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '20px',
                            color: 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.9rem',
                        }}>
                            <Clock size={16} />
                            <span>Skip in {countdown}s</span>
                        </div>
                    ) : (
                        <motion.button
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={handleSkip}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #00D9FF, #0099FF)',
                                border: 'none',
                                borderRadius: '20px',
                                color: '#000',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                cursor: 'pointer',
                            }}
                        >
                            <X size={16} />
                            Skip Ad
                        </motion.button>
                    )}
                </div>

                {/* Ad Label */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '20px',
                    padding: '4px 12px',
                    background: 'rgba(255, 193, 7, 0.2)',
                    borderRadius: '4px',
                    color: '#ffc107',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                }}>
                    ADVERTISEMENT
                </div>

                {/* Ad Container */}
                <div style={{
                    width: '100%',
                    maxWidth: '728px',
                    minHeight: '300px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                }}>
                    {/* Google AdSense Ad Unit - Replace with your actual ad slot */}
                    <ins
                        className="adsbygoogle"
                        style={{
                            display: 'block',
                            width: '100%',
                            height: '280px',
                        }}
                        data-ad-client="ca-pub-7253353658623253"
                        data-ad-slot="YOUR_AD_SLOT_ID"  // Replace with your ad slot ID
                        data-ad-format="auto"
                        data-full-width-responsive="true"
                    />

                    {/* Fallback if ad doesn't load */}
                    {!adLoaded && (
                        <div style={{
                            textAlign: 'center',
                            color: 'rgba(255, 255, 255, 0.5)',
                        }}>
                            <p>Loading advertisement...</p>
                        </div>
                    )}
                </div>

                {/* Thank you message */}
                <p style={{
                    marginTop: '20px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.85rem',
                    textAlign: 'center',
                }}>
                    Thank you for supporting Magetool! Your file will be ready after this ad.
                </p>
            </motion.div>
        </AnimatePresence>
    );
}

'use client';

import { motion } from 'framer-motion';
import { Loader2, Check, AlertCircle, Upload, Cog, Download } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export type ProcessingStage = 'idle' | 'uploading' | 'uploaded' | 'processing' | 'complete' | 'error';

interface ProgressDisplayProps {
    stage: ProcessingStage;
    progress: number; // 0-100 (Target progress from backend)
    uploadSpeed?: string; // e.g., "12.3 MB/s"
    estimatedTime?: string; // e.g., "1 minute 23 seconds"
    fileName?: string;
    fileSize?: string;
    errorMessage?: string;
    onProcessClick?: () => void; // Callback for Process button
}

export default function ProgressDisplay({
    stage,
    progress,
    uploadSpeed,
    estimatedTime,
    fileName,
    fileSize,
    errorMessage,
    onProcessClick,
}: ProgressDisplayProps) {
    // Local state for smooth visual progress
    const [visualProgress, setVisualProgress] = useState(0);
    const progressInterval = useRef<NodeJS.Timeout | null>(null);

    // Reset visual progress when stage changes significantly
    useEffect(() => {
        if (stage === 'idle' || stage === 'uploading') {
            setVisualProgress(progress);
        }
        if (stage === 'complete') {
            setVisualProgress(100);
        }
    }, [stage]);

    // SMART PROGRESS SIMULATION LOGIC
    useEffect(() => {
        // Clear any existing intervals
        if (progressInterval.current) {
            clearInterval(progressInterval.current);
            progressInterval.current = null;
        }

        // If we are complete, force 100%
        if (stage === 'complete' || progress === 100) {
            setVisualProgress(100);
            return;
        }

        // Check if we are in a state that needs smoothing
        const needsSmoothing = stage === 'processing' || stage === 'uploading';

        if (needsSmoothing) {
            const step = () => {
                setVisualProgress((current) => {
                    // 1. CATCH UP MODE: If backend is ahead, move quickly to catch up
                    if (current < progress) {
                        // Move 10% of the distance or at least 1, but don't overshoot
                        const jump = Math.max(1, Math.ceil((progress - current) / 10));
                        return Math.min(progress, current + jump);
                    }

                    // 2. SIMULATION MODE: If we are "stuck" awaiting backend, creep forward slowly
                    // Only creep if we are processing (not uploading, uploads are usually accurate)
                    // limit to 98% to avoid fake completion
                    if (stage === 'processing' && current >= progress && current < 98) {
                        // Very slow increment to show "aliveness"
                        // Random chance to increment to make it look organic
                        return Math.random() > 0.7 ? current + 1 : current;
                    }

                    return current;
                });
            };

            // Run this loop frequently
            progressInterval.current = setInterval(step, 200);
        } else {
            // honest mode for other states
            setVisualProgress(progress);
        }

        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, [stage, progress]); // Re-evaluate when target progress or stage changes


    if (stage === 'idle') return null;

    const getStageIcon = () => {
        switch (stage) {
            case 'uploading':
                return <Upload size={24} />;
            case 'uploaded':
                return <Check size={24} />;
            case 'processing':
                return <Cog size={24} className="animate-spin" style={{ animation: 'spin 2s linear infinite' }} />;
            case 'complete':
                return <Check size={24} />;
            case 'error':
                return <AlertCircle size={24} />;
            default:
                return <Loader2 size={24} />;
        }
    };

    const getStageTitle = () => {
        switch (stage) {
            case 'uploading':
                return 'Uploading...';
            case 'uploaded':
                return '✓ Upload Complete!';
            case 'processing':
                return 'Processing...';
            case 'complete':
                return '✓ Your file is ready!';
            case 'error':
                return 'Error occurred';
            default:
                return 'Preparing...';
        }
    };

    const getStageColor = () => {
        switch (stage) {
            case 'uploading':
                return '#00D9FF';
            case 'uploaded':
                return '#44FF44';
            case 'processing':
                return '#0099FF';
            case 'complete':
                return '#44FF44';
            case 'error':
                return '#FF4444';
            default:
                return '#00D9FF';
        }
    };

    const color = getStageColor();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{
                padding: '24px',
                marginTop: '20px',
                borderColor: `${color}30`,
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '20px',
                }}
            >
                <div
                    style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: `${color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color,
                    }}
                >
                    {getStageIcon()}
                </div>
                <div>
                    <h3
                        style={{
                            fontSize: '1.25rem',
                            fontWeight: 600,
                            color: color,
                            marginBottom: '4px',
                        }}
                    >
                        {getStageTitle()}
                    </h3>
                    {fileName && (
                        <p
                            style={{
                                fontSize: '0.875rem',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            {fileName} {fileSize && `(${fileSize})`}
                        </p>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            {(stage === 'uploading' || stage === 'processing') && (
                <div style={{ marginBottom: '16px' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '8px',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        <span>{Math.round(visualProgress)}% complete</span>
                        {estimatedTime && <span>ETA: {estimatedTime}</span>}
                    </div>
                    <div className="progress-bar">
                        <motion.div
                            className="progress-bar-fill"
                            // Use visualProgress here for the width
                            initial={{ width: 0 }}
                            animate={{ width: `${visualProgress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    {stage === 'uploading' && uploadSpeed && (
                        <p
                            style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-muted)',
                                marginTop: '8px',
                            }}
                        >
                            Upload speed: {uploadSpeed}
                        </p>
                    )}
                </div>
            )}

            {/* Process Button - After upload is complete */}
            {stage === 'uploaded' && onProcessClick && (
                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <p
                        style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '16px',
                        }}
                    >
                        Your file has been uploaded successfully. Click below to start processing.
                    </p>
                    <button
                        onClick={onProcessClick}
                        style={{
                            padding: '14px 40px',
                            background: 'linear-gradient(135deg, #00D9FF, #0099FF)',
                            border: 'none',
                            borderRadius: '12px',
                            color: '#0F0F0F',
                            fontSize: '1rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 4px 20px rgba(0, 217, 255, 0.3)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.02)';
                            e.currentTarget.style.boxShadow = '0 6px 30px rgba(0, 217, 255, 0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 217, 255, 0.3)';
                        }}
                    >
                        🚀 Process Now
                    </button>
                </div>
            )}

            {/* Processing Message */}
            {stage === 'processing' && (
                <p
                    style={{
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        textAlign: 'center',
                    }}
                >
                    Your file is being processed on our servers...
                    <br />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        You can browse other tools while we work.
                    </span>
                </p>
            )}

            {/* Error Message */}
            {stage === 'error' && errorMessage && (
                <div
                    style={{
                        padding: '12px 16px',
                        background: 'rgba(255, 68, 68, 0.1)',
                        border: '1px solid rgba(255, 68, 68, 0.3)',
                        borderRadius: '8px',
                        color: '#FF4444',
                        fontSize: '0.9rem',
                    }}
                >
                    {errorMessage}
                </div>
            )}

            {/* Three-Stage Progress Indicator */}
            {stage !== 'error' && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '32px',
                        marginTop: '24px',
                        paddingTop: '20px',
                        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    {[
                        { label: 'Upload', stage: 'uploading', icon: Upload },
                        { label: 'Process', stage: 'processing', icon: Cog },
                        { label: 'Download', stage: 'complete', icon: Download },
                    ].map((step, index) => {
                        const StepIcon = step.icon;
                        const isActive = stage === step.stage || (stage === 'uploaded' && step.stage === 'uploading');
                        const isPast =
                            (stage === 'uploaded' && step.stage === 'uploading') ||
                            (stage === 'processing' && ['uploading'].includes(step.stage)) ||
                            (stage === 'complete' && ['uploading', 'processing'].includes(step.stage));
                        const stepColor = isActive && stage !== 'uploaded' ? color : isPast ? '#44FF44' : 'rgba(255, 255, 255, 0.3)';

                        return (
                            <div
                                key={step.label}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                }}
                            >
                                <div
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        background: `${stepColor}20`,
                                        border: `2px solid ${stepColor}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: stepColor,
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {isPast ? <Check size={18} /> : <StepIcon size={18} />}
                                </div>
                                <span
                                    style={{
                                        fontSize: '0.75rem',
                                        color: stepColor,
                                        fontWeight: isActive ? 600 : 400,
                                    }}
                                >
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
}

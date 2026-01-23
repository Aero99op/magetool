'use client';

import { ReactNode, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import UploadZone from './UploadZone';
import ProgressDisplay, { ProcessingStage } from './ProgressDisplay';
import DownloadButton from './DownloadButton';
import AdSlot from './AdSlot';
import InterstitialAd from './InterstitialAd';
import { Accept } from 'react-dropzone';

interface ToolLayoutProps {
    title: string;
    subtitle: string;
    acceptFormats?: Accept;
    maxFileSize?: number;
    maxFiles?: number;
    supportedFormatsText?: string;
    onFilesSelected: (files: File[]) => void;
    onProcessClick?: () => void;
    configPanel?: ReactNode;
    customContent?: ReactNode;
    processingStage?: ProcessingStage;
    progress?: number;
    uploadSpeed?: string;
    estimatedTime?: string;
    fileName?: string;
    fileSize?: string;
    errorMessage?: string;
    downloadReady?: boolean;
    downloadUrl?: string;
    downloadFileName?: string;
    downloadFileSize?: string;
}

export default function ToolLayout({
    title,
    subtitle,
    acceptFormats,
    maxFileSize = 50,
    maxFiles = 40,
    supportedFormatsText,
    onFilesSelected,
    onProcessClick,
    configPanel,
    customContent,
    processingStage = 'idle',
    progress = 0,
    uploadSpeed,
    estimatedTime,
    fileName,
    fileSize,
    errorMessage,
    downloadReady = false,
    downloadUrl,
    downloadFileName,
    downloadFileSize,
}: ToolLayoutProps) {
    const [showInterstitial, setShowInterstitial] = useState(false);
    const [adWatched, setAdWatched] = useState(false);

    useEffect(() => {
        if (downloadReady && !adWatched) {
            setShowInterstitial(true);
        }
    }, [downloadReady, adWatched]);

    const handleAdClose = () => {
        setShowInterstitial(false);
        setAdWatched(true);
    };

    return (
        <div className="container">
            <InterstitialAd
                isOpen={showInterstitial}
                onClose={handleAdClose}
                onSkip={handleAdClose}
                skipDelay={5}
            />

            <div className="tool-page">
                {/* Tool Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="tool-header"
                >
                    <h1 className="tool-title">{title}</h1>
                    <p className="tool-subtitle">{subtitle}</p>
                </motion.div>

                {/* Main Content Grid - Responsive */}
                <div className="tool-grid">
                    {/* Left Column: Upload + Progress + Download */}
                    <div className="tool-main-content">
                        {/* Upload Zone - Only show when idle or error */}
                        {(processingStage === 'idle' || processingStage === 'error') && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <UploadZone
                                    accept={acceptFormats}
                                    maxSize={maxFileSize}
                                    maxFiles={maxFiles}
                                    onFilesSelected={onFilesSelected}
                                    supportedFormatsText={supportedFormatsText}
                                />
                            </motion.div>
                        )}

                        {/* Custom Content - User-provided content */}
                        {customContent}

                        {/* Progress Display - During upload/uploaded/processing */}
                        {(processingStage === 'uploading' || processingStage === 'uploaded' || processingStage === 'processing') && (
                            <ProgressDisplay
                                stage={processingStage}
                                progress={progress}
                                uploadSpeed={uploadSpeed}
                                estimatedTime={estimatedTime}
                                fileName={fileName}
                                fileSize={fileSize}
                                onProcessClick={onProcessClick}
                            />
                        )}

                        {/* Error Display */}
                        {processingStage === 'error' && (
                            <ProgressDisplay
                                stage="error"
                                progress={0}
                                errorMessage={errorMessage}
                            />
                        )}

                        {/* Download Ready */}
                        {downloadReady && downloadUrl && downloadFileName && (
                            <DownloadButton
                                fileName={downloadFileName}
                                fileSize={downloadFileSize}
                                downloadUrl={downloadUrl}
                            />
                        )}
                    </div>

                    {/* Right Column: Configuration Panel */}
                    {configPanel && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card tool-config-panel"
                        >
                            <h3 className="tool-config-title">Configuration</h3>
                            {configPanel}
                        </motion.div>
                    )}
                </div>

                {/* Ad Section - Below Tool */}
                <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <AdSlot variant="inline" />
                </div>
            </div>

            {/* Responsive Styles - Comprehensive */}
            <style jsx global>{`
                /* Tool Page Base */
                .tool-page {
                    padding: 20px 0 40px;
                }
                
                .tool-header {
                    margin-bottom: 24px;
                }
                
                /* Main Grid - Desktop */
                .tool-grid {
                    display: grid;
                    grid-template-columns: 1fr 320px;
                    gap: 24px;
                    align-items: start;
                }
                
                .tool-main-content {
                    min-width: 0; /* Prevent grid blowout */
                }
                
                .tool-config-panel {
                    padding: 24px;
                    position: sticky;
                    top: 84px; /* header-height + spacing */
                }
                
                .tool-config-title {
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 20px;
                    color: var(--text-primary);
                }
                
                /* Tablet - Stack sidebar below */
                @media (max-width: 1024px) {
                    .tool-grid {
                        grid-template-columns: 1fr !important;
                        gap: 20px;
                    }
                    
                    .tool-config-panel {
                        position: relative !important;
                        top: 0 !important;
                        order: -1; /* Move config ABOVE main content on mobile */
                    }
                }
                
                /* Mobile - Smaller spacing */
                @media (max-width: 768px) {
                    .tool-page {
                        padding: 16px 0 32px;
                    }
                    
                    .tool-header {
                        margin-bottom: 20px;
                    }
                    
                    .tool-grid {
                        gap: 16px;
                    }
                    
                    .tool-config-panel {
                        padding: 16px;
                    }
                    
                    .tool-config-title {
                        font-size: 0.9rem;
                        margin-bottom: 16px;
                    }
                }
                
                /* Small Mobile */
                @media (max-width: 480px) {
                    .tool-page {
                        padding: 12px 0 24px;
                    }
                    
                    .tool-config-panel {
                        padding: 12px;
                    }
                }
            `}</style>
        </div>
    );
}


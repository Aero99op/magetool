'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import UploadZone from './UploadZone';
import ProgressDisplay, { ProcessingStage } from './ProgressDisplay';
import DownloadButton from './DownloadButton';
import AdSlot from './AdSlot';
import { Accept } from 'react-dropzone';

interface ToolLayoutProps {
    title: string;
    subtitle: string;
    acceptFormats?: Accept;
    maxFileSize?: number;
    maxFiles?: number;
    supportedFormatsText?: string;
    onFilesSelected: (files: File[]) => void;
    configPanel?: ReactNode;
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
    configPanel,
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
    return (
        <div className="container">
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

                {/* Main Content Grid */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: configPanel ? '1fr 350px' : '1fr',
                        gap: '24px',
                        alignItems: 'start',
                    }}
                    className="tool-grid"
                >
                    {/* Left Column: Upload + Progress + Download */}
                    <div>
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

                        {/* Progress Display - During upload/processing */}
                        {(processingStage === 'uploading' || processingStage === 'processing') && (
                            <ProgressDisplay
                                stage={processingStage}
                                progress={progress}
                                uploadSpeed={uploadSpeed}
                                estimatedTime={estimatedTime}
                                fileName={fileName}
                                fileSize={fileSize}
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
                            className="glass-card"
                            style={{
                                padding: '24px',
                                position: 'sticky',
                                top: 'calc(var(--header-height) + 20px)',
                            }}
                        >
                            <h3
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    marginBottom: '20px',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                Configuration
                            </h3>
                            {configPanel}
                        </motion.div>
                    )}
                </div>

                {/* Ad Section - Below Tool */}
                <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                    <AdSlot variant="inline" />
                </div>
            </div>

            {/* Responsive Styles */}
            <style jsx global>{`
        @media (max-width: 1024px) {
          .tool-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
        </div>
    );
}

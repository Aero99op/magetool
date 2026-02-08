'use client';

import { useState, useCallback, useEffect } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { formatFileSize } from '@/lib/api';
import ToolContent from '@/components/ToolContent';
import { removeBackground, BackgroundRemovalProgress, isWebGPUAvailable, getEstimatedTime } from '@/utils/backgroundRemover';

const ACCEPT_FORMATS = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
};

export default function BackgroundRemoverClient() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState<string>();
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [downloadFileSize, setDownloadFileSize] = useState<string>();
    const [hasWebGPU, setHasWebGPU] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string>();
    const [resultUrl, setResultUrl] = useState<string>();

    useEffect(() => {
        setHasWebGPU(isWebGPUAvailable());
    }, []);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        const file = files[0];
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(10);
        setErrorMessage(undefined);
        setDownloadReady(false);
        setPreviewUrl(URL.createObjectURL(file));
        setResultUrl(undefined);

        // For client-side processing, we skip upload and go straight to processing
        setTimeout(() => {
            setStage('uploaded');
            setProgress(100);
        }, 300);
    }, []);

    const handleProcess = useCallback(async () => {
        if (!fileName) return;

        // Get the file from the preview URL
        const response = await fetch(previewUrl!);
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type });

        setStage('processing');
        setProgress(0);

        try {
            // Process using client-side AI
            const resultBlob = await removeBackground(file, (p: BackgroundRemovalProgress) => {
                setProgress(p.progress);
                setUploadSpeed(p.message);
            });

            // Create download URL
            const url = URL.createObjectURL(resultBlob);
            setResultUrl(url);

            // Create output filename
            const originalStem = fileName.replace(/\.[^/.]+$/, '');
            const outputName = `${originalStem}_no_bg.png`;

            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(url);
            setDownloadFileName(outputName);
            setDownloadFileSize(formatFileSize(resultBlob.size));

        } catch (error: any) {
            console.error('Processing error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Background removal failed. Please try again.');
        }
    }, [fileName, previewUrl]);

    const resetState = () => {
        // Cleanup URLs
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        if (resultUrl) URL.revokeObjectURL(resultUrl);

        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage(undefined);
        setPreviewUrl(undefined);
        setResultUrl(undefined);
        setFileName(undefined);
        setFileSize(undefined);
    };

    return (
        <ToolLayout
            title="Background Remover"
            subtitle="Remove backgrounds from images using AI - 100% in your browser, FREE!"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: JPG, PNG, WebP | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{ padding: '16px', background: 'rgba(0, 255, 255, 0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', background: 'rgba(0, 255, 255, 0.2)', borderRadius: '3px', color: '#00FFFF' }}>
                                AI
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Runs in Your Browser</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            Powered by RMBG-1.4 AI model. Your images stay on your device - nothing is uploaded to any server!
                        </p>
                    </div>

                    <div style={{ padding: '12px', background: hasWebGPU ? 'rgba(0, 255, 100, 0.1)' : 'rgba(255, 200, 0, 0.1)', borderRadius: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '1rem' }}>{hasWebGPU ? '⚡' : '🔄'}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                {hasWebGPU ? 'WebGPU Acceleration Available' : 'Using CPU Processing'}
                            </span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Expected time: {getEstimatedTime()}
                        </p>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--neon-blue)' }}>Best for:</strong>
                        <ul style={{ margin: '8px 0 0 16px', lineHeight: 1.6 }}>
                            <li>Product photos</li>
                            <li>Portraits & headshots</li>
                            <li>Logo extraction</li>
                            <li>Creating transparent PNGs</li>
                        </ul>
                    </div>

                    {stage !== 'idle' && (
                        <button onClick={resetState} className="btn btn-ghost" style={{ width: '100%', marginTop: '20px' }}>
                            Remove Another Background
                        </button>
                    )}
                </div>
            }
            processingStage={stage}
            progress={progress}
            uploadSpeed={uploadSpeed}
            fileName={fileName}
            fileSize={fileSize}
            errorMessage={errorMessage}
            downloadReady={downloadReady}
            downloadUrl={downloadUrl}
            downloadFileName={downloadFileName}
            downloadFileSize={downloadFileSize}
            toolContent={
                <ToolContent
                    overview="Remove image backgrounds automatically in seconds. Our AI-powered tool runs ENTIRELY in your browser - your images are never uploaded to any server. Perfect for e-commerce product photos, marketing materials, and portraits."
                    features={[
                        "100% Client-side: Your images never leave your device - complete privacy.",
                        "AI Precision: RMBG-1.4 model handles hair, fur, and complex edges accurately.",
                        "Instant Results: No waiting for server processing.",
                        "WebGPU Accelerated: Uses your GPU for faster processing when available.",
                        "FREE Forever: No API keys, no credits, no limits."
                    ]}
                    howTo={[
                        { step: "Upload Image", description: "Select the image to process." },
                        { step: "AI Processing", description: "Wait a few seconds for the AI to work its magic." },
                        { step: "Download", description: "Save your transparent PNG." }
                    ]}
                />
            }
        />
    );
}

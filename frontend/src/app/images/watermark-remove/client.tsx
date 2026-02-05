'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { imageApi, pollTaskStatus, getDownloadUrl, formatFileSize } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';
import ToolContent from '@/components/ToolContent';

const ACCEPT_FORMATS = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] };

export default function WatermarkRemoveClient() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [detectionMode, setDetectionMode] = useState('auto');
    const [taskId, setTaskId] = useState<string | null>(null);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage('');

        try {
            const response = await imageApi.watermarkRemove(
                file, detectionMode,
                (e: AxiosProgressEvent) => setProgress(Math.round((e.loaded / (e.total || 1)) * 100))
            );

            setTaskId(response.task_id);
            setStage('uploaded');
            setProgress(100);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.detail || err.message || 'Upload failed');
            setStage('error');
        }
    }, [detectionMode]);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;

        setStage('processing');
        setProgress(50);

        try {
            const result = await pollTaskStatus(taskId, (status) => {
                setProgress(status.progress_percent || 60);
            });

            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(result.output_filename);
            setStage('complete');
            setDownloadReady(true);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.detail || err.message || 'Failed to remove watermark');
            setStage('error');
        }
    }, [taskId]);

    return (
        <ToolLayout
            title="AI Watermark Remover"
            subtitle="Remove watermarks and text overlays from images using AI inpainting"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: JPG, PNG, WebP | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Detection Mode</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {['auto', 'corner', 'center'].map(mode => (
                                <button
                                    key={mode}
                                    onClick={() => setDetectionMode(mode)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: detectionMode === mode ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${detectionMode === mode ? 'var(--neon-blue)' : 'var(--glass-border)'}`,
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                            Auto: Detects semi-transparent overlays | Corner: Focuses on corner watermarks | Center: Focuses on center watermarks
                        </p>
                    </div>

                    <div style={{ padding: '16px', background: 'rgba(0, 255, 255, 0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', background: 'rgba(0, 255, 255, 0.2)', borderRadius: '3px', color: '#00FFFF' }}>AI</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Powered by OpenCV Inpainting</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            Uses Telea inpainting algorithm to intelligently remove watermarks while preserving image quality.
                        </p>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--neon-blue)' }}>Best for:</strong>
                        <ul style={{ margin: '8px 0 0 16px', lineHeight: 1.6 }}>
                            <li>Stock photo watermarks</li>
                            <li>Text overlays</li>
                            <li>Logo stamps</li>
                            <li>Date stamps</li>
                        </ul>
                    </div>

                    {stage !== 'idle' && (
                        <button onClick={() => { setStage('idle'); setDownloadReady(false); setErrorMessage(''); }} className="btn btn-ghost" style={{ width: '100%', marginTop: '20px' }}>Remove Another</button>
                    )}
                </div>
            }
            processingStage={stage}
            progress={progress}
            fileName={fileName}
            fileSize={fileSize}
            errorMessage={errorMessage}
            downloadReady={downloadReady}
            downloadUrl={downloadUrl}
            downloadFileName={downloadFileName}
            toolContent={
                <ToolContent
                    overview="Remove unwanted watermarks, date stamps, and text overlays from your images using advanced AI inpainting technology."
                    features={[
                        "AI Inpainting: Intelligently fills in the removed area.",
                        "Auto Detection: Automatically finds common watermarks.",
                        "Manual Modes: Target specific areas like corners.",
                        "Clean Results: Preserves original image quality."
                    ]}
                    howTo={[
                        { step: "Upload Image", description: "Select image with watermark." },
                        { step: "Select Mode", description: "Choose Auto, Corner, or Center." },
                        { step: "Process", description: "Let AI remove the object." },
                        { step: "Download", description: "Save the clean image." }
                    ]}
                />
            }
        />
    );
}

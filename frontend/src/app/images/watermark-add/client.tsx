'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { imageApi, pollTaskStatus, getDownloadUrl, formatFileSize, startProcessing } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';
import ToolContent from '@/components/ToolContent';

const ACCEPT_FORMATS = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] };

export default function WatermarkAddClient() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [text, setText] = useState('© 2026');
    const [position, setPosition] = useState('bottom-right');
    const [opacity, setOpacity] = useState(70);
    const [fontSize, setFontSize] = useState(24);
    const [error, setError] = useState('');
    const [taskId, setTaskId] = useState<string | null>(null);

    const positions = ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'];

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setDownloadReady(false);
        setError('');

        try {
            const response = await imageApi.watermarkAdd(
                file, text, position, opacity, fontSize,
                (e: AxiosProgressEvent) => setProgress(Math.round((e.loaded / (e.total || 1)) * 100))
            );

            setTaskId(response.task_id);
            setStage('uploaded');
            setProgress(100);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Upload failed');
            setStage('error');
        }
    }, [text, position, opacity, fontSize]);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;

        setStage('processing');
        setProgress(50);

        try {
            await startProcessing(taskId);
            const result = await pollTaskStatus(taskId, (status) => {
                setProgress(status.progress_percent || 60);
            });

            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(result.output_filename);
            setStage('complete');
            setDownloadReady(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to process');
            setStage('error');
        }
    }, [taskId]);

    return (
        <ToolLayout
            title="Watermark Adder"
            subtitle="Add text watermark to protect your images"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: JPG, PNG, WEBP | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Watermark Text</label>
                        <input type="text" value={text} onChange={(e) => setText(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Position</label>
                        <select value={position} onChange={(e) => setPosition(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                            {positions.map(p => <option key={p} value={p}>{p.replace('-', ' ').toUpperCase()}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Opacity: {opacity}%</label>
                        <input type="range" min="10" max="100" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} style={{ width: '100%' }} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Font Size: {fontSize}px</label>
                        <input type="range" min="12" max="72" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} style={{ width: '100%' }} />
                    </div>

                    {error && (
                        <div style={{ padding: '12px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}
                </div>
            }
            processingStage={stage}
            progress={progress}
            fileName={fileName}
            fileSize={fileSize}
            downloadReady={downloadReady}
            downloadUrl={downloadUrl}
            downloadFileName={downloadFileName}
            toolContent={
                <ToolContent
                    overview="Protect your intellectual property by adding custom text watermarks to your images. Customize the text, position, opacity, and size."
                    features={[
                        "Custom Text: Add copyright info or your name.",
                        "Positioning: Place watermark in corners or center.",
                        "Transparency: Adjust opacity for subtle branding.",
                        "Batch Ready: Fast processing for single images."
                    ]}
                    howTo={[
                        { step: "Upload Image", description: "Select the photo to protect." },
                        { step: "Configure", description: "Enter text and adjust settings." },
                        { step: "Preview", description: "Check placement and look." },
                        { step: "Apply", description: "Process and download." }
                    ]}
                />
            }
        />
    );
}

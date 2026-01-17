'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { imageApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';

const SCALE_OPTIONS = [
    { value: 2, label: '2x (Double)' },
    { value: 4, label: '4x (Quadruple)' },
    { value: 8, label: '8x (Maximum)' },
];

const ACCEPT_FORMATS = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] };

export default function AIUpscalerPage() {
    const [scale, setScale] = useState(2);
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [downloadFileSize, setDownloadFileSize] = useState<string>();
    const [taskId, setTaskId] = useState<string | null>(null);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setDownloadReady(false);

        try {
            const response = await imageApi.upscale(file, scale, (e) => {
                if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
            });

            setTaskId(response.task_id);
            setStage('uploaded');
            setProgress(100);
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Upload failed');
        }
    }, [scale]);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;
        setStage('processing');
        setProgress(0);

        try {
            await startProcessing(taskId);
            const completedTask = await pollTaskStatus(taskId, (task) => {
                setProgress(task.progress_percent || 0);
            });

            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(completedTask.output_filename || 'upscaled.png');
            if (completedTask.file_size) setDownloadFileSize(formatFileSize(completedTask.file_size));
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Upscale failed');
        }
    }, [taskId]);

    return (
        <ToolLayout
            title="AI Image Upscaler"
            subtitle="Enhance and upscale low-resolution images using AI technology"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: JPG, PNG, WebP | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{ padding: '12px', background: 'rgba(0, 255, 255, 0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', background: 'rgba(0, 255, 255, 0.2)', borderRadius: '3px', color: '#00FFFF' }}>AI</span>
                        <span style={{ marginLeft: '8px', fontSize: '0.875rem', color: 'var(--text-primary)' }}>Powered by AI</span>
                    </div>

                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Scale Factor</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {SCALE_OPTIONS.map((option) => (
                            <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: scale === option.value ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${scale === option.value ? 'var(--neon-blue)' : 'var(--glass-border)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                                <input type="radio" value={option.value} checked={scale === option.value} onChange={() => setScale(option.value)} style={{ accentColor: 'var(--neon-blue)' }} />
                                <span style={{ color: 'var(--text-primary)' }}>{option.label}</span>
                            </label>
                        ))}
                    </div>

                    {stage !== 'idle' && (
                        <button onClick={() => { setStage('idle'); setDownloadReady(false); }} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>Upscale Another</button>
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
            downloadFileSize={downloadFileSize}
        />
    );
}

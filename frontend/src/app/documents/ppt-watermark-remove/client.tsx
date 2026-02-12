'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { documentApi, pollTaskStatus, getDownloadUrl, formatFileSize } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';
import ToolContent from '@/components/ToolContent';

const ACCEPT_FORMATS = { 'application/*': ['.pptx', '.ppt'] };

export default function PPTWatermarkRemoveClient() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [downloadFileSize, setDownloadFileSize] = useState<string>();
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
            const response = await documentApi.pptWatermarkRemove(
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
            if (result.file_size) setDownloadFileSize(formatFileSize(result.file_size));
            setStage('complete');
            setDownloadReady(true);
        } catch (err: any) {
            setErrorMessage(err.response?.data?.detail || err.message || 'Failed to remove watermark');
            setStage('error');
        }
    }, [taskId]);

    return (
        <ToolLayout
            title="PPT Watermark Remover"
            subtitle="Remove watermarks from PowerPoint presentations instantly"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={100}
            maxFiles={1}
            supportedFormatsText="Supported: PPTX, PPT | Max: 100MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Detection Mode</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {[
                                { key: 'auto', label: 'Auto' },
                                { key: 'template', label: 'Template' },
                                { key: 'content', label: 'Content' }
                            ].map(mode => (
                                <button
                                    key={mode.key}
                                    onClick={() => setDetectionMode(mode.key)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: detectionMode === mode.key ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${detectionMode === mode.key ? 'var(--neon-blue)' : 'var(--glass-border)'}`,
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    {mode.label}
                                </button>
                            ))}
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px' }}>
                            Auto: All methods | Template: Master/layout slides only | Content: Slide shapes only
                        </p>
                    </div>

                    <div style={{ padding: '16px', background: 'rgba(0, 255, 255, 0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '3px', color: '#8B5CF6' }}>SMART</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Multi-Strategy Detection</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            Detects watermarks by name, opacity, rotation, position, and master/layout analysis.
                        </p>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--neon-blue)' }}>Removes:</strong>
                        <ul style={{ margin: '8px 0 0 16px', lineHeight: 1.6 }}>
                            <li>Template watermarks (master slides)</li>
                            <li>&quot;DRAFT&quot; / &quot;CONFIDENTIAL&quot; overlays</li>
                            <li>Semi-transparent text/image stamps</li>
                            <li>Diagonal text watermarks</li>
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
            downloadFileSize={downloadFileSize}
            toolContent={
                <ToolContent
                    overview="Remove watermarks from PowerPoint presentations. Detects and removes text watermarks, semi-transparent overlays, and template-based watermarks."
                    features={[
                        "Smart Detection: Finds watermarks by name, opacity, rotation & position.",
                        "Template Cleaning: Removes watermarks from master slides & layouts.",
                        "Format Preserved: Original formatting & content stays intact.",
                        "Multiple Modes: Auto, Template-only, or Content-only detection."
                    ]}
                    howTo={[
                        { step: "Upload PPT", description: "Select your PowerPoint file." },
                        { step: "Choose Mode", description: "Pick Auto, Template, or Content." },
                        { step: "Process", description: "Watermarks are detected & removed." },
                        { step: "Download", description: "Save your clean presentation." }
                    ]}
                />
            }
        />
    );
}

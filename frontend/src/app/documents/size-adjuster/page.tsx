'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { documentApi, pollTaskStatus, getDownloadUrl, formatFileSize } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';

const ACCEPT_FORMATS = { '*/*': [] };

export default function FileSizeAdjusterPage() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [originalSize, setOriginalSize] = useState(0);
    const [mode, setMode] = useState<'increase' | 'decrease'>('increase');
    const [targetSize, setTargetSize] = useState('');
    const [targetUnit, setTargetUnit] = useState('MB');
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setOriginalSize(file.size);
        setCurrentFile(file);
        setStage('idle');
        setDownloadReady(false);
        setError('');
    }, []);

    const getTargetBytes = () => {
        const val = parseFloat(targetSize) || 0;
        switch (targetUnit) {
            case 'KB': return Math.floor(val * 1024);
            case 'MB': return Math.floor(val * 1024 * 1024);
            case 'GB': return Math.floor(val * 1024 * 1024 * 1024);
            default: return Math.floor(val);
        }
    };

    const handleProcess = async () => {
        if (!currentFile || !targetSize) return;

        setStage('processing');
        setProgress(30);
        setError('');

        try {
            const targetBytes = getTargetBytes();
            const response = await documentApi.sizeAdjust(
                currentFile, mode, targetBytes,
                (e: AxiosProgressEvent) => setProgress(Math.round((e.loaded / (e.total || 1)) * 30))
            );
            const taskId = response.task_id;

            setProgress(50);

            const result = await pollTaskStatus(taskId, (status) => {
                setProgress(status.progress_percent || 60);
            });

            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(result.output_filename);
            setStage('complete');
            setDownloadReady(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to adjust size');
            setStage('error');
        }
    };

    return (
        <ToolLayout
            title="File Size Adjuster"
            subtitle="Increase or decrease file size for testing or upload requirements"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={500}
            maxFiles={1}
            supportedFormatsText="Any file type | Max: 500MB"
            onFilesSelected={handleFilesSelected}
            configPanel={
                <div>
                    {originalSize > 0 && (
                        <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Current Size</div>
                            <div style={{ fontSize: '1.1rem', color: 'var(--neon-blue)', fontWeight: 600 }}>{formatFileSize(originalSize)}</div>
                        </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Mode</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setMode('increase')} style={{ flex: 1, padding: '12px', background: mode === 'increase' ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${mode === 'increase' ? 'var(--neon-blue)' : 'var(--glass-border)'}`, borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                ⬆️ Increase
                            </button>
                            <button onClick={() => setMode('decrease')} style={{ flex: 1, padding: '12px', background: mode === 'decrease' ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${mode === 'decrease' ? 'var(--neon-blue)' : 'var(--glass-border)'}`, borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>
                                ⬇️ Decrease
                            </button>
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Size</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="number" placeholder="Enter size" value={targetSize} onChange={(e) => setTargetSize(e.target.value)} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                            <select value={targetUnit} onChange={(e) => setTargetUnit(e.target.value)} style={{ padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                                <option value="KB">KB</option>
                                <option value="MB">MB</option>
                                <option value="GB">GB</option>
                            </select>
                        </div>
                    </div>

                    {mode === 'increase' && (
                        <div style={{ padding: '12px', background: 'rgba(255, 200, 100, 0.05)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <strong style={{ color: '#FFAA00' }}>Note:</strong> Adds non-destructive padding bytes. File remains functional.
                        </div>
                    )}

                    {mode === 'decrease' && (
                        <div style={{ padding: '12px', background: 'rgba(100, 200, 255, 0.05)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <strong style={{ color: '#00AAFF' }}>Note:</strong> Creates compressed ZIP file. Some files may not compress further.
                        </div>
                    )}

                    {error && (
                        <div style={{ padding: '12px', marginBottom: '16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}

                    {originalSize > 0 && targetSize && !downloadReady && (
                        <button onClick={handleProcess} className="btn btn-primary" style={{ width: '100%' }} disabled={stage === 'processing'}>
                            {stage === 'processing' ? '⏳ Processing...' : `${mode === 'increase' ? '⬆️ Increase to' : '⬇️ Decrease to'} ${targetSize} ${targetUnit}`}
                        </button>
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
        />
    );
}

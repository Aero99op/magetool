'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { imageApi, pollTaskStatus, getDownloadUrl, formatFileSize, startProcessing } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';

const ACCEPT_FORMATS = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'],
};

type SizeUnit = 'KB' | 'MB' | 'GB';
type AdjustMode = 'quality' | 'resolution' | 'padding';

export default function ImageSizeAdjusterPage() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [originalSize, setOriginalSize] = useState(0);
    const [targetValue, setTargetValue] = useState('');
    const [targetUnit, setTargetUnit] = useState<SizeUnit>('KB');
    const [mode, setMode] = useState<AdjustMode>('quality');
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [downloadFileSize, setDownloadFileSize] = useState<string>();
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [error, setError] = useState('');

    const handleFilesSelected = useCallback((files: File[]) => {
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

    const getTargetBytes = (): number => {
        const val = parseFloat(targetValue) || 0;
        switch (targetUnit) {
            case 'KB': return Math.floor(val * 1024);
            case 'MB': return Math.floor(val * 1024 * 1024);
            case 'GB': return Math.floor(val * 1024 * 1024 * 1024);
            default: return Math.floor(val);
        }
    };

    const handleProcess = async () => {
        if (!currentFile || !targetValue) return;

        setStage('uploading');
        setProgress(0);
        setError('');

        try {
            const targetBytes = getTargetBytes();

            const response = await imageApi.adjustSize(
                currentFile,
                targetBytes,
                mode,
                (e: AxiosProgressEvent) => {
                    if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
                }
            );

            setStage('processing');
            setProgress(0);

            await startProcessing(response.task_id);

            const result = await pollTaskStatus(response.task_id, (status) => {
                setProgress(status.progress_percent || 0);
            });

            setDownloadUrl(getDownloadUrl(response.task_id));
            setDownloadFileName(result.output_filename);
            if (result.file_size) {
                setDownloadFileSize(formatFileSize(result.file_size));
            }
            setStage('complete');
            setDownloadReady(true);

        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to adjust image size');
            setStage('error');
        }
    };

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setCurrentFile(null);
        setError('');
    };

    const getTargetSizeDisplay = () => {
        const bytes = getTargetBytes();
        return bytes > 0 ? formatFileSize(bytes) : '0';
    };

    return (
        <ToolLayout
            title="Image Size Adjuster"
            subtitle="Compress or expand images to a specific file size"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: JPG, PNG, WebP, GIF | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            configPanel={
                <div>
                    {originalSize > 0 && (
                        <div style={{
                            marginBottom: '20px',
                            padding: '16px',
                            background: 'rgba(0, 217, 255, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 217, 255, 0.1)'
                        }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                                Current Size
                            </div>
                            <div style={{ fontSize: '1.25rem', color: 'var(--neon-blue)', fontWeight: 600 }}>
                                {formatFileSize(originalSize)}
                            </div>
                        </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Target Size
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                type="number"
                                placeholder="Enter size"
                                value={targetValue}
                                onChange={(e) => setTargetValue(e.target.value)}
                                min="1"
                                step="any"
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem'
                                }}
                            />
                            <select
                                value={targetUnit}
                                onChange={(e) => setTargetUnit(e.target.value as SizeUnit)}
                                style={{
                                    padding: '12px 16px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem',
                                    cursor: 'pointer'
                                }}
                            >
                                <option value="KB">KB</option>
                                <option value="MB">MB</option>
                                <option value="GB">GB</option>
                            </select>
                        </div>
                        {targetValue && (
                            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                = {getTargetSizeDisplay()}
                            </div>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Compression Method
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {(['quality', 'resolution', 'padding'] as AdjustMode[]).map((m) => (
                                <button
                                    key={m}
                                    onClick={() => setMode(m)}
                                    style={{
                                        padding: '12px',
                                        background: mode === m ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${mode === m ? 'var(--neon-blue)' : 'var(--glass-border)'}`,
                                        borderRadius: '8px',
                                        color: mode === m ? 'var(--neon-blue)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                                        {m === 'quality' && '✨ Smart Fit (Recommended)'}
                                        {m === 'resolution' && '📐 Resolution Reduction'}
                                        {m === 'padding' && '⬆️ Padding (Increase Size)'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                        {m === 'quality' && 'Smartly adjusts quality & padding to hit EXACT target size'}
                                        {m === 'resolution' && 'Scale down dimensions proportionally'}
                                        {m === 'padding' && 'Add bytes to increase file size'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            marginBottom: '16px',
                            background: 'rgba(255,100,100,0.1)',
                            border: '1px solid rgba(255,100,100,0.3)',
                            borderRadius: '8px',
                            color: '#FF6B6B',
                            fontSize: '0.85rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {currentFile && targetValue && !downloadReady && stage !== 'processing' && stage !== 'uploading' && (
                        <button
                            onClick={handleProcess}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            {mode === 'padding' ? '⬆️ Increase' : '⬇️ Compress'} to {targetValue} {targetUnit}
                        </button>
                    )}

                    {downloadReady && (
                        <button
                            onClick={resetState}
                            className="btn btn-ghost"
                            style={{ width: '100%', marginTop: '12px' }}
                        >
                            Adjust Another Image
                        </button>
                    )}
                </div>
            }
            processingStage={stage}
            progress={progress}
            fileName={fileName}
            fileSize={fileSize}
            errorMessage={error}
            downloadReady={downloadReady}
            downloadUrl={downloadUrl}
            downloadFileName={downloadFileName}
            downloadFileSize={downloadFileSize}
        />
    );
}

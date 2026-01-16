'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { imageApi, pollTaskStatus, getDownloadUrl, formatFileSize } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';

const ACCEPT_FORMATS = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] };

const SIZES = [
    { id: '2x2', name: '2×2 inch (US Passport)', pixels: '600×600' },
    { id: '35x45', name: '35×45mm (EU Standard)', pixels: '413×531' },
    { id: '4x6', name: '4×6 inch (Large)', pixels: '1200×1800' },
];

const BG_COLORS = [
    { id: '#FFFFFF', name: 'White' },
    { id: '#E8F4F8', name: 'Light Blue' },
    { id: '#FF0000', name: 'Red' },
    { id: 'transparent', name: 'Transparent' },
];

export default function PassportPhotoPage() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [size, setSize] = useState('2x2');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [error, setError] = useState('');

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
            const response = await imageApi.passportPhoto(
                file, size, bgColor,
                (e: AxiosProgressEvent) => setProgress(Math.round((e.loaded / (e.total || 1)) * 30))
            );
            const taskId = response.task_id;

            setStage('processing');
            setProgress(50);

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
    }, [size, bgColor]);

    return (
        <ToolLayout
            title="Passport Photo Maker"
            subtitle="Create professional passport photos with correct dimensions"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: JPG, PNG, WEBP | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Photo Size</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {SIZES.map(s => (
                                <button key={s.id} onClick={() => setSize(s.id)} style={{ padding: '12px', display: 'flex', justifyContent: 'space-between', background: size === s.id ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${size === s.id ? 'var(--neon-blue)' : 'var(--glass-border)'}`, borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    <span>{s.name}</span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{s.pixels}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Background Color</label>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {BG_COLORS.map(c => (
                                <button key={c.id} onClick={() => setBgColor(c.id)} style={{ width: '48px', height: '48px', background: c.id === 'transparent' ? 'repeating-conic-gradient(#808080 0% 25%, transparent 0% 50%) 50% / 12px 12px' : c.id, border: `2px solid ${bgColor === c.id ? 'var(--neon-blue)' : 'var(--glass-border)'}`, borderRadius: '8px', cursor: 'pointer' }} title={c.name} />
                            ))}
                        </div>
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
        />
    );
}

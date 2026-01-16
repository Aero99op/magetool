'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { documentApi, getDownloadUrl, pollTaskStatus, formatFileSize } from '@/lib/api';

const QUALITY_OPTIONS = [
    { value: 'low', label: 'Maximum Compression', desc: 'Smallest file size' },
    { value: 'medium', label: 'Balanced', desc: 'Good quality, smaller size' },
    { value: 'high', label: 'Best Quality', desc: 'Minimal compression' },
];

const ACCEPT_FORMATS = { 'application/pdf': ['.pdf'] };

export default function PDFCompressPage() {
    const [quality, setQuality] = useState('medium');
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [downloadFileSize, setDownloadFileSize] = useState<string>();

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setDownloadReady(false);

        try {
            const response = await documentApi.compressPdf(file, quality, (e) => {
                if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
            });

            setStage('processing');
            setProgress(0);

            const completedTask = await pollTaskStatus(response.task_id, (task) => {
                setProgress(task.progress_percent || 0);
            });

            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(getDownloadUrl(response.task_id));
            setDownloadFileName(completedTask.output_filename || 'compressed.pdf');
            if (completedTask.file_size) setDownloadFileSize(formatFileSize(completedTask.file_size));
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Compression failed');
        }
    }, [quality]);

    return (
        <ToolLayout
            title="PDF Compressor"
            subtitle="Reduce PDF file size while preserving quality"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="PDF files only | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            configPanel={
                <div>
                    <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Compression Level</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {QUALITY_OPTIONS.map(opt => (
                            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: quality === opt.value ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${quality === opt.value ? 'var(--neon-blue)' : 'var(--glass-border)'}`, borderRadius: '8px', cursor: 'pointer' }}>
                                <input type="radio" name="quality" value={opt.value} checked={quality === opt.value} onChange={() => setQuality(opt.value)} style={{ accentColor: 'var(--neon-blue)' }} />
                                <div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.9rem' }}>{opt.label}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                    {stage !== 'idle' && (
                        <button onClick={() => { setStage('idle'); setDownloadReady(false); }} className="btn btn-ghost" style={{ width: '100%' }}>Compress Another</button>
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

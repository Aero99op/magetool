'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { documentApi, pollTaskStatus, getDownloadUrl, formatFileSize } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';

const ACCEPT_FORMATS = { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] };
const OUTPUT_FORMATS = ['PNG', 'JPG', 'WebP'];

export default function ToImagePage() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [format, setFormat] = useState('png');
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
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
            const response = await documentApi.toImage(
                file, format,
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
            setError(err.response?.data?.detail || err.message || 'Conversion failed');
            setStage('error');
        }
    }, [format]);

    return (
        <ToolLayout
            title="File to Image Converter"
            subtitle="Convert PDF pages or documents to image format"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="PDF, DOC, DOCX | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Output Format</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {OUTPUT_FORMATS.map(f => (
                                <button key={f} onClick={() => setFormat(f.toLowerCase())} style={{ flex: 1, padding: '10px', background: format === f.toLowerCase() ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${format === f.toLowerCase() ? 'var(--neon-blue)' : 'var(--glass-border)'}`, borderRadius: '6px', color: format === f.toLowerCase() ? 'var(--neon-blue)' : 'var(--text-primary)', cursor: 'pointer' }}>{f}</button>
                            ))}
                        </div>
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--neon-blue)' }}>Note:</strong> Multi-page PDFs will be converted as a ZIP of images.
                    </div>

                    {error && (
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', fontSize: '0.85rem' }}>
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

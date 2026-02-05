'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { documentApi, pollTaskStatus, getDownloadUrl, formatFileSize } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';
import ToolContent from '@/components/ToolContent';

const ACCEPT_FORMATS = { 'application/pdf': ['.pdf'], 'application/msword': ['.doc'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] };
const OUTPUT_FORMATS = ['PNG', 'JPG', 'WebP'];

export default function ToImageClient() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [format, setFormat] = useState('png');
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [error, setError] = useState('');
    const [taskId, setTaskId] = useState<string | null>(null);

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
                (e: AxiosProgressEvent) => setProgress(Math.round((e.loaded / (e.total || 1)) * 100))
            );

            setTaskId(response.task_id);
            setStage('uploaded');
            setProgress(100);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Upload failed');
            setStage('error');
        }
    }, [format]);

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
            setError(err.response?.data?.detail || err.message || 'Conversion failed');
            setStage('error');
        }
    }, [taskId]);

    return (
        <ToolLayout
            title="File to Image Converter"
            subtitle="Convert PDF pages or documents to image format"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="PDF, DOC, DOCX | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
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
            toolContent={
                <ToolContent
                    overview="Convert PDF pages or Word documents into high-quality images. Great for sharing documents on social media, inserting them into presentations, or viewing them on devices that don't support PDF/DOCX."
                    features={[
                        "Multi-Format Output: Save as PNG, JPG, or WebP.",
                        "Smart Conversion: Converts each page of a PDF into a separate image.",
                        "Batch Download: Automatic ZIP creation for multi-page documents.",
                        "High Quality: Preserves resolution and text clarity."
                    ]}
                    howTo={[
                        { step: "Upload Document", description: "Select your PDF or Word file." },
                        { step: "Select Format", description: "Choose JPG, PNG, or WebP output." },
                        { step: "Convert", description: "The tool renders each page as an image." },
                        { step: "Download", description: "Get your images (zipped if multiple pages)." }
                    ]}
                />
            }
        />
    );
}

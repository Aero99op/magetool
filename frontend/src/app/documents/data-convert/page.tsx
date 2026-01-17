'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { documentApi, pollTaskStatus, getDownloadUrl, formatFileSize } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';

const ACCEPT_FORMATS = { 'application/json': ['.json'], 'text/csv': ['.csv'], 'text/xml': ['.xml'], 'application/xml': ['.xml'] };

export default function DataConvertPage() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [outputFormat, setOutputFormat] = useState('csv');
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [error, setError] = useState('');
    const [taskId, setTaskId] = useState<string | null>(null);

    const formats = ['json', 'csv', 'xml'];

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];

        // Detect input format and set output to something different
        const ext = file.name.split('.').pop()?.toLowerCase() || 'json';
        const available = formats.filter(f => f !== ext);
        if (available.length > 0) setOutputFormat(available[0]);

        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setDownloadReady(false);
        setError('');

        try {
            const response = await documentApi.dataConvert(
                file, outputFormat,
                (e: AxiosProgressEvent) => setProgress(Math.round((e.loaded / (e.total || 1)) * 100))
            );

            setTaskId(response.task_id);
            setStage('uploaded');
            setProgress(100);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Upload failed');
            setStage('error');
        }
    }, [outputFormat]);

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
            title="Data Format Converter"
            subtitle="Convert between JSON, CSV, and XML formats"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={10}
            maxFiles={1}
            supportedFormatsText="JSON, CSV, XML | Max: 10MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Output Format</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {formats.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setOutputFormat(f)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        background: outputFormat === f ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${outputFormat === f ? 'var(--neon-blue)' : 'var(--glass-border)'}`,
                                        borderRadius: '6px',
                                        color: outputFormat === f ? 'var(--neon-blue)' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        textTransform: 'uppercase',
                                        fontWeight: 600
                                    }}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--neon-blue)' }}>Tip:</strong> Upload a file and select the target format. The conversion will automatically start.
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

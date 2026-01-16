'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { documentApi, getDownloadUrl, pollTaskStatus, formatFileSize } from '@/lib/api';

const ACCEPT_FORMATS = { 'application/pdf': ['.pdf'] };

export default function PDFSplitPage() {
    const [pages, setPages] = useState('1-5');
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
            const response = await documentApi.splitPdf(file, pages, (e) => {
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
            setDownloadFileName(completedTask.output_filename || 'split.pdf');
            if (completedTask.file_size) setDownloadFileSize(formatFileSize(completedTask.file_size));
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Split failed');
        }
    }, [pages]);

    return (
        <ToolLayout
            title="PDF Splitter"
            subtitle="Extract specific pages from your PDF documents"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="PDF files only | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Pages to Extract
                        </label>
                        <input type="text" value={pages} onChange={(e) => setPages(e.target.value)} placeholder="1-5, 10, 15-20" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                    </div>
                    <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        <strong style={{ color: 'var(--neon-blue)' }}>Examples:</strong>
                        <ul style={{ margin: '6px 0 0 16px', lineHeight: 1.5 }}>
                            <li>1-5 (pages 1 to 5)</li>
                            <li>1, 3, 5 (specific pages)</li>
                            <li>1-3, 7, 10-15 (mixed)</li>
                        </ul>
                    </div>
                    {stage !== 'idle' && (
                        <button onClick={() => { setStage('idle'); setDownloadReady(false); }} className="btn btn-ghost" style={{ width: '100%' }}>Split Another</button>
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

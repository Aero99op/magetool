'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { documentApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';

const ACCEPT_FORMATS = {
    'application/pdf': ['.pdf'],
};

export default function PDFMergePage() {
    const [files, setFiles] = useState<File[]>([]);
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [downloadFileSize, setDownloadFileSize] = useState<string>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFilesSelected = useCallback((newFiles: File[]) => {
        setFiles(prev => [...prev, ...newFiles].slice(0, 40));
    }, []);

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        const newFiles = [...files];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= files.length) return;
        [newFiles[index], newFiles[newIndex]] = [newFiles[newIndex], newFiles[index]];
        setFiles(newFiles);
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            setErrorMessage('Please add at least 2 PDF files to merge');
            return;
        }

        setStage('uploading');
        setProgress(0);
        setErrorMessage(undefined);
        setDownloadReady(false);

        try {
            let lastLoaded = 0;
            let lastTime = Date.now();

            const response = await documentApi.mergePdf(
                files,
                (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        setProgress(percent);

                        const now = Date.now();
                        const timeDiff = (now - lastTime) / 1000;
                        if (timeDiff > 0.5) {
                            const bytesDiff = progressEvent.loaded - lastLoaded;
                            const speed = bytesDiff / timeDiff / (1024 * 1024);
                            setUploadSpeed(`${speed.toFixed(1)} MB/s`);
                            lastLoaded = progressEvent.loaded;
                            lastTime = now;
                        }
                    }
                }
            );

            setStage('processing');
            setProgress(0);

            await startProcessing(response.task_id);
            const completedTask = await pollTaskStatus(
                response.task_id,
                (task) => {
                    setProgress(task.progress_percent || 0);
                }
            );

            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(getDownloadUrl(response.task_id));
            setDownloadFileName(completedTask.output_filename || 'merged.pdf');
            if (completedTask.file_size) {
                setDownloadFileSize(formatFileSize(completedTask.file_size));
            }

        } catch (error: any) {
            console.error('Merge error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Merge failed. Please try again.');
        }
    };

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage(undefined);
        setFiles([]);
    };

    const totalSize = files.reduce((acc, f) => acc + f.size, 0);

    return (
        <ToolLayout
            title="PDF Merger"
            subtitle="Combine multiple PDF files into a single document"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={40}
            supportedFormatsText="PDF files only | Max 40 files | 50MB each"
            onFilesSelected={handleFilesSelected}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                            Files to merge ({files.length}/40)
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Total size: {formatFileSize(totalSize)}
                        </p>
                    </div>

                    {files.length > 0 && (
                        <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
                            {files.map((file, index) => (
                                <motion.div
                                    key={`${file.name}-${index}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 12px',
                                        marginBottom: '4px',
                                        background: 'rgba(255, 255, 255, 0.03)',
                                        borderRadius: '6px',
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {index + 1}. {file.name}
                                    </span>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={() => moveFile(index, 'up')}
                                            disabled={index === 0}
                                            style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: index === 0 ? 0.3 : 1 }}
                                        >↑</button>
                                        <button
                                            onClick={() => moveFile(index, 'down')}
                                            disabled={index === files.length - 1}
                                            style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', opacity: index === files.length - 1 ? 0.3 : 1 }}
                                        >↓</button>
                                        <button
                                            onClick={() => removeFile(index)}
                                            style={{ padding: '4px 8px', background: 'transparent', border: 'none', color: '#FF4444', cursor: 'pointer' }}
                                        >×</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {files.length >= 2 && stage === 'idle' && (
                        <button
                            onClick={handleMerge}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            Merge {files.length} PDFs
                        </button>
                    )}

                    {stage !== 'idle' && (
                        <button onClick={resetState} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>
                            Merge More PDFs
                        </button>
                    )}
                </div>
            }
            processingStage={stage}
            progress={progress}
            uploadSpeed={uploadSpeed}
            fileName={`${files.length} PDF files`}
            fileSize={formatFileSize(totalSize)}
            errorMessage={errorMessage}
            downloadReady={downloadReady}
            downloadUrl={downloadUrl}
            downloadFileName={downloadFileName}
            downloadFileSize={downloadFileSize}
        />
    );
}

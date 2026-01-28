'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { documentApi, pollTaskStatus, getDownloadUrl, formatFileSize, startProcessing } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';
import ToolContent from '@/components/ToolContent';

const ACCEPT_FORMATS = { 'application/pdf': ['.pdf'] };

export default function PDFUnlockPage() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [password, setPassword] = useState('');
    const [currentFile, setCurrentFile] = useState<File | null>(null);
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [error, setError] = useState('');

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setCurrentFile(file);
        setStage('idle');
        setDownloadReady(false);
        setError('');
    }, []);

    const handleUnlock = async () => {
        if (!currentFile || !password) return;

        setStage('processing');
        setProgress(30);
        setError('');

        try {
            const response = await documentApi.unlockPdf(
                currentFile, password,
                (e: AxiosProgressEvent) => setProgress(Math.round((e.loaded / (e.total || 1)) * 30))
            );
            const taskId = response.task_id;

            setProgress(50);
            await startProcessing(taskId);
            const result = await pollTaskStatus(taskId, (status) => {
                setProgress(status.progress_percent || 60);
            });

            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(result.output_filename);
            setStage('complete');
            setDownloadReady(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to unlock PDF. Check password.');
            setStage('error');
        }
    };

    return (
        <ToolLayout
            title="PDF Unlocker"
            subtitle="Remove password protection from PDFs (requires correct password)"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={100}
            maxFiles={1}
            supportedFormatsText="PDF files only | Max: 100MB"
            onFilesSelected={handleFilesSelected}
            configPanel={
                <div>
                    {currentFile && (
                        <>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Current Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter PDF password" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                            </div>

                            {error && (
                                <div style={{ padding: '12px', marginBottom: '16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', fontSize: '0.85rem' }}>
                                    {error}
                                </div>
                            )}

                            {!downloadReady && (
                                <button onClick={handleUnlock} className="btn btn-primary" style={{ width: '100%' }} disabled={!password || stage === 'processing'}>
                                    {stage === 'processing' ? '⏳ Unlocking...' : '🔓 Unlock PDF'}
                                </button>
                            )}
                        </>
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
                    overview="Remove password protection from your PDF files so they can be opened and edited freely. If you have a legally accessible PDF that is locked and you know the password, this tool removes the restriction permanently for easier future access."
                    features={[
                        "Permanent Unlocking: Creates a new, unprotected copy of your file.",
                        "Hassle-Free Access: No need to type the password every time you open the file.",
                        "Secure Processing: Your password and file are used only for unlocking and then discarded.",
                        "Fast & Easy: Unlocks in moments."
                    ]}
                    howTo={[
                        { step: "Upload Locked PDF", description: "Select the password-protected file." },
                        { step: "Enter Password", description: "Type the correct password to authorize the unlocking." },
                        { step: "Unlock", description: "Click button to strip the security." },
                        { step: "Download", description: "Save the fully accessible PDF." }
                    ]}
                />
            }
        />
    );
}

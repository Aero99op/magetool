'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { documentApi, pollTaskStatus, getDownloadUrl, formatFileSize, startProcessing } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';
import ToolContent from '@/components/ToolContent';

const ACCEPT_FORMATS = { 'application/pdf': ['.pdf'] };

export default function PDFProtectPage() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleProtect = async () => {
        if (!currentFile || !password) return;
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setStage('processing');
        setProgress(30);
        setError('');

        try {
            const response = await documentApi.protectPdf(
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
            setError(err.response?.data?.detail || err.message || 'Failed to protect PDF');
            setStage('error');
        }
    };

    return (
        <ToolLayout
            title="PDF Password Protector"
            subtitle="Add password protection to your PDF documents"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={100}
            maxFiles={1}
            supportedFormatsText="PDF files only | Max: 100MB"
            onFilesSelected={handleFilesSelected}
            configPanel={
                <div>
                    {currentFile && (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Password</label>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Confirm Password</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }} />
                            </div>

                            {error && (
                                <div style={{ padding: '12px', marginBottom: '16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', fontSize: '0.85rem' }}>
                                    {error}
                                </div>
                            )}

                            {!downloadReady && (
                                <button onClick={handleProtect} className="btn btn-primary" style={{ width: '100%' }} disabled={!password || password !== confirmPassword || stage === 'processing'}>
                                    {stage === 'processing' ? '⏳ Protecting...' : '🔒 Protect PDF'}
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
                    overview="Secure your sensitive PDF documents with strong password protection. This tool encrypts your PDF file so it can only be opened by those who have the password. Ideal for bank statements, contracts, or personal records."
                    features={[
                        "Strong Encryption: Applies standard PDF security to prevent unauthorized access.",
                        "Instant Locking: Protects your file in seconds.",
                        "Zero Storage: The file is encrypted and returned immediately; we don't store your data or password.",
                        "Universal Compatibility: Protected PDFs open in all standard readers (Adobe, Chrome, etc.)."
                    ]}
                    howTo={[
                        { step: "Upload PDF", description: "Select the PDF file you want to secure." },
                        { step: "Set Password", description: "Enter a strong password and confirm it." },
                        { step: "Protect", description: "Click to apply the encryption." },
                        { step: "Download", description: "Save your now-secure PDF." }
                    ]}
                />
            }
        />
    );
}

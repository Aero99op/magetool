'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { imageApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

const ACCEPT_FORMATS = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
};

export default function BackgroundRemoverPage() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState<string>();
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [downloadFileSize, setDownloadFileSize] = useState<string>();
    const [taskId, setTaskId] = useState<string | null>(null);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        const file = files[0];
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setErrorMessage(undefined);
        setDownloadReady(false);

        try {
            let lastLoaded = 0;
            let lastTime = Date.now();

            const response = await imageApi.removeBackground(
                file,
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

            setTaskId(response.task_id);
            setStage('uploaded');
            setProgress(100);

        } catch (error: any) {
            console.error('Upload error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Upload failed. Please try again.');
        }
    }, []);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;

        setStage('processing');
        setProgress(0);

        try {
            await startProcessing(taskId);
            const completedTask = await pollTaskStatus(
                taskId,
                (task) => {
                    setProgress(task.progress_percent || 0);
                }
            );

            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(completedTask.output_filename || 'no_background.png');
            if (completedTask.file_size) {
                setDownloadFileSize(formatFileSize(completedTask.file_size));
            }

        } catch (error: any) {
            console.error('Processing error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Background removal failed. Please try again.');
        }
    }, [taskId]);

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage(undefined);
        setTaskId(null);
    };

    return (
        <ToolLayout
            title="Background Remover"
            subtitle="Remove backgrounds from images using AI - perfect for product photos and portraits"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: JPG, PNG, WebP | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{ padding: '16px', background: 'rgba(0, 255, 255, 0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', background: 'rgba(0, 255, 255, 0.2)', borderRadius: '3px', color: '#00FFFF' }}>
                                AI
                            </span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>Powered by AI</span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            Automatically detects and removes image backgrounds with high precision. Works best with clear subjects.
                        </p>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--neon-blue)' }}>Best for:</strong>
                        <ul style={{ margin: '8px 0 0 16px', lineHeight: 1.6 }}>
                            <li>Product photos</li>
                            <li>Portraits & headshots</li>
                            <li>Logo extraction</li>
                            <li>Creating transparent PNGs</li>
                        </ul>
                    </div>

                    {stage !== 'idle' && (
                        <button onClick={resetState} className="btn btn-ghost" style={{ width: '100%', marginTop: '20px' }}>
                            Remove Another Background
                        </button>
                    )}
                </div>
            }
            processingStage={stage}
            progress={progress}
            uploadSpeed={uploadSpeed}
            fileName={fileName}
            fileSize={fileSize}
            errorMessage={errorMessage}
            downloadReady={downloadReady}
            downloadUrl={downloadUrl}
            downloadFileName={downloadFileName}
            downloadFileSize={downloadFileSize}
            toolContent={
                <ToolContent
                    overview="Remove image backgrounds automatically in seconds. Our AI-powered tool detects the subject and creates a transparent background with high precision. Perfect for e-commerce product photos, marketing materials, and portraits."
                    features={[
                        "AI Precision: Accurately handles hair, fur, and complex edges.",
                        "Instant Transparency: Returns a PNG file with a transparent background.",
                        "No Editing Skills Needed: Just upload and let the AI do the work.",
                        "High Resolution: Maintains original image quality."
                    ]}
                    howTo={[
                        { step: "Upload Image", description: "Select the image to process." },
                        { step: "AI Processing", description: "Wait a few seconds for automatic removal." },
                        { step: "Download", description: "Save your transparent PNG." }
                    ]}
                />
            }
        />
    );
}

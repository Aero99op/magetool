'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { imageApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

const ACCEPT_FORMATS = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'],
};

export default function ImageResizerPage() {
    const [width, setWidth] = useState('800');
    const [height, setHeight] = useState('600');
    const [lockAspect, setLockAspect] = useState(true);
    const [originalWidth, setOriginalWidth] = useState(0);
    const [originalHeight, setOriginalHeight] = useState(0);
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
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        const file = files[0];
        setSelectedFile(file);
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setErrorMessage(undefined);

        // Get original dimensions
        const img = new Image();
        img.onload = () => {
            setOriginalWidth(img.width);
            setOriginalHeight(img.height);
            setWidth(String(img.width));
            setHeight(String(img.height));
        };
        img.src = URL.createObjectURL(file);
    }, []);

    const handleWidthChange = (newWidth: string) => {
        setWidth(newWidth);
        if (lockAspect && originalWidth && originalHeight) {
            const ratio = originalHeight / originalWidth;
            setHeight(String(Math.round(parseInt(newWidth) * ratio)));
        }
    };

    const handleHeightChange = (newHeight: string) => {
        setHeight(newHeight);
        if (lockAspect && originalWidth && originalHeight) {
            const ratio = originalWidth / originalHeight;
            setWidth(String(Math.round(parseInt(newHeight) * ratio)));
        }
    };

    const handleResize = async () => {
        if (!selectedFile) return;

        const w = parseInt(width);
        const h = parseInt(height);

        if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
            setErrorMessage('Please enter valid dimensions');
            return;
        }

        if (w > 10000 || h > 10000) {
            setErrorMessage('Maximum dimension is 10000px');
            return;
        }

        setStage('uploading');
        setProgress(0);
        setDownloadReady(false);

        try {
            let lastLoaded = 0;
            let lastTime = Date.now();

            const response = await imageApi.resize(
                selectedFile,
                w,
                h,
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
            setDownloadFileName(completedTask.output_filename || 'resized.png');
            if (completedTask.file_size) {
                setDownloadFileSize(formatFileSize(completedTask.file_size));
            }

        } catch (error: any) {
            console.error('Resize error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Resize failed. Please try again.');
        }
    };

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage(undefined);
        setSelectedFile(null);
    };

    return (
        <ToolLayout
            title="Image Resizer"
            subtitle="Resize images to exact pixel dimensions while maintaining quality"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: JPG, PNG, WebP, GIF, BMP, TIFF | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            configPanel={
                <div>
                    {originalWidth > 0 && (
                        <div style={{ marginBottom: '16px', padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Original: {originalWidth} × {originalHeight} px
                            </p>
                        </div>
                    )}

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Width (px)
                        </label>
                        <input
                            type="number"
                            value={width}
                            onChange={(e) => handleWidthChange(e.target.value)}
                            min="1"
                            max="10000"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Height (px)
                        </label>
                        <input
                            type="number"
                            value={height}
                            onChange={(e) => handleHeightChange(e.target.value)}
                            min="1"
                            max="10000"
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                            }}
                        />
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={lockAspect}
                            onChange={(e) => setLockAspect(e.target.checked)}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--neon-blue)' }}
                        />
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Lock aspect ratio</span>
                    </label>

                    {selectedFile && stage === 'idle' && (
                        <button
                            onClick={handleResize}
                            className="btn btn-primary"
                            style={{ width: '100%' }}
                        >
                            Resize to {width} × {height}
                        </button>
                    )}

                    {stage !== 'idle' && (
                        <button onClick={resetState} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>
                            Resize Another
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
                    overview="Resize images to specific dimensions instantly. Scale up or down while preserving aspect ratio. Ideal for reducing file size for web use or meeting social media requirements."
                    features={[
                        "Precise Dimensions: Enter exact Width and Height.",
                        "Aspect Ratio Lock: Keep your image from stretching.",
                        "High Speed: Resizes instantly on the server.",
                        "Format Support: Works with JPG, PNG, WEBP, and more."
                    ]}
                    howTo={[
                        { step: "Upload Image", description: "Select the image to resize." },
                        { step: "Set Size", description: "Enter desired dimensions." },
                        { step: "Resize", description: "Click to process." },
                        { step: "Download", description: "Save the resized image." }
                    ]}
                />
            }
        />
    );
}

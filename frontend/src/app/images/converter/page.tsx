'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { imageApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

const OUTPUT_FORMATS = [
    { value: 'jpg', label: 'JPEG (.jpg)' },
    { value: 'png', label: 'PNG (.png)' },
    { value: 'webp', label: 'WebP (.webp)' },
    { value: 'gif', label: 'GIF (.gif)' },
    { value: 'bmp', label: 'BMP (.bmp)' },
    { value: 'ico', label: 'ICO (.ico)' },
    { value: 'tiff', label: 'TIFF (.tiff)' },
];

const ACCEPT_FORMATS = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.heic', '.heif', '.tiff', '.tif', '.svg'],
};

export default function ImageConverterPage() {
    const [outputFormat, setOutputFormat] = useState('webp');
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [uploadSpeed, setUploadSpeed] = useState<string>();
    const [estimatedTime, setEstimatedTime] = useState<string>();
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [downloadFileSize, setDownloadFileSize] = useState<string>();

    // Store file and task info for processing
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [taskId, setTaskId] = useState<string | null>(null);

    // Step 1: Upload file only (no processing yet)
    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        const file = files[0];
        setUploadedFile(file);
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setErrorMessage(undefined);
        setDownloadReady(false);

        try {
            let lastLoaded = 0;
            let lastTime = Date.now();

            const response = await imageApi.convert(
                file,
                outputFormat,
                (progressEvent) => {
                    if (progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                        setProgress(percent);

                        // Calculate upload speed
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

            // Upload complete - wait for user to click "Process"
            setTaskId(response.task_id);
            setStage('uploaded');
            setProgress(100);

        } catch (error: any) {
            console.error('Upload error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Upload failed. Please try again.');
        }
    }, [outputFormat]);

    // Step 2: Process file (triggered by user clicking "Process" button)
    const handleProcess = useCallback(async () => {
        if (!taskId) return;

        setStage('processing');
        setProgress(0);

        try {
            await startProcessing(taskId);
            // Poll for task completion
            const completedTask = await pollTaskStatus(
                taskId,
                (task) => {
                    setProgress(task.progress_percent || 0);
                    if (task.estimated_time_remaining_seconds) {
                        setEstimatedTime(`${task.estimated_time_remaining_seconds} seconds`);
                    }
                }
            );

            // Download ready
            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(completedTask.output_filename || `converted.${outputFormat}`);
            if (completedTask.file_size) {
                setDownloadFileSize(formatFileSize(completedTask.file_size));
            }

        } catch (error: any) {
            console.error('Processing error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Processing failed. Please try again.');
        }
    }, [taskId, outputFormat]);

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage(undefined);
        setUploadedFile(null);
        setTaskId(null);
    };

    return (
        <ToolLayout
            title="Image Format Converter"
            subtitle="Convert images between JPG, PNG, WebP, GIF, and more formats"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: JPG, PNG, WebP, GIF, BMP, HEIC, TIFF, SVG"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <label
                        htmlFor="output-format"
                        style={{
                            display: 'block',
                            marginBottom: '8px',
                            fontSize: '0.875rem',
                            color: 'var(--text-secondary)',
                        }}
                    >
                        Output Format
                    </label>
                    <select
                        id="output-format"
                        value={outputFormat}
                        onChange={(e) => setOutputFormat(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            cursor: 'pointer',
                        }}
                    >
                        {OUTPUT_FORMATS.map((format) => (
                            <option key={format.value} value={format.value}>
                                {format.label}
                            </option>
                        ))}
                    </select>

                    <div
                        style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: 'rgba(0, 217, 255, 0.05)',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            color: 'var(--text-muted)',
                        }}
                    >
                        <strong style={{ color: 'var(--neon-blue)' }}>Tips:</strong>
                        <ul style={{ margin: '8px 0 0 16px', lineHeight: 1.6 }}>
                            <li>WebP offers best compression</li>
                            <li>PNG for transparency</li>
                            <li>JPG for photographs</li>
                        </ul>
                    </div>

                    {(stage !== 'idle') && (
                        <button
                            onClick={resetState}
                            style={{
                                marginTop: '20px',
                                width: '100%',
                                padding: '10px',
                                background: 'transparent',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: 'var(--text-secondary)',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                            }}
                        >
                            Convert Another
                        </button>
                    )}
                </div>
            }
            processingStage={stage}
            progress={progress}
            uploadSpeed={uploadSpeed}
            estimatedTime={estimatedTime}
            fileName={fileName}
            fileSize={fileSize}
            errorMessage={errorMessage}
            downloadReady={downloadReady}
            downloadUrl={downloadUrl}
            downloadFileName={downloadFileName}
            downloadFileSize={downloadFileSize}
            toolContent={
                <ToolContent
                    overview="Convert images between all popular formats. Need a JPG for a form, a PNG for transparency, or a WebP for speed? Our Universal Image Converter handles it all."
                    features={[
                        "Many Formats: Convert to JPG, PNG, WEBP, GIF, BMP, TIFF, ICO.",
                        "Batch Processing: Convert single files quickly.",
                        "Smart Compression: Optimizes file size based on format.",
                        "Privacy Secure: Files are deleted after processing."
                    ]}
                    howTo={[
                        { step: "Upload Image", description: "Select the image you want to convert." },
                        { step: "Select Format", description: "Choose output format (e.g., to PNG)." },
                        { step: "Convert", description: "Process the conversion." },
                        { step: "Download", description: "Save your new image file." }
                    ]}
                />
            }
        />
    );
}

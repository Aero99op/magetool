'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { videoApi, getDownloadUrl, pollTaskStatus, formatFileSize } from '@/lib/api';
import ToolContent from '@/components/ToolContent';
import { isFFmpegSupported, convertVideoClient } from '@/lib/ffmpeg-client';

const OUTPUT_FORMATS = [
    { value: 'mp4', label: 'MP4 (.mp4)' },
    { value: 'mkv', label: 'MKV (.mkv)' },
    { value: 'avi', label: 'AVI (.avi)' },
    { value: 'mov', label: 'MOV (.mov)' },
    { value: 'webm', label: 'WebM (.webm)' },
    { value: 'gif', label: 'GIF (.gif)' },
];

const RESOLUTIONS = [
    { value: '', label: 'Auto (Original)' },
    { value: '360p', label: '360p' },
    { value: '480p', label: '480p' },
    { value: '720p', label: '720p HD' },
    { value: '1080p', label: '1080p Full HD' },
];

const ACCEPT_FORMATS = {
    'video/*': ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv', '.m4v'],
};

export default function VideoConverterPage() {
    const [outputFormat, setOutputFormat] = useState('mp4');
    const [resolution, setResolution] = useState('');
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
    const [taskId, setTaskId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isClientSide, setIsClientSide] = useState(false);

    // Client-side processing fallback
    const processClientSide = useCallback(async (file: File) => {
        setIsClientSide(true);
        setStage('processing');
        setEstimatedTime('Processing in your browser (server busy)...');
        setProgress(0);

        try {
            const outputBlob = await convertVideoClient(
                file,
                outputFormat,
                (message) => {
                    setEstimatedTime(message);
                    // Simulate progress from messages
                    if (message.includes('%')) {
                        const match = message.match(/(\d+)%/);
                        if (match) setProgress(parseInt(match[1]));
                    }
                }
            );

            // Create download URL from blob
            const blobUrl = URL.createObjectURL(outputBlob);
            const baseName = file.name.replace(/\.[^/.]+$/, '');

            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(blobUrl);
            setDownloadFileName(`${baseName}_converted.${outputFormat}`);
            setDownloadFileSize(formatFileSize(outputBlob.size));

        } catch (error: any) {
            console.error('Client-side processing error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Browser processing failed.');
        }
    }, [outputFormat]);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        const file = files[0];
        setSelectedFile(file);
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setErrorMessage(undefined);
        setDownloadReady(false);
        setIsClientSide(false);

        try {
            let lastLoaded = 0;
            let lastTime = Date.now();

            const response = await videoApi.convert(
                file,
                outputFormat,
                { resolution },
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

            // Check if server error - fallback to client-side
            const isServerError = error.message?.includes('502') ||
                error.message?.includes('503') ||
                error.message?.includes('Network Error') ||
                error.message?.includes('timeout');

            if (isServerError && isFFmpegSupported()) {
                console.log('Server busy, falling back to client-side processing...');
                await processClientSide(file);
            } else {
                setStage('error');
                setErrorMessage(error.message || 'Upload failed. Please try again.');
            }
        }
    }, [outputFormat, resolution, processClientSide]);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;

        setStage('processing');
        setProgress(0);
        setEstimatedTime('Starting processing...');

        try {
            // Trigger backend processing via /start endpoint
            const { startProcessing } = await import('@/lib/api');
            await startProcessing(taskId);

            setEstimatedTime('Processing video... This may take several minutes');

            const completedTask = await pollTaskStatus(
                taskId,
                (task) => {
                    setProgress(task.progress_percent || 0);
                    if (task.estimated_time_remaining_seconds) {
                        setEstimatedTime(`${task.estimated_time_remaining_seconds} seconds`);
                    }
                }
            );

            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(completedTask.output_filename || `converted.${outputFormat}`);
            if (completedTask.file_size) {
                setDownloadFileSize(formatFileSize(completedTask.file_size));
            }

        } catch (error: any) {
            console.error('Processing error:', error);

            // Check if server error - fallback to client-side
            const isServerError = error.message?.includes('502') ||
                error.message?.includes('503') ||
                error.message?.includes('Network Error') ||
                error.message?.includes('Task failed');

            if (isServerError && isFFmpegSupported() && selectedFile) {
                console.log('Server failed, falling back to client-side processing...');
                await processClientSide(selectedFile);
            } else {
                setStage('error');
                setErrorMessage(error.message || 'Processing failed. Please try again.');
            }
        }
    }, [taskId, outputFormat, selectedFile, processClientSide]);

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage(undefined);
        setTaskId(null);
        setSelectedFile(null);
        setIsClientSide(false);
    };

    return (
        <ToolLayout
            title="Video Format Converter"
            subtitle="Convert videos between MP4, MKV, AVI, MOV, WebM, and GIF"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={500}
            maxFiles={1}
            supportedFormatsText="Supported: MP4, MKV, AVI, MOV, WebM, FLV | Max: 500MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Output Format
                        </label>
                        <select
                            value={outputFormat}
                            onChange={(e) => setOutputFormat(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'var(--glass-bg-hover)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                            }}
                        >
                            {OUTPUT_FORMATS.map((format) => (
                                <option key={format.value} value={format.value}>{format.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Resolution
                        </label>
                        <select
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'var(--glass-bg-hover)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                            }}
                        >
                            {RESOLUTIONS.map((res) => (
                                <option key={res.value} value={res.value}>{res.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Client-side processing indicator */}
                    {isClientSide && (
                        <div style={{
                            padding: '12px',
                            marginBottom: '16px',
                            background: 'rgba(255, 193, 7, 0.1)',
                            border: '1px solid rgba(255, 193, 7, 0.3)',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            color: '#ffc107'
                        }}>
                            ⚡ Processing in your browser (servers busy)
                        </div>
                    )}

                    {/* FFmpeg support indicator */}
                    {typeof window !== 'undefined' && !isFFmpegSupported() && (
                        <div style={{
                            padding: '12px',
                            marginBottom: '16px',
                            background: 'rgba(255, 100, 100, 0.1)',
                            border: '1px solid rgba(255, 100, 100, 0.3)',
                            borderRadius: '8px',
                            fontSize: '0.8rem',
                            color: '#ff6b6b'
                        }}>
                            ⚠️ Browser fallback not available (use Chrome/Firefox)
                        </div>
                    )}

                    {stage !== 'idle' && (
                        <button onClick={resetState} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>
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
                    overview="Convert videos between all major formats effortlessly. Whether you need an MP4 for the web, an MKV for archiving, or a GIF/WebM for memes, this tool handles it all. Supports client-side fallback for privacy and speed."
                    features={[
                        "Universal Format Support: MP4, MKV, AVI, MOV, WebM, and GIF.",
                        "Resolution Control: Resize videos to 1080p, 720p, 480p, or 360p.",
                        "Hybrid Processing: Uses high-speed servers or your own browser (via WebAssembly) for conversion.",
                        "No Limits: Convert files of various sizes and codecs."
                    ]}
                    howTo={[
                        { step: "Upload Video", description: "Select your source video file." },
                        { step: "Configure", description: "Choose output format (e.g., MP4) and resolution." },
                        { step: "Convert", description: "Click to start the transcoding process." },
                        { step: "Download", description: "Save your converted video." }
                    ]}
                />
            }
        />
    );
}

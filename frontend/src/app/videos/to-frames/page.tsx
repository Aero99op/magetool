'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { videoApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

const FORMAT_OPTIONS = [
    { value: 'jpg', label: 'JPG (Smaller size)' },
    { value: 'png', label: 'PNG (Lossless)' },
];

const FRAME_RATE_OPTIONS = [
    { value: '', label: 'All Frames (Original FPS)' },
    { value: '1', label: '1 FPS (1 frame per second)' },
    { value: '2', label: '2 FPS (2 frames per second)' },
    { value: '5', label: '5 FPS' },
    { value: '10', label: '10 FPS' },
    { value: '24', label: '24 FPS' },
    { value: '30', label: '30 FPS' },
];

const ACCEPT_FORMATS = {
    'video/*': ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv', '.m4v'],
};

export default function VideoToFramesPage() {
    const [outputFormat, setOutputFormat] = useState('jpg');
    const [frameRate, setFrameRate] = useState('');
    const [quality, setQuality] = useState(95);
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
    const [originalFileName, setOriginalFileName] = useState<string>('');

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        const file = files[0];
        setOriginalFileName(file.name);
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setErrorMessage(undefined);
        setDownloadReady(false);

        try {
            let lastLoaded = 0;
            let lastTime = Date.now();

            const response = await videoApi.toFrames(
                file,
                outputFormat,
                frameRate ? parseFloat(frameRate) : undefined,
                outputFormat === 'jpg' ? quality : undefined,
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
    }, [outputFormat, frameRate, quality]);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;

        setStage('processing');
        setProgress(0);
        setEstimatedTime('Extracting frames...');

        try {
            await startProcessing(taskId);
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
            const baseName = originalFileName.replace(/\.[^.]+$/, '');
            setDownloadFileName(completedTask.output_filename || `${baseName}_frames.zip`);
            if (completedTask.file_size) {
                setDownloadFileSize(formatFileSize(completedTask.file_size));
            }

        } catch (error: any) {
            console.error('Processing error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Frame extraction failed. Please try again.');
        }
    }, [taskId, originalFileName]);

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage(undefined);
        setTaskId(null);
    };

    return (
        <ToolLayout
            title="Video to Frames"
            subtitle="Extract all frames from video as a ZIP of images"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={200}
            maxFiles={1}
            supportedFormatsText="Supported: MP4, MKV, AVI, MOV, WebM | Max: 200MB"
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
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                            }}
                        >
                            {FORMAT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Frame Rate
                        </label>
                        <select
                            value={frameRate}
                            onChange={(e) => setFrameRate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                            }}
                        >
                            {FRAME_RATE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Lower FPS = fewer frames, smaller ZIP
                        </p>
                    </div>

                    {outputFormat === 'jpg' && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                JPG Quality: {quality}%
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="100"
                                value={quality}
                                onChange={(e) => setQuality(parseInt(e.target.value))}
                                style={{
                                    width: '100%',
                                    accentColor: '#0099FF',
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                <span>Smaller</span>
                                <span>Better</span>
                            </div>
                        </div>
                    )}

                    {stage !== 'idle' && (
                        <button onClick={resetState} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>
                            Extract Another
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
                    overview="Extract every frame from your video as individual images. Perfect for creating thumbnails, analyzing footage, or converting video to image sequences. Download all frames in a convenient ZIP file."
                    features={[
                        "JPG or PNG: Choose between smaller JPG files or lossless PNG quality.",
                        "Frame Rate Control: Extract all frames or specify FPS (1-30 fps).",
                        "Quality Slider: Adjust JPG compression for size vs quality trade-off.",
                        "ZIP Download: All frames neatly packaged in a single downloadable archive."
                    ]}
                    howTo={[
                        { step: "Upload Video", description: "Select your video file (MP4, MKV, AVI, etc.)." },
                        { step: "Configure", description: "Choose format (JPG/PNG), frame rate, and quality." },
                        { step: "Extract", description: "Click to start frame extraction." },
                        { step: "Download", description: "Get your ZIP file with all extracted frames." }
                    ]}
                />
            }
        />
    );
}

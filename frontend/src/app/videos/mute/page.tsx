'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { videoApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

const ACCEPT_FORMATS = {
    'video/*': ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv', '.m4v'],
};

export default function MuteVideoPage() {
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
    const [originalFile, setOriginalFile] = useState<File | null>(null);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        const file = files[0];
        setOriginalFile(file);
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setErrorMessage(undefined);
        setDownloadReady(false);

        try {
            let lastLoaded = 0;
            let lastTime = Date.now();

            const response = await videoApi.mute(
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
        if (!taskId || !originalFile) return;

        setStage('processing');
        setProgress(0);
        setEstimatedTime('Removing audio...');

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
            const baseName = originalFile.name.replace(/\.[^.]+$/, '');
            const ext = originalFile.name.split('.').pop();
            setDownloadFileName(completedTask.output_filename || `${baseName}_muted.${ext}`);
            if (completedTask.file_size) {
                setDownloadFileSize(formatFileSize(completedTask.file_size));
            }

        } catch (error: any) {
            console.error('Processing error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Failed to mute video. Please try again.');
        }
    }, [taskId, originalFile]);

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage(undefined);
        setTaskId(null);
        setOriginalFile(null);
    };

    return (
        <ToolLayout
            title="Mute Video"
            subtitle="Remove audio track from any video - perfect for creating silent clips"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={500}
            maxFiles={1}
            supportedFormatsText="Supported: MP4, MKV, AVI, MOV, WebM | Max: 500MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{
                        padding: '20px',
                        background: 'rgba(0, 217, 255, 0.1)',
                        borderRadius: '12px',
                        marginBottom: '16px',
                        textAlign: 'center',
                    }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔇</div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                            Simply upload a video and we&apos;ll remove all audio
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            Video quality will be preserved • Fast processing
                        </p>
                    </div>

                    {stage !== 'idle' && (
                        <button onClick={resetState} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>
                            Mute Another Video
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
                    overview="Remove audio from your video files instantly. Whether it's to remove background noise, copyright music, or just to create a silent clip, our Mute Video tool removes the audio track completely without re-encoding the video stream."
                    features={[
                        "Lossless Video: Removes audio track without touching video quality.",
                        "Lightning Fast: Processing takes seconds as no re-encoding is needed.",
                        "Clean Output: Resulting file is strictly video-only.",
                        "Wide Support: Works with MP4, AVI, MKV, MOV, etc."
                    ]}
                    howTo={[
                        { step: "Upload Video", description: "Select the video you want to silence." },
                        { step: "Process", description: "Click to remove the audio track." },
                        { step: "Download", description: "Get your silent video file." }
                    ]}
                />
            }
        />
    );
}

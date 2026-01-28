'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { videoApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

const OUTPUT_FORMATS = [
    { value: 'mp4', label: 'MP4 (.mp4)' },
    { value: 'mkv', label: 'MKV (.mkv)' },
    { value: 'avi', label: 'AVI (.avi)' },
    { value: 'mov', label: 'MOV (.mov)' },
    { value: 'webm', label: 'WebM (.webm)' },
];

const ACCEPT_FORMATS = {
    'video/*': ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv', '.m4v'],
};

export default function VideoMergerPage() {
    const [outputFormat, setOutputFormat] = useState('mp4');
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
    const [fileCount, setFileCount] = useState(0);
    const [taskId, setTaskId] = useState<string | null>(null);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length < 2) {
            setErrorMessage('Please select at least 2 videos to merge');
            setStage('error');
            return;
        }

        setFileCount(files.length);
        setFileName(`${files.length} videos selected`);
        const totalSize = files.reduce((acc, f) => acc + f.size, 0);
        setFileSize(formatFileSize(totalSize));
        setStage('uploading');
        setProgress(0);
        setErrorMessage(undefined);
        setDownloadReady(false);

        try {
            let lastLoaded = 0;
            let lastTime = Date.now();

            const response = await videoApi.merge(
                files,
                outputFormat,
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
    }, [outputFormat]);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;

        setStage('processing');
        setProgress(0);
        setEstimatedTime('Merging videos... This may take several minutes');

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
            setDownloadFileName(completedTask.output_filename || `merged.${outputFormat}`);
            if (completedTask.file_size) {
                setDownloadFileSize(formatFileSize(completedTask.file_size));
            }

        } catch (error: any) {
            console.error('Processing error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Merge failed. Please try again.');
        }
    }, [taskId, outputFormat]);

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage(undefined);
        setFileCount(0);
        setTaskId(null);
    };

    return (
        <ToolLayout
            title="Video Merger"
            subtitle="Combine multiple videos into one seamless file"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={500}
            maxFiles={10}
            supportedFormatsText="Select 2-10 videos | Supported: MP4, MKV, AVI, MOV, WebM | Max: 500MB each"
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
                            {OUTPUT_FORMATS.map((format) => (
                                <option key={format.value} value={format.value}>{format.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{
                        padding: '12px',
                        background: 'rgba(0, 217, 255, 0.1)',
                        borderRadius: '8px',
                        marginBottom: '16px',
                    }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                            💡 Videos will be merged in the order selected. For best results, use videos with the same resolution and codec.
                        </p>
                    </div>

                    {stage !== 'idle' && (
                        <button onClick={resetState} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>
                            Merge More Videos
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
                    overview="Join multiple video clips into a single movie instantly. Our Video Merger concatenates your files seamlessly, maintaining the quality of your clips. Ideal for creating compilations, highlight reels, or combining parts of a recording."
                    features={[
                        "Batch Merging: Combine up to 10 videos at once.",
                        "Sequential Ordering: Videos are joined in the order you upload them.",
                        "Universal Output: Save result as MP4, MKV, AVI, etc.",
                        "Smart Concatenation: Efficient processing for files with same codecs."
                    ]}
                    howTo={[
                        { step: "Upload Videos", description: "Select multiple video files." },
                        { step: "Select Output", description: "Choose the target format for the merged file." },
                        { step: "Merge", description: "Click to join the clips together." },
                        { step: "Download", description: "Get your single combined video." }
                    ]}
                />
            }
        />
    );
}

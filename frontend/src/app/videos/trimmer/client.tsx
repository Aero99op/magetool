'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { videoApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

const ACCEPT_FORMATS = { 'video/*': ['.mp4', '.mkv', '.avi', '.mov', '.webm'] };

export default function VideoTrimmerClient() {
    const [startTime, setStartTime] = useState('00:00:00');
    const [endTime, setEndTime] = useState('00:00:30');
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
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
        setDownloadReady(false);

        try {
            const response = await videoApi.trim(file, startTime, endTime, (e) => {
                if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
            });

            setTaskId(response.task_id);
            setStage('uploaded');
            setProgress(100);
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Upload failed');
        }
    }, [startTime, endTime]);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;
        setStage('processing');
        setProgress(0);

        try {
            await startProcessing(taskId);
            const completedTask = await pollTaskStatus(taskId, (task) => {
                setProgress(task.progress_percent || 0);
            });

            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(completedTask.output_filename || 'trimmed.mp4');
            if (completedTask.file_size) setDownloadFileSize(formatFileSize(completedTask.file_size));
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Trim failed');
        }
    }, [taskId]);

    return (
        <ToolLayout
            title="Video Trimmer"
            subtitle="Cut and trim videos to your desired length"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={500}
            maxFiles={1}
            supportedFormatsText="Supported: MP4, MKV, AVI, MOV, WebM | Max: 500MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Start Time (HH:MM:SS)</label>
                        <input type="text" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="00:00:00" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>End Time (HH:MM:SS)</label>
                        <input type="text" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="00:00:30" style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                    </div>
                    <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--neon-blue)' }}>Format:</strong> HH:MM:SS or SS
                    </div>
                    {stage !== 'idle' && (
                        <button onClick={() => { setStage('idle'); setDownloadReady(false); }} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>Trim Another</button>
                    )}
                </div>
            }
            processingStage={stage}
            progress={progress}
            fileName={fileName}
            fileSize={fileSize}
            errorMessage={errorMessage}
            downloadReady={downloadReady}
            downloadUrl={downloadUrl}
            downloadFileName={downloadFileName}
            downloadFileSize={downloadFileSize}
            toolContent={
                <ToolContent
                    overview="Cut unwanted parts from the beginning or end of your videos. Our Video Trimmer lets you specify exact start and end times to keep only the footage you need. Ideal for removing intros, outros, or extracting a specific scene."
                    features={[
                        "Precision Cutting: Enter exact timecodes (HH:MM:SS) for accuracy.",
                        "No Re-encoding: Uses stream copying for instant trimming without quality loss.",
                        "Original Quality: Output is identical in quality to the source.",
                        "Broad Format Support: Trim MP4, MKV, AVI, etc."
                    ]}
                    howTo={[
                        { step: "Upload Video", description: "Select the video to trim." },
                        { step: "Set Times", description: "Enter Start Time and End Time (e.g., 00:00:10 to 00:00:20)." },
                        { step: "Trim", description: "Click to cut the video." },
                        { step: "Download", description: "Get your trimmed clip." }
                    ]}
                />
            }
        />
    );
}

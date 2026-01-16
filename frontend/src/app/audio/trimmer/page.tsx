'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { audioApi, getDownloadUrl, pollTaskStatus, formatFileSize } from '@/lib/api';

const ACCEPT_FORMATS = { 'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a'] };

export default function AudioTrimmerPage() {
    const [startTime, setStartTime] = useState('00:00:00');
    const [endTime, setEndTime] = useState('00:00:30');
    const [fadeIn, setFadeIn] = useState(0);
    const [fadeOut, setFadeOut] = useState(0);
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [downloadFileSize, setDownloadFileSize] = useState<string>();

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setDownloadReady(false);

        try {
            const response = await audioApi.trim(file, startTime, endTime, fadeIn, fadeOut, (e) => {
                if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
            });

            setStage('processing');
            setProgress(0);

            const completedTask = await pollTaskStatus(response.task_id, (task) => {
                setProgress(task.progress_percent || 0);
            });

            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(getDownloadUrl(response.task_id));
            setDownloadFileName(completedTask.output_filename || 'trimmed.mp3');
            if (completedTask.file_size) setDownloadFileSize(formatFileSize(completedTask.file_size));
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Trim failed');
        }
    }, [startTime, endTime, fadeIn, fadeOut]);

    return (
        <ToolLayout
            title="Audio Trimmer"
            subtitle="Cut and trim audio files with optional fade effects"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={100}
            maxFiles={1}
            supportedFormatsText="Supported: MP3, WAV, AAC, FLAC, OGG | Max: 100MB"
            onFilesSelected={handleFilesSelected}
            configPanel={
                <div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Start Time</label>
                        <input type="text" value={startTime} onChange={(e) => setStartTime(e.target.value)} placeholder="00:00:00" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>End Time</label>
                        <input type="text" value={endTime} onChange={(e) => setEndTime(e.target.value)} placeholder="00:00:30" style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'monospace' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fade In (sec)</label>
                            <input type="number" value={fadeIn} onChange={(e) => setFadeIn(Number(e.target.value))} min="0" max="10" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fade Out (sec)</label>
                            <input type="number" value={fadeOut} onChange={(e) => setFadeOut(Number(e.target.value))} min="0" max="10" style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                        </div>
                    </div>
                    {stage !== 'idle' && (
                        <button onClick={() => { setStage('idle'); setDownloadReady(false); }} className="btn btn-ghost" style={{ width: '100%' }}>Trim Another</button>
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
        />
    );
}

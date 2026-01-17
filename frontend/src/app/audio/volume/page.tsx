'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { audioApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';

const ACCEPT_FORMATS = { 'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a'] };

export default function VolumeBoosterPage() {
    const [gain, setGain] = useState(0);
    const [normalize, setNormalize] = useState(false);
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
            const response = await audioApi.volume(file, gain, normalize, (e) => {
                if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
            });

            setTaskId(response.task_id);
            setStage('uploaded');
            setProgress(100);
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Upload failed');
        }
    }, [gain, normalize]);

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
            setDownloadFileName(completedTask.output_filename || 'adjusted.mp3');
            if (completedTask.file_size) setDownloadFileSize(formatFileSize(completedTask.file_size));
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Volume adjustment failed');
        }
    }, [taskId]);

    return (
        <ToolLayout
            title="Volume Booster"
            subtitle="Increase or decrease audio volume with normalization option"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={100}
            maxFiles={1}
            supportedFormatsText="Supported: MP3, WAV, AAC, FLAC, OGG | Max: 100MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Volume Gain: {gain > 0 ? '+' : ''}{gain} dB
                        </label>
                        <input type="range" min="-20" max="20" value={gain} onChange={(e) => setGain(Number(e.target.value))} style={{ width: '100%' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span>-20 dB</span>
                            <span>0</span>
                            <span>+20 dB</span>
                        </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', borderRadius: '8px', cursor: 'pointer', marginBottom: '16px' }}>
                        <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} style={{ accentColor: 'var(--neon-blue)', width: '18px', height: '18px' }} />
                        <div>
                            <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Normalize Audio</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automatically adjust to optimal level</div>
                        </div>
                    </label>

                    {stage !== 'idle' && (
                        <button onClick={() => { setStage('idle'); setDownloadReady(false); }} className="btn btn-ghost" style={{ width: '100%' }}>Adjust Another</button>
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

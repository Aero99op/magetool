'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { videoApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';
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

const ACCEPT_FORMATS = { 'video/*': ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv', '.m4v'] };

export default function VideoConverterClient() {
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

    const processClientSide = useCallback(async (file: File) => {
        setIsClientSide(true);
        setStage('processing');
        setEstimatedTime('Processing in your browser...');
        try {
            const outputBlob = await convertVideoClient(file, outputFormat, (msg) => {
                setEstimatedTime(msg);
                const match = msg.match(/(\d+)%/);
                if (match) setProgress(parseInt(match[1]));
            });
            const blobUrl = URL.createObjectURL(outputBlob);
            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(blobUrl);
            setDownloadFileName(`${file.name.replace(/\.[^/.]+$/, '')}_converted.${outputFormat}`);
            setDownloadFileSize(formatFileSize(outputBlob.size));
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Processing failed');
        }
    }, [outputFormat]);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        setSelectedFile(file);
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setDownloadReady(false);
        setIsClientSide(false);

        try {
            let lastLoaded = 0, lastTime = Date.now();
            const response = await videoApi.convert(file, outputFormat, { resolution }, (e) => {
                if (e.total) {
                    setProgress(Math.round((e.loaded / e.total) * 100));
                    const now = Date.now(), timeDiff = (now - lastTime) / 1000;
                    if (timeDiff > 0.5) {
                        setUploadSpeed(`${((e.loaded - lastLoaded) / timeDiff / 1024 / 1024).toFixed(1)} MB/s`);
                        lastLoaded = e.loaded; lastTime = now;
                    }
                }
            });
            setTaskId(response.task_id);
            setStage('uploaded');
        } catch (error: any) {
            if (isFFmpegSupported() && (error.message?.includes('502') || error.message?.includes('Network'))) {
                await processClientSide(file);
            } else {
                setStage('error');
                setErrorMessage(error.message || 'Upload failed');
            }
        }
    }, [outputFormat, resolution, processClientSide]);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;
        setStage('processing');
        setEstimatedTime('Starting...');
        try {
            await startProcessing(taskId);
            const completedTask = await pollTaskStatus(taskId, (t) => {
                setProgress(t.progress_percent || 0);
                if (t.estimated_time_remaining_seconds) setEstimatedTime(`${t.estimated_time_remaining_seconds}s`);
            });
            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(completedTask.output_filename || `converted.${outputFormat}`);
            if (completedTask.file_size) setDownloadFileSize(formatFileSize(completedTask.file_size));
        } catch (error: any) {
            if (isFFmpegSupported() && selectedFile) {
                await processClientSide(selectedFile);
            } else {
                setStage('error');
                setErrorMessage(error.message || 'Processing failed');
            }
        }
    }, [taskId, outputFormat, selectedFile, processClientSide]);

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
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Output Format</label>
                        <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--glass-bg-hover)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                            {OUTPUT_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                        </select>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Resolution</label>
                        <select value={resolution} onChange={(e) => setResolution(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--glass-bg-hover)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                            {RESOLUTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                    {isClientSide && <div style={{ padding: '12px', marginBottom: '16px', background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: '8px', fontSize: '0.8rem', color: '#ffc107' }}>⚡ Processing in browser</div>}
                    {stage !== 'idle' && <button onClick={() => { setStage('idle'); setDownloadReady(false); setTaskId(null); setSelectedFile(null); setIsClientSide(false); }} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>Convert Another</button>}
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
            toolContent={<ToolContent overview="Convert videos between all major formats." features={["Multi-Format: MP4, MKV, AVI, MOV, WebM, GIF.", "Resolution Control: 1080p, 720p, 480p, 360p.", "Hybrid Processing: Server or browser fallback.", "No Limits: Large files supported."]} howTo={[{ step: "Upload Video", description: "Select source video." }, { step: "Configure", description: "Choose format and resolution." }, { step: "Convert", description: "Start transcoding." }, { step: "Download", description: "Save converted video." }]} />}
        />
    );
}

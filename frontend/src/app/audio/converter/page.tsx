'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { audioApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

const OUTPUT_FORMATS = [
    { value: 'mp3', label: 'MP3 (.mp3)' },
    { value: 'wav', label: 'WAV (.wav)' },
    { value: 'aac', label: 'AAC (.aac)' },
    { value: 'flac', label: 'FLAC (.flac)' },
    { value: 'ogg', label: 'OGG (.ogg)' },
    { value: 'm4a', label: 'M4A (.m4a)' },
];

const BITRATES = [
    { value: '128k', label: '128 kbps' },
    { value: '192k', label: '192 kbps' },
    { value: '256k', label: '256 kbps' },
    { value: '320k', label: '320 kbps (Best)' },
];

const ACCEPT_FORMATS = {
    'audio/*': ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.wma', '.opus'],
};

export default function AudioConverterPage() {
    const [outputFormat, setOutputFormat] = useState('mp3');
    const [bitrate, setBitrate] = useState('192k');
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

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;

        const file = files[0];
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setErrorMessage(undefined);
        setDownloadReady(false);

        try {
            let lastLoaded = 0;
            let lastTime = Date.now();

            const response = await audioApi.convert(
                file,
                outputFormat,
                bitrate,
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
    }, [outputFormat, bitrate]);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;

        setStage('processing');
        setProgress(0);

        try {
            await startProcessing(taskId);
            const completedTask = await pollTaskStatus(
                taskId,
                (task) => {
                    setProgress(task.progress_percent || 0);
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
            setStage('error');
            setErrorMessage(error.message || 'Processing failed. Please try again.');
        }
    }, [taskId, outputFormat]);

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage(undefined);
        setTaskId(null);
    };

    return (
        <ToolLayout
            title="Audio Format Converter"
            subtitle="Convert audio between MP3, WAV, AAC, FLAC, OGG, and M4A formats"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={100}
            maxFiles={1}
            supportedFormatsText="Supported: MP3, WAV, AAC, FLAC, OGG, M4A, WMA | Max: 100MB"
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

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Bitrate
                        </label>
                        <select
                            value={bitrate}
                            onChange={(e) => setBitrate(e.target.value)}
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
                            {BITRATES.map((rate) => (
                                <option key={rate.value} value={rate.value}>{rate.label}</option>
                            ))}
                        </select>
                    </div>

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
                    overview="Convert your audio files freely between all major formats with our universal Audio Converter. Whether you need an MP3 for your phone, a high-quality FLAC for archiving, or an OGG file for a game project, this tool handles it all. We offer full control over audio quality, allowing you to choose bitrates from 128kbps up to 320kbps for crystal clear sound."
                    features={[
                        "Multi-Format Support: Convert between MP3, WAV, AAC, FLAC, OGG, M4A, and more.",
                        "Quality Control: selectable bitrates (128k, 192k, 256k, 320k) to balance size and quality.",
                        "Lossless Conversion: Support for FLAC and WAV ensures no quality loss for audiophiles.",
                        "Fast Processing: Optimized backend ensures your files are converted in seconds.",
                        "Secure: Your files are auto-deleted after 1 hour."
                    ]}
                    howTo={[
                        { step: "Upload Audio", description: "Choose the audio file you wish to convert." },
                        { step: "Configure Output", description: "Select your desired file format and bitrate quality." },
                        { step: "Convert", description: "Click 'Convert' to start the transformation." },
                        { step: "Download", description: "Save your new audio file instantly." }
                    ]}
                />
            }
        />
    );
}

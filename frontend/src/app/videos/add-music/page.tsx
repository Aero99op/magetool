'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { videoApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

const ACCEPT_VIDEO_FORMATS = {
    'video/*': ['.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv', '.wmv', '.m4v'],
};

const ACCEPT_AUDIO_FORMATS = {
    'audio/*': ['.mp3', '.wav', '.aac', '.m4a', '.ogg', '.flac'],
};

export default function AddMusicPage() {
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [replaceAudio, setReplaceAudio] = useState(true);
    const [audioVolume, setAudioVolume] = useState(100);
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

    const handleVideoSelected = useCallback((files: File[]) => {
        if (files.length > 0) {
            setVideoFile(files[0]);
        }
    }, []);

    const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAudioFile(e.target.files[0]);
        }
    };

    const handleProcess = async () => {
        if (!videoFile || !audioFile) {
            setErrorMessage('Please select both a video and an audio file');
            setStage('error');
            return;
        }

        setFileName(videoFile.name);
        setFileSize(formatFileSize(videoFile.size + audioFile.size));
        setStage('uploading');
        setProgress(0);
        setErrorMessage(undefined);
        setDownloadReady(false);

        try {
            let lastLoaded = 0;
            let lastTime = Date.now();

            const response = await videoApi.addMusic(
                videoFile,
                audioFile,
                replaceAudio,
                audioVolume / 100,
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

            setStage('processing');
            setProgress(0);
            setEstimatedTime('Adding music to video...');

            await startProcessing(response.task_id);
            const completedTask = await pollTaskStatus(
                response.task_id,
                (task) => {
                    setProgress(task.progress_percent || 0);
                    if (task.estimated_time_remaining_seconds) {
                        setEstimatedTime(`${task.estimated_time_remaining_seconds} seconds`);
                    }
                }
            );

            setStage('complete');
            setDownloadReady(true);
            setDownloadUrl(getDownloadUrl(response.task_id));
            const baseName = videoFile.name.replace(/\.[^.]+$/, '');
            setDownloadFileName(completedTask.output_filename || `${baseName}_with_music.mp4`);
            if (completedTask.file_size) {
                setDownloadFileSize(formatFileSize(completedTask.file_size));
            }

        } catch (error: any) {
            console.error('Add music error:', error);
            setStage('error');
            setErrorMessage(error.message || 'Failed to add music. Please try again.');
        }
    };

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setErrorMessage(undefined);
        setVideoFile(null);
        setAudioFile(null);
    };

    return (
        <ToolLayout
            title="Add Music to Video"
            subtitle="Add background music or replace the audio track in your videos"
            acceptFormats={ACCEPT_VIDEO_FORMATS}
            maxFileSize={500}
            maxFiles={1}
            supportedFormatsText="Supported: MP4, MKV, AVI, MOV, WebM | Max: 500MB"
            onFilesSelected={handleVideoSelected}
            configPanel={
                <div>
                    {videoFile && (
                        <div style={{
                            padding: '12px',
                            background: 'rgba(0, 217, 255, 0.1)',
                            borderRadius: '8px',
                            marginBottom: '16px',
                        }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', margin: 0 }}>
                                ✓ Video: {videoFile.name}
                            </p>
                        </div>
                    )}

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Audio File
                        </label>
                        <input
                            type="file"
                            accept=".mp3,.wav,.aac,.m4a,.ogg,.flac"
                            onChange={handleAudioChange}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                fontSize: '0.875rem',
                            }}
                        />
                        {audioFile && (
                            <p style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '8px' }}>
                                ✓ {audioFile.name} ({formatFileSize(audioFile.size)})
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            padding: '12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            border: '1px solid var(--glass-border)',
                        }}>
                            <input
                                type="checkbox"
                                checked={replaceAudio}
                                onChange={(e) => setReplaceAudio(e.target.checked)}
                                style={{ width: '18px', height: '18px' }}
                            />
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                                Replace original audio
                            </span>
                        </label>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
                            {replaceAudio ? 'Original audio will be removed' : 'New audio will be mixed with original'}
                        </p>
                    </div>

                    {!replaceAudio && (
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                New Audio Volume: {audioVolume}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="200"
                                value={audioVolume}
                                onChange={(e) => setAudioVolume(parseInt(e.target.value))}
                                style={{ width: '100%' }}
                            />
                        </div>
                    )}

                    {videoFile && audioFile && stage === 'idle' && (
                        <button
                            onClick={handleProcess}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '16px' }}
                        >
                            Add Music to Video
                        </button>
                    )}

                    {stage !== 'idle' && (
                        <button onClick={resetState} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>
                            Process Another
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
                    overview="Elevate your videos by adding the perfect soundtrack. Our 'Add Music to Video' tool allows you to merge audio files (MP3, WAV, etc.) with your video clips instantly. You can choose to replace the original audio or mix the new track with the existing sound."
                    features={[
                        "Audio Mixing: Keep original sound and add background music, or replace it entirely.",
                        "Volume Control: Adjust the volume of the added track for perfect balance.",
                        "Wide Support: Works with all major video (MP4, AVI, MOV) and audio (MP3, M4A) formats.",
                        "Fast Processing: Merges streams without re-encoding the video track when possible."
                    ]}
                    howTo={[
                        { step: "Upload Video", description: "Select the video file you want to edit." },
                        { step: "Upload Audio", description: "Choose the music track to add." },
                        { step: "Configure", description: "Choose to 'Replace original audio' or mix. Adjust volume." },
                        { step: "Process", description: "Click to merge the streams." },
                        { step: "Download", description: "Get your new music video." }
                    ]}
                />
            }
        />
    );
}

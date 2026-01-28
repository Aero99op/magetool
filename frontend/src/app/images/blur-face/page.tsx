'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { imageApi, pollTaskStatus, getDownloadUrl, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';
import { AxiosProgressEvent } from 'axios';

const ACCEPT_FORMATS = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] };

export default function BlurFacePage() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [blurIntensity, setBlurIntensity] = useState(30);
    const [error, setError] = useState('');
    const [taskId, setTaskId] = useState<string | null>(null);

    const handleFilesSelected = useCallback(async (files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));
        setStage('uploading');
        setProgress(0);
        setDownloadReady(false);
        setError('');

        try {
            const response = await imageApi.blurFace(
                file, blurIntensity,
                (e: AxiosProgressEvent) => setProgress(Math.round((e.loaded / (e.total || 1)) * 100))
            );

            setTaskId(response.task_id);
            setStage('uploaded');
            setProgress(100);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Upload failed');
            setStage('error');
        }
    }, [blurIntensity]);

    const handleProcess = useCallback(async () => {
        if (!taskId) return;

        setStage('processing');
        setProgress(50);

        try {
            await startProcessing(taskId);
            const result = await pollTaskStatus(taskId, (status) => {
                setProgress(status.progress_percent || 60);
            });

            setDownloadUrl(getDownloadUrl(taskId));
            setDownloadFileName(result.output_filename);
            setStage('complete');
            setDownloadReady(true);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to process');
            setStage('error');
        }
    }, [taskId]);

    return (
        <ToolLayout
            title="Blur Face / License Plate"
            subtitle="Anonymize sensitive areas in images with blur effect"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: JPG, PNG, WEBP | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Blur Intensity: {blurIntensity}
                        </label>
                        <input
                            type="range"
                            min="10"
                            max="100"
                            value={blurIntensity}
                            onChange={(e) => setBlurIntensity(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            <span>Light</span>
                            <span>Medium</span>
                            <span>Heavy</span>
                        </div>
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(255, 200, 100, 0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            <strong style={{ color: '#FFAA00' }}>Note:</strong> Apply blur intensity to anonymize content.
                        </p>
                    </div>

                    {error && (
                        <div style={{ padding: '12px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}
                </div>
            }
            toolContent={
                <ToolContent
                    overview="Protect privacy and sensitive information with our online Image Blur tool. Whether it's blurring a face, a license plate, or confidential text in a screenshot, this tool provides a quick and secure way to obscure details. Currently operating as a full-image blur tool with adjustable intensity, it's perfect for creating background textures or anonymizing entire photos before sharing."
                    features={[
                        "Adjustable Intensity: Control the strength of the blur from subtle softening to complete obscurity.",
                        "Privacy Focused: Images are processed securely and never stored.",
                        "No Watermarks: Clean output without any branding.",
                        "Fast Processing: Instant results powered by optimized algorithms.",
                        "Cross-Platform: Works on desktop, tablet, and mobile browsers."
                    ]}
                    howTo={[
                        { step: "Upload Image", description: "Select the photo you want to blur. JPG, PNG, and WebP supported." },
                        { step: "Adjust Intensity", description: "Use the slider to set the blur level. Higher values mean more obscurity." },
                        { step: "Process", description: "Click 'Process' to apply the effect." },
                        { step: "Download", description: "Save the blurred image to your device." }
                    ]}
                />
            }
            processingStage={stage}
            progress={progress}
            fileName={fileName}
            fileSize={fileSize}
            downloadReady={downloadReady}
            downloadUrl={downloadUrl}
            downloadFileName={downloadFileName}
        />
    );
}

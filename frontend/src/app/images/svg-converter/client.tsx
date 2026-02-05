'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { imageApi, pollTaskStatus, getDownloadUrl, formatFileSize, startProcessing } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';
import ToolContent from '@/components/ToolContent';

const ACCEPT_FORMATS = { 'image/*': ['.jpg', '.jpeg', '.png', '.bmp'] };
const SMOOTHING_OPTIONS = ['Sharp', 'Normal', 'Smooth'];

export default function SVGConverterClient() {
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [smoothing, setSmoothing] = useState('Normal');
    const [colorDepth, setColorDepth] = useState('preserve');
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
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
            const response = await imageApi.svgConvert(
                file, smoothing, colorDepth,
                (e: AxiosProgressEvent) => setProgress(Math.round((e.loaded / (e.total || 1)) * 100))
            );

            setTaskId(response.task_id);
            setStage('uploaded');
            setProgress(100);
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Upload failed');
            setStage('error');
        }
    }, [smoothing, colorDepth]);

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
            setError(err.response?.data?.detail || err.message || 'Failed to convert');
            setStage('error');
        }
    }, [taskId]);

    return (
        <ToolLayout
            title="SVG Converter"
            subtitle="Convert raster images (PNG, JPG) to editable vector SVG"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: PNG, JPG, BMP | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            onProcessClick={handleProcess}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Smoothing Level</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {SMOOTHING_OPTIONS.map(opt => (
                                <button key={opt} onClick={() => setSmoothing(opt)} style={{ flex: 1, padding: '10px', background: smoothing === opt ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255,255,255,0.03)', border: `1px solid ${smoothing === opt ? 'var(--neon-blue)' : 'var(--glass-border)'}`, borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem' }}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Color Depth</label>
                        <select value={colorDepth} onChange={(e) => setColorDepth(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                            <option value="preserve">Preserve Original</option>
                            <option value="256">256 Colors</option>
                            <option value="64">64 Colors</option>
                            <option value="16">16 Colors</option>
                            <option value="bw">Black & White</option>
                        </select>
                    </div>

                    <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <strong style={{ color: 'var(--neon-blue)' }}>Output:</strong> Editable SVG file with vector paths
                    </div>

                    {error && (
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}
                </div>
            }
            processingStage={stage}
            progress={progress}
            fileName={fileName}
            fileSize={fileSize}
            downloadReady={downloadReady}
            downloadUrl={downloadUrl}
            downloadFileName={downloadFileName}
            toolContent={
                <ToolContent
                    overview="Convert raster images (JPG, PNG) into scalable vector graphics (SVG). Ideal for logos, icons, and illustrations that need to be resized without pixelation."
                    features={[
                        "Vectorization: Traces shapes to create vector paths.",
                        "Color Control: Preserve colors or convert to simple palettes.",
                        "Smoothing: Adjust how smooth the curves should be.",
                        "Scalable: Output can be resized infinitely."
                    ]}
                    howTo={[
                        { step: "Upload Image", description: "Select a JPG or PNG file." },
                        { step: "Settings", description: "Choose smoothing and color options." },
                        { step: "Convert", description: "Transform into SVG vector." },
                        { step: "Download", description: "Save your scalable vector file." }
                    ]}
                />
            }
        />
    );
}

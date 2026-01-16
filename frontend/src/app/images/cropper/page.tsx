'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { imageApi, getDownloadUrl, pollTaskStatus, formatFileSize } from '@/lib/api';

const ASPECT_RATIOS = [
    { value: 'free', label: 'Freeform', ratio: null },
    { value: '1:1', label: '1:1 (Square)', ratio: 1 },
    { value: '4:3', label: '4:3 (Photo)', ratio: 4 / 3 },
    { value: '3:2', label: '3:2 (Classic)', ratio: 3 / 2 },
    { value: '16:9', label: '16:9 (Widescreen)', ratio: 16 / 9 },
    { value: '9:16', label: '9:16 (Portrait)', ratio: 9 / 16 },
    { value: '5:4', label: '5:4', ratio: 5 / 4 },
    { value: '2:3', label: '2:3', ratio: 2 / 3 },
];

const ACCEPT_FORMATS = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'],
};

export default function ImageCropperPage() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');
    const [aspectRatio, setAspectRatio] = useState('free');
    const [cropX, setCropX] = useState(0);
    const [cropY, setCropY] = useState(0);
    const [cropWidth, setCropWidth] = useState(200);
    const [cropHeight, setCropHeight] = useState(200);
    const [imageWidth, setImageWidth] = useState(0);
    const [imageHeight, setImageHeight] = useState(0);
    const [stage, setStage] = useState<ProcessingStage>('idle');
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState<string>();
    const [fileSize, setFileSize] = useState<string>();
    const [errorMessage, setErrorMessage] = useState<string>();
    const [downloadReady, setDownloadReady] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [downloadFileName, setDownloadFileName] = useState<string>();
    const [downloadFileSize, setDownloadFileSize] = useState<string>();

    const handleFilesSelected = useCallback((files: File[]) => {
        if (files.length === 0) return;
        const file = files[0];
        setSelectedFile(file);
        setFileName(file.name);
        setFileSize(formatFileSize(file.size));

        const url = URL.createObjectURL(file);
        setImageUrl(url);

        const img = new Image();
        img.onload = () => {
            setImageWidth(img.width);
            setImageHeight(img.height);
            setCropWidth(Math.min(200, img.width));
            setCropHeight(Math.min(200, img.height));
        };
        img.src = url;
    }, []);

    const handleCrop = async () => {
        if (!selectedFile) return;

        setStage('uploading');
        setProgress(0);
        setDownloadReady(false);

        try {
            const response = await imageApi.crop(selectedFile, cropX, cropY, cropWidth, cropHeight, (e) => {
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
            setDownloadFileName(completedTask.output_filename || 'cropped.png');
            if (completedTask.file_size) setDownloadFileSize(formatFileSize(completedTask.file_size));
        } catch (error: any) {
            setStage('error');
            setErrorMessage(error.message || 'Crop failed');
        }
    };

    const resetState = () => {
        setStage('idle');
        setProgress(0);
        setDownloadReady(false);
        setSelectedFile(null);
        setImageUrl('');
    };

    return (
        <ToolLayout
            title="Image Cropper"
            subtitle="Crop images with precise control and aspect ratio presets"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: JPG, PNG, WebP, GIF | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Aspect Ratio</label>
                        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                            {ASPECT_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>

                    {imageWidth > 0 && (
                        <>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>X: {cropX}px, Y: {cropY}px</label>
                            </div>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Size: {cropWidth} × {cropHeight}px</label>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                                <input type="number" placeholder="X" value={cropX} onChange={(e) => setCropX(Number(e.target.value))} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                                <input type="number" placeholder="Y" value={cropY} onChange={(e) => setCropY(Number(e.target.value))} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                                <input type="number" placeholder="Width" value={cropWidth} onChange={(e) => setCropWidth(Number(e.target.value))} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                                <input type="number" placeholder="Height" value={cropHeight} onChange={(e) => setCropHeight(Number(e.target.value))} style={{ padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                            </div>
                        </>
                    )}

                    {selectedFile && stage === 'idle' && (
                        <button onClick={handleCrop} className="btn btn-primary" style={{ width: '100%' }}>Crop Image</button>
                    )}
                    {stage !== 'idle' && (
                        <button onClick={resetState} className="btn btn-ghost" style={{ width: '100%', marginTop: '12px' }}>Crop Another</button>
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

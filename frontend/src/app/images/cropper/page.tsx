'use client';

import { useState, useCallback } from 'react';
import ToolLayout from '@/components/ToolLayout';
import { ProcessingStage } from '@/components/ProgressDisplay';
import { imageApi, getDownloadUrl, pollTaskStatus, formatFileSize, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';
import ImageCropper from '@/components/ImageCropper';

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
            // Initial crop: centered, 50% of image size
            const initialSize = Math.min(img.width, img.height) * 0.5;
            setCropWidth(Math.round(initialSize));
            setCropHeight(Math.round(initialSize));
            setCropX(Math.round((img.width - initialSize) / 2));
            setCropY(Math.round((img.height - initialSize) / 2));
        };
        img.src = url;
    }, []);

    const handleCropChange = useCallback((crop: { x: number; y: number; width: number; height: number }) => {
        setCropX(Math.round(crop.x));
        setCropY(Math.round(crop.y));
        setCropWidth(Math.round(crop.width));
        setCropHeight(Math.round(crop.height));
    }, []);

    const handleAspectRatioChange = (value: string) => {
        setAspectRatio(value);
        const ratio = ASPECT_RATIOS.find(r => r.value === value)?.ratio;

        if (ratio && imageWidth > 0) {
            // Adjust crop to match new aspect ratio while keeping centered
            const centerX = cropX + cropWidth / 2;
            const centerY = cropY + cropHeight / 2;

            let newWidth = cropWidth;
            let newHeight = cropWidth / ratio;

            // Make sure it fits in the image
            if (newHeight > imageHeight) {
                newHeight = imageHeight * 0.8;
                newWidth = newHeight * ratio;
            }
            if (newWidth > imageWidth) {
                newWidth = imageWidth * 0.8;
                newHeight = newWidth / ratio;
            }

            const newX = Math.max(0, Math.min(centerX - newWidth / 2, imageWidth - newWidth));
            const newY = Math.max(0, Math.min(centerY - newHeight / 2, imageHeight - newHeight));

            setCropWidth(Math.round(newWidth));
            setCropHeight(Math.round(newHeight));
            setCropX(Math.round(newX));
            setCropY(Math.round(newY));
        }
    };

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
            await startProcessing(response.task_id);
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

    const currentRatio = ASPECT_RATIOS.find(r => r.value === aspectRatio)?.ratio || null;

    return (
        <ToolLayout
            title="Image Cropper"
            subtitle="Crop images with precise control and aspect ratio presets"
            acceptFormats={ACCEPT_FORMATS}
            maxFileSize={50}
            maxFiles={1}
            supportedFormatsText="Supported: JPG, PNG, WebP, GIF | Max: 50MB"
            onFilesSelected={handleFilesSelected}
            customContent={
                imageUrl && stage === 'idle' && (
                    <div style={{ marginTop: '24px' }}>
                        <ImageCropper
                            imageUrl={imageUrl}
                            aspectRatio={currentRatio}
                            initialCrop={{ x: cropX, y: cropY, width: cropWidth, height: cropHeight }}
                            onCropChange={handleCropChange}
                            imageWidth={imageWidth}
                            imageHeight={imageHeight}
                        />
                    </div>
                )
            }
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                            Aspect Ratio
                        </label>
                        <select
                            value={aspectRatio}
                            onChange={(e) => handleAspectRatioChange(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)'
                            }}
                        >
                            {ASPECT_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>

                    {imageWidth > 0 && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '16px',
                            background: 'rgba(0, 217, 255, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(0, 217, 255, 0.1)'
                        }}>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                Selection
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.9rem' }}>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Position: </span>
                                    <span style={{ color: 'var(--text-primary)' }}>{cropX}, {cropY}</span>
                                </div>
                                <div>
                                    <span style={{ color: 'var(--text-muted)' }}>Size: </span>
                                    <span style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>{cropWidth} × {cropHeight}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {imageWidth > 0 && (
                        <>
                            <div style={{ marginBottom: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Fine-tune (optional)
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                                <input
                                    type="number"
                                    placeholder="X"
                                    value={cropX}
                                    onChange={(e) => setCropX(Number(e.target.value))}
                                    style={{
                                        padding: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem'
                                    }}
                                />
                                <input
                                    type="number"
                                    placeholder="Y"
                                    value={cropY}
                                    onChange={(e) => setCropY(Number(e.target.value))}
                                    style={{
                                        padding: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem'
                                    }}
                                />
                                <input
                                    type="number"
                                    placeholder="Width"
                                    value={cropWidth}
                                    onChange={(e) => setCropWidth(Number(e.target.value))}
                                    style={{
                                        padding: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem'
                                    }}
                                />
                                <input
                                    type="number"
                                    placeholder="Height"
                                    value={cropHeight}
                                    onChange={(e) => setCropHeight(Number(e.target.value))}
                                    style={{
                                        padding: '8px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '6px',
                                        color: 'var(--text-primary)',
                                        fontSize: '0.85rem'
                                    }}
                                />
                            </div>
                        </>
                    )}

                    {selectedFile && stage === 'idle' && (
                        <button onClick={handleCrop} className="btn btn-primary" style={{ width: '100%' }}>
                            ✂️ Crop Image
                        </button>
                    )}
                    {stage !== 'idle' && (
                        <button onClick={resetState} className="btn btn-ghost" style={{ width: '100%', marginTop: '12px' }}>
                            Crop Another
                        </button>
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
                    overview="Crop your images to the perfect size and aspect ratio. Whether you need a square for Instagram, 16:9 for YouTube, or a custom dimensional crop, this tool gives you precise control."
                    features={[
                        "Preset Ratios: 1:1, 4:3, 16:9, and many more.",
                        "Freeform Crop: Drag handles to crop exactly what you want.",
                        "Pixel Precision: Input exact coordinates and dimensions.",
                        "Visual Editor: See changes in real-time on your image."
                    ]}
                    howTo={[
                        { step: "Upload Image", description: "Select the photo to crop." },
                        { step: "Select Area", description: "Drag the box or choose a preset ratio." },
                        { step: "Crop", description: "Click to apply the crop." },
                        { step: "Download", description: "Get your perfectly framed image." }
                    ]}
                />
            }
        />
    );
}

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
];
const ACCEPT_FORMATS = { 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'] };

export default function ImageCropperClient() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
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

    const handleCrop = async () => {
        if (!selectedFile) return;
        setStage('uploading');
        setDownloadReady(false);
        try {
            const response = await imageApi.crop(selectedFile, cropX, cropY, cropWidth, cropHeight, (e) => { if (e.total) setProgress(Math.round((e.loaded / e.total) * 100)); });
            setStage('processing');
            await startProcessing(response.task_id);
            const completedTask = await pollTaskStatus(response.task_id, (t) => setProgress(t.progress_percent || 0));
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
            customContent={imageUrl && stage === 'idle' && <div style={{ marginTop: '24px' }}><ImageCropper imageUrl={imageUrl} aspectRatio={currentRatio} initialCrop={{ x: cropX, y: cropY, width: cropWidth, height: cropHeight }} onCropChange={handleCropChange} imageWidth={imageWidth} imageHeight={imageHeight} /></div>}
            configPanel={
                <div>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Aspect Ratio</label>
                        <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                            {ASPECT_RATIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                    </div>
                    {imageWidth > 0 && <div style={{ padding: '16px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '12px', marginBottom: '16px' }}><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Selection: {cropWidth} × {cropHeight}</div></div>}
                    {selectedFile && stage === 'idle' && <button onClick={handleCrop} className="btn btn-primary" style={{ width: '100%' }}>✂️ Crop Image</button>}
                    {stage !== 'idle' && <button onClick={() => { setStage('idle'); setDownloadReady(false); setSelectedFile(null); setImageUrl(''); }} className="btn btn-ghost" style={{ width: '100%', marginTop: '12px' }}>Crop Another</button>}
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
            toolContent={<ToolContent overview="Crop your images to the perfect size and aspect ratio." features={["Preset Ratios: 1:1, 4:3, 16:9, and more.", "Freeform Crop: Drag handles.", "Pixel Precision: Input exact coordinates.", "Visual Editor: Real-time preview."]} howTo={[{ step: "Upload Image", description: "Select photo to crop." }, { step: "Select Area", description: "Drag box or choose preset." }, { step: "Crop", description: "Click to apply." }, { step: "Download", description: "Get your cropped image." }]} />}
        />
    );
}

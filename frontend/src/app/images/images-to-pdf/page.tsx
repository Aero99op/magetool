'use client';

import { useState, useCallback } from 'react';
import { motion, Reorder } from 'framer-motion';
import { imageApi, pollTaskStatus, getDownloadUrl, formatFileSize, startProcessing } from '@/lib/api';
import { FileImage, X, GripVertical, Download, Loader2 } from 'lucide-react';

const ACCEPT_FORMATS = {
    'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'],
};

const PAGE_SIZES = [
    { value: 'A4', label: 'A4 (210 × 297 mm)' },
    { value: 'A3', label: 'A3 (297 × 420 mm)' },
    { value: 'Letter', label: 'Letter (8.5 × 11 in)' },
    { value: 'Legal', label: 'Legal (8.5 × 14 in)' },
    { value: 'Custom', label: 'Custom (Original Size)' },
];

interface ImageItem {
    id: string;
    file: File;
    preview: string;
}

export default function ImagesToPdfPage() {
    const [images, setImages] = useState<ImageItem[]>([]);
    const [pageSize, setPageSize] = useState('A4');
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
    const [processing, setProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [downloadFileName, setDownloadFileName] = useState('');
    const [error, setError] = useState('');

    const handleFilesSelected = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const newImages: ImageItem[] = files.map((file, i) => ({
            id: `${Date.now()}-${i}`,
            file,
            preview: URL.createObjectURL(file),
        }));

        setImages(prev => [...prev, ...newImages]);
        setDownloadUrl('');
        setError('');

        // Reset input to allow selecting same files again
        e.target.value = '';
    }, []);

    const removeImage = (id: string) => {
        setImages(prev => {
            const removed = prev.find(img => img.id === id);
            if (removed) URL.revokeObjectURL(removed.preview);
            return prev.filter(img => img.id !== id);
        });
    };

    const clearAll = () => {
        images.forEach(img => URL.revokeObjectURL(img.preview));
        setImages([]);
        setDownloadUrl('');
    };

    const handleConvert = async () => {
        if (images.length === 0) return;

        setProcessing(true);
        setProgress(0);
        setError('');
        setDownloadUrl('');

        try {
            const files = images.map(img => img.file);

            const response = await imageApi.imagesToPdf(files, pageSize, orientation, (e) => {
                if (e.total) setProgress(Math.round((e.loaded / e.total) * 50));
            }, quality);

            setProgress(50);
            await startProcessing(response.task_id);

            const result = await pollTaskStatus(response.task_id, (status) => {
                setProgress(50 + (status.progress_percent || 0) / 2);
            });

            setDownloadUrl(getDownloadUrl(response.task_id));
            setDownloadFileName(result.output_filename || 'images.pdf');
            setProgress(100);

        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to create PDF');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '32px' }}
            >
                <h1 className="tool-title">Images to PDF</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Combine multiple images into a single PDF document
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                {/* Left: Image List */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    {images.length === 0 ? (
                        <label style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '60px',
                            border: '2px dashed var(--glass-border)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                        }}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFilesSelected}
                                style={{ display: 'none' }}
                            />
                            <FileImage size={48} color="var(--neon-blue)" style={{ marginBottom: '16px' }} />
                            <span style={{ color: 'var(--neon-blue)', fontWeight: 600, marginBottom: '8px' }}>
                                Select Images
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                or drag and drop here
                            </span>
                        </label>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    {images.length} image{images.length !== 1 ? 's' : ''} • Drag to reorder
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <label className="btn btn-ghost" style={{ cursor: 'pointer', fontSize: '0.85rem', padding: '6px 12px' }}>
                                        + Add More
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleFilesSelected}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    <button
                                        onClick={clearAll}
                                        className="btn btn-ghost"
                                        style={{ fontSize: '0.85rem', padding: '6px 12px', color: '#FF6B6B' }}
                                    >
                                        Clear All
                                    </button>
                                </div>
                            </div>

                            <Reorder.Group
                                axis="y"
                                values={images}
                                onReorder={setImages}
                                style={{ listStyle: 'none', padding: 0, margin: 0 }}
                            >
                                {images.map((image, index) => (
                                    <Reorder.Item
                                        key={image.id}
                                        value={image}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px',
                                            background: 'rgba(255,255,255,0.03)',
                                            borderRadius: '8px',
                                            marginBottom: '8px',
                                            cursor: 'grab'
                                        }}
                                    >
                                        <GripVertical size={18} color="var(--text-muted)" />
                                        <span style={{
                                            width: '28px',
                                            height: '28px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'rgba(0, 217, 255, 0.1)',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            color: 'var(--neon-blue)'
                                        }}>
                                            {index + 1}
                                        </span>
                                        <img
                                            src={image.preview}
                                            alt=""
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                objectFit: 'cover',
                                                borderRadius: '6px',
                                                border: '1px solid var(--glass-border)'
                                            }}
                                        />
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <div style={{
                                                fontSize: '0.9rem',
                                                color: 'var(--text-primary)',
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis'
                                            }}>
                                                {image.file.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {formatFileSize(image.file.size)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeImage(image.id)}
                                            style={{
                                                padding: '6px',
                                                background: 'transparent',
                                                border: 'none',
                                                cursor: 'pointer',
                                                color: 'var(--text-muted)',
                                                transition: 'color 0.2s'
                                            }}
                                        >
                                            <X size={18} />
                                        </button>
                                    </Reorder.Item>
                                ))}
                            </Reorder.Group>
                        </>
                    )}
                </div>

                {/* Right: Settings */}
                <div className="glass-card" style={{ padding: '20px', height: 'fit-content', position: 'sticky', top: '100px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--text-primary)' }}>
                        PDF Settings
                    </h3>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Page Size
                        </label>
                        <select
                            value={pageSize}
                            onChange={(e) => setPageSize(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'var(--text-primary)',
                                cursor: 'pointer'
                            }}
                        >
                            {PAGE_SIZES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Orientation
                        </label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {(['portrait', 'landscape'] as const).map(o => (
                                <button
                                    key={o}
                                    onClick={() => setOrientation(o)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: orientation === o ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${orientation === o ? 'var(--neon-blue)' : 'var(--glass-border)'}`,
                                        borderRadius: '8px',
                                        color: orientation === o ? 'var(--neon-blue)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {o}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Quality
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                            {(['low', 'medium', 'high'] as const).map(q => (
                                <button
                                    key={q}
                                    onClick={() => setQuality(q)}
                                    style={{
                                        padding: '12px',
                                        background: quality === q ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${quality === q ? 'var(--neon-blue)' : 'var(--glass-border)'}`,
                                        borderRadius: '8px',
                                        color: quality === q ? 'var(--neon-blue)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        textTransform: 'capitalize'
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                        <div style={{
                            marginTop: '8px',
                            fontSize: '0.75rem',
                            color: 'var(--text-muted)',
                            background: 'rgba(255,255,255,0.02)',
                            padding: '8px',
                            borderRadius: '6px'
                        }}>
                            {quality === 'low' && 'Smaller file size, lower resolution (ideal for sharing)'}
                            {quality === 'medium' && 'Balanced quality and size (recommended)'}
                            {quality === 'high' && 'Original resolution, larger file size (print quality)'}
                        </div>
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            marginBottom: '16px',
                            background: 'rgba(255,100,100,0.1)',
                            border: '1px solid rgba(255,100,100,0.3)',
                            borderRadius: '8px',
                            color: '#FF6B6B',
                            fontSize: '0.85rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {processing && (
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{
                                height: '4px',
                                background: 'rgba(255,255,255,0.1)',
                                borderRadius: '2px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${progress}%`,
                                    height: '100%',
                                    background: 'var(--neon-blue)',
                                    transition: 'width 0.3s ease'
                                }} />
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                {progress < 50 ? 'Uploading images...' : 'Creating PDF...'}
                            </div>
                        </div>
                    )}

                    {downloadUrl ? (
                        <a
                            href={downloadUrl}
                            download={downloadFileName}
                            className="btn btn-primary"
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                textDecoration: 'none'
                            }}
                        >
                            <Download size={18} />
                            Download PDF
                        </a>
                    ) : (
                        <button
                            onClick={handleConvert}
                            className="btn btn-primary"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            disabled={images.length === 0 || processing}
                        >
                            {processing ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                                    Creating PDF...
                                </>
                            ) : (
                                <>📄 Create PDF ({images.length} image{images.length !== 1 ? 's' : ''})</>
                            )}
                        </button>
                    )}
                </div>
            </div>

            <style jsx global>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    .container > div {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div >
    );
}

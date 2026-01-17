'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import api, { pollTaskStatus, getDownloadUrl, formatFileSize, startProcessing } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';

const LAYOUTS = [
    { id: '2x2', name: '2×2 Grid', cols: 2, rows: 2 },
    { id: '3x3', name: '3×3 Grid', cols: 3, rows: 3 },
    { id: '2x3', name: '2×3 Grid', cols: 2, rows: 3 },
    { id: '1x3', name: '1×3 Strip', cols: 1, rows: 3 },
    { id: '3x1', name: '3×1 Strip', cols: 3, rows: 1 },
];

export default function CollageMakerPage() {
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [layout, setLayout] = useState('2x2');
    const [spacing, setSpacing] = useState(8);
    const [processing, setProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string>();
    const [error, setError] = useState('');

    const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = Array.from(e.target.files || []);
        const combined = [...files, ...newFiles].slice(0, 9);
        setFiles(combined);

        const urls = combined.map(f => URL.createObjectURL(f));
        setPreviews(urls);
        setDownloadUrl(undefined);
    };

    const removeImage = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleCreate = async () => {
        if (files.length === 0) return;

        setProcessing(true);
        setError('');

        try {
            const formData = new FormData();
            files.forEach(file => formData.append('files', file));
            formData.append('layout', layout);
            formData.append('spacing', String(spacing));

            const response = await api.post('/api/image/collage', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const taskId = response.data.task_id;
            await startProcessing(taskId);
            await pollTaskStatus(taskId);
            setDownloadUrl(getDownloadUrl(taskId));
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to create collage');
        } finally {
            setProcessing(false);
        }
    };

    const selectedLayout = LAYOUTS.find(l => l.id === layout);
    const cellCount = selectedLayout ? selectedLayout.cols * selectedLayout.rows : 4;

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="tool-title">Collage Maker</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Create beautiful photo collages with custom layouts</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: `repeat(${selectedLayout?.cols || 2}, 1fr)`,
                        gridTemplateRows: `repeat(${selectedLayout?.rows || 2}, 1fr)`,
                        gap: `${spacing}px`,
                        aspectRatio: selectedLayout?.cols === selectedLayout?.rows ? '1' : selectedLayout?.cols! > selectedLayout?.rows! ? '3/2' : '2/3',
                        background: '#1A1A1A',
                        padding: `${spacing}px`,
                        borderRadius: '8px',
                        minHeight: '300px'
                    }}>
                        {Array.from({ length: cellCount }).map((_, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                {previews[i] ? (
                                    <>
                                        <img src={previews[i]} alt={`Image ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <button onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer' }}>×</button>
                                    </>
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                                        {i + 1}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', padding: '12px', border: '1px dashed var(--glass-border)', borderRadius: '8px', cursor: 'pointer' }}>
                        <input type="file" accept="image/*" multiple onChange={handleFilesSelect} style={{ display: 'none' }} />
                        <span style={{ color: 'var(--neon-blue)' }}>+ Add Images</span>
                    </label>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Layout Options</h3>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Grid Layout</label>
                        <select value={layout} onChange={(e) => setLayout(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)' }}>
                            {LAYOUTS.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Spacing: {spacing}px</label>
                        <input type="range" min="0" max="20" value={spacing} onChange={(e) => setSpacing(Number(e.target.value))} style={{ width: '100%' }} />
                    </div>

                    {error && (
                        <div style={{ padding: '12px', marginBottom: '16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', fontSize: '0.85rem' }}>
                            {error}
                        </div>
                    )}

                    {downloadUrl ? (
                        <a href={downloadUrl} download className="btn btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            ⬇️ Download Collage
                        </a>
                    ) : (
                        <button onClick={handleCreate} className="btn btn-primary" style={{ width: '100%' }} disabled={files.length === 0 || processing}>
                            {processing ? '⏳ Creating...' : '🖼️ Create Collage'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

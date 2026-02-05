'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { imageApi, pollTaskStatus, getDownloadUrl, startProcessing } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

export default function ImageSplitterClient() {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [rows, setRows] = useState(3);
    const [cols, setCols] = useState(3);
    const [processing, setProcessing] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [error, setError] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            setImageUrl(URL.createObjectURL(f));
            setDownloadUrl('');
            setError('');
        }
    };

    const handleSplit = async () => {
        if (!file) return;

        setProcessing(true);
        setError('');

        try {
            const response = await imageApi.splitter(file, rows, cols);
            const taskId = response.task_id;

            await startProcessing(taskId);
            const result = await pollTaskStatus(taskId);
            setDownloadUrl(getDownloadUrl(taskId));
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to split image');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="tool-title">Image Splitter</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Split image into grid segments for Instagram carousels</p>
            </motion.div>

            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    {!imageUrl ? (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', border: '2px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer' }}>
                            <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                            <span style={{ fontSize: '3rem', marginBottom: '16px' }}>🔲</span>
                            <span style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>Upload image to split</span>
                        </label>
                    ) : (
                        <div>
                            <div style={{ position: 'relative', marginBottom: '20px' }}>
                                <img src={imageUrl} alt="Preview" style={{ width: '100%', borderRadius: '8px' }} />
                                <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateRows: `repeat(${rows}, 1fr)`, gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: '2px', pointerEvents: 'none' }}>
                                    {Array.from({ length: rows * cols }).map((_, i) => (
                                        <div key={i} style={{ border: '2px dashed rgba(0, 217, 255, 0.5)', background: 'rgba(0, 217, 255, 0.05)' }} />
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rows: {rows}</label>
                                    <input type="range" min="2" max="5" value={rows} onChange={(e) => { setRows(Number(e.target.value)); setDownloadUrl(''); }} style={{ width: '100%' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Columns: {cols}</label>
                                    <input type="range" min="2" max="5" value={cols} onChange={(e) => { setCols(Number(e.target.value)); setDownloadUrl(''); }} style={{ width: '100%' }} />
                                </div>
                            </div>

                            <div style={{ padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Output: {rows * cols} pieces ({rows}×{cols} grid) as ZIP file
                            </div>

                            {error && (
                                <div style={{ padding: '12px', marginBottom: '16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', textAlign: 'center' }}>
                                    {error}
                                </div>
                            )}

                            {downloadUrl ? (
                                <a href={downloadUrl} download className="btn btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                                    ⬇️ Download ZIP ({rows * cols} pieces)
                                </a>
                            ) : (
                                <button onClick={handleSplit} className="btn btn-primary" style={{ width: '100%' }} disabled={processing}>
                                    {processing ? '⏳ Splitting...' : '✂️ Split Image'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <ToolContent
                overview="Split large images into smaller grid tiles. Perfect for creating Instagram grid layouts, printing large posters on multiple pages, or segmenting game assets."
                features={[
                    "Custom Grids: Choose from 2x2 up to 5x5 grids.",
                    "Instant Preview: See how your image will be divided.",
                    "ZIP Download: Get all tiles in a single archive.",
                    "High Quality: Splits images without losing resolution."
                ]}
                howTo={[
                    { step: "Upload Image", description: "Select the photo you want to split." },
                    { step: "Choose Grid", description: "Set the number of rows and columns." },
                    { step: "Split", description: "Process the image." },
                    { step: "Download", description: "Save the ZIP file containing all tiles." }
                ]}
            />
        </div>
    );
}

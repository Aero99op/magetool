'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { imageApi, pollTaskStatus, getDownloadUrl } from '@/lib/api';

export default function FaviconGeneratorPage() {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
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

    const handleGenerate = async () => {
        if (!file) return;

        setProcessing(true);
        setError('');

        try {
            const response = await imageApi.favicon(file);
            const taskId = response.task_id;

            const result = await pollTaskStatus(taskId);
            setDownloadUrl(getDownloadUrl(taskId));
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to generate favicons');
        } finally {
            setProcessing(false);
        }
    };

    const sizes = [16, 32, 48, 64, 128, 180, 192, 512];

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="tool-title">Favicon Generator</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Generate all favicon sizes from a single image</p>
            </motion.div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    {!imageUrl ? (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', border: '2px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer' }}>
                            <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                            <span style={{ fontSize: '3rem', marginBottom: '16px' }}>🌐</span>
                            <span style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>Upload square image</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>Best results with 512×512 or larger</span>
                        </label>
                    ) : (
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                                <img src={imageUrl} alt="Preview" style={{ width: '100px', height: '100px', borderRadius: '8px', objectFit: 'cover' }} />
                                <div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>Source Image</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{file?.name}</div>
                                    <label style={{ marginTop: '8px', display: 'inline-block', cursor: 'pointer' }}>
                                        <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                                        <span className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Change</span>
                                    </label>
                                </div>
                            </div>

                            <div style={{ padding: '16px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px', marginBottom: '20px' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>Generated Sizes:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {sizes.map(size => (
                                        <span key={size} style={{ padding: '4px 10px', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--neon-blue)' }}>
                                            {size}×{size}
                                        </span>
                                    ))}
                                    <span style={{ padding: '4px 10px', background: 'rgba(0, 217, 255, 0.2)', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--neon-blue)', fontWeight: 600 }}>
                                        + ICO + manifest.json
                                    </span>
                                </div>
                            </div>

                            {error && (
                                <div style={{ padding: '12px', marginBottom: '16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', textAlign: 'center' }}>
                                    {error}
                                </div>
                            )}

                            {downloadUrl ? (
                                <a href={downloadUrl} download className="btn btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                                    ⬇️ Download Favicon Pack (ZIP)
                                </a>
                            ) : (
                                <button onClick={handleGenerate} className="btn btn-primary" style={{ width: '100%' }} disabled={processing}>
                                    {processing ? '⏳ Generating...' : '🌐 Generate Favicons'}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

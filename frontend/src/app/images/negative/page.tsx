'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { imageApi, pollTaskStatus, getDownloadUrl } from '@/lib/api';
import { AxiosProgressEvent } from 'axios';

const EFFECTS = [
    { id: 'invert', name: 'Negative/Invert', desc: 'Invert all colors' },
    { id: 'grayscale', name: 'Grayscale', desc: 'Convert to black & white' },
    { id: 'sepia', name: 'Sepia', desc: 'Vintage brown tone' },
    { id: 'solarize', name: 'Solarize', desc: 'Partial color inversion' },
    { id: 'posterize', name: 'Posterize', desc: 'Reduce color depth' },
];

export default function NegativeInvertPage() {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [effect, setEffect] = useState('invert');
    const [intensity, setIntensity] = useState(100);
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

    const handleProcess = async () => {
        if (!file) return;

        setProcessing(true);
        setError('');

        try {
            const response = await imageApi.negative(file, effect, intensity);
            const taskId = response.task_id;

            const result = await pollTaskStatus(taskId);
            setDownloadUrl(getDownloadUrl(taskId));
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to process');
        } finally {
            setProcessing(false);
        }
    };

    const getFilter = () => {
        switch (effect) {
            case 'invert': return `invert(${intensity}%)`;
            case 'grayscale': return `grayscale(${intensity}%)`;
            case 'sepia': return `sepia(${intensity}%)`;
            case 'solarize': return `invert(${intensity / 2}%) contrast(120%)`;
            case 'posterize': return `contrast(${100 + intensity}%)`;
            default: return 'none';
        }
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="tool-title">Negative / Color Effects</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Apply negative, grayscale, sepia, and other color effects</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    {!imageUrl ? (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px', border: '2px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer' }}>
                            <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                            <span style={{ fontSize: '3rem', marginBottom: '16px' }}>🎨</span>
                            <span style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>Upload image</span>
                        </label>
                    ) : (
                        <div style={{ textAlign: 'center' }}>
                            <img src={imageUrl} alt="Preview" style={{ maxWidth: '100%', borderRadius: '8px', filter: getFilter() }} />
                            <label style={{ display: 'inline-block', marginTop: '16px', cursor: 'pointer' }}>
                                <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                                <span className="btn btn-ghost">Change Image</span>
                            </label>
                        </div>
                    )}
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Effect</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                        {EFFECTS.map(e => (
                            <label key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: effect === e.id ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255,255,255,0.03)', border: `1px solid ${effect === e.id ? 'var(--neon-blue)' : 'var(--glass-border)'}`, borderRadius: '6px', cursor: 'pointer' }}>
                                <input type="radio" name="effect" value={e.id} checked={effect === e.id} onChange={() => { setEffect(e.id); setDownloadUrl(''); }} style={{ accentColor: 'var(--neon-blue)' }} />
                                <div>
                                    <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>{e.name}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{e.desc}</div>
                                </div>
                            </label>
                        ))}
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Intensity: {intensity}%</label>
                        <input type="range" min="0" max="100" value={intensity} onChange={(e) => { setIntensity(Number(e.target.value)); setDownloadUrl(''); }} style={{ width: '100%' }} />
                    </div>

                    {error && (
                        <div style={{ padding: '10px', marginBottom: '12px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '6px', color: '#FF6B6B', fontSize: '0.8rem' }}>
                            {error}
                        </div>
                    )}

                    {downloadUrl ? (
                        <a href={downloadUrl} download className="btn btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            ⬇️ Download
                        </a>
                    ) : (
                        <button onClick={handleProcess} className="btn btn-primary" style={{ width: '100%' }} disabled={!imageUrl || processing}>
                            {processing ? '⏳ Processing...' : '🎨 Apply Effect'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';

export default function VideoMetadataPage() {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState<any>(null);
    const [error, setError] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            setMetadata(null);
            setError('');
        }
    };

    const handleAnalyze = async () => {
        if (!file) return;

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/api/video/metadata', formData);

            if (response.data.success) {
                setMetadata(response.data);
            } else {
                setError(response.data.error || 'Failed to extract metadata');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to analyze video');
        } finally {
            setLoading(false);
        }
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="tool-title">Video Metadata Finder</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Extract detailed information from video files</p>
            </motion.div>

            <div style={{ maxWidth: '700px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', border: '2px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer', marginBottom: '20px' }}>
                        <input type="file" accept="video/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                        <span style={{ fontSize: '2rem' }}>🎬</span>
                        <div>
                            <div style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>{file ? file.name : 'Select video file'}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{file ? formatBytes(file.size) : 'MP4, MOV, AVI, MKV, WEBM'}</div>
                        </div>
                    </label>

                    {file && !metadata && (
                        <button onClick={handleAnalyze} className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                            {loading ? '⏳ Analyzing...' : '🔍 Extract Metadata'}
                        </button>
                    )}

                    {error && (
                        <div style={{ padding: '16px', marginTop: '16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {metadata && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>📊 Video Information</h3>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Format</div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{metadata.format}</div>
                                </div>
                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Duration</div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{metadata.duration_formatted}</div>
                                </div>
                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Resolution</div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{metadata.video?.width}×{metadata.video?.height}</div>
                                </div>
                                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Bitrate</div>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{Math.round(metadata.bitrate / 1000)} kbps</div>
                                </div>
                            </div>

                            <div style={{ padding: '16px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--neon-blue)', marginBottom: '12px' }}>Video Stream</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.8rem' }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Codec:</span> <span style={{ color: 'var(--text-primary)' }}>{metadata.video?.codec}</span></div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>FPS:</span> <span style={{ color: 'var(--text-primary)' }}>{Math.round(metadata.video?.fps)}</span></div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Aspect:</span> <span style={{ color: 'var(--text-primary)' }}>{metadata.video?.aspect_ratio}</span></div>
                                </div>
                            </div>

                            <div style={{ padding: '16px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px', marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '0.85rem', color: 'var(--neon-blue)', marginBottom: '12px' }}>Audio Stream</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', fontSize: '0.8rem' }}>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Codec:</span> <span style={{ color: 'var(--text-primary)' }}>{metadata.audio?.codec}</span></div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Channels:</span> <span style={{ color: 'var(--text-primary)' }}>{metadata.audio?.channels}</span></div>
                                    <div><span style={{ color: 'var(--text-muted)' }}>Sample:</span> <span style={{ color: 'var(--text-primary)' }}>{metadata.audio?.sample_rate} Hz</span></div>
                                </div>
                            </div>

                            <button onClick={() => { setFile(null); setMetadata(null); }} className="btn btn-ghost" style={{ width: '100%' }}>
                                Analyze Another Video
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

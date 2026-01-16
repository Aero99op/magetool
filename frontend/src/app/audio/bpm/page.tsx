'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { audioApi } from '@/lib/api';

export default function BPMDetectorPage() {
    const [fileName, setFileName] = useState('');
    const [bpm, setBpm] = useState<number | null>(null);
    const [confidence, setConfidence] = useState<number | null>(null);
    const [method, setMethod] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setBpm(null);
            setConfidence(null);
            setMethod('');
            setIsAnalyzing(true);
            setError('');

            try {
                const result = await audioApi.detectBpm(file);

                if (result.success) {
                    setBpm(result.bpm);
                    setConfidence(result.confidence);
                    setMethod(result.method || 'unknown');
                } else {
                    setError(result.error || 'Failed to detect BPM');
                }
            } catch (err: any) {
                setError(err.response?.data?.detail || err.message || 'BPM detection failed');
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    const getTempoDescription = (bpm: number) => {
        if (bpm < 80) return 'Very slow tempo (ambient, downtempo)';
        if (bpm < 100) return 'Slow tempo (ballad, chill)';
        if (bpm < 120) return 'Moderate tempo (pop, rock)';
        if (bpm < 140) return 'Upbeat tempo (dance, EDM)';
        if (bpm < 160) return 'Fast tempo (house, techno)';
        return 'Very fast tempo (drum & bass, hardcore)';
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="tool-title">BPM Detector</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Analyze tempo and beats per minute using librosa</p>
            </motion.div>

            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                    {!fileName ? (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', border: '2px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer' }}>
                            <input type="file" accept="audio/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                            <span style={{ fontSize: '3rem', marginBottom: '16px' }}>🎵</span>
                            <span style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>Upload an audio file</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>MP3, WAV, FLAC supported</span>
                        </label>
                    ) : (
                        <div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>{fileName}</p>

                            {isAnalyzing ? (
                                <div>
                                    <div className="spinner" style={{ margin: '0 auto 16px' }} />
                                    <p style={{ color: 'var(--text-secondary)' }}>Analyzing tempo with librosa...</p>
                                </div>
                            ) : error ? (
                                <div style={{ padding: '16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B' }}>
                                    {error}
                                </div>
                            ) : bpm !== null && (
                                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                                    <div style={{ fontSize: '4rem', fontWeight: 700, color: 'var(--neon-blue)', marginBottom: '8px' }}>{Math.round(bpm)}</div>
                                    <div style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>BPM</div>

                                    {confidence !== null && (
                                        <div style={{ marginTop: '16px', padding: '8px 16px', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '20px', display: 'inline-block' }}>
                                            <span style={{ color: 'var(--neon-blue)', fontSize: '0.85rem' }}>
                                                Confidence: {Math.round(confidence * 100)}%
                                            </span>
                                        </div>
                                    )}

                                    <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '8px' }}>
                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            {getTempoDescription(bpm)}
                                        </p>
                                    </div>

                                    {method && (
                                        <div style={{ marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                            Detection method: {method}
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            <label style={{ display: 'inline-block', marginTop: '24px', cursor: 'pointer' }}>
                                <input type="file" accept="audio/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                                <span className="btn btn-ghost">Analyze Another</span>
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

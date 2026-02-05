'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import api from '@/lib/api';
import ToolContent from '@/components/ToolContent';

export default function SongIdentifierClient() {
    const [file, setFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<{ title: string; artist: string; album?: string; note?: string } | null>(null);
    const [error, setError] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            setResult(null);
            setError('');
        }
    };

    const handleIdentify = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await api.post('/api/audio/identify', formData);

            if (response.data.success) {
                setResult({
                    title: response.data.title || 'Unknown Title',
                    artist: response.data.artist || 'Unknown Artist',
                    album: response.data.album,
                    note: response.data.note,
                });
            } else {
                setError(response.data.error || 'Could not identify song');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to identify song');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="tool-title">Song Identifier</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Upload an audio clip to identify the song</p>
            </motion.div>

            <div style={{ maxWidth: '400px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <div style={{ padding: '8px 12px', background: 'rgba(255, 200, 0, 0.1)', borderRadius: '16px', display: 'inline-block', marginBottom: '24px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FFC800' }}>REQUIRES EXTERNAL API</span>
                    </div>

                    {!file ? (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', border: '2px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer' }}>
                            <input type="file" accept="audio/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                            <span style={{ fontSize: '3rem', marginBottom: '16px' }}>🎵</span>
                            <span style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>Upload audio clip</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>MP3, WAV, M4A supported</span>
                        </label>
                    ) : (
                        <div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
                                🎵 {file.name}
                            </p>

                            {!result && !error && (
                                <button onClick={handleIdentify} className="btn btn-primary" style={{ width: '100%' }} disabled={isAnalyzing}>
                                    {isAnalyzing ? '🔄 Identifying...' : '🔍 Identify Song'}
                                </button>
                            )}

                            {error && (
                                <div style={{ padding: '16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '12px', marginBottom: '16px' }}>
                                    <p style={{ color: '#FF6B6B', margin: 0 }}>{error}</p>
                                </div>
                            )}

                            {result && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '20px', background: 'rgba(0, 217, 255, 0.05)', borderRadius: '12px', marginTop: '24px' }}>
                                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>{result.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', marginBottom: result.album ? '8px' : '0' }}>{result.artist}</p>
                                    {result.album && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Album: {result.album}</p>}
                                    {result.note && <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '12px', fontStyle: 'italic' }}>{result.note}</p>}
                                </motion.div>
                            )}

                            <button onClick={() => { setFile(null); setResult(null); setError(''); }} className="btn btn-ghost" style={{ marginTop: '16px' }}>
                                Try Another
                            </button>
                        </div>
                    )}

                    <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Note: Full song identification requires integration with AudD or ACRCloud API.
                    </div>
                </div>
            </div>

            <ToolContent
                overview="Heard a song you like but don't know the name? Our Song Identifier tool helps you discover music title, artist, and album information from just a short audio clip. Whether it's from a video, a recording, or a live snip, simply upload it and let our database matching technology find the details for you."
                features={[
                    "Instant Recognition: Matches audio fingerprints against a massive music database.",
                    "Detailed Info: Provides Title, Artist, and Album name when available.",
                    "Simple to Use: Just uploading a short clip (10-20 seconds) is usually enough.",
                    "Extensive Support: Works with MP3, WAV, M4A and other common audio formats."
                ]}
                howTo={[
                    { step: "Record/Upload", description: "Upload a short audio clip of the song you want to identify." },
                    { step: "Identify", description: "Click the button to scan the audio fingerprint." },
                    { step: "Discover", description: "View the song title and artist information immediately." }
                ]}
            />
        </div>
    );
}

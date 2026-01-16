'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { videoApi } from '@/lib/api';

export default function AIVideoFinderPage() {
    const [file, setFile] = useState<File | null>(null);
    const [searching, setSearching] = useState(false);
    const [results, setResults] = useState<{ title: string; url: string; platform: string; similarity: number }[] | null>(null);
    const [error, setError] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            setResults(null);
            setError('');
        }
    };

    const handleSearch = async () => {
        if (!file) return;

        setSearching(true);
        setError('');

        try {
            const response = await videoApi.aiFinder(file);

            if (response.success) {
                setResults(response.results);
            } else {
                setError(response.error || 'Search failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Search failed');
        } finally {
            setSearching(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <h1 className="tool-title" style={{ margin: 0 }}>AI Video Finder</h1>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '3px 8px', background: 'rgba(0, 255, 255, 0.2)', borderRadius: '4px', color: '#00FFFF' }}>AI</span>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>Find the original source of a video using reverse search</p>
            </motion.div>

            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', border: '2px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer', marginBottom: '20px' }}>
                        <input type="file" accept="video/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                        <span style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎬</span>
                        <span style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>{file ? file.name : 'Upload video to search'}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>MP4, MOV, WEBM supported</span>
                    </label>

                    {error && (
                        <div style={{ padding: '12px', marginBottom: '16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {file && !results && (
                        <button onClick={handleSearch} className="btn btn-primary" style={{ width: '100%' }} disabled={searching}>
                            {searching ? '🔍 Searching the web...' : '🔍 Find Original Video'}
                        </button>
                    )}

                    {results && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <h4 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Search Results ({results.length} found)</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {results.map((result, i) => (
                                    <a key={i} href={result.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)', textDecoration: 'none' }}>
                                        <div>
                                            <div style={{ color: 'var(--text-primary)', fontWeight: 500, marginBottom: '4px' }}>{result.title}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{result.platform}</div>
                                        </div>
                                        <div style={{ padding: '6px 12px', background: 'rgba(0, 217, 255, 0.1)', borderRadius: '4px', color: 'var(--neon-blue)', fontSize: '0.85rem', fontWeight: 600 }}>
                                            {result.similarity}% match
                                        </div>
                                    </a>
                                ))}
                            </div>

                            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255, 200, 100, 0.05)', borderRadius: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                <strong style={{ color: '#FFAA00' }}>Note:</strong> Results are simulated. Real reverse video search requires Google Vision API integration.
                            </div>

                            <button onClick={() => { setFile(null); setResults(null); }} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>
                                Search Another Video
                            </button>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}

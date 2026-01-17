'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { imageApi, pollTaskStatus, getDownloadUrl, startProcessing } from '@/lib/api';

const FONTS = ['Impact', 'Arial Black', 'Comic Sans MS', 'Helvetica'];

export default function MemeGeneratorPage() {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [topText, setTopText] = useState('TOP TEXT');
    const [bottomText, setBottomText] = useState('BOTTOM TEXT');
    const [font, setFont] = useState('Impact');
    const [fontSize, setFontSize] = useState(48);
    const [textColor, setTextColor] = useState('#FFFFFF');
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
            const response = await imageApi.meme(file, topText, bottomText, fontSize);
            const taskId = response.task_id;

            await startProcessing(taskId);
            const result = await pollTaskStatus(taskId);
            setDownloadUrl(getDownloadUrl(taskId));
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to generate meme');
        } finally {
            setProcessing(false);
        }
    };

    const textStyle = {
        fontFamily: font,
        fontSize: `${fontSize}px`,
        color: textColor,
        textTransform: 'uppercase' as const,
        textShadow: '2px 2px 0 #000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
        fontWeight: 'bold',
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="tool-title">Meme Generator</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Create classic memes with top and bottom text</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', maxWidth: '900px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    {!imageUrl ? (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px', border: '2px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer' }}>
                            <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                            <span style={{ fontSize: '4rem', marginBottom: '16px' }}>😂</span>
                            <span style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>Upload meme template</span>
                        </label>
                    ) : (
                        <div style={{ position: 'relative', textAlign: 'center' }}>
                            <img src={imageUrl} alt="Meme" style={{ maxWidth: '100%', borderRadius: '8px' }} />
                            <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', ...textStyle }}>{topText}</div>
                            <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', ...textStyle }}>{bottomText}</div>
                        </div>
                    )}
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>Meme Text</h3>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Top Text</label>
                        <input type="text" value={topText} onChange={(e) => setTopText(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bottom Text</label>
                        <input type="text" value={bottomText} onChange={(e) => setBottomText(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }} />
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Font</label>
                        <select value={font} onChange={(e) => setFont(e.target.value)} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)' }}>
                            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                    </div>

                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Font Size: {fontSize}px</label>
                        <input type="range" min="24" max="72" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} style={{ width: '100%' }} />
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Text Color</label>
                        <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} style={{ width: '100%', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }} />
                    </div>

                    {error && (
                        <div style={{ padding: '10px', marginBottom: '12px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '6px', color: '#FF6B6B', fontSize: '0.8rem' }}>
                            {error}
                        </div>
                    )}

                    {downloadUrl ? (
                        <a href={downloadUrl} download className="btn btn-primary" style={{ width: '100%', display: 'block', textAlign: 'center', textDecoration: 'none' }}>
                            ⬇️ Download Meme
                        </a>
                    ) : (
                        <button onClick={handleGenerate} className="btn btn-primary" style={{ width: '100%' }} disabled={!imageUrl || processing}>
                            {processing ? '⏳ Generating...' : '🔥 Generate Meme'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

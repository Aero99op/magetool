'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { imageApi } from '@/lib/api';
import ToolContent from '@/components/ToolContent';

export default function ColorPaletteClient() {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [numColors, setNumColors] = useState(5);
    const [colors, setColors] = useState<Array<{ hex: string; rgb: { r: number; g: number; b: number }; percentage: number }>>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            setImageUrl(URL.createObjectURL(f));
            setColors([]);
            setError('');
        }
    };

    const handleExtract = async () => {
        if (!file) return;

        setLoading(true);
        setError('');

        try {
            const response = await imageApi.colorPalette(file, numColors);

            if (response.success) {
                setColors(response.colors);
            } else {
                setError(response.error || 'Extraction failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || err.message || 'Failed to extract palette');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="tool-title">Color Palette Extractor</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Extract dominant colors from any image</p>
            </motion.div>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                    {!imageUrl ? (
                        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px', border: '2px dashed var(--glass-border)', borderRadius: '12px', cursor: 'pointer' }}>
                            <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                            <span style={{ fontSize: '3rem', marginBottom: '16px' }}>🎨</span>
                            <span style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>Upload image</span>
                        </label>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <img src={imageUrl} alt="Preview" style={{ width: '100%', borderRadius: '8px' }} />
                                <div style={{ marginTop: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Number of Colors: {numColors}</label>
                                    <input type="range" min="3" max="10" value={numColors} onChange={(e) => { setNumColors(Number(e.target.value)); setColors([]); }} style={{ width: '100%' }} />
                                </div>
                                <button onClick={handleExtract} className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
                                    {loading ? '⏳ Extracting...' : '🎨 Extract Palette'}
                                </button>
                            </div>

                            <div>
                                {colors.length > 0 ? (
                                    <div>
                                        <h3 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Extracted Colors</h3>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {colors.map((color, i) => (
                                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: color.hex, border: '1px solid var(--glass-border)' }} />
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace' }}>{color.hex.toUpperCase()}</div>
                                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})</div>
                                                    </div>
                                                    <div style={{ color: 'var(--neon-blue)', fontSize: '0.8rem' }}>{color.percentage}%</div>
                                                    <button onClick={() => copyToClipboard(color.hex)} style={{ padding: '4px 8px', background: 'rgba(0,217,255,0.1)', border: 'none', borderRadius: '4px', color: 'var(--neon-blue)', cursor: 'pointer', fontSize: '0.7rem' }}>
                                                        Copy
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => copyToClipboard(colors.map(c => c.hex).join(', '))} className="btn btn-ghost" style={{ width: '100%', marginTop: '16px' }}>
                                            📋 Copy All Colors
                                        </button>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                                        Click "Extract Palette" to analyze
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {error && (
                    <div style={{ padding: '16px', background: 'rgba(255,100,100,0.1)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: '8px', color: '#FF6B6B', textAlign: 'center' }}>
                        {error}
                    </div>
                )}
            </div>

            <ToolContent
                overview="Extract a beautiful color palette from any image. Identify dominant colors and get their HEX and RGB codes. Perfect for designers looking for inspiration from photos."
                features={[
                    "Dominant Colors: Finds the most prominent colors in the image.",
                    "Adjustable Quantity: Extract anywhere from 3 to 10 colors.",
                    "Color Codes: Get HEX and RGB values for easy copying.",
                    "Visual Preview: See the palette alongside the source image."
                ]}
                howTo={[
                    { step: "Upload Image", description: "Choose a photo to analyze." },
                    { step: "Settings", description: "Select how many colors you want." },
                    { step: "Extract", description: "Click to generate the palette." },
                    { step: "Copy", description: "Click any color code to copy it." }
                ]}
            />
        </div>
    );
}

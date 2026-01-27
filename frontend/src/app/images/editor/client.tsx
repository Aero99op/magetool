'use client';

import { useState, useRef, useEffect, ChangeEvent, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, Download, Sliders, Layout, Image as ImageIcon,
    RotateCcw, RotateCw, FlipHorizontal, FlipVertical,
    Sun, Moon, Contrast, Droplets, Palette, Layers,
    Maximize, Minimize, RefreshCw, X, Crop, Type, Frame,
    Wand2, Scissors, ZoomIn, ZoomOut, Move
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS                                   */
/* -------------------------------------------------------------------------- */

const ADJUSTMENTS = [
    { name: 'Brightness', property: 'brightness', min: 0, max: 200, default: 100, unit: '%' },
    { name: 'Contrast', property: 'contrast', min: 0, max: 200, default: 100, unit: '%' },
    { name: 'Saturation', property: 'saturate', min: 0, max: 200, default: 100, unit: '%' },
    { name: 'Warmth', property: 'sepia', min: 0, max: 100, default: 0, unit: '%' }, // Using sepia as proxy or overlay
    { name: 'Hue', property: 'hue-rotate', min: 0, max: 360, default: 0, unit: 'deg' },
    { name: 'Blur', property: 'blur', min: 0, max: 20, default: 0, unit: 'px' },
    { name: 'Invert', property: 'invert', min: 0, max: 100, default: 0, unit: '%' },
    { name: 'Opacity', property: 'opacity', min: 0, max: 100, default: 100, unit: '%' },
    { name: 'Grayscale', property: 'grayscale', min: 0, max: 100, default: 0, unit: '%' },
];

const OVERLAYS = [
    { name: 'Vignette', property: 'vignette', min: 0, max: 100, default: 0 },
    { name: 'Noise', property: 'noise', min: 0, max: 100, default: 0 },
    { name: 'Tint', property: 'tint', min: 0, max: 100, default: 0 }, // Color overlay intensity
];

const CROP_RATIOS = [
    { name: 'Free', value: 0 },
    { name: '1:1', value: 1 },
    { name: '16:9', value: 16 / 9 },
    { name: '4:3', value: 4 / 3 },
    { name: '9:16', value: 9 / 16 },
];

const COLLAGE_LAYOUTS = [
    // --- 2 Images ---
    { id: '2h', name: '2 Horizontal', count: 2, template: '"a" "b"', icon: 'TbLayoutRows' },
    { id: '2v', name: '2 Vertical', count: 2, template: '"a b"', icon: 'TbLayoutColumns' },
    { id: '2big-top', name: 'Big Top', count: 2, template: '"a a" "b b"', icon: 'TbLayoutRows' },

    // --- 3 Images ---
    { id: '3h', name: '3 Horizontal', count: 3, template: '"a" "b" "c"' },
    { id: '3v', name: '3 Vertical', count: 3, template: '"a b c"' },
    { id: '3big-left', name: '3 Big Left', count: 3, template: '"a a b" "a a c"' },
    { id: '3big-top', name: '3 Big Top', count: 3, template: '"a a" "b c"' },

    // --- 4 Images ---
    { id: '4grid', name: '4 Grid', count: 4, template: '"a b" "c d"' },
    { id: '4rows', name: '4 Rows', count: 4, template: '"a" "b" "c" "d"' },
    { id: '4cols', name: '4 Cols', count: 4, template: '"a b c d"' },
    { id: '4big-center', name: '4 Center Focus', count: 4, template: '"a b a c" "d b a c"' },
    { id: '4left-focus', name: '4 Left Focus', count: 4, template: '"a a b" "a a c" "a a d"' },

    // --- 5 Images ---
    { id: '5mosaic', name: '5 Mosaic', count: 5, template: '"a a b" "a a c" "d e e"' },
    { id: '5center', name: '5 Center', count: 5, template: '"a b c" "d e e"' },

    // --- 6 Images ---
    { id: '6grid-2x3', name: '6 Grid 2x3', count: 6, template: '"a b c" "d e f"' },

    // --- Passport / Special ---
    { id: 'pp-4', name: 'Passport 4 (2x2)', count: 4, template: '"a a" "a a"', type: 'passport' },
];

/* -------------------------------------------------------------------------- */
/*                                HELPERS                                     */
/* -------------------------------------------------------------------------- */

// Convolution implementation for Sharpen/Edge/Emboss
const processConvolution = (ctx: CanvasRenderingContext2D, width: number, height: number, kernel: number[]) => {
    const imageData = ctx.getImageData(0, 0, width, height);
    const side = Math.round(Math.sqrt(kernel.length));
    const halfSide = Math.floor(side / 2);
    const src = imageData.data;
    const canvasWidth = width;
    const canvasHeight = height;
    const output = ctx.createImageData(width, height);
    const dst = output.data;

    for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
            let r = 0, g = 0, b = 0;
            for (let cy = 0; cy < side; cy++) {
                for (let cx = 0; cx < side; cx++) {
                    const scy = y + cy - halfSide;
                    const scx = x + cx - halfSide;
                    if (scy >= 0 && scy < canvasHeight && scx >= 0 && scx < canvasWidth) {
                        const srcOffset = (scy * canvasWidth + scx) * 4;
                        const wt = kernel[cy * side + cx];
                        r += src[srcOffset] * wt;
                        g += src[srcOffset + 1] * wt;
                        b += src[srcOffset + 2] * wt;
                    }
                }
            }
            const dstOffset = (y * canvasWidth + x) * 4;
            dst[dstOffset] = r;
            dst[dstOffset + 1] = g;
            dst[dstOffset + 2] = b;
            dst[dstOffset + 3] = src[dstOffset + 3];
        }
    }
    return output;
};

/* -------------------------------------------------------------------------- */
/*                                COMPONENTS                                  */
/* -------------------------------------------------------------------------- */

export default function ImageEditorClient() {
    const [mode, setMode] = useState<'editor' | 'collage'>('editor');

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '32px' }}>
                <h1 className="tool-title">Pro Image Studio</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Advanced 30+ Tools Editor & Collage Maker</p>

                <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', marginTop: '20px', border: '1px solid var(--glass-border)' }}>
                    <button
                        onClick={() => setMode('editor')}
                        className={mode === 'editor' ? 'btn btn-primary' : 'btn btn-ghost'}
                        style={{ borderRadius: '8px', padding: '8px 24px' }}
                    >
                        <Sliders size={18} style={{ marginRight: '8px' }} /> Editor
                    </button>
                    <button
                        onClick={() => setMode('collage')}
                        className={mode === 'collage' ? 'btn btn-primary' : 'btn btn-ghost'}
                        style={{ borderRadius: '8px', padding: '8px 24px' }}
                    >
                        <Layout size={18} style={{ marginRight: '8px' }} /> Collage
                    </button>
                </div>
            </motion.div>

            <AnimatePresence mode="wait">
                {mode === 'editor' ? (
                    <SingleEditor key="editor" />
                ) : (
                    <CollageMaker key="collage" />
                )}
            </AnimatePresence>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*                               SINGLE EDITOR                                */
/* -------------------------------------------------------------------------- */

function SingleEditor() {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('adjust');

    // State for all tools
    const [adjValues, setAdjValues] = useState<Record<string, number>>({});
    const [overlayValues, setOverlayValues] = useState<Record<string, number>>({});

    const [transform, setTransform] = useState({ rotate: 0, flipH: 1, flipV: 1, scale: 1 });
    const [effect, setEffect] = useState<string>('none'); // sharpen, emboss, etc.

    const [textOverlay, setTextOverlay] = useState({ text: '', x: 50, y: 50, color: '#ffffff', size: 40 });
    const [border, setBorder] = useState({ size: 0, color: '#ffffff' });

    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Initialize defaults
    useEffect(() => {
        const defaults: Record<string, number> = {};
        ADJUSTMENTS.forEach(f => defaults[f.property] = f.default);
        setAdjValues(defaults);

        const overlayDefs: Record<string, number> = {};
        OVERLAYS.forEach(f => overlayDefs[f.property] = f.default);
        setOverlayValues(overlayDefs);
    }, []);

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            const img = new Image();
            img.onload = () => {
                setImage(img);
                setImageUrl(url);
                setTransform({ rotate: 0, flipH: 1, flipV: 1, scale: 1 });
            };
            img.src = url;
        }
    };

    // --- RENDER PIPELINE ---
    useEffect(() => {
        if (!image || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // 1. Setup Canvas Size
        // We keep canvas size = image size usually, but for border we might need expansion?
        // For simplicity, border draws INSIDE.
        canvas.width = image.width;
        canvas.height = image.height;

        // 2. Offscreen processing for expensive pixel ops (Sharpen etc)
        // If we have effects, we might need a temp pass. 
        // For performance, we'll apply these AFTER drawing the base image if possible, 
        // but `getImageData` gets what's on canvas. So: Draw -> Get -> Process -> Put.

        // --- STEP A: DRAW BASE with Transforms ---
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((transform.rotate * Math.PI) / 180);
        ctx.scale(transform.flipH * transform.scale, transform.flipV * transform.scale);

        // CSS Filters (Brightness etc) - applied to drawImage
        const filterString = ADJUSTMENTS.map(f => {
            if (f.name === 'Warmth' || f.name === 'Tint' || f.name === 'Opacity') return ''; // Handled separately
            const val = adjValues[f.property];
            return `${f.property}(${val}${f.unit})`;
        }).join(' ');
        ctx.filter = filterString;

        ctx.drawImage(image, -image.width / 2, -image.height / 2);
        ctx.restore();
        ctx.filter = 'none'; // Reset filter

        // --- STEP B: PIXEL EFFECTS (Expensive) ---
        if (effect !== 'none') {
            if (effect === 'sharpen') {
                const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
                const processed = processConvolution(ctx, canvas.width, canvas.height, kernel);
                ctx.putImageData(processed, 0, 0);
            } else if (effect === 'emboss') {
                const kernel = [-2, -1, 0, -1, 1, 1, 0, 1, 2];
                const processed = processConvolution(ctx, canvas.width, canvas.height, kernel);
                ctx.putImageData(processed, 0, 0);
            } else if (effect === 'edge') {
                const kernel = [-1, -1, -1, -1, 8, -1, -1, -1, -1];
                const processed = processConvolution(ctx, canvas.width, canvas.height, kernel);
                ctx.putImageData(processed, 0, 0);
            }
        }

        // --- STEP C: NOISE ---
        if (overlayValues.noise > 0) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            const factor = overlayValues.noise * 2.55; // 0-255 range
            for (let i = 0; i < data.length; i += 4) {
                const rand = (0.5 - Math.random()) * factor;
                data[i] += rand;
                data[i + 1] += rand;
                data[i + 2] += rand;
            }
            ctx.putImageData(imageData, 0, 0);
        }

        // --- STEP D: OVERLAYS (Vignette, Warmth, Tint) ---
        ctx.save();
        // Warmth (Orange overlay)
        if (adjValues.sepia > 0) { // Using 'Warmth' slider mapped to sepia logic but doing overlay
            ctx.fillStyle = `rgba(255, 160, 0, ${adjValues.sepia / 200})`; // 0.0 - 0.5 opacity
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Tint (Pink/Purple overlay example)
        if (overlayValues.tint > 0) {
            ctx.fillStyle = `rgba(255, 0, 255, ${overlayValues.tint / 200})`;
            ctx.globalCompositeOperation = 'soft-light';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        // Vignette
        if (overlayValues.vignette > 0) {
            ctx.globalCompositeOperation = 'source-over';
            const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.width / 4, canvas.width / 2, canvas.height / 2, canvas.width / 1.2);
            gradient.addColorStop(0, 'rgba(0,0,0,0)');
            gradient.addColorStop(1, `rgba(0,0,0, ${overlayValues.vignette / 100})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        ctx.restore();

        // --- STEP E: DECORATIONS (Text, Border) ---
        // Basic Text
        if (textOverlay.text) {
            ctx.save();
            ctx.fillStyle = textOverlay.color;
            ctx.font = `bold ${textOverlay.size}px Arial`;
            ctx.textAlign = 'center';
            // Simple positioning logic (percent to pixels)
            const tx = (textOverlay.x / 100) * canvas.width;
            const ty = (textOverlay.y / 100) * canvas.height;
            ctx.fillText(textOverlay.text, tx, ty);
            ctx.restore();
        }

        // Border
        if (border.size > 0) {
            ctx.strokeStyle = border.color;
            ctx.lineWidth = border.size * 2; // *2 because stroke is centered
            ctx.strokeRect(0, 0, canvas.width, canvas.height);
        }

    }, [image, adjValues, overlayValues, transform, effect, textOverlay, border]);


    const handleDownload = () => {
        if (!canvasRef.current) return;
        const link = document.createElement('a');
        link.download = 'edited-image-pro.png';
        link.href = canvasRef.current.toDataURL('image/png', 0.9);
        link.click();
    };

    const resetAll = () => {
        const defaults: Record<string, number> = {};
        ADJUSTMENTS.forEach(f => defaults[f.property] = f.default);
        setAdjValues(defaults);
        setOverlayValues({ vignette: 0, noise: 0, tint: 0 });
        setTransform({ rotate: 0, flipH: 1, flipV: 1, scale: 1 });
        setEffect('none');
        setTextOverlay({ text: '', x: 50, y: 50, color: '#ffffff', size: 40 });
        setBorder({ size: 0, color: '#ffffff' });
    };

    // TAB COMPONENTS
    const renderControls = () => {
        switch (activeTab) {
            case 'adjust':
                return (
                    <div className="scroll-y" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                        {ADJUSTMENTS.map(f => (
                            <div key={f.name} style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                                    <label>{f.name}</label>
                                    <span style={{ color: 'var(--neon-blue)' }}>{adjValues[f.property]}</span>
                                </div>
                                <input
                                    type="range" min={f.min} max={f.max}
                                    value={adjValues[f.property]}
                                    onChange={e => setAdjValues(p => ({ ...p, [f.property]: Number(e.target.value) }))}
                                    style={{ width: '100%', accentColor: 'var(--neon-blue)' }}
                                />
                            </div>
                        ))}
                    </div>
                );
            case 'effects':
                return (
                    <div className="scroll-y" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Filters (Pixel Ops)</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {['none', 'sharpen', 'emboss', 'edge'].map(e => (
                                    <button
                                        key={e}
                                        onClick={() => setEffect(e)}
                                        className={effect === e ? 'btn-tag active' : 'btn-tag'}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            border: effect === e ? '1px solid var(--neon-blue)' : '1px solid var(--glass-border)',
                                            background: effect === e ? 'rgba(0,217,255,0.1)' : 'transparent',
                                            cursor: 'pointer',
                                            color: 'var(--text-primary)'
                                        }}
                                    >
                                        {e.charAt(0).toUpperCase() + e.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {OVERLAYS.map(f => (
                            <div key={f.name} style={{ marginBottom: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.8rem' }}>
                                    <label>{f.name}</label>
                                    <span style={{ color: 'var(--neon-blue)' }}>{overlayValues[f.property]}</span>
                                </div>
                                <input
                                    type="range" min={f.min} max={f.max}
                                    value={overlayValues[f.property]}
                                    onChange={e => setOverlayValues(p => ({ ...p, [f.property]: Number(e.target.value) }))}
                                    style={{ width: '100%', accentColor: 'var(--neon-blue)' }}
                                />
                            </div>
                        ))}

                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Transforms</label>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <button className="btn-icon" onClick={() => setTransform(p => ({ ...p, rotate: p.rotate - 90 }))}><RotateCcw size={16} /> L</button>
                                <button className="btn-icon" onClick={() => setTransform(p => ({ ...p, rotate: p.rotate + 90 }))}><RotateCw size={16} /> R</button>
                                <button className="btn-icon" onClick={() => setTransform(p => ({ ...p, flipH: p.flipH * -1 }))}><FlipHorizontal size={16} /> H</button>
                                <button className="btn-icon" onClick={() => setTransform(p => ({ ...p, flipV: p.flipV * -1 }))}><FlipVertical size={16} /> V</button>
                                <button className="btn-icon" onClick={() => setTransform(p => ({ ...p, scale: p.scale + 0.1 }))}><ZoomIn size={16} /> +</button>
                                <button className="btn-icon" onClick={() => setTransform(p => ({ ...p, scale: Math.max(0.1, p.scale - 0.1) }))}><ZoomOut size={16} /> -</button>
                            </div>
                        </div>
                    </div>
                );
            case 'decorate':
                return (
                    <div className="scroll-y">
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Add Text</label>
                            <input
                                type="text"
                                value={textOverlay.text}
                                onChange={e => setTextOverlay(p => ({ ...p, text: e.target.value }))}
                                placeholder="Type something..."
                                style={{ width: '100%', padding: '8px', marginBottom: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: '#fff' }}
                            />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <input type="number" value={textOverlay.size} onChange={e => setTextOverlay(p => ({ ...p, size: Number(e.target.value) }))} placeholder="Size" style={{ padding: '8px', background: 'transparent', border: '1px solid var(--glass-border)', color: '#fff' }} />
                                <input type="color" value={textOverlay.color} onChange={e => setTextOverlay(p => ({ ...p, color: e.target.value }))} style={{ width: '100%', height: '36px', border: 'none' }} />
                            </div>
                            <div style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Position:
                                <input type="range" min="0" max="100" value={textOverlay.x} onChange={e => setTextOverlay(p => ({ ...p, x: Number(e.target.value) }))} style={{ width: '100%', margin: '4px 0' }} />
                                <input type="range" min="0" max="100" value={textOverlay.y} onChange={e => setTextOverlay(p => ({ ...p, y: Number(e.target.value) }))} style={{ width: '100%', margin: '4px 0' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px' }}>Border</label>
                            <input
                                type="range" min="0" max="50"
                                value={border.size} onChange={e => setBorder(p => ({ ...p, size: Number(e.target.value) }))}
                                style={{ width: '100%', marginBottom: '8px' }}
                            />
                            <input type="color" value={border.color} onChange={e => setBorder(p => ({ ...p, color: e.target.value }))} style={{ width: '100%', height: '30px', border: 'none' }} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid-layout" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 340px', gap: '24px', maxWidth: '1400px', margin: '0 auto' }}>

            {/* Canvas Area */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '600px', background: '#0a0a0a', position: 'relative' }}>
                {!imageUrl ? (
                    <label style={{ cursor: 'pointer', textAlign: 'center' }}>
                        <input type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 217, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--neon-blue)' }}>
                            <Upload size={32} />
                        </div>
                        <h3 style={{ marginBottom: '8px' }}>Open Photo</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Drag & drop high-res photo</p>
                    </label>
                ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <canvas ref={canvasRef} style={{ maxWidth: '100%', maxHeight: '600px', objectFit: 'contain', boxShadow: '0 0 40px rgba(0,0,0,0.5)' }} />
                    </div>
                )}
            </div>

            {/* Controls Side Panel */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '700px' }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)' }}>
                    {['adjust', 'effects', 'decorate'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                flex: 1,
                                padding: '16px',
                                background: activeTab === tab ? 'rgba(255,255,255,0.05)' : 'transparent',
                                border: 'none',
                                borderBottom: activeTab === tab ? '2px solid var(--neon-blue)' : '2px solid transparent',
                                color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                                cursor: 'pointer',
                                fontWeight: 500
                            }}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                    {renderControls()}
                </div>

                <div style={{ padding: '24px', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        <button onClick={resetAll} className="btn-icon" title="Reset All" style={{ flex: 1 }}>
                            <RotateCcw size={16} /> Reset
                        </button>
                        {imageUrl && (
                            <button onClick={() => { setImage(null); setImageUrl(null); }} className="btn-icon" style={{ flex: 1, color: '#ff6b6b' }}>
                                <X size={16} /> Close
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleDownload}
                        disabled={!imageUrl}
                        className="btn btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Download size={18} /> Export Image
                    </button>
                </div>
            </div>

            <style jsx>{`
                .btn-icon {
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid var(--glass-border);
                    border-radius: 6px;
                    color: var(--text-primary);
                    cursor: pointer;
                    transition: all 0.2s;
                    gap: 6px;
                }
                .btn-icon:hover {
                    background: rgba(0, 217, 255, 0.1);
                    border-color: var(--neon-blue);
                }
            `}</style>
        </motion.div>
    );
}


/* -------------------------------------------------------------------------- */
/*                               COLLAGE MAKER                                */
/* -------------------------------------------------------------------------- */

// (Kept implementation identical to previous step but included in this file for completeness)
function CollageMaker() {
    const [images, setImages] = useState<string[]>([]);
    const [layoutId, setLayoutId] = useState('4grid');
    const [spacing, setSpacing] = useState(10);
    const [borderRadius, setBorderRadius] = useState(0);
    const [aspectRatio, setAspectRatio] = useState(1);
    const [bgColor, setBgColor] = useState('#ffffff');
    const collageRef = useRef<HTMLDivElement>(null);

    const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map(f => URL.createObjectURL(f));
            setImages(prev => [...prev, ...newImages].slice(0, 9));
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const getLayoutStyles = () => {
        const layout = COLLAGE_LAYOUTS.find(l => l.id === layoutId);
        if (!layout) return {};
        return {
            display: 'grid',
            gap: `${spacing}px`,
            gridTemplateAreas: layout.template,
            gridAutoColumns: '1fr',
            gridAutoRows: '1fr',
            height: '100%',
            width: '100%',
            background: bgColor,
            padding: `${spacing}px`
        };
    };

    const handleDownload = async () => {
        if (!collageRef.current) return;
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(collageRef.current, { useCORS: true, scale: 2, backgroundColor: bgColor });
        const link = document.createElement('a');
        link.download = `collage-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    const getAreas = (template: string) => {
        const raw = template.replace(/"/g, '').split(/\s+/);
        return Array.from(new Set(raw));
    };

    const activeLayout = COLLAGE_LAYOUTS.find(l => l.id === layoutId) || COLLAGE_LAYOUTS[0];
    const cells = getAreas(activeLayout.template);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            <div className="glass-card" style={{ padding: '24px', minHeight: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div ref={collageRef} style={{ width: '100%', maxWidth: '600px', aspectRatio: String(aspectRatio), ...getLayoutStyles() as any, boxShadow: '0 0 30px rgba(0,0,0,0.5)', position: 'relative' }}>
                    {cells.map((area, index) => (
                        <div key={area} style={{ gridArea: area, background: 'rgba(255,255,255,0.1)', borderRadius: `${borderRadius}px`, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {images[index] ? (
                                <>
                                    <img src={images[index]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button onClick={() => removeImage(index)} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', zIndex: 10 }}><X size={14} /></button>
                                </>
                            ) : (
                                <div style={{ color: 'var(--text-muted)', fontSize: '2rem', fontWeight: 700, opacity: 0.3 }}>{index + 1}</div>
                            )}
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', overflowX: 'auto', maxWidth: '100%', paddingBottom: '10px' }}>
                    {images.map((src, i) => (
                        <div key={i} style={{ width: 60, height: 60, flexShrink: 0, borderRadius: 4, overflow: 'hidden', border: '2px solid var(--glass-border)', cursor: 'grab' }}>
                            <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} draggable />
                        </div>
                    ))}
                    <label style={{ width: 60, height: 60, flexShrink: 0, borderRadius: 4, border: '2px dashed var(--neon-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--neon-blue)' }}>
                        <input type="file" onChange={handleFiles} multiple accept="image/*" style={{ display: 'none' }} />
                        <Upload size={20} />
                    </label>
                </div>
            </div>
            <div className="glass-card" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '16px' }}>Collage Settings</h3>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Layout</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                        {COLLAGE_LAYOUTS.map(l => (
                            <button key={l.id} onClick={() => setLayoutId(l.id)} title={l.name} style={{ aspectRatio: '1', background: layoutId === l.id ? 'rgba(0,217,255,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${layoutId === l.id ? 'var(--neon-blue)' : 'var(--glass-border)'}`, borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                <span style={{ opacity: 0.5 }}>{l.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="control-group"><label>Spacing ({spacing}px)</label><input type="range" min="0" max="50" value={spacing} onChange={e => setSpacing(Number(e.target.value))} /></div>
                <div className="control-group"><label>Border Radius ({borderRadius}px)</label><input type="range" min="0" max="100" value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} /></div>
                <div className="control-group"><label>Aspect Ratio</label><select value={aspectRatio} onChange={e => setAspectRatio(Number(e.target.value))} style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', borderRadius: '6px' }}><option value={1}>1:1</option><option value={4 / 3}>4:3</option><option value={3 / 4}>3:4</option><option value={16 / 9}>16:9</option><option value={9 / 16}>9:16</option></select></div>
                <div className="control-group"><label>Background</label><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '100%', height: 30, padding: 0, border: 'none' }} /></div>
                <button onClick={handleDownload} className="btn btn-primary" style={{ width: '100%', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Download size={18} /> Save Collage</button>
            </div>
            <style jsx>{`
                .control-group { margin-bottom: 16px; }
                .control-group label { display: block; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; }
                .control-group input[type="range"] { width: 100%; accent-color: var(--neon-blue); }
            `}</style>
        </motion.div>
    );
}

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

const SIZE_PRESETS = [
    { name: 'Custom Design', ratio: -1 },
    { name: 'Passport (3.5x4.5 cm)', ratio: 35 / 45 },
    { name: 'Standard Photo (4x6)', ratio: 4 / 6 },
    { name: 'Instagram Square', ratio: 1 },
    { name: 'Instagram Story (9:16)', ratio: 9 / 16 },
    { name: 'LinkedIn Banner', ratio: 4 / 1 },
    { name: 'A4 Paper (Print)', ratio: 1 / 1.414 },
];

function CollageMaker() {
    const [library, setLibrary] = useState<string[]>([]);
    const [mode, setMode] = useState<'preset' | 'grid'>('grid');
    const [rows, setRows] = useState(2);
    const [cols, setCols] = useState(2);
    const [layoutId, setLayoutId] = useState('4grid');
    const [cellImages, setCellImages] = useState<Record<number, string>>({});
    const [spacing, setSpacing] = useState(15);
    const [borderRadius, setBorderRadius] = useState(8);
    const [bgColor, setBgColor] = useState('#ffffff');
    const [aspectRatio, setAspectRatio] = useState(1);
    const [customSize, setCustomSize] = useState({ w: 1200, h: 1200 });
    const [isCustom, setIsCustom] = useState(false);
    const [draggedImage, setDraggedImage] = useState<string | null>(null);
    const collageRef = useRef<HTMLDivElement>(null);

    // Determines if we should use dark or light borders based on canvas background
    const isDarkBg = () => {
        const rgb = bgColor.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(rgb);
        if (!result) return false;
        const r = parseInt(result[1], 16), g = parseInt(result[2], 16), b = parseInt(result[3], 16);
        return (r * 0.299 + g * 0.587 + b * 0.114) < 128;
    };

    const handleFiles = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files).map(f => URL.createObjectURL(f));
            setLibrary(prev => [...prev, ...newImages]);
        }
    };

    const handleDrop = (index: number) => {
        if (draggedImage) {
            setCellImages(prev => ({ ...prev, [index]: draggedImage }));
            setDraggedImage(null);
        }
    };

    const clearCell = (index: number) => {
        setCellImages(prev => {
            const next = { ...prev };
            delete next[index];
            return next;
        });
    };

    const getGridStyles = () => {
        if (mode === 'preset') {
            const layout = COLLAGE_LAYOUTS.find(l => l.id === layoutId) || COLLAGE_LAYOUTS[0];
            return {
                display: 'grid',
                gap: `${spacing}px`,
                gridTemplateAreas: layout.template,
                gridAutoColumns: '1fr',
                gridAutoRows: '1fr',
            };
        } else {
            return {
                display: 'grid',
                gap: `${spacing}px`,
                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                gridTemplateRows: `repeat(${rows}, 1fr)`,
            };
        }
    };

    const getCells = () => {
        if (mode === 'preset') {
            const activeLayout = COLLAGE_LAYOUTS.find(l => l.id === layoutId) || COLLAGE_LAYOUTS[0];
            const raw = activeLayout.template.replace(/"/g, '').split(/\s+/);
            const areas = Array.from(new Set(raw));
            return areas.map((area, i) => ({ id: area, index: i, area }));
        } else {
            return Array.from({ length: rows * cols }, (_, i) => ({ id: `cell-${i}`, index: i, area: 'auto' }));
        }
    };

    const handleDownload = async () => {
        if (!collageRef.current) return;
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(collageRef.current, { useCORS: true, scale: 3, backgroundColor: bgColor });
        const link = document.createElement('a');
        link.download = `mage-collage-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    };

    useEffect(() => {
        if (isCustom) setAspectRatio(customSize.w / customSize.h);
    }, [customSize, isCustom]);

    const cells = getCells();
    const darkTheme = isDarkBg();

    return (
        <div className="collage-studio" style={{ color: '#fff', height: '100%', padding: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 340px', gap: '20px', height: 'calc(100vh - 120px)' }}>

                {/* 1. MEDIA LIBRARY */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', borderRadius: '16px', background: 'rgba(15,15,15,0.7)', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <ImageIcon size={18} className="text-neon" /> My Photos
                        </h4>
                    </div>

                    <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
                        <label style={{ width: '100%', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', padding: '14px', borderRadius: '12px', background: 'var(--neon-blue)', color: '#000', fontWeight: 700, transition: '0.2s' }} className="upload-btn">
                            <input type="file" onChange={handleFiles} multiple accept="image/*" style={{ display: 'none' }} />
                            <Upload size={18} /> Add Photos
                        </label>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            {library.map((src, i) => (
                                <div key={i} draggable onDragStart={() => setDraggedImage(src)} style={{ aspectRatio: '1', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', cursor: 'grab', position: 'relative' }} className="library-card">
                                    <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <div className="drag-hint" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', opacity: 0, transition: '0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>DRAG ME</div>
                                </div>
                            ))}
                            {library.length === 0 && (
                                <div style={{ gridColumn: 'span 2', textAlign: 'center', padding: '40px 10px', opacity: 0.3, fontSize: '0.85rem' }}>
                                    Upload photos to start designing
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. MAIN CANVAS AREA */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>

                    <div style={{ position: 'absolute', top: 20, textAlign: 'center', width: '100%', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', zIndex: 5 }}>
                        &larr; Drag photos into the boxes below
                    </div>

                    {/* The Visual Container */}
                    <div
                        ref={collageRef}
                        style={{
                            width: '90%',
                            maxWidth: '700px',
                            padding: `${spacing}px`,
                            aspectRatio: String(aspectRatio),
                            ...getGridStyles() as any,
                            background: bgColor,
                            boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
                            borderRadius: '4px', // Subtle paper feel
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                        {cells.map((cell) => (
                            <div
                                key={cell.id}
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('active-drop'); }}
                                onDragLeave={(e) => e.currentTarget.classList.remove('active-drop')}
                                onDrop={(e) => { e.currentTarget.classList.remove('active-drop'); handleDrop(cell.index); }}
                                style={{
                                    gridArea: cell.area !== 'auto' ? cell.area : undefined,
                                    background: darkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
                                    borderRadius: `${borderRadius}px`,
                                    overflow: 'hidden',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: `2px dashed ${darkTheme ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                                    transition: '0.3s'
                                }}
                                className="collage-cell"
                            >
                                {cellImages[cell.index] ? (
                                    <>
                                        <img src={cellImages[cell.index]} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                                        <button onClick={() => clearCell(cell.index)} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(255,0,0,0.8)', color: '#fff', border: 'none', borderRadius: '50%', width: 24, height: 24, cursor: 'pointer', zIndex: 10 }}><X size={14} /></button>
                                    </>
                                ) : (
                                    <div style={{ textAlign: 'center', opacity: 0.5, pointerEvents: 'none' }}>
                                        <ImageIcon size={24} style={{ marginBottom: '4px' }} />
                                        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Drop Image</div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. SETTINGS & CONTROLS */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', borderRadius: '16px', background: 'rgba(15,15,15,0.7)', border: '1px solid rgba(255,255,255,0.1)', overflowY: 'auto' }}>

                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
                        <button onClick={() => setMode('grid')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: mode === 'grid' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Simple Grid</button>
                        <button onClick={() => setMode('preset')} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', background: mode === 'preset' ? 'rgba(255,255,255,0.1)' : 'transparent', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Pro Layouts</button>
                    </div>

                    <section>
                        <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--neon-blue)', marginBottom: '16px' }}>
                            {mode === 'grid' ? 'Grid Setup' : 'Choose Layout'}
                        </h5>

                        {mode === 'grid' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div className="s-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                        <span>Photos Across</span>
                                        <span style={{ fontWeight: 800 }}>{cols}</span>
                                    </div>
                                    <input type="range" min="1" max="10" value={cols} onChange={e => setCols(Number(e.target.value))} />
                                </div>
                                <div className="s-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                        <span>Photos Down</span>
                                        <span style={{ fontWeight: 800 }}>{rows}</span>
                                    </div>
                                    <input type="range" min="1" max="10" value={rows} onChange={e => setRows(Number(e.target.value))} />
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
                                {COLLAGE_LAYOUTS.map(l => (
                                    <button key={l.id} onClick={() => setLayoutId(l.id)} style={{ aspectRatio: '1', border: `2px solid ${layoutId === l.id ? 'var(--neon-blue)' : 'rgba(255,255,255,0.05)'}`, background: layoutId === l.id ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255,255,255,0.02)', borderRadius: '8px', cursor: 'pointer', padding: '4px' }}>
                                        <div style={{ color: layoutId === l.id ? 'var(--neon-blue)' : '#fff', fontSize: '10px', fontWeight: 800 }}>{l.count}P</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section>
                        <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--neon-blue)', marginBottom: '16px' }}>Canvas Size</h5>
                        <select onChange={(e) => { const v = Number(e.target.value); setIsCustom(v === -1); if (v !== -1) setAspectRatio(v); }} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}>
                            {SIZE_PRESETS.map(p => <option key={p.name} value={p.ratio}>{p.name}</option>)}
                        </select>
                        {isCustom && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
                                <input type="number" value={customSize.w} onChange={e => setCustomSize(p => ({ ...p, w: Number(e.target.value) }))} className="px-input" placeholder="Width" />
                                <input type="number" value={customSize.h} onChange={e => setCustomSize(p => ({ ...p, h: Number(e.target.value) }))} className="px-input" placeholder="Height" />
                            </div>
                        )}
                    </section>

                    <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="s-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                <span>Gap Size</span>
                                <span style={{ opacity: 0.5 }}>{spacing}px</span>
                            </div>
                            <input type="range" min="0" max="80" value={spacing} onChange={e => setSpacing(Number(e.target.value))} />
                        </div>
                        <div className="s-group">
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                                <span>Rounded Corners</span>
                                <span style={{ opacity: 0.5 }}>{borderRadius}px</span>
                            </div>
                            <input type="range" min="0" max="100" value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} />
                        </div>
                        <div className="s-group">
                            <span style={{ fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>Box Color</span>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '44px', height: '44px', border: 'none', padding: 0, background: 'none', cursor: 'pointer' }} />
                                <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0 12px', color: '#fff', fontSize: '0.9rem' }} />
                            </div>
                        </div>
                    </section>

                    <button onClick={handleDownload} style={{ width: '100%', marginTop: 'auto', padding: '18px', borderRadius: '14px', background: 'var(--neon-blue)', color: '#000', border: 'none', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 40px rgba(0, 217, 255, 0.3)' }} className="download-cta">
                        <Download size={22} /> Download Photo
                    </button>
                </div>
            </div>

            <style jsx>{`
                input[type="range"] { width: 100%; accent-color: var(--neon-blue); height: 6px; border-radius: 3px; cursor: pointer; }
                .px-input { width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 0.8rem; }
                .library-card:hover .drag-hint { opacity: 1; }
                .library-card:hover { border-color: var(--neon-blue) !important; transform: translateY(-2px); }
                .collage-cell:hover { border-color: var(--neon-blue) !important; }
                .active-drop { border-color: var(--neon-blue) !important; background: rgba(0, 217, 255, 0.1) !important; box-shadow: inset 0 0 20px rgba(0, 217, 255, 0.2); }
                .download-cta:hover { transform: scale(1.02); filter: brightness(1.1); }
                .upload-btn:hover { filter: brightness(1.1); }
            `}</style>
        </div>
    );
}

'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import MemeCanvas, { TextElement, createTextElement } from '@/components/MemeCanvas';
import ToolContent from '@/components/ToolContent';
import { Plus, Trash2, Download, Type } from 'lucide-react';

const FONTS = [
    'Impact',
    'Arial Black',
    'Arial',
    'Comic Sans MS',
    'Verdana',
    'Helvetica',
];

export default function MemeGeneratorClient() {
    const [file, setFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState('');
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [elements, setElements] = useState<TextElement[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const selectedElement = elements.find(el => el.id === selectedId);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f) {
            setFile(f);
            const url = URL.createObjectURL(f);
            setImageUrl(url);

            // Get image dimensions
            const img = new Image();
            img.onload = () => {
                setImageSize({ width: img.width, height: img.height });
                // Add initial text elements
                setElements([
                    { ...createTextElement(img.width, img.height), text: 'TOP TEXT', y: 30 },
                    { ...createTextElement(img.width, img.height), text: 'BOTTOM TEXT', y: img.height - 80 },
                ]);
            };
            img.src = url;
        }
    };

    const addTextElement = () => {
        if (imageSize.width === 0) return;
        const newElement = createTextElement(imageSize.width, imageSize.height);
        setElements([...elements, newElement]);
        setSelectedId(newElement.id);
    };

    const deleteSelectedElement = () => {
        if (!selectedId) return;
        setElements(elements.filter(el => el.id !== selectedId));
        setSelectedId(null);
    };

    const updateSelectedElement = (updates: Partial<TextElement>) => {
        if (!selectedId) return;
        setElements(elements.map(el =>
            el.id === selectedId ? { ...el, ...updates } : el
        ));
    };

    const handleDownload = async () => {
        if (!imageUrl || !canvasRef.current) return;

        setProcessing(true);

        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Load the image
            const img = new Image();
            img.crossOrigin = 'anonymous';

            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = reject;
                img.src = imageUrl;
            });

            // Set canvas size
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image
            ctx.drawImage(img, 0, 0);

            // Draw text elements
            elements.forEach(el => {
                ctx.save();
                ctx.translate(el.x, el.y);
                ctx.rotate((el.rotation * Math.PI) / 180);

                ctx.font = `bold ${el.fontSize}px ${el.fontFamily}`;
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';

                // Draw stroke
                if (el.strokeWidth > 0) {
                    ctx.strokeStyle = el.strokeColor;
                    ctx.lineWidth = el.strokeWidth * 2;
                    ctx.lineJoin = 'round';
                    ctx.strokeText(el.text.toUpperCase(), 0, 0);
                }

                // Draw fill
                ctx.fillStyle = el.color;
                ctx.fillText(el.text.toUpperCase(), 0, 0);

                ctx.restore();
            });

            // Download
            const link = document.createElement('a');
            link.download = 'meme.png';
            link.href = canvas.toDataURL('image/png');
            link.click();

        } catch (error) {
            console.error('Failed to generate meme:', error);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center', marginBottom: '32px' }}
            >
                <h1 className="tool-title">Meme Generator</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Create memes with unlimited draggable text - freestyle!
                </p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', maxWidth: '1000px', margin: '0 auto' }}>
                {/* Left: Canvas */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    {!imageUrl ? (
                        <label style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '100px',
                            border: '2px dashed var(--glass-border)',
                            borderRadius: '12px',
                            cursor: 'pointer'
                        }}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                style={{ display: 'none' }}
                            />
                            <span style={{ fontSize: '4rem', marginBottom: '16px' }}>😂</span>
                            <span style={{ color: 'var(--neon-blue)', fontWeight: 600 }}>Upload meme template</span>
                        </label>
                    ) : (
                        <MemeCanvas
                            imageUrl={imageUrl}
                            elements={elements}
                            onElementsChange={setElements}
                            selectedId={selectedId}
                            onSelectElement={setSelectedId}
                        />
                    )}
                </div>

                {/* Right: Controls */}
                <div className="glass-card" style={{ padding: '20px', height: 'fit-content', position: 'sticky', top: '100px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-primary)' }}>
                        Text Elements ({elements.length})
                    </h3>

                    <button
                        onClick={addTextElement}
                        disabled={!imageUrl}
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <Plus size={18} />
                        Add Text
                    </button>

                    {/* Element list */}
                    <div style={{ marginBottom: '16px', maxHeight: '150px', overflowY: 'auto' }}>
                        {elements.map((el, i) => (
                            <div
                                key={el.id}
                                onClick={() => setSelectedId(el.id)}
                                style={{
                                    padding: '10px',
                                    marginBottom: '8px',
                                    background: selectedId === el.id ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${selectedId === el.id ? 'var(--neon-blue)' : 'var(--glass-border)'}`,
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    color: 'var(--text-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Type size={14} />
                                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {el.text || 'Empty text'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Selected element editor */}
                    {selectedElement && (
                        <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Edit Text</span>
                                <button
                                    onClick={deleteSelectedElement}
                                    style={{ padding: '6px', background: 'rgba(255,100,100,0.1)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#FF6B6B' }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <input
                                type="text"
                                value={selectedElement.text}
                                onChange={(e) => updateSelectedElement({ text: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    marginBottom: '12px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '6px',
                                    color: 'var(--text-primary)',
                                    fontSize: '1rem'
                                }}
                            />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Font</label>
                                    <select
                                        value={selectedElement.fontFamily}
                                        onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                                        style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                                    >
                                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Size</label>
                                    <input
                                        type="number"
                                        value={selectedElement.fontSize}
                                        onChange={(e) => updateSelectedElement({ fontSize: Number(e.target.value) })}
                                        min={12}
                                        max={150}
                                        style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fill</label>
                                    <input
                                        type="color"
                                        value={selectedElement.color}
                                        onChange={(e) => updateSelectedElement({ color: e.target.value })}
                                        style={{ width: '100%', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stroke</label>
                                    <input
                                        type="color"
                                        value={selectedElement.strokeColor}
                                        onChange={(e) => updateSelectedElement({ strokeColor: e.target.value })}
                                        style={{ width: '100%', height: '36px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rotation</label>
                                    <input
                                        type="number"
                                        value={selectedElement.rotation}
                                        onChange={(e) => updateSelectedElement({ rotation: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '6px', color: 'var(--text-primary)', fontSize: '0.85rem' }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Download button */}
                    {imageUrl && (
                        <button
                            onClick={handleDownload}
                            disabled={processing}
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            <Download size={18} />
                            {processing ? 'Generating...' : 'Download Meme'}
                        </button>
                    )}
                </div>
            </div>

            {/* Hidden canvas for rendering */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <style jsx global>{`
                @media (max-width: 768px) {
                    .container > div:last-of-type {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>

            <ToolContent
                overview="Create viral memes in seconds with our advanced Meme Generator. Upload any image, add unlimited text layers, and customize fonts and colors to make your message pop."
                features={[
                    "Free Positioning: Drag and drop text anywhere on the canvas.",
                    "Custom Styling: Change fonts, sizes, colors, and stroke outlines.",
                    "Rotation: Rotate text for dynamic effects.",
                    "No Watermark: Download clean, high-quality memes."
                ]}
                howTo={[
                    { step: "Upload Template", description: "Choose a meme image or upload your own." },
                    { step: "Add Text", description: "Click 'Add Text' to create a new layer." },
                    { step: "Customize", description: "Font, color, size, and position." },
                    { step: "Download", description: "Save your creation and share!" }
                ]}
            />
        </div>
    );
}

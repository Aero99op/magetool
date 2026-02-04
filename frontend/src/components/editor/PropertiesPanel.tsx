'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Palette, Type, AlignLeft, AlignCenter, AlignRight,
    Bold, Italic, Underline, Trash2, Copy, Layers,
    ChevronUp, ChevronDown, MoveUp, MoveDown
} from 'lucide-react';
import { useEditorStore } from '@/hooks/useEditorStore';
import { FabricImage, filters } from 'fabric';
import type { FabricObject, Textbox, Rect, Circle } from 'fabric';

// Google Fonts for text
const FONTS = [
    'Inter',
    'Arial',
    'Impact',
    'Georgia',
    'Courier New',
    'Comic Sans MS',
    'Verdana',
    'Times New Roman',
];

export default function PropertiesPanel() {
    const { canvas, selectedObjects, saveToHistory } = useEditorStore();
    const selectedObject = selectedObjects[0];

    const [localProps, setLocalProps] = useState({
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 0,
        opacity: 100,
        fontSize: 32,
        fontFamily: 'Inter',
        textAlign: 'center',
        fontWeight: 'normal',
        fontStyle: 'normal',
        brightness: 0,
        contrast: 0,
    });

    // Sync local state with selected object
    useEffect(() => {
        if (selectedObject) {
            setLocalProps({
                fill: (selectedObject.fill as string) || '#ffffff',
                stroke: (selectedObject.stroke as string) || '#000000',
                strokeWidth: selectedObject.strokeWidth || 0,
                opacity: Math.round((selectedObject.opacity || 1) * 100),
                fontSize: (selectedObject as Textbox).fontSize || 32,
                fontFamily: (selectedObject as Textbox).fontFamily || 'Inter',
                textAlign: (selectedObject as Textbox).textAlign || 'center',
                fontWeight: (String((selectedObject as Textbox).fontWeight) || 'normal'),
                fontStyle: (String((selectedObject as Textbox).fontStyle) || 'normal'),
                brightness: 0, // Reset filters visual state (complex to read back from filters array generally, simplifying for MVP)
                contrast: 0,
            });

            // Try to read existing filters if image
            if (selectedObject.type === 'image') {
                const img = selectedObject as FabricImage;
                // Simplified: Assuming we only have one instance of each filter type
                // In real app, you'd map filters to state
            }
        }
    }, [selectedObject]);

    const updateProperty = (key: string, value: any) => {
        if (!selectedObject || !canvas) return;

        if (key === 'brightness' || key === 'contrast') {
            if (selectedObject.type !== 'image') return;

            const img = selectedObject as FabricImage;
            img.filters = img.filters || [];

            // Remove existing filter of this type
            // Note: This is a simplified approach, replacing the whole filter list might be cleaner or updating in place

            // Better: Create new filters array
            const newFilters = [];

            // 1. Brightness
            const bValue = key === 'brightness' ? value : localProps.brightness;
            if (bValue !== 0) {
                newFilters.push(new filters.Brightness({ brightness: bValue }));
            }

            // 2. Contrast
            const cValue = key === 'contrast' ? value : localProps.contrast;
            if (cValue !== 0) {
                newFilters.push(new filters.Contrast({ contrast: cValue }));
            }

            img.filters = newFilters;
            img.applyFilters();
        } else {
            selectedObject.set(key as keyof FabricObject, value);
        }

        canvas.renderAll();
        setLocalProps(prev => ({ ...prev, [key]: value }));
    };

    const applyChanges = () => {
        if (canvas) {
            saveToHistory();
            canvas.renderAll();
        }
    };

    const handleDuplicate = () => {
        if (!selectedObject || !canvas) return;

        selectedObject.clone().then((cloned: FabricObject) => {
            cloned.set({
                left: (selectedObject.left || 0) + 20,
                top: (selectedObject.top || 0) + 20,
            });
            canvas.add(cloned);
            canvas.setActiveObject(cloned);
            canvas.renderAll();
            saveToHistory();
        });
    };

    const handleDelete = () => {
        if (!selectedObject || !canvas) return;
        canvas.remove(selectedObject);
        canvas.renderAll();
        saveToHistory();
    };

    const handleBringForward = () => {
        if (!selectedObject || !canvas) return;
        canvas.bringObjectForward(selectedObject);
        canvas.renderAll();
        saveToHistory();
    };

    const handleSendBackward = () => {
        if (!selectedObject || !canvas) return;
        canvas.sendObjectBackwards(selectedObject);
        canvas.renderAll();
        saveToHistory();
    };

    const isText = selectedObject?.type === 'textbox' || selectedObject?.type === 'text';

    if (!selectedObject) {
        return (
            <div className="properties-panel" style={{
                padding: '24px',
                textAlign: 'center',
                color: 'var(--text-muted)',
            }}>
                <Layers size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p style={{ fontSize: '0.9rem' }}>Select an object to edit its properties</p>
            </div>
        );
    }

    return (
        <div className="properties-panel" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            padding: '20px',
            maxHeight: 'calc(100vh - 200px)',
            overflowY: 'auto',
        }}>
            <h4 style={{
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: 'var(--text-muted)',
                margin: 0,
            }}>
                {selectedObject.type?.toUpperCase()} Properties
            </h4>

            {/* Color Controls */}
            <div className="property-group">
                <label>Fill Color</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                        type="color"
                        value={localProps.fill}
                        onChange={(e) => updateProperty('fill', e.target.value)}
                        onBlur={applyChanges}
                        style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input
                        type="text"
                        value={localProps.fill}
                        onChange={(e) => updateProperty('fill', e.target.value)}
                        onBlur={applyChanges}
                        className="prop-input"
                    />
                </div>
            </div>

            <div className="property-group">
                <label>Stroke</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                        type="color"
                        value={localProps.stroke}
                        onChange={(e) => updateProperty('stroke', e.target.value)}
                        onBlur={applyChanges}
                        style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input
                        type="number"
                        value={localProps.strokeWidth}
                        onChange={(e) => updateProperty('strokeWidth', Number(e.target.value))}
                        onBlur={applyChanges}
                        min={0}
                        max={50}
                        className="prop-input"
                        style={{ width: '60px' }}
                    />
                </div>
            </div>

            <div className="property-group">
                <label>Opacity ({localProps.opacity}%)</label>
                <input
                    type="range"
                    min={0}
                    max={100}
                    value={localProps.opacity}
                    onChange={(e) => updateProperty('opacity', Number(e.target.value) / 100)}
                    onMouseUp={applyChanges}
                    style={{ width: '100%', accentColor: '#00D9FF' }}
                />
            </div>

            {/* Text Controls */}
            {isText && (
                <>
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />

                    <div className="property-group">
                        <label>Font Family</label>
                        <select
                            value={localProps.fontFamily}
                            onChange={(e) => { updateProperty('fontFamily', e.target.value); applyChanges(); }}
                            className="prop-select"
                        >
                            {FONTS.map(font => (
                                <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                            ))}
                        </select>
                    </div>

                    <div className="property-group">
                        <label>Font Size</label>
                        <input
                            type="number"
                            value={localProps.fontSize}
                            onChange={(e) => updateProperty('fontSize', Number(e.target.value))}
                            onBlur={applyChanges}
                            min={8}
                            max={200}
                            className="prop-input"
                        />
                    </div>

                    <div className="property-group">
                        <label>Style</label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <StyleButton
                                icon={Bold}
                                isActive={localProps.fontWeight === 'bold'}
                                onClick={() => {
                                    updateProperty('fontWeight', localProps.fontWeight === 'bold' ? 'normal' : 'bold');
                                    applyChanges();
                                }}
                            />
                            <StyleButton
                                icon={Italic}
                                isActive={localProps.fontStyle === 'italic'}
                                onClick={() => {
                                    updateProperty('fontStyle', localProps.fontStyle === 'italic' ? 'normal' : 'italic');
                                    applyChanges();
                                }}
                            />
                        </div>
                    </div>

                    <div className="property-group">
                        <label>Alignment</label>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <StyleButton icon={AlignLeft} isActive={localProps.textAlign === 'left'} onClick={() => { updateProperty('textAlign', 'left'); applyChanges(); }} />
                            <StyleButton icon={AlignCenter} isActive={localProps.textAlign === 'center'} onClick={() => { updateProperty('textAlign', 'center'); applyChanges(); }} />
                            <StyleButton icon={AlignRight} isActive={localProps.textAlign === 'right'} onClick={() => { updateProperty('textAlign', 'right'); applyChanges(); }} />
                        </div>
                    </div>
                </>
            )}

            {/* Image Filters & AI Tools */}
            {selectedObject.type === 'image' && (
                <>
                    <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>AI TOOLS</h4>

                    <button
                        onClick={async () => {
                            if (!selectedObject || !canvas) return;
                            const img = selectedObject as FabricImage;
                            const src = img.getSrc();

                            // Visual feedback
                            const originalOpacity = img.opacity;
                            img.set('opacity', 0.5);
                            canvas.renderAll();

                            try {
                                // Fetch blob from current image src
                                const r = await fetch(src);
                                const blob = await r.blob();

                                const formData = new FormData();
                                formData.append('file', blob, 'image.png');

                                const res = await fetch('/api/image/ai-remove-bg', {
                                    method: 'POST',
                                    body: formData
                                });

                                if (!res.ok) throw new Error('Failed to remove bg');

                                const data = await res.json();
                                // Assuming backend returns { url: "/temp/..." }
                                // We might need to handle absolute URL if backend is elsewhere
                                // For now try relative, or if start with /, it's relative to domain.
                                // If using a separate backend port, we might need a Helper to get API_URL.
                                // But let's user data.url. 

                                // Replace image source
                                await img.setSrc(data.url);
                                img.set('opacity', originalOpacity);
                                canvas.renderAll();
                                saveToHistory();

                            } catch (e) {
                                console.error(e);
                                alert('Error removing background');
                                img.set('opacity', originalOpacity);
                                canvas.renderAll();
                            }
                        }}
                        className="action-btn"
                        style={{ background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', border: 'none', color: '#000', fontWeight: 600 }}
                    >
                        <Layers size={16} /> Remove Background
                    </button>

                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '12px 0 0 0' }}>FILTERS</h4>

                    <div className="property-group">
                        <label>Brightness</label>
                        <input
                            type="range"
                            min={-1}
                            max={1}
                            step={0.01}
                            value={localProps.brightness}
                            onChange={(e) => updateProperty('brightness', Number(e.target.value))}
                            onMouseUp={applyChanges}
                            style={{ width: '100%', accentColor: '#00D9FF' }}
                        />
                    </div>

                    <div className="property-group">
                        <label>Contrast</label>
                        <input
                            type="range"
                            min={-1}
                            max={1}
                            step={0.01}
                            value={localProps.contrast}
                            onChange={(e) => updateProperty('contrast', Number(e.target.value))}
                            onMouseUp={applyChanges}
                            style={{ width: '100%', accentColor: '#00D9FF' }}
                        />
                    </div>
                </>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />

            {/* Layer Controls */}
            <div className="property-group">
                <label>Layer Order</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={handleBringForward} className="action-btn" title="Bring Forward">
                        <MoveUp size={16} /> Forward
                    </button>
                    <button onClick={handleSendBackward} className="action-btn" title="Send Backward">
                        <MoveDown size={16} /> Backward
                    </button>
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                <button onClick={handleDuplicate} className="action-btn" style={{ flex: 1 }}>
                    <Copy size={16} /> Duplicate
                </button>
                <button onClick={handleDelete} className="action-btn danger" style={{ flex: 1 }}>
                    <Trash2 size={16} /> Delete
                </button>
            </div>

            <style jsx>{`
                .property-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .property-group label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                .prop-input, .prop-select {
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.9rem;
                }
                .prop-input:focus, .prop-select:focus {
                    outline: none;
                    border-color: #00D9FF;
                }
                .action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 10px 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 0.8rem;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .action-btn:hover {
                    background: rgba(0, 217, 255, 0.1);
                    border-color: #00D9FF;
                }
                .action-btn.danger:hover {
                    background: rgba(255, 107, 107, 0.1);
                    border-color: #ff6b6b;
                    color: #ff6b6b;
                }
            `}</style>
        </div>
    );
}

function StyleButton({ icon: Icon, isActive, onClick }: { icon: any; isActive: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive ? 'rgba(0, 217, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: isActive ? '1px solid #00D9FF' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '6px',
                color: isActive ? '#00D9FF' : '#fff',
                cursor: 'pointer',
            }}
        >
            <Icon size={16} />
        </button>
    );
}

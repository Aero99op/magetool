'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout, Type, Square, Star, Layers, Settings,
    ChevronLeft, ChevronRight, Image as ImageIcon,
    Download
} from 'lucide-react';
import FabricCanvas, {
    addImageToCanvas,
    addTextToCanvas,
    addShapeToCanvas
} from './FabricCanvas';
import EditorToolbar from './EditorToolbar';
import PropertiesPanel from './PropertiesPanel';
import { useEditorStore } from '@/hooks/useEditorStore';

// Import Panels
import TextPanel from './panels/TextPanel';
import ShapesPanel from './panels/ShapesPanel';
import ElementsPanel from './panels/ElementsPanel';
import LayersPanel from './panels/LayersPanel';
import TemplatesPanel from './panels/TemplatesPanel';

// Canvas size presets
const SIZE_PRESETS = [
    { name: 'Instagram Post', width: 1080, height: 1080 },
    { name: 'Instagram Story', width: 1080, height: 1920 },
    { name: 'YouTube Thumbnail', width: 1280, height: 720 },
    { name: 'Facebook Cover', width: 820, height: 312 },
    { name: 'Twitter Post', width: 1200, height: 675 },
];

export default function CanvaEditor() {
    const {
        canvas,
        canvasWidth,
        canvasHeight,
        setCanvasSize,
        backgroundColor,
        setBackgroundColor
    } = useEditorStore();

    // UI State
    const [activeTab, setActiveTab] = useState<'design' | 'elements' | 'text' | 'shapes' | 'layers' | 'templates'>('design');
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddImage = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canvas || !e.target.files?.[0]) return;
        const file = e.target.files[0];
        const url = URL.createObjectURL(file);
        addImageToCanvas(canvas, url);
        e.target.value = '';
    }, [canvas]);

    const handleExport = useCallback((format: 'png' | 'jpeg' | 'pdf') => {
        if (!canvas) return;

        // 1. Image Export (PNG/JPG)
        if (format === 'png' || format === 'jpeg') {
            const dataURL = canvas.toDataURL({
                format: format,
                quality: format === 'jpeg' ? 0.9 : 1,
                multiplier: 2, // 2x resolution
            });
            const link = document.createElement('a');
            link.download = `mage-design-${Date.now()}.${format}`;
            link.href = dataURL;
            link.click();
        }

        // 2. PDF Export
        else if (format === 'pdf') {
            import('jspdf').then(({ jsPDF }) => {
                const imgData = canvas.toDataURL({
                    format: 'jpeg', // JPEG reduces PDF size
                    quality: 1,
                    multiplier: 2
                });

                // Calculate dimensions (A4 or Custom?)
                // Default to fitting image on page or page matching image
                const pdf = new jsPDF({
                    orientation: canvasWidth > canvasHeight ? 'l' : 'p',
                    unit: 'px',
                    format: [canvasWidth, canvasHeight]
                });

                pdf.addImage(imgData, 'JPEG', 0, 0, canvasWidth, canvasHeight);
                pdf.save(`mage-design-${Date.now()}.pdf`);
            });
        }
    }, [canvas, canvasWidth, canvasHeight]);

    const handleSave = useCallback(() => {
        if (!canvas) return;

        // Client-side Save (Download JSON) - ZERO STORAGE Required on Server
        const jsonData = canvas.toJSON();
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.download = `mage-project-${Date.now()}.json`;
        link.href = url;
        link.click();

        URL.revokeObjectURL(url);
    }, [canvas]);

    const handleLoadProject = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (!canvas || !e.target.files?.[0]) return;
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (f) => {
            const data = f.target?.result as string;
            try {
                const json = JSON.parse(data);
                canvas.loadFromJSON(json, () => {
                    canvas.renderAll();
                    alert('Project loaded successfully!');
                });
            } catch (err) {
                console.error(err);
                alert('Invalid project file');
            }
        };
        reader.readAsText(file);
        e.target.value = ''; // Reset
    }, [canvas]);

    // Navigation Items
    const navItems = [
        { id: 'design', icon: Layout, label: 'Design' },
        { id: 'templates', icon: Layout, label: 'Templates' },
        { id: 'elements', icon: Star, label: 'Elements' },
        { id: 'text', icon: Type, label: 'Text' },
        { id: 'shapes', icon: Square, label: 'Shapes' },
        { id: 'layers', icon: Layers, label: 'Layers' },
    ];

    return (
        <div className="canva-editor" style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            background: '#0a0a0a',
            overflow: 'hidden',
        }}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
            />

            {/* Hidden Input for Project Load */}
            <input
                id="project-upload"
                type="file"
                accept=".json"
                onChange={handleLoadProject}
                style={{ display: 'none' }}
            />

            {/* Top Toolbar */}
            <EditorToolbar
                onAddImage={handleAddImage}
                onAddText={() => setActiveTab('text')}
                onAddShape={() => setActiveTab('shapes')}
                onExport={handleExport}
                onSave={handleSave}
                onLoad={() => document.getElementById('project-upload')?.click()}
            />
            {/* Main Content Area */}
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* 1. Sidebar Navigation Strip */}
                <div style={{
                    width: '72px',
                    background: '#0f0f0f',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: '16px',
                    zIndex: 20
                }}>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id as any);
                                setShowLeftPanel(true);
                            }}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                width: '100%',
                                padding: '12px 0',
                                background: activeTab === item.id && showLeftPanel ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                border: 'none',
                                borderLeft: activeTab === item.id && showLeftPanel ? '3px solid #00D9FF' : '3px solid transparent',
                                color: activeTab === item.id && showLeftPanel ? '#fff' : 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                        >
                            <item.icon size={24} color={activeTab === item.id && showLeftPanel ? '#00D9FF' : 'currentColor'} />
                            <span style={{ fontSize: '0.65rem' }}>{item.label}</span>
                        </button>
                    ))}
                </div>

                {/* 2. Left Side Panel Content */}
                <AnimatePresence>
                    {showLeftPanel && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 320, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{
                                background: '#141414',
                                borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                                position: 'relative',
                            }}
                        >
                            <div style={{ flex: 1, overflowY: 'auto' }}>
                                {activeTab === 'design' && (
                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '20px' }}>Canvas Settings</h3>

                                        <div style={{ marginBottom: '24px' }}>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>SIZE PRESETS</label>
                                            <div style={{ display: 'grid', gap: '8px' }}>
                                                {SIZE_PRESETS.map((preset) => (
                                                    <button
                                                        key={preset.name}
                                                        onClick={() => {
                                                            setCanvasSize(preset.width, preset.height);
                                                            canvas?.setDimensions({ width: preset.width, height: preset.height });
                                                        }}
                                                        style={{
                                                            padding: '10px',
                                                            background: canvasWidth === preset.width ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                            border: canvasWidth === preset.width ? '1px solid #00D9FF' : '1px solid transparent',
                                                            borderRadius: '6px',
                                                            color: '#fff',
                                                            textAlign: 'left',
                                                            fontSize: '0.85rem',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {preset.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>BACKGROUND COLOR</label>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                {['#ffffff', '#000000', '#f5f5f5', '#FF6B6B', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'].map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setBackgroundColor(color)}
                                                        style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: '50%',
                                                            background: color,
                                                            border: backgroundColor === color ? '2px solid #00D9FF' : '2px solid rgba(255,255,255,0.2)',
                                                            cursor: 'pointer'
                                                        }}
                                                    />
                                                ))}
                                                <input
                                                    type="color"
                                                    value={backgroundColor}
                                                    onChange={(e) => setBackgroundColor(e.target.value)}
                                                    style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer' }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {activeTab === 'text' && <TextPanel />}
                                {activeTab === 'shapes' && <ShapesPanel />}
                                {activeTab === 'elements' && <ElementsPanel />}
                                {activeTab === 'layers' && <LayersPanel />}
                                {activeTab === 'templates' && <TemplatesPanel />}
                            </div>

                            {/* Toggle Button Inside Panel */}
                            <button
                                onClick={() => setShowLeftPanel(false)}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    right: 0,
                                    transform: 'translateY(-50%)',
                                    width: '20px',
                                    height: '60px',
                                    background: '#141414',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRight: 'none',
                                    borderRadius: '6px 0 0 6px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'var(--text-muted)'
                                }}
                            >
                                <ChevronLeft size={16} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Re-open button if panel closed */}
                {!showLeftPanel && (
                    <button
                        onClick={() => setShowLeftPanel(true)}
                        style={{
                            position: 'absolute',
                            left: '72px', // Width of nav strip
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '20px',
                            height: '60px',
                            background: '#141414',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '0 6px 6px 0',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-muted)'
                        }}
                    >
                        <ChevronRight size={16} />
                    </button>
                )}

                {/* 3. Canvas Area */}
                <div style={{
                    flex: 1,
                    background: '#050505',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'auto',
                    padding: '40px',
                    position: 'relative'
                }}>
                    <FabricCanvas width={canvasWidth} height={canvasHeight} />
                </div>

                {/* 4. Right Properties Panel */}
                <AnimatePresence>
                    {showRightPanel && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            style={{
                                background: 'rgba(20, 20, 20, 0.95)',
                                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(20px)',
                            }}
                        >
                            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Settings size={18} color="#00D9FF" /> Properties
                                </h3>
                                <button onClick={() => setShowRightPanel(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                            <PropertiesPanel />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Re-open right panel */}
                {!showRightPanel && (
                    <button
                        onClick={() => setShowRightPanel(true)}
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '24px',
                            height: '60px',
                            background: '#141414',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '6px 0 0 6px',
                            zIndex: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'var(--text-muted)'
                        }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}

            </div>
        </div>
    );
}

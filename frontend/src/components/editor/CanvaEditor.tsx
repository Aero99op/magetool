'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layout, Type, Square, Star, Layers, Settings,
    ChevronLeft, ChevronRight, Image as ImageIcon,
    Download, X
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

// Mobile responsive styles
import './editor-mobile.css';

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

    // Mobile detection - Optimized with debounce
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const checkMobile = () => {
            // Debounce to avoid excessive re-renders
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const mobile = window.innerWidth <= 768;
                setIsMobile(mobile);
                if (mobile) {
                    setShowLeftPanel(false);
                    setShowRightPanel(false);
                }
            }, 100);
        };

        // Initial check without debounce
        const initialMobile = window.innerWidth <= 768;
        setIsMobile(initialMobile);
        if (initialMobile) {
            setShowLeftPanel(false);
            setShowRightPanel(false);
        }

        window.addEventListener('resize', checkMobile);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

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

                {/* 1. Sidebar Navigation Strip - Hidden on Mobile */}
                {!isMobile && (
                    <div className="sidebar-nav" style={{
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
                )}

                {/* 2. Left Side Panel Content - Hidden on Mobile (uses mobile overlay instead) */}
                {!isMobile && (
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
                )}

                {/* Re-open button if panel closed - Desktop only */}
                {!isMobile && !showLeftPanel && (
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
                <div
                    className="canvas-area-mobile"
                    style={{
                        flex: 1,
                        background: '#050505',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'auto',
                        padding: isMobile ? '16px' : '40px',
                        paddingBottom: isMobile ? '80px' : '40px', // Extra space for mobile bottom nav
                        position: 'relative'
                    }}
                >
                    <FabricCanvas width={canvasWidth} height={canvasHeight} />
                </div>

                {/* 4. Right Properties Panel - Desktop only */}
                {!isMobile && (
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
                )}

                {/* Re-open right panel - Desktop only */}
                {!isMobile && !showRightPanel && (
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

            {/* Mobile Bottom Navigation */}
            {isMobile && (
                <div className="mobile-bottom-nav">
                    {[
                        { id: 'design', icon: Layout, label: 'Design' },
                        { id: 'elements', icon: Star, label: 'Elements' },
                        { id: 'text', icon: Type, label: 'Text' },
                        { id: 'shapes', icon: Square, label: 'Shapes' },
                        { id: 'layers', icon: Layers, label: 'Layers' },
                        { id: 'properties', icon: Settings, label: 'Properties' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            className={activeTab === item.id || (item.id === 'properties' && showRightPanel) ? 'active' : ''}
                            onClick={() => {
                                if (item.id === 'properties') {
                                    setShowRightPanel(!showRightPanel);
                                    setShowLeftPanel(false);
                                } else {
                                    setActiveTab(item.id as any);
                                    setShowLeftPanel(true);
                                    setShowRightPanel(false);
                                }
                            }}
                        >
                            <item.icon size={22} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Mobile Left Panel Overlay */}
            <AnimatePresence mode="wait">
                {isMobile && showLeftPanel && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
                        className="left-panel-mobile"
                        style={{
                            position: 'fixed',
                            left: 0,
                            top: 0,
                            bottom: '60px',
                            width: '100%',
                            background: '#141414',
                            zIndex: 900,
                            overflowY: 'auto',
                        }}
                    >
                        <div className="panel-header" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '16px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                            </h3>
                            <button
                                onClick={() => setShowLeftPanel(false)}
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div style={{ padding: '16px' }}>
                            {activeTab === 'design' && (
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>SIZE PRESETS</label>
                                    <div style={{ display: 'grid', gap: '8px' }}>
                                        {SIZE_PRESETS.map((preset) => (
                                            <button
                                                key={preset.name}
                                                onClick={() => {
                                                    setCanvasSize(preset.width, preset.height);
                                                    canvas?.setDimensions({ width: preset.width, height: preset.height });
                                                    setShowLeftPanel(false);
                                                }}
                                                style={{
                                                    padding: '12px',
                                                    background: canvasWidth === preset.width ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                                    border: canvasWidth === preset.width ? '1px solid #00D9FF' : '1px solid transparent',
                                                    borderRadius: '8px',
                                                    color: '#fff',
                                                    textAlign: 'left',
                                                    fontSize: '0.9rem',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {preset.name}
                                            </button>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: '20px' }}>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>BACKGROUND COLOR</label>
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {['#ffffff', '#000000', '#f5f5f5', '#FF6B6B', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0'].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setBackgroundColor(color)}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: color,
                                                        border: backgroundColor === color ? '3px solid #00D9FF' : '2px solid rgba(255,255,255,0.2)',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            ))}
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
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Right Panel (Properties) Bottom Sheet */}
            <AnimatePresence mode="wait">
                {isMobile && showRightPanel && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
                        className="right-panel-mobile"
                        style={{
                            position: 'fixed',
                            left: 0,
                            right: 0,
                            bottom: '60px',
                            maxHeight: '50vh',
                            background: '#141414',
                            borderRadius: '20px 20px 0 0',
                            zIndex: 850,
                            overflowY: 'auto',
                        }}
                    >
                        <div style={{ width: '40px', height: '4px', background: 'rgba(255, 255, 255, 0.3)', borderRadius: '2px', margin: '12px auto' }} />
                        <div style={{ padding: '0 16px 16px' }}>
                            <PropertiesPanel />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MousePointer2, Type, Square, Circle, Image,
    Undo2, Redo2, ZoomIn, ZoomOut, Trash2,
    Download, Upload, Layers, Settings, Save, FolderOpen,
    FileImage, FileType, ChevronDown,
    type LucideIcon
} from 'lucide-react';
import { useEditorStore } from '@/hooks/useEditorStore';
import { deleteSelectedObjects } from './FabricCanvas';

interface EditorToolbarProps {
    onAddImage: () => void;
    onAddText: () => void;
    onAddShape: (type: 'rect' | 'circle') => void;
    onExport: (format: 'png' | 'jpeg' | 'pdf') => void;
    onSave: () => void;
    onLoad: () => void;
}

export default function EditorToolbar({
    onAddImage,
    onAddText,
    onAddShape,
    onExport,
    onSave,
    onLoad
}: EditorToolbarProps) {
    const {
        canvas,
        activeTool,
        setActiveTool,
        selectedObjects,
        zoom,
        setZoom,
        canUndo,
        canRedo,
        undo,
        redo
    } = useEditorStore();

    const [showExportMenu, setShowExportMenu] = useState(false);

    const toolButtons = [
        { id: 'select', icon: MousePointer2, label: 'Select', onClick: () => setActiveTool('select') },
        { id: 'text', icon: Type, label: 'Text', onClick: () => { setActiveTool('text'); onAddText(); } },
        { id: 'rect', icon: Square, label: 'Rectangle', onClick: () => onAddShape('rect') },
        { id: 'circle', icon: Circle, label: 'Circle', onClick: () => onAddShape('circle') },
    ];

    const handleDelete = () => {
        if (canvas && selectedObjects.length > 0) {
            deleteSelectedObjects(canvas);
        }
    };

    const handleZoomIn = () => setZoom(Math.min(zoom + 0.1, 3));
    const handleZoomOut = () => setZoom(Math.max(zoom - 0.1, 0.25));

    return (
        <div className="editor-toolbar" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            background: 'rgba(15, 15, 15, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            gap: '16px',
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 100
        }}>
            {/* Tool Buttons */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                {toolButtons.map((tool) => (
                    <ToolButton
                        key={tool.id}
                        icon={tool.icon}
                        label={tool.label}
                        isActive={activeTool === tool.id}
                        onClick={tool.onClick}
                    />
                ))}

                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 8px' }} />

                <ToolButton
                    icon={Image}
                    label="Add Image"
                    onClick={onAddImage}
                />
            </div>

            {/* History & Zoom */}
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <ToolButton
                    icon={Undo2}
                    label="Undo"
                    onClick={undo}
                    disabled={!canUndo()}
                />
                <ToolButton
                    icon={Redo2}
                    label="Redo"
                    onClick={redo}
                    disabled={!canRedo()}
                />

                <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.2)', margin: '0 8px' }} />

                <ToolButton icon={ZoomOut} label="Zoom Out" onClick={handleZoomOut} />
                <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    minWidth: '45px',
                    textAlign: 'center'
                }}>
                    {Math.round(zoom * 100)}%
                </span>
                <ToolButton icon={ZoomIn} label="Zoom In" onClick={handleZoomIn} />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <ToolButton
                    icon={Trash2}
                    label="Delete"
                    onClick={handleDelete}
                    disabled={selectedObjects.length === 0}
                    danger
                />

                <motion.button
                    onClick={onLoad}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Load Project (.json)"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                    }}
                >
                    <FolderOpen size={18} />
                    Load
                </motion.button>

                <motion.button
                    onClick={onSave}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title="Save Project (.json)"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                    }}
                >
                    <Save size={18} />
                    Save
                </motion.button>

                <div style={{ position: 'relative' }}>
                    <motion.button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: 'linear-gradient(135deg, #00D9FF, #00AAFF)',
                            border: 'none',
                            borderRadius: '8px',
                            color: '#000',
                            fontWeight: 600,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            minWidth: '120px',
                            justifyContent: 'center'
                        }}
                    >
                        Export <ChevronDown size={16} />
                    </motion.button>

                    <AnimatePresence>
                        {showExportMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    background: '#1a1a1a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '4px',
                                    width: '160px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                                }}
                            >
                                <button
                                    onClick={() => { onExport('png'); setShowExportMenu(false); }}
                                    className="export-item"
                                >
                                    <FileImage size={14} className="icon-blue" />
                                    <span>PNG <span style={{ opacity: 0.5, fontSize: '0.7em' }}>Web</span></span>
                                </button>
                                <button
                                    onClick={() => { onExport('jpeg'); setShowExportMenu(false); }}
                                    className="export-item"
                                >
                                    <FileImage size={14} className="icon-blue" />
                                    <span>JPG <span style={{ opacity: 0.5, fontSize: '0.7em' }}>Small</span></span>
                                </button>
                                <button
                                    onClick={() => { onExport('pdf'); setShowExportMenu(false); }}
                                    className="export-item"
                                >
                                    <FileType size={14} className="icon-blue" />
                                    <span>PDF <span style={{ opacity: 0.5, fontSize: '0.7em' }}>Doc</span></span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <style jsx>{`
                .export-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px;
                    border: none;
                    background: transparent;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                    text-align: left;
                    font-size: 0.85rem;
                    transition: background 0.2s;
                    width: 100%;
                }
                .export-item:hover {
                    background: rgba(255,255,255,0.1);
                }
                .icon-blue {
                    color: #00D9FF;
                }
            `}</style>
        </div>
    );
}

// Tool Button Component


interface ToolButtonProps {
    icon: LucideIcon;
    label: string;
    isActive?: boolean;
    disabled?: boolean;
    danger?: boolean;
    onClick: () => void;
}

function ToolButton({ icon: Icon, label, isActive, disabled, danger, onClick }: ToolButtonProps) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            title={label}
            whileHover={disabled ? {} : { scale: 1.1, y: -2 }}
            whileTap={disabled ? {} : { scale: 0.95 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: isActive
                    ? 'rgba(0, 217, 255, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                border: isActive
                    ? '1px solid #00D9FF'
                    : '1px solid transparent',
                borderRadius: '8px',
                color: danger
                    ? '#ff6b6b'
                    : isActive
                        ? '#00D9FF'
                        : 'var(--text-primary)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.4 : 1,
                transition: 'all 0.2s ease',
            }}
        >
            <Icon size={20} />
        </motion.button>
    );
}

'use client';

import { Layers, Eye, EyeOff, Lock, Unlock, Trash2, MoveUp, MoveDown } from 'lucide-react';
import { useEditorStore } from '@/hooks/useEditorStore';
import { useEffect, useState } from 'react';

export default function LayersPanel() {
    const { canvas, selectedObjects } = useEditorStore();
    const [layers, setLayers] = useState<any[]>([]);

    // Refresh layers when canvas changes
    const refreshLayers = () => {
        if (!canvas) return;
        // Reversed so top layer is first
        const objects = [...canvas.getObjects()].reverse();
        setLayers(objects);
    };

    useEffect(() => {
        if (!canvas) return;

        // Listen to events that change layers
        const events = ['object:added', 'object:removed', 'object:modified', 'selection:created', 'selection:updated', 'selection:cleared'];
        events.forEach(e => canvas.on(e as any, refreshLayers));

        refreshLayers();

        return () => {
            events.forEach(e => canvas.off(e as any, refreshLayers));
        };
    }, [canvas]);

    const selectLayer = (obj: any) => {
        if (!canvas) return;
        canvas.setActiveObject(obj);
        canvas.renderAll();
    };

    const toggleVisibility = (e: React.MouseEvent, obj: any) => {
        e.stopPropagation();
        if (!canvas) return;
        obj.set('visible', !obj.visible);
        if (!obj.visible) {
            canvas.discardActiveObject();
        }
        canvas.renderAll();
        refreshLayers();
    };

    const toggleLock = (e: React.MouseEvent, obj: any) => {
        e.stopPropagation();
        if (!canvas) return;
        // Lock movement/scaling/rotation
        const isLocked = !obj.lockMovementX;
        obj.set({
            lockMovementX: isLocked,
            lockMovementY: isLocked,
            lockRotation: isLocked,
            lockScalingX: isLocked,
            lockScalingY: isLocked,
            selectable: !isLocked, // Also make unselectable if locked? Usually better to keep selectable so you can see it's locked.
            // Actually, usually in editors, 'Lock' prevents selection or at least movement.
        });
        canvas.renderAll();
        refreshLayers();
    };

    if (layers.length === 0) {
        return (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p>No layers yet</p>
                <p style={{ fontSize: '0.8rem' }}>Add objects to see them here</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Layers size={18} color="#00D9FF" /> Layers
                </h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {layers.map((obj, i) => {
                    const isSelected = selectedObjects.includes(obj);
                    const isLocked = obj.lockMovementX;

                    // Determine type for icon/label
                    let typeLabel = 'Object';
                    if (obj.type === 'textbox') typeLabel = `Text: "${obj.text?.substring(0, 15)}${obj.text?.length > 15 ? '...' : ''}"`;
                    else if (obj.type === 'image') typeLabel = 'Image';
                    else if (obj.type === 'rect') typeLabel = 'Rectangle';
                    else if (obj.type === 'circle') typeLabel = 'Circle';
                    else if (obj.type === 'triangle') typeLabel = 'Triangle';

                    return (
                        <div
                            key={i}
                            onClick={() => selectLayer(obj)}
                            className={`layer-item ${isSelected ? 'selected' : ''}`}
                        >
                            <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.85rem' }}>
                                {typeLabel}
                            </span>

                            <div className="layer-actions">
                                <button onClick={(e) => toggleLock(e, obj)} className={`icon-btn ${isLocked ? 'active' : ''}`} title={isLocked ? "Unlock" : "Lock"}>
                                    {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                                </button>
                                <button onClick={(e) => toggleVisibility(e, obj)} className={`icon-btn ${!obj.visible ? 'active' : ''}`} title="Toggle Visibility">
                                    {obj.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                .layer-item {
                    display: flex;
                    align-items: center;
                    padding: 10px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                    transition: background 0.2s;
                }
                .layer-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                .layer-item.selected {
                    background: rgba(0, 217, 255, 0.1);
                    border-left: 3px solid #00D9FF;
                }
                .layer-actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0.5;
                }
                .layer-item:hover .layer-actions, .layer-item.selected .layer-actions {
                    opacity: 1;
                }
                .icon-btn {
                    padding: 4px;
                    background: transparent;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                    border-radius: 4px;
                }
                .icon-btn:hover {
                    background: rgba(255, 255, 255, 0.2);
                }
                .icon-btn.active {
                    color: #ff6b6b;
                }
            `}</style>
        </div>
    );
}

'use client';

import { Square, Circle, Triangle, Hexagon, Star, Heart } from 'lucide-react';
import { useEditorStore } from '@/hooks/useEditorStore';
import { addShapeToCanvas } from '../FabricCanvas';
import { FabricObject, Rect, Circle as FabricCircle, Triangle as FabricTriangle, Polygon, Path } from 'fabric';

export default function ShapesPanel() {
    const { canvas } = useEditorStore();

    const addShape = (type: string) => {
        if (!canvas) return;

        const commonProps = {
            left: canvas.width ? canvas.width / 2 : 400,
            top: canvas.height ? canvas.height / 2 : 300,
            fill: '#00D9FF',
            stroke: '#ffffff',
            strokeWidth: 0,
            originX: 'center' as const,
            originY: 'center' as const,
            cornerColor: '#00D9FF',
            cornerStrokeColor: '#ffffff',
            cornerSize: 10,
            cornerStyle: 'circle' as const,
            transparentCorners: false,
            borderColor: '#00D9FF',
        };

        let shape: FabricObject | null = null;

        switch (type) {
            case 'rect':
                shape = new Rect({ ...commonProps, width: 100, height: 100, rx: 0, ry: 0 });
                break;
            case 'circle':
                shape = new FabricCircle({ ...commonProps, radius: 50 });
                break;
            case 'triangle':
                shape = new FabricTriangle({ ...commonProps, width: 100, height: 100 });
                break;
            case 'rounded-rect':
                shape = new Rect({ ...commonProps, width: 100, height: 100, rx: 20, ry: 20 });
                break;
            // Add more manually or with Path
        }

        if (shape) {
            canvas.add(shape);
            canvas.setActiveObject(shape);
            canvas.renderAll();
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Square size={18} color="#00D9FF" /> Shapes
            </h3>

            <div className="shapes-grid">
                <button onClick={() => addShape('rect')} className="shape-btn" title="Rectangle">
                    <div style={{ width: '40px', height: '40px', background: '#ccc' }} />
                </button>
                <button onClick={() => addShape('circle')} className="shape-btn" title="Circle">
                    <div style={{ width: '40px', height: '40px', background: '#ccc', borderRadius: '50%' }} />
                </button>
                <button onClick={() => addShape('rounded-rect')} className="shape-btn" title="Rounded Rectangle">
                    <div style={{ width: '40px', height: '40px', background: '#ccc', borderRadius: '12px' }} />
                </button>
                <button onClick={() => addShape('triangle')} className="shape-btn" title="Triangle">
                    <div style={{ width: 0, height: 0, borderLeft: '20px solid transparent', borderRight: '20px solid transparent', borderBottom: '40px solid #ccc' }} />
                </button>
            </div>

            <style jsx>{`
                .shapes-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                }
                .shape-btn {
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    borderRadius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    color: #fff;
                }
                .shape-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: #00D9FF;
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
}

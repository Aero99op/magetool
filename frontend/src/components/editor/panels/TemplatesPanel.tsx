'use client';

import { LayoutTemplate } from 'lucide-react';
import { useEditorStore } from '@/hooks/useEditorStore';
import { addTextToCanvas, addShapeToCanvas } from '../FabricCanvas';
import { Rect, Circle, FabricImage } from 'fabric';

// Simple programmatic templates since we don't have JSON assets yet
const TEMPLATES = [
    {
        id: 'sale',
        name: 'Sale Poster',
        color: '#FF6B6B',
        apply: (canvas: any) => {
            canvas.clear();
            canvas.backgroundColor = '#FF6B6B';

            addTextToCanvas(canvas, 'HUGE\nSALE', {
                fontSize: 120,
                fontWeight: 'bold',
                fill: '#ffffff',
                top: 200,
                textAlign: 'center'
            });

            addTextToCanvas(canvas, 'UP TO 50% OFF', {
                fontSize: 40,
                fill: '#000000',
                top: 500,
                textAlign: 'center'
            });

            // Add a decorative circle
            const circle = new Circle({
                radius: 150,
                fill: 'transparent',
                stroke: '#ffffff',
                strokeWidth: 5,
                left: canvas.width! / 2,
                top: canvas.height! / 2,
                originX: 'center' as const,
                originY: 'center' as const,
                selectable: false,
                evented: false
            });
            canvas.add(circle);
            canvas.sendToBack(circle);
        }
    },
    {
        id: 'quote',
        name: 'Inspirational Quote',
        color: '#1a1a1a',
        apply: (canvas: any) => {
            canvas.clear();
            canvas.backgroundColor = '#1a1a1a';

            addTextToCanvas(canvas, '"Design is intelligence\nmade visible."', {
                fontSize: 60,
                fontFamily: 'Georgia',
                fontStyle: 'italic',
                fill: '#ffffff',
                top: 300,
                textAlign: 'center'
            });

            addTextToCanvas(canvas, '- Alina Wheeler', {
                fontSize: 30,
                fill: '#888888',
                top: 550,
                textAlign: 'center'
            });
        }
    },
    {
        id: 'event',
        name: 'Event Invite',
        color: '#4CAF50',
        apply: (canvas: any) => {
            canvas.clear();
            canvas.backgroundColor = '#ffffff';

            const header = new Rect({
                left: 0,
                top: 0,
                width: canvas.width,
                height: 200,
                fill: '#4CAF50',
                selectable: false
            });
            canvas.add(header);

            addTextToCanvas(canvas, 'WORKSHOP', {
                fontSize: 80,
                fontWeight: 'bold',
                fill: '#ffffff',
                top: 60,
                textAlign: 'center'
            });

            addTextToCanvas(canvas, 'Join us for a masterclass', {
                fontSize: 32,
                fill: '#333333',
                top: 300,
                textAlign: 'center'
            });
        }
    }
];

export default function TemplatesPanel() {
    const { canvas } = useEditorStore();

    const applyTemplate = (template: typeof TEMPLATES[0]) => {
        if (!canvas) return;

        if (confirm('Replacing current design with template. Continue?')) {
            template.apply(canvas);
            canvas.renderAll();
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <LayoutTemplate size={18} color="#00D9FF" /> Templates
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {TEMPLATES.map(template => (
                    <button
                        key={template.id}
                        onClick={() => applyTemplate(template)}
                        className="template-card"
                    >
                        <div style={{
                            height: '100px',
                            background: template.color,
                            borderRadius: '8px',
                            marginBottom: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                            fontSize: '0.8rem',
                            fontWeight: 600
                        }}>
                            Preview
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#fff' }}>{template.name}</span>
                    </button>
                ))}
            </div>

            <style jsx>{`
                .template-card {
                    display: flex;
                    flex-direction: column;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    padding: 0;
                }
                .template-card:hover {
                    transform: translateY(-4px);
                }
            `}</style>
        </div>
    );
}

'use client';

import { Type } from 'lucide-react';
import { useEditorStore } from '@/hooks/useEditorStore';
import { addTextToCanvas } from '../FabricCanvas';

export default function TextPanel() {
    const { canvas } = useEditorStore();

    const handleAddText = (text: string, fontSize: number, fontWeight: string = 'normal') => {
        if (!canvas) return;
        addTextToCanvas(canvas, text, {
            fontSize,
            fontWeight,
            fontFamily: 'Inter',
        });
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Type size={18} color="#00D9FF" /> Text
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                    onClick={() => handleAddText('Add a heading', 48, 'bold')}
                    className="text-preset-btn"
                    style={{ fontSize: '1.5rem', fontWeight: 700 }}
                >
                    Add a heading
                </button>
                <button
                    onClick={() => handleAddText('Add a subheading', 32, '600')}
                    className="text-preset-btn"
                    style={{ fontSize: '1.1rem', fontWeight: 600 }}
                >
                    Add a subheading
                </button>
                <button
                    onClick={() => handleAddText('Add a little bit of body text', 18, 'normal')}
                    className="text-preset-btn"
                    style={{ fontSize: '0.9rem', fontWeight: 400 }}
                >
                    Add a little bit of body text
                </button>
            </div>

            <div style={{ marginTop: '30px' }}>
                <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>FONT COMBINATIONS</h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                    {/* Placeholder for fancy combinations */}
                    <button onClick={() => {
                        if (!canvas) return;
                        addTextToCanvas(canvas, 'SALE', { fontSize: 80, fontWeight: 'bold', fill: '#ff6b6b' });
                        addTextToCanvas(canvas, '50% OFF', { fontSize: 40, top: 380, fill: '#ffffff' });
                    }} className="combo-card">
                        <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ff6b6b' }}>SALE</span>
                        <span style={{ fontSize: '1rem' }}>50% OFF</span>
                    </button>

                    <button onClick={() => {
                        if (!canvas) return;
                        addTextToCanvas(canvas, 'Thank You', { fontFamily: 'Comis Sans MS', fontSize: 60, fill: '#00D9FF' });
                    }} className="combo-card">
                        <span style={{ fontFamily: 'Comic Sans MS', fontSize: '1.5rem', color: '#00D9FF' }}>Thank You</span>
                    </button>
                </div>
            </div>

            <style jsx>{`
                .text-preset-btn {
                    width: 100%;
                    padding: 16px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #fff;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .text-preset-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                    transform: translateX(4px);
                }
                .combo-card {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px dashed rgba(255, 255, 255, 0.2);
                    border-radius: 8px;
                    color: #fff;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .combo-card:hover {
                    background: rgba(255, 255, 255, 0.08);
                    border-color: #00D9FF;
                }
            `}</style>
        </div>
    );
}

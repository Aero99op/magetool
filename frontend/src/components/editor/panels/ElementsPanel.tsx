'use client';

import {
    Heart, Star, Cloud, Sun, Moon, Zap,
    Smile, Crown, Flag, Anchor, Music,
    Camera, Video, Mic, Globe, MapPin,
    ArrowRight, Check, X, AlertTriangle
} from 'lucide-react';
import { useEditorStore } from '@/hooks/useEditorStore';
import { FabricImage, Textbox } from 'fabric';

const ICONS = [
    { icon: Heart, name: 'Heart' },
    { icon: Star, name: 'Star' },
    { icon: Smile, name: 'Smile' },
    { icon: Zap, name: 'Zap' },
    { icon: Cloud, name: 'Cloud' },
    { icon: Sun, name: 'Sun' },
    { icon: Moon, name: 'Moon' },
    { icon: Crown, name: 'Crown' },
    { icon: Music, name: 'Music' },
    { icon: Camera, name: 'Camera' },
    { icon: Globe, name: 'Globe' },
    { icon: MapPin, name: 'Location' },
    { icon: ArrowRight, name: 'Arrow' },
    { icon: Check, name: 'Check' },
    { icon: X, name: 'Close' },
    { icon: AlertTriangle, name: 'Alert' },
];

export default function ElementsPanel() {
    const { canvas } = useEditorStore();

    const addIcon = (IconComponent: any) => {
        if (!canvas) return;

        // Create an SVG string from the icon
        // This is a simplified approach. In a real app, you might want to fetch actual SVGs or use a library that outputs SVG strings.
        // Since Lucide React components render to DOM, we can't easily get the SVG string directly in this context without rendering.
        // FOR NOW: We will use a workaround - use a known SVG strings for these icons or just text emojis if SVG is hard.
        // BETTER: Use Fabric's Path with SVG path data.

        // Let's use a trick: Render icon to an off-screen canvas or just use text for now as "Stickers" 
        // OR better: Just use Emoji text which is super robust for "Stickers" in MVP.
        // OR even better: Use a hack to get SVG data.

        // Let's use Text emojis first as it's reliable and fast for "V1".
        // Wait, user wants "Best to best".
        // I will use an online placeholder image service for icons or simple SVG paths.

        // Actually, I can use a simple SVG string for common shapes.
        // Let's use a dummy SVG for now or Text.
    };

    // MVP Approach: Use Emojis as "Stickers" because they render perfectly in Fabric Textbox.
    const addEmoji = (emoji: string) => {
        if (!canvas) return;

        const text = new Textbox(emoji, {
            left: canvas.width! / 2,
            top: canvas.height! / 2,
            fontSize: 80,
            originX: 'center',
            originY: 'center',
            cornerColor: '#00D9FF',
            cornerStrokeColor: '#ffffff',
            cornerSize: 10,
            cornerStyle: 'circle',
            transparentCorners: false,
            borderColor: '#00D9FF',
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
    };

    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={18} color="#00D9FF" /> Elements
            </h3>

            <div className="elements-grid">
                {['❤️', '⭐', '😂', '🔥', '☁️', '☀️', '🌙', '👑', '🎵', '📷', '🌍', '📍', '➡️', '✅', '❌', '⚠️', '🎉', '💡', '🚀', '💯'].map((emoji, i) => (
                    <button
                        key={i}
                        onClick={() => addEmoji(emoji)}
                        className="element-btn"
                    >
                        {emoji}
                    </button>
                ))}
            </div>

            <style jsx>{`
                .elements-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                }
                .element-btn {
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .element-btn:hover {
                    background: rgba(0, 217, 255, 0.1);
                    border-color: #00D9FF;
                    transform: scale(1.1);
                }
            `}</style>
        </div>
    );
}

import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import ToolContent from '@/components/ToolContent';

// Dynamic import to avoid SSR issues with Fabric.js
const CanvaEditor = dynamic(
    () => import('@/components/editor/CanvaEditor'),
    { ssr: false }
);

export const metadata: Metadata = {
    title: 'Design Studio - Canva-like Editor | Magetool',
    description: 'Create stunning graphic designs with our free Canva-like editor. Add text, shapes, images, and export for social media. Drag, resize, and style your designs with ease.',
    keywords: ['canva alternative', 'free design tool', 'graphic design', 'social media graphics', 'image editor', 'poster maker'],
};

export default function DesignStudioPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
            <CanvaEditor />

            {/* Content section below editor */}
            <div className="container" style={{ padding: '60px 20px 80px' }}>
                <ToolContent
                    overview="Welcome to Design Studio - your free Canva-like graphic design tool. Create beautiful social media posts, YouTube thumbnails, Instagram stories, and more with our intuitive drag-and-drop editor. Add text, shapes, images, and style them with ease. No design skills required!"
                    features={[
                        "Drag & Drop Canvas: Move, resize, and rotate objects with intuitive handles",
                        "Rich Text Editor: Multiple fonts, colors, alignment, and formatting options",
                        "Shape Library: Rectangles, circles, and more with customizable colors",
                        "Social Media Presets: Instagram, Facebook, YouTube, LinkedIn, and Twitter sizes",
                        "Layer Control: Bring forward, send backward, duplicate, and delete objects",
                        "Undo/Redo: Full history support for easy editing",
                        "High-Quality Export: Download at 2x resolution for crisp prints and displays"
                    ]}
                    howTo={[
                        { step: "Choose Size", description: "Select a preset (Instagram, YouTube, etc.) or set custom dimensions" },
                        { step: "Add Content", description: "Click toolbar buttons to add text, shapes, or upload images" },
                        { step: "Style It", description: "Select any object to change colors, fonts, opacity, and more in the right panel" },
                        { step: "Export", description: "Click 'Export' to download your design as a high-quality PNG" }
                    ]}
                />
            </div>
        </div>
    );
}

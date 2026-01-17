'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Type, Move, RotateCw } from 'lucide-react';

export interface TextElement {
    id: string;
    text: string;
    x: number;
    y: number;
    fontSize: number;
    fontFamily: string;
    color: string;
    strokeColor: string;
    strokeWidth: number;
    rotation: number;
}

interface MemeCanvasProps {
    imageUrl: string;
    elements: TextElement[];
    onElementsChange: (elements: TextElement[]) => void;
    selectedId: string | null;
    onSelectElement: (id: string | null) => void;
}

const FONTS = [
    'Impact',
    'Arial Black',
    'Arial',
    'Comic Sans MS',
    'Verdana',
    'Helvetica',
];

export default function MemeCanvas({
    imageUrl,
    elements,
    onElementsChange,
    selectedId,
    onSelectElement,
}: MemeCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [elementStart, setElementStart] = useState({ x: 0, y: 0 });
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [displayScale, setDisplayScale] = useState(1);

    // Calculate display scale
    useEffect(() => {
        if (containerRef.current && imageSize.width > 0) {
            const containerWidth = containerRef.current.clientWidth;
            const scale = Math.min(1, containerWidth / imageSize.width);
            setDisplayScale(scale);
        }
    }, [imageSize.width, containerRef.current?.clientWidth]);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight });
    };

    const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
        e.preventDefault();
        e.stopPropagation();

        const element = elements.find(el => el.id === elementId);
        if (!element) return;

        setIsDragging(true);
        onSelectElement(elementId);
        setDragStart({ x: e.clientX, y: e.clientY });
        setElementStart({ x: element.x, y: element.y });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !selectedId) return;

        const dx = (e.clientX - dragStart.x) / displayScale;
        const dy = (e.clientY - dragStart.y) / displayScale;

        const newElements = elements.map(el => {
            if (el.id === selectedId) {
                return {
                    ...el,
                    x: Math.max(0, Math.min(elementStart.x + dx, imageSize.width - 50)),
                    y: Math.max(0, Math.min(elementStart.y + dy, imageSize.height - 20)),
                };
            }
            return el;
        });

        onElementsChange(newElements);
    }, [isDragging, selectedId, dragStart, elementStart, displayScale, elements, imageSize, onElementsChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const handleCanvasClick = () => {
        onSelectElement(null);
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: `${imageSize.width}px`,
                userSelect: 'none',
                cursor: isDragging ? 'grabbing' : 'default',
            }}
            onClick={handleCanvasClick}
        >
            {/* Background Image */}
            <img
                src={imageUrl}
                alt="Meme template"
                onLoad={handleImageLoad}
                style={{
                    display: 'block',
                    width: imageSize.width * displayScale,
                    height: imageSize.height * displayScale,
                    borderRadius: '8px',
                }}
                draggable={false}
            />

            {/* Text Elements */}
            {elements.map((element) => (
                <div
                    key={element.id}
                    style={{
                        position: 'absolute',
                        left: element.x * displayScale,
                        top: element.y * displayScale,
                        transform: `rotate(${element.rotation}deg)`,
                        cursor: isDragging && selectedId === element.id ? 'grabbing' : 'grab',
                        padding: '4px 8px',
                        border: selectedId === element.id ? '2px dashed var(--neon-blue)' : '2px dashed transparent',
                        borderRadius: '4px',
                        background: selectedId === element.id ? 'rgba(0, 217, 255, 0.1)' : 'transparent',
                    }}
                    onMouseDown={(e) => handleMouseDown(e, element.id)}
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelectElement(element.id);
                    }}
                >
                    <span
                        style={{
                            fontFamily: element.fontFamily,
                            fontSize: `${element.fontSize * displayScale}px`,
                            color: element.color,
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            WebkitTextStroke: `${element.strokeWidth}px ${element.strokeColor}`,
                            textShadow: `2px 2px 0 ${element.strokeColor}, -2px -2px 0 ${element.strokeColor}, 2px -2px 0 ${element.strokeColor}, -2px 2px 0 ${element.strokeColor}`,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {element.text || 'Double-click to edit'}
                    </span>
                </div>
            ))}

            {/* Instructions overlay when empty */}
            {elements.length === 0 && (
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        pointerEvents: 'none',
                    }}
                >
                    <div
                        style={{
                            padding: '12px 20px',
                            background: 'rgba(0, 0, 0, 0.7)',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '0.9rem',
                        }}
                    >
                        👆 Add text using the panel on the right
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper function to generate unique IDs
export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Default new text element
export function createTextElement(imageWidth: number, imageHeight: number): TextElement {
    return {
        id: generateId(),
        text: 'YOUR TEXT',
        x: imageWidth / 2 - 100,
        y: imageHeight / 2 - 20,
        fontSize: 48,
        fontFamily: 'Impact',
        color: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 2,
        rotation: 0,
    };
}

'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface ImageCropperProps {
    imageUrl: string;
    aspectRatio?: number | null; // null = freeform
    initialCrop?: CropArea;
    onCropChange: (crop: CropArea) => void;
    imageWidth: number;
    imageHeight: number;
}

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move';

export default function ImageCropper({
    imageUrl,
    aspectRatio = null,
    initialCrop,
    onCropChange,
    imageWidth,
    imageHeight,
}: ImageCropperProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [displayScale, setDisplayScale] = useState(1);
    const [crop, setCrop] = useState<CropArea>(initialCrop || { x: 50, y: 50, width: 200, height: 200 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragHandle, setDragHandle] = useState<HandlePosition | null>(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [cropStart, setCropStart] = useState<CropArea>({ x: 0, y: 0, width: 0, height: 0 });

    // Calculate display scale when container or image size changes
    useEffect(() => {
        if (containerRef.current && imageWidth > 0) {
            const containerWidth = containerRef.current.clientWidth;
            const scale = Math.min(1, containerWidth / imageWidth);
            setDisplayScale(scale);
        }
    }, [imageWidth, containerRef.current?.clientWidth]);

    // Sync with initial crop
    useEffect(() => {
        if (initialCrop) {
            setCrop(initialCrop);
        }
    }, [initialCrop]);

    const constrainCrop = useCallback((newCrop: CropArea): CropArea => {
        let { x, y, width, height } = newCrop;

        // Minimum size
        width = Math.max(20, width);
        height = Math.max(20, height);

        // Apply aspect ratio if set
        if (aspectRatio) {
            const currentRatio = width / height;
            if (currentRatio > aspectRatio) {
                width = height * aspectRatio;
            } else {
                height = width / aspectRatio;
            }
        }

        // Keep within image bounds
        x = Math.max(0, Math.min(x, imageWidth - width));
        y = Math.max(0, Math.min(y, imageHeight - height));
        width = Math.min(width, imageWidth - x);
        height = Math.min(height, imageHeight - y);

        return { x, y, width, height };
    }, [aspectRatio, imageWidth, imageHeight]);

    const handleMouseDown = (e: React.MouseEvent, handle: HandlePosition) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setDragHandle(handle);
        setDragStart({ x: e.clientX, y: e.clientY });
        setCropStart({ ...crop });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging || !dragHandle) return;

        const dx = (e.clientX - dragStart.x) / displayScale;
        const dy = (e.clientY - dragStart.y) / displayScale;

        let newCrop = { ...cropStart };

        switch (dragHandle) {
            case 'move':
                newCrop.x = cropStart.x + dx;
                newCrop.y = cropStart.y + dy;
                break;
            case 'nw':
                newCrop.x = cropStart.x + dx;
                newCrop.y = cropStart.y + dy;
                newCrop.width = cropStart.width - dx;
                newCrop.height = cropStart.height - dy;
                break;
            case 'n':
                newCrop.y = cropStart.y + dy;
                newCrop.height = cropStart.height - dy;
                break;
            case 'ne':
                newCrop.y = cropStart.y + dy;
                newCrop.width = cropStart.width + dx;
                newCrop.height = cropStart.height - dy;
                break;
            case 'e':
                newCrop.width = cropStart.width + dx;
                break;
            case 'se':
                newCrop.width = cropStart.width + dx;
                newCrop.height = cropStart.height + dy;
                break;
            case 's':
                newCrop.height = cropStart.height + dy;
                break;
            case 'sw':
                newCrop.x = cropStart.x + dx;
                newCrop.width = cropStart.width - dx;
                newCrop.height = cropStart.height + dy;
                break;
            case 'w':
                newCrop.x = cropStart.x + dx;
                newCrop.width = cropStart.width - dx;
                break;
        }

        const constrained = constrainCrop(newCrop);
        setCrop(constrained);
        onCropChange(constrained);
    }, [isDragging, dragHandle, dragStart, cropStart, displayScale, constrainCrop, onCropChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setDragHandle(null);
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

    const displayWidth = imageWidth * displayScale;
    const displayHeight = imageHeight * displayScale;

    const handleStyle = (position: HandlePosition): React.CSSProperties => ({
        position: 'absolute',
        width: '14px',
        height: '14px',
        background: 'white',
        border: '2px solid var(--neon-blue)',
        borderRadius: '2px',
        cursor: getCursor(position),
        zIndex: 10,
        ...getHandlePosition(position),
    });

    const getHandlePosition = (position: HandlePosition): React.CSSProperties => {
        const offset = -7; // Half of handle size
        switch (position) {
            case 'nw': return { top: offset, left: offset };
            case 'n': return { top: offset, left: '50%', transform: 'translateX(-50%)' };
            case 'ne': return { top: offset, right: offset };
            case 'e': return { top: '50%', right: offset, transform: 'translateY(-50%)' };
            case 'se': return { bottom: offset, right: offset };
            case 's': return { bottom: offset, left: '50%', transform: 'translateX(-50%)' };
            case 'sw': return { bottom: offset, left: offset };
            case 'w': return { top: '50%', left: offset, transform: 'translateY(-50%)' };
            default: return {};
        }
    };

    const getCursor = (position: HandlePosition): string => {
        const cursors: Record<HandlePosition, string> = {
            'nw': 'nwse-resize',
            'n': 'ns-resize',
            'ne': 'nesw-resize',
            'e': 'ew-resize',
            'se': 'nwse-resize',
            's': 'ns-resize',
            'sw': 'nesw-resize',
            'w': 'ew-resize',
            'move': 'move',
        };
        return cursors[position];
    };

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                maxWidth: `${imageWidth}px`,
                userSelect: 'none',
            }}
        >
            {/* Image */}
            <img
                src={imageUrl}
                alt="Source"
                style={{
                    display: 'block',
                    width: displayWidth,
                    height: displayHeight,
                    borderRadius: '8px',
                }}
                draggable={false}
            />

            {/* Overlay (darkened outside crop area) */}
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: displayWidth,
                    height: displayHeight,
                    background: 'rgba(0, 0, 0, 0.5)',
                    clipPath: `polygon(
                        0% 0%,
                        0% 100%,
                        ${crop.x * displayScale}px 100%,
                        ${crop.x * displayScale}px ${crop.y * displayScale}px,
                        ${(crop.x + crop.width) * displayScale}px ${crop.y * displayScale}px,
                        ${(crop.x + crop.width) * displayScale}px ${(crop.y + crop.height) * displayScale}px,
                        ${crop.x * displayScale}px ${(crop.y + crop.height) * displayScale}px,
                        ${crop.x * displayScale}px 100%,
                        100% 100%,
                        100% 0%
                    )`,
                    pointerEvents: 'none',
                    borderRadius: '8px',
                }}
            />

            {/* Crop selection box */}
            <div
                style={{
                    position: 'absolute',
                    top: crop.y * displayScale,
                    left: crop.x * displayScale,
                    width: crop.width * displayScale,
                    height: crop.height * displayScale,
                    border: '2px solid var(--neon-blue)',
                    boxSizing: 'border-box',
                    cursor: 'move',
                }}
                onMouseDown={(e) => handleMouseDown(e, 'move')}
            >
                {/* Grid lines */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gridTemplateRows: '1fr 1fr 1fr',
                    pointerEvents: 'none',
                }}>
                    {[...Array(9)].map((_, i) => (
                        <div
                            key={i}
                            style={{
                                borderRight: i % 3 !== 2 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                                borderBottom: i < 6 ? '1px solid rgba(255,255,255,0.3)' : 'none',
                            }}
                        />
                    ))}
                </div>

                {/* Resize handles */}
                {(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as HandlePosition[]).map(pos => (
                    <div
                        key={pos}
                        style={handleStyle(pos)}
                        onMouseDown={(e) => handleMouseDown(e, pos)}
                    />
                ))}
            </div>

            {/* Size info */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '4px 12px',
                    background: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    color: 'white',
                    whiteSpace: 'nowrap',
                }}
            >
                {Math.round(crop.width)} × {Math.round(crop.height)} px
            </div>
        </div>
    );
}

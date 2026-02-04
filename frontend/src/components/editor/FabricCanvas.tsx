'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Canvas, FabricImage, FabricText, Rect, Circle, Textbox } from 'fabric';
import { useEditorStore } from '@/hooks/useEditorStore';

interface FabricCanvasProps {
    width?: number;
    height?: number;
    onReady?: (canvas: Canvas) => void;
}

export default function FabricCanvas({
    width = 800,
    height = 600,
    onReady
}: FabricCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<Canvas | null>(null);

    const {
        setCanvas,
        setSelectedObjects,
        saveToHistory,
        backgroundColor
    } = useEditorStore();

    // Initialize Fabric canvas
    useEffect(() => {
        if (!canvasRef.current || fabricRef.current) return;

        const canvas = new Canvas(canvasRef.current, {
            width,
            height,
            backgroundColor: backgroundColor || '#ffffff',
            preserveObjectStacking: true,
            selection: true,
            selectionColor: 'rgba(0, 217, 255, 0.1)',
            selectionBorderColor: '#00D9FF',
            selectionLineWidth: 2,
        });

        // Custom control styling
        const controlStyle = {
            cornerColor: '#00D9FF',
            cornerStrokeColor: '#ffffff',
            cornerSize: 10,
            cornerStyle: 'circle' as const,
            transparentCorners: false,
            borderColor: '#00D9FF',
            borderScaleFactor: 2,
        };

        // Apply to all objects by default
        Canvas.prototype.getActiveObject = (function (originalFn) {
            return function (this: Canvas) {
                const obj = originalFn.call(this);
                if (obj) {
                    Object.assign(obj, controlStyle);
                }
                return obj;
            };
        })(Canvas.prototype.getActiveObject);

        // Selection events
        canvas.on('selection:created', (e) => {
            setSelectedObjects(e.selected || []);
        });

        canvas.on('selection:updated', (e) => {
            setSelectedObjects(e.selected || []);
        });

        canvas.on('selection:cleared', () => {
            setSelectedObjects([]);
        });

        // History on object modification
        canvas.on('object:modified', () => {
            saveToHistory();
        });

        canvas.on('object:added', () => {
            saveToHistory();
        });

        fabricRef.current = canvas;
        setCanvas(canvas);
        saveToHistory(); // Initial state

        if (onReady) {
            onReady(canvas);
        }

        return () => {
            canvas.dispose();
            fabricRef.current = null;
            setCanvas(null);
        };
    }, []);

    // Update canvas size
    useEffect(() => {
        if (fabricRef.current) {
            fabricRef.current.setDimensions({ width, height });
            fabricRef.current.renderAll();
        }
    }, [width, height]);

    // Update background color
    useEffect(() => {
        if (fabricRef.current) {
            fabricRef.current.backgroundColor = backgroundColor;
            fabricRef.current.renderAll();
        }
    }, [backgroundColor]);

    return (
        <div
            className="fabric-canvas-wrapper"
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'repeating-linear-gradient(45deg, #1a1a1a, #1a1a1a 10px, #222 10px, #222 20px)',
                borderRadius: '12px',
                padding: '24px',
                overflow: 'auto',
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                    borderRadius: '4px',
                }}
            />
        </div>
    );
}

// Helper functions to add objects to canvas
export function addImageToCanvas(canvas: Canvas, imageUrl: string): Promise<FabricImage> {
    return new Promise((resolve, reject) => {
        FabricImage.fromURL(imageUrl, { crossOrigin: 'anonymous' }).then((img) => {
            // Scale image to fit canvas
            const maxWidth = canvas.width! * 0.8;
            const maxHeight = canvas.height! * 0.8;

            const scale = Math.min(
                maxWidth / img.width!,
                maxHeight / img.height!,
                1
            );

            img.scale(scale);
            img.set({
                left: (canvas.width! - img.width! * scale) / 2,
                top: (canvas.height! - img.height! * scale) / 2,
                cornerColor: '#00D9FF',
                cornerStrokeColor: '#ffffff',
                cornerSize: 10,
                cornerStyle: 'circle',
                transparentCorners: false,
                borderColor: '#00D9FF',
            });

            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            resolve(img);
        }).catch(reject);
    });
}

export function addTextToCanvas(
    canvas: Canvas,
    text: string = 'Add your text here',
    options: Partial<Textbox> = {}
): Textbox {
    const textbox = new Textbox(text, {
        left: canvas.width! / 2 - 100,
        top: canvas.height! / 2 - 20,
        width: 300,
        fontSize: 32,
        fontFamily: 'Inter, Arial, sans-serif',
        fill: '#ffffff',
        textAlign: 'center',
        cornerColor: '#00D9FF',
        cornerStrokeColor: '#ffffff',
        cornerSize: 10,
        cornerStyle: 'circle',
        transparentCorners: false,
        borderColor: '#00D9FF',
        ...options,
    });

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
    return textbox;
}

export function addShapeToCanvas(
    canvas: Canvas,
    type: 'rect' | 'circle',
    options: Partial<Rect | Circle> = {}
): Rect | Circle {
    const commonProps = {
        left: canvas.width! / 2 - 50,
        top: canvas.height! / 2 - 50,
        fill: '#00D9FF',
        stroke: '#ffffff',
        strokeWidth: 2,
        cornerColor: '#00D9FF',
        cornerStrokeColor: '#ffffff',
        cornerSize: 10,
        cornerStyle: 'circle' as const,
        transparentCorners: false,
        borderColor: '#00D9FF',
    };

    let shape: Rect | Circle;

    if (type === 'rect') {
        shape = new Rect({
            ...commonProps,
            width: 100,
            height: 100,
            rx: 8,
            ry: 8,
            ...options,
        });
    } else {
        shape = new Circle({
            ...commonProps,
            radius: 50,
            ...options,
        });
    }

    canvas.add(shape);
    canvas.setActiveObject(shape);
    canvas.renderAll();
    return shape;
}

export function deleteSelectedObjects(canvas: Canvas) {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => {
        canvas.remove(obj);
    });
    canvas.discardActiveObject();
    canvas.renderAll();
}

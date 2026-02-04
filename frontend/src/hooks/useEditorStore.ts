'use client';

import { create } from 'zustand';
import type { Canvas as FabricCanvas, FabricObject } from 'fabric';

// History entry for undo/redo
interface HistoryEntry {
    json: string;
    timestamp: number;
}

// Editor state
interface EditorState {
    // Canvas reference
    canvas: FabricCanvas | null;
    setCanvas: (canvas: FabricCanvas | null) => void;

    // Selected object(s)
    selectedObjects: FabricObject[];
    setSelectedObjects: (objects: FabricObject[]) => void;

    // Canvas settings
    canvasWidth: number;
    canvasHeight: number;
    backgroundColor: string;
    setCanvasSize: (width: number, height: number) => void;
    setBackgroundColor: (color: string) => void;

    // Global adjustments (applied to background image)
    adjustments: {
        brightness: number;
        contrast: number;
        saturation: number;
        blur: number;
    };
    setAdjustment: (key: keyof EditorState['adjustments'], value: number) => void;
    resetAdjustments: () => void;

    // History (undo/redo)
    history: HistoryEntry[];
    historyIndex: number;
    maxHistory: number;
    saveToHistory: () => void;
    undo: () => void;
    redo: () => void;
    canUndo: () => boolean;
    canRedo: () => boolean;

    // Active tool
    activeTool: 'select' | 'text' | 'shape' | 'draw';
    setActiveTool: (tool: EditorState['activeTool']) => void;

    // Zoom
    zoom: number;
    setZoom: (zoom: number) => void;
}

const DEFAULT_ADJUSTMENTS = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    blur: 0,
};

export const useEditorStore = create<EditorState>((set, get) => ({
    // Canvas
    canvas: null,
    setCanvas: (canvas) => set({ canvas }),

    // Selection
    selectedObjects: [],
    setSelectedObjects: (objects) => set({ selectedObjects: objects }),

    // Canvas settings
    canvasWidth: 800,
    canvasHeight: 600,
    backgroundColor: '#ffffff',
    setCanvasSize: (width, height) => set({ canvasWidth: width, canvasHeight: height }),
    setBackgroundColor: (color) => {
        const { canvas } = get();
        if (canvas) {
            canvas.backgroundColor = color;
            canvas.renderAll();
        }
        set({ backgroundColor: color });
    },

    // Adjustments
    adjustments: { ...DEFAULT_ADJUSTMENTS },
    setAdjustment: (key, value) => {
        set((state) => ({
            adjustments: { ...state.adjustments, [key]: value },
        }));
    },
    resetAdjustments: () => set({ adjustments: { ...DEFAULT_ADJUSTMENTS } }),

    // History
    history: [],
    historyIndex: -1,
    maxHistory: 50,
    saveToHistory: () => {
        const { canvas, history, historyIndex, maxHistory } = get();
        if (!canvas) return;

        const json = JSON.stringify(canvas.toJSON());
        const newEntry: HistoryEntry = { json, timestamp: Date.now() };

        // Remove any future history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newEntry);

        // Keep only last maxHistory entries
        if (newHistory.length > maxHistory) {
            newHistory.shift();
        }

        set({ history: newHistory, historyIndex: newHistory.length - 1 });
    },
    undo: () => {
        const { canvas, history, historyIndex } = get();
        if (!canvas || historyIndex <= 0) return;

        const prevIndex = historyIndex - 1;
        const entry = history[prevIndex];
        if (entry) {
            canvas.loadFromJSON(JSON.parse(entry.json)).then(() => {
                canvas.renderAll();
            });
            set({ historyIndex: prevIndex });
        }
    },
    redo: () => {
        const { canvas, history, historyIndex } = get();
        if (!canvas || historyIndex >= history.length - 1) return;

        const nextIndex = historyIndex + 1;
        const entry = history[nextIndex];
        if (entry) {
            canvas.loadFromJSON(JSON.parse(entry.json)).then(() => {
                canvas.renderAll();
            });
            set({ historyIndex: nextIndex });
        }
    },
    canUndo: () => get().historyIndex > 0,
    canRedo: () => get().historyIndex < get().history.length - 1,

    // Active tool
    activeTool: 'select',
    setActiveTool: (tool) => set({ activeTool: tool }),

    // Zoom
    zoom: 1,
    setZoom: (zoom) => {
        const { canvas } = get();
        if (canvas) {
            canvas.setZoom(zoom);
            canvas.renderAll();
        }
        set({ zoom });
    },
}));

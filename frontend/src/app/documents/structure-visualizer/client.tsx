'use client';

import * as React from 'react';
import mermaid from 'mermaid';
import {
    Maximize2, Minimize2, Download, Copy, Share2,
    Settings, RefreshCw, FileText, Code, Network,
    PieChart, BarChart2, GitBranch, Activity, Layers,
    Database, Box, Clock, User, Target, ChevronDown,
    Play, Layout, ZoomIn, ZoomOut, Move,
    Upload, Trash2, Check, Grid, List, Monitor, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '@/components/ui/AnimatedBackground';

// --- Types ---
type NodeType = 'default' | 'root' | 'child' | 'leaf';
interface StructureNode {
    id: string;
    label: string;
    type: NodeType;
    children?: StructureNode[];
}

type VisualizationType =
    | 'flowchart-td' | 'flowchart-lr' | 'mindmap'
    | 'class-diagram' | 'state-diagram' | 'er-diagram'
    | 'sequence-diagram' | 'gantt' | 'pie' | 'quadrant'
    | 'timeline' | 'user-journey' | 'git-graph' | 'deep-tree';

type ComplexityLevel = 'easy' | 'medium' | 'hard';

// --- Helper: Parse Indented Text to Node Tree ---
const parseIndentedText = (text: string): StructureNode[] => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const root: StructureNode = { id: 'root', label: 'Root', type: 'root', children: [] };
    const stack: { node: StructureNode, level: number }[] = [{ node: root, level: -1 }];

    lines.forEach((line, index) => {
        const indentMatch = line.match(/^(\s*)/);
        const level = indentMatch ? indentMatch[1].length : 0;
        const label = line.trim();
        const newNode: StructureNode = { id: `node-${index}`, label, type: 'child', children: [] };

        while (stack.length > 1 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        const parent = stack[stack.length - 1].node;
        parent.children = parent.children || [];
        parent.children.push(newNode);
        stack.push({ node: newNode, level });
    });

    return root.children || [];
};

// --- Helper: Parse JSON to Node Tree ---
const parseJson = (text: string): StructureNode[] => {
    try {
        const data = JSON.parse(text);
        const traverse = (obj: any, key: string = 'root'): StructureNode => {
            const children: StructureNode[] = [];
            if (typeof obj === 'object' && obj !== null) {
                Object.entries(obj).forEach(([k, v]) => {
                    children.push(traverse(v, k));
                });
            } else {
                children.push({ id: `leaf-${Math.random()}`, label: String(obj), type: 'leaf' });
            }
            return { id: `node-${Math.random()}`, label: key, type: children.length ? 'default' : 'leaf', children };
        };
        return [traverse(data)];
    } catch (e) {
        return [{ id: 'error', label: 'Invalid JSON', type: 'default' }];
    }
};

// --- Helper: Parse Code (JS/TS/Python) to Node Tree ---
// --- Helper: Parse Code (Generic & Multi-Level) ---
const parseCode = (text: string, complexity: ComplexityLevel): StructureNode[] => {
    // Limit input size to prevent freezing
    const MAX_LINES = 1000;
    const lines = text.split('\n').slice(0, MAX_LINES);

    const root: StructureNode = { id: 'root', label: 'Code Structure', type: 'root', children: [] };
    const stack: { node: StructureNode, level: number, type: 'class' | 'function' | 'root' | 'other' }[] = [{ node: root, level: -1, type: 'root' }];

    // Generic Patterns with Complexity Levels
    const patterns = [
        // HARD: Imports/Package
        { regex: /^\s*(?:import|package|using|include)\s+/, type: 'leaf', minComplexity: 'hard', label: (m: RegExpMatchArray, l: string) => `Import/Pkg: ${l.trim().substring(0, 20)}...` },

        // EASY: Classes & High Level Structures
        { regex: /^\s*(?:export\s+)?(?:public|private|protected|internal\s+)?(?:abstract\s+)?(?:class|struct|interface|enum|trait|impl|namespace|module)\s+(\w+)/, type: 'root', minComplexity: 'easy', label: (m: RegExpMatchArray) => `TYPE: ${m[1]}`, context: 'class' },

        // MEDIUM: Functions & Methods (Generic detection: func name() or name = () =>)
        { regex: /^\s*(?:export\s+)?(?:public|private|protected|static\s+)?(?:async\s+)?(?:function|func|fn|def|sub|void|int|string|bool)\s+(\w+)/, type: 'child', minComplexity: 'medium', label: (m: RegExpMatchArray) => `Func: ${m[1]}`, context: 'function' },

        // MEDIUM: Arrow Functions / Assignments as functions
        { regex: /^\s*(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[^=]*)\s*=>/, type: 'child', minComplexity: 'medium', label: (m: RegExpMatchArray) => `Func: ${m[1]}`, context: 'function' },

        // HARD: Variables
        { regex: /^\s*(?:const|let|var|val|final|int|string|float|bool|char)\s+(\w+)\s*(?:=|;)/, type: 'leaf', minComplexity: 'hard', label: (m: RegExpMatchArray) => `Var: ${m[1]}` },

        // HARD: Control Flow
        { regex: /^\s*(if|for|while|switch|try|catch|finally|match|loop)\b/, type: 'child', minComplexity: 'hard', label: (m: RegExpMatchArray) => `Flow: ${m[1]}`, context: 'function' },

        // HARD: Return / Yield
        { regex: /^\s*(return|yield|break|continue)\b/, type: 'leaf', minComplexity: 'hard', label: (m: RegExpMatchArray) => `Flow: ${m[1]}` },

        // HARD: JSX
        { regex: /^\s*<([A-Z]\w+)/, type: 'leaf', minComplexity: 'hard', label: (m: RegExpMatchArray) => `JSX: <${m[1]}>` },
    ];

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        // Skip comments and empty lines to save processing
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

        const indentMatch = line.match(/^(\s*)/);
        const level = indentMatch ? indentMatch[1].length : 0;

        let matchFound: { label: string, type: NodeType, context?: string } | null = null;

        for (const pattern of patterns) {
            // Check complexity requirement
            // @ts-ignore
            if (complexity === 'easy' && pattern.minComplexity !== 'easy') continue;
            // @ts-ignore
            if (complexity === 'medium' && pattern.minComplexity === 'hard') continue;

            const m = line.match(pattern.regex);
            if (m) {
                // @ts-ignore
                matchFound = { label: pattern.label(m, line), type: pattern.type, context: pattern.context };
                break;
            }
        }

        // Simpler heuristic for class methods if not found above
        if (!matchFound) {
            const methodMatch = line.match(/^\s*(?:private|public|protected|static)?\s*(?:async\s+)?(\w+)\s*\(/);
            if (methodMatch && !line.includes('function') && stack[stack.length - 1].type === 'class') {
                matchFound = { label: `Method: ${methodMatch[1]}`, type: 'leaf', context: 'function' };
            }
        }

        if (matchFound) {
            // @ts-ignore
            const newNode: StructureNode = { id: `node-${index}`, label: matchFound.label, type: matchFound.type, children: [] };

            // Logic to find parent based on indent level (Python/General) or Stack (JS/TS simplified)
            // For now, using simple indentation tracking as a proxy for scope
            while (stack.length > 1 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }

            const parent = stack[stack.length - 1].node;
            parent.children = parent.children || [];
            parent.children.push(newNode);
            // @ts-ignore
            stack.push({ node: newNode, level, type: matchFound.context || 'other' });
        }
    });

    return root.children?.length ? root.children : [{ id: 'empty', label: 'No structure found', type: 'default' }];
};

// --- Visualization Generators (Mermaid Syntax) ---
const generators: Record<VisualizationType, (nodes: StructureNode[]) => string> = {
    'flowchart-td': (nodes) => {
        let code = 'graph TD\n';
        const traverse = (n: StructureNode) => {
            n.children?.forEach(child => {
                code += `  ${n.id.replace(/[^a-zA-Z0-9]/g, '')}["${n.label}"] --> ${child.id.replace(/[^a-zA-Z0-9]/g, '')}["${child.label}"]\n`;
                traverse(child);
            });
        };
        nodes.forEach(traverse);
        return code;
    },
    'flowchart-lr': (nodes) => {
        let code = 'graph LR\n';
        const traverse = (n: StructureNode) => {
            n.children?.forEach(child => {
                code += `  ${n.id.replace(/[^a-zA-Z0-9]/g, '')}["${n.label}"] --> ${child.id.replace(/[^a-zA-Z0-9]/g, '')}["${child.label}"]\n`;
                traverse(child);
            });
        };
        nodes.forEach(traverse);
        return code;
    },
    'mindmap': (nodes) => {
        let code = 'mindmap\n  root((Structure))\n';
        const traverse = (n: StructureNode, depth: number) => {
            const indent = '    '.repeat(depth + 1);
            code += `${indent}${n.label}\n`;
            n.children?.forEach(c => traverse(c, depth + 1));
        };
        nodes.forEach(n => traverse(n, 0));
        return code;
    },
    'pie': (nodes) => {
        let code = 'pie title Structure Distribution\n';
        const traverse = (n: StructureNode) => {
            const val = n.children?.length || 1;
            code += `  "${n.label}" : ${val}\n`;
            n.children?.forEach(traverse);
        };
        nodes.forEach(traverse);
        return code;
    },
    'class-diagram': (nodes) => {
        let code = 'classDiagram\n';
        const traverse = (n: StructureNode) => {
            code += `class ${n.label.replace(/[^a-zA-Z0-9_]/g, '')} {\n}\n`;
            n.children?.forEach(child => {
                code += `${n.label.replace(/[^a-zA-Z0-9_]/g, '')} *-- ${child.label.replace(/[^a-zA-Z0-9_]/g, '')}\n`;
                traverse(child);
            });
        };
        nodes.forEach(traverse);
        return code;
    },
    'state-diagram': (nodes) => {
        let code = 'stateDiagram-v2\n';
        const traverse = (n: StructureNode) => {
            n.children?.forEach(child => {
                code += `  ${n.label.replace(/[^a-zA-Z0-9_]/g, '')} --> ${child.label.replace(/[^a-zA-Z0-9_]/g, '')}\n`;
                traverse(child);
            });
        };
        nodes.forEach(traverse);
        return code;
    },
    'er-diagram': (nodes) => {
        let code = 'erDiagram\n';
        const traverse = (n: StructureNode) => {
            n.children?.forEach(child => {
                code += `  ${n.label.replace(/[^a-zA-Z0-9_]/g, '')} ||--|{ ${child.label.replace(/[^a-zA-Z0-9_]/g, '')} : contains\n`;
                traverse(child);
            });
        };
        nodes.forEach(traverse);
        return code;
    },
    'sequence-diagram': (nodes) => {
        let code = 'sequenceDiagram\n';
        nodes.forEach(n => {
            code += `  participant ${n.label.replace(/[^a-zA-Z0-9_]/g, '')}\n`;
            n.children?.forEach(c => {
                code += `  ${n.label.replace(/[^a-zA-Z0-9_]/g, '')}->>${c.label.replace(/[^a-zA-Z0-9_]/g, '')}: includes\n`;
            });
        });
        return code;
    },
    'gantt': (nodes) => {
        let code = 'gantt\n  title Project Timeline\n  dateFormat YYYY-MM-DD\n  section Primary\n';
        nodes.forEach((n, i) => {
            code += `  ${n.label} :a${i}, 2024-01-0${(i % 9) + 1}, 30d\n`;
        });
        return code;
    },
    'timeline': (nodes) => {
        let code = 'timeline\n  title Structure Timeline\n';
        nodes.forEach((n, i) => {
            code += `  Section ${i + 1} : ${n.label}\n`;
            n.children?.forEach(c => {
                code += `    : ${c.label}\n`;
            });
        });
        return code;
    },
    'git-graph': (nodes) => {
        let code = 'gitGraph\n';
        code += '  commit\n';
        nodes.forEach(n => {
            code += `  branch ${n.label.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 10)}\n`;
            code += '  checkout main\n';
            code += '  commit\n';
        });
        return code;
    },
    'user-journey': (nodes) => {
        let code = 'journey\n  title User Journey Map\n';
        nodes.forEach(n => {
            code += `  section ${n.label}\n`;
            const children = n.children?.map(c => c.label).join(', ') || 'Action';
            code += `    Task: 5: ${children}\n`;
        });
        return code;
    },
    'quadrant': (nodes) => {
        let code = 'quadrantChart\n  title Quadrant Analysis\n  x-axis Low Priority --> High Priority\n  y-axis Low Complexity --> High Complexity\n';
        nodes.forEach((n, i) => {
            code += `  ${n.label}: [0.${(i % 9) + 1}, 0.${(nodes.length - i) % 9 + 1}]\n`;
        });
        return code;
    },
    'deep-tree': (nodes) => {
        let code = 'graph TB\n';

        const traverse = (n: StructureNode) => {
            const cleanId = n.id.replace(/[^a-zA-Z0-9]/g, '');
            if (n.children && n.children.length > 0) {
                code += `  subgraph ${cleanId} ["${n.label}"]\n`;
                code += `    direction TB\n`;
                n.children.forEach(traverse);
                code += `  end\n`;
            } else {
                code += `  ${cleanId}(["${n.label}"])\n`;
            }
        };

        nodes.forEach(traverse);

        // Link siblings to show flow/order within the same container? 
        // For structure, improved containment is key.
        return code;
    },

};


const DIAGRAM_TYPES: { id: VisualizationType; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'deep-tree', label: 'Deep Code Visualizer', icon: <Code size={18} />, desc: 'Nested Blocks & Logic' },
    { id: 'mindmap', label: 'Mindmap', icon: <Network size={18} />, desc: 'Brainstorming & hierarchy' },
    { id: 'flowchart-td', label: 'Flowchart (TD)', icon: <Activity size={18} />, desc: 'Top-down process flow' },
    { id: 'flowchart-lr', label: 'Flowchart (LR)', icon: <Activity size={18} className="rotate-90" />, desc: 'Left-right process flow' },
    { id: 'git-graph', label: 'Git Graph', icon: <GitBranch size={18} />, desc: 'Version control history' },
    { id: 'class-diagram', label: 'Class Diagram', icon: <Code size={18} />, desc: 'OOP structure' },
    { id: 'state-diagram', label: 'State Diagram', icon: <RefreshCw size={18} />, desc: 'State machine transitions' },
    { id: 'er-diagram', label: 'ER Diagram', icon: <Database size={18} />, desc: 'Database relationships' },
    { id: 'sequence-diagram', label: 'Sequence', icon: <Layers size={18} />, desc: 'Interaction timeline' },
    { id: 'pie', label: 'Pie Chart', icon: <PieChart size={18} />, desc: 'Data distribution' },
    { id: 'gantt', label: 'Gantt Chart', icon: <BarChart2 size={18} />, desc: 'Project schedule' },
    { id: 'timeline', label: 'Timeline', icon: <Clock size={18} />, desc: 'Chronological events' },
    { id: 'quadrant', label: 'Quadrant', icon: <Target size={18} />, desc: 'Four-part grid analysis' },
    { id: 'user-journey', label: 'User Journey', icon: <User size={18} />, desc: 'User experience map' },
];


export default function StructureVisualizerClient() {
    const [input, setInput] = React.useState<string>('Project\n  Backend\n    Database\n    API\n  Frontend\n    Components\n    Pages');
    const [vizType, setVizType] = React.useState<VisualizationType>('mindmap');
    const [mermaidCode, setMermaidCode] = React.useState<string>('');
    const [error, setError] = React.useState<string | null>(null);
    const [zoom, setZoom] = React.useState(1);
    const [inputType, setInputType] = React.useState<'tree' | 'json' | 'code'>('tree');
    const [complexity, setComplexity] = React.useState<ComplexityLevel>('easy');

    // UI States
    const [isTypeSelectorOpen, setIsTypeSelectorOpen] = React.useState(false);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const typeSelectRef = React.useRef<HTMLDivElement>(null);

    // Initial load - Custom Theme Override
    React.useEffect(() => {
        mermaid.initialize({
            startOnLoad: false,
            theme: 'base',
            themeVariables: {
                primaryColor: '#00D9FF', // Neon Blue
                primaryTextColor: '#000000',
                primaryBorderColor: '#00D9FF',
                lineColor: '#8B5CF6', // Neon Purple
                secondaryColor: '#10B981', // Neon Green
                tertiaryColor: '#18181B', // Dark BG
                fontFamily: 'var(--font-sans)',
                background: 'transparent',
                mainBkg: '#030304',
                nodeBorder: '#00D9FF',
                clusterBkg: '#18181B',
                clusterBorder: '#8B5CF6',
                defaultLinkColor: '#8B5CF6',
                edgeLabelBackground: '#030304',
            },
            securityLevel: 'loose',
            flowchart: {
                useMaxWidth: false,
                htmlLabels: true,
                curve: 'basis', // Smooth curves are faster than some other types?
            },
        });
    }, []);

    // Close Dropdown on Click Outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (typeSelectRef.current && !typeSelectRef.current.contains(event.target as Node)) {
                setIsTypeSelectorOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Render Diagram
    const renderDiagram = React.useCallback(async () => {
        if (!containerRef.current) return;
        setError(null);

        // 1. Parse Input
        let nodes: StructureNode[] = [];
        try {
            if (inputType === 'code') {
                nodes = parseCode(input, complexity);
            } else if (inputType === 'json' || input.trim().startsWith('{') || input.trim().startsWith('[')) {
                if (input.trim().startsWith('{') || input.trim().startsWith('[')) {
                    nodes = parseJson(input);
                } else if (inputType === 'tree') {
                    nodes = parseIndentedText(input);
                } else {
                    nodes = parseJson(input);
                }
            } else {
                nodes = parseIndentedText(input);
            }
        } catch (e) {
            setError('Failed to parse input.');
            return;
        }

        // 2. Generate Code
        let code = '';
        try {
            const generator = generators[vizType] || generators['flowchart-td'];
            code = generator(nodes);
            // Append theme configuration to each render to ensure it applies
            code = `%%{init: {'theme':'base', 'themeVariables': { 'primaryColor': '#00D9FF', 'primaryTextColor': '#fff', 'primaryBorderColor': '#00D9FF', 'lineColor': '#8B5CF6', 'mainBkg': '#000000', 'nodeBorder': '#00D9FF' }}}%%\n` + code;
            setMermaidCode(code);
        } catch (e) {
            setError('Failed to generate visualization code.');
            return;
        }

        // 3. Render Mermaid
        try {
            const id = `mermaid-${Date.now()}`;
            containerRef.current.innerHTML = '';
            const { svg } = await mermaid.render(id, code);
            containerRef.current.innerHTML = svg;

            // Post-process SVG
            const svgElement = containerRef.current.querySelector('svg');
            if (svgElement) {
                svgElement.style.width = '100%';
                svgElement.style.height = '100%';
                svgElement.style.maxWidth = 'none';
            }

        } catch (e) {
            console.error(e);
            containerRef.current.innerHTML = '<div class="opacity-30 flex items-center justify-center p-10"><span class="animate-pulse">Rendering...</span></div>';
        }
    }, [input, vizType, inputType, complexity]);

    React.useEffect(() => {
        const timeout = setTimeout(renderDiagram, 1500);
        return () => clearTimeout(timeout);
    }, [renderDiagram]);

    const handleDownload = () => {
        const svg = containerRef.current?.querySelector('svg');
        if (svg) {
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `mage-struct-${vizType}.svg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (ev) => {
                if (ev.target?.result) setInput(ev.target.result as string);
                if (file.name.endsWith('.json')) setInputType('json');
                else setInputType('tree');
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-deep)] text-white font-sans selection:bg-[var(--neon-blue)] selection:text-black pt-[var(--header-height)]">

            {/* Holographic Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <AnimatedBackground />
            </div>

            {/* Header / Intro */}
            <div className="container mx-auto px-4 md:px-6 py-4 md:py-8 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-4 md:mb-6 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight flex items-center gap-3">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[var(--neon-blue)] to-[var(--neon-purple)]">
                                Structure Visualizer
                            </span>
                            <span className="px-2 py-0.5 rounded-full border border-[var(--neon-blue)]/30 bg-[var(--neon-blue)]/10 text-[var(--neon-blue)] text-[10px] md:text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(0,217,255,0.2)]">
                                Pro
                            </span>
                        </h1>
                    </div>
                </div>

                {/* Main Grid Layout - Split Screen 50/50 */}
                {/* Switch to Flex for safer side-by-side on desktop */}
                <div className="flex flex-col lg:flex-row gap-6 pb-20 h-[calc(100vh-180px)] min-h-[600px]">

                    {/* Left Panel: Editor */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-4 w-full h-[50vh] lg:h-full lg:w-1/2"
                    >
                        {/* Editor Card */}
                        <div className="flex flex-col flex-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative group h-full">
                            {/* Hover Glow Effect */}
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-transparent via-[var(--neon-blue)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none" />

                            {/* Editor Toolbar */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5">
                                <div className="flex gap-4 text-[10px] font-bold tracking-widest uppercase text-[var(--text-muted)]">
                                    <button
                                        onClick={() => setInputType('tree')}
                                        className={`hover:text-[var(--neon-blue)] transition-colors ${inputType === 'tree' ? 'text-[var(--neon-blue)] shadow-[0_10px_20px_-10px_rgba(0,217,255,0.5)]' : ''}`}
                                    >
                                        Tree
                                    </button>
                                    <button
                                        onClick={() => setInputType('json')}
                                        className={`hover:text-[var(--neon-purple)] transition-colors ${inputType === 'json' ? 'text-[var(--neon-purple)]' : ''}`}
                                    >
                                        JSON
                                    </button>
                                    <button
                                        onClick={() => setInputType('code')}
                                        className={`hover:text-[var(--neon-green)] transition-colors ${inputType === 'code' ? 'text-[var(--neon-green)]' : ''}`}
                                    >
                                        Code
                                    </button>
                                </div>

                                {/* Complexity Toggles (Only for Code) */}
                                {inputType === 'code' && (
                                    <div className="flex bg-white/5 rounded-lg p-1 mr-2">
                                        {(['easy', 'medium', 'hard'] as ComplexityLevel[]).map((level) => (
                                            <button
                                                key={level}
                                                onClick={() => setComplexity(level)}
                                                className={`px-3 py-1.5 rounded-lg text-xs uppercase font-bold tracking-wider transition-colors ${complexity === level ? 'bg-[#00D9FF] text-black shadow-[0_0_10px_rgba(0,217,255,0.4)]' : 'text-gray-500 hover:text-gray-300'}`}
                                            >
                                                {level}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[var(--neon-blue)]/50 rounded-lg transition-all group/upload">
                                    <Upload size={14} className="text-[var(--text-muted)] group-hover/upload:text-[var(--neon-blue)] transition-colors" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] group-hover/upload:text-white transition-colors">Import</span>
                                    <input type="file" className="hidden" accept=".txt,.json,.md" onChange={handleFileChange} />
                                </label>
                            </div>

                            {/* Text Area */}
                            <div className="relative flex-1 group/textarea flex flex-col">
                                <textarea
                                    className="flex-1 w-full h-full bg-transparent border-none p-4 md:p-6 font-mono text-xs md:text-sm leading-relaxed resize-none focus:ring-0 outline-none text-[var(--text-primary)] placeholder:opacity-20 custom-scrollbar selection:bg-[var(--neon-purple)] selection:text-white"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={
                                        inputType === 'tree' ? "// Type your structure here...\nRoot\n  Child 1\n  Child 2" :
                                            inputType === 'code' ? "// Paste your code here...\nclass MyClass {\n  myMethod() {}\n}" :
                                                '{\n  "root": {\n    "child": {}\n  }\n}'
                                    }
                                    spellCheck={false}
                                />
                                {/* Bottom Glow Bar */}
                                <div className="h-[2px] bg-gradient-to-r from-[var(--neon-blue)] via-[var(--neon-purple)] to-[var(--neon-blue)] opacity-0 group-focus-within/textarea:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(0,217,255,0.5)]" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Panel: Visualization */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex flex-col relative w-full h-[50vh] lg:h-full lg:w-1/2"
                    >
                        {/* Visualizer Container */}
                        <div className="flex-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl relative flex flex-col group w-full h-full">

                            {/* Inner Border Glow */}
                            <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none" />

                            {/* Scifi Grid Background */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] pointer-events-none" />


                            {/* Floating Holographic Toolbar */}
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center p-1 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/5 max-w-[98%]">

                                {/* Type Selector */}
                                <div className="relative shrink-0" ref={typeSelectRef}>
                                    <button
                                        onClick={() => setIsTypeSelectorOpen(!isTypeSelectorOpen)}
                                        className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all group/btn"
                                    >
                                        <span className={`p-1 rounded-lg bg-gradient-to-br from-[var(--neon-blue)]/20 to-[var(--neon-purple)]/20 border border-white/10 group-hover/btn:border-[var(--neon-blue)]/50 transition-colors`}>
                                            {DIAGRAM_TYPES.find(t => t.id === vizType)?.icon}
                                        </span>
                                        <span className="text-[var(--text-secondary)] group-hover/btn:text-white transition-colors truncate max-w-[120px]">
                                            {DIAGRAM_TYPES.find(t => t.id === vizType)?.label}
                                        </span>
                                        <ChevronDown size={12} className={`opacity-50 transition-transform duration-300 ${isTypeSelectorOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Holographic Dropdown - EXPANDED & MULTI-COLUMN */}
                                    <AnimatePresence>
                                        {isTypeSelectorOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                                transition={{ duration: 0.2 }}
                                                className="absolute top-[120%] left-0 w-[500px] max-w-[90vw] -translate-x-0 bg-[#050505]/95 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] p-3 grid grid-cols-2 gap-2 z-50 backdrop-blur-xl ring-1 ring-white/5 overflow-hidden"
                                            >
                                                {/* Header or Label could go here if needed, but keeping it clean */}

                                                {DIAGRAM_TYPES.map((type) => (
                                                    <button
                                                        key={type.id}
                                                        onClick={() => { setVizType(type.id); setIsTypeSelectorOpen(false); }}
                                                        className={`flex items-center gap-3 p-2 rounded-lg border transition-all group/item text-left
                                                            ${vizType === type.id
                                                                ? 'bg-[var(--neon-blue)]/10 border-[var(--neon-blue)]/50'
                                                                : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                                                            }`}
                                                    >
                                                        <div className={`p-1.5 rounded-md shrink-0 transition-all duration-300 ${vizType === type.id ? 'bg-[var(--neon-blue)] text-black shadow-[0_0_15px_var(--neon-blue)]' : 'bg-white/5 text-[var(--text-muted)] group-hover/item:text-white'}`}>
                                                            {type.icon}
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider truncate ${vizType === type.id ? 'text-[var(--neon-blue)]' : 'text-[var(--text-muted)] group-hover/item:text-white'}`}>
                                                                {type.label}
                                                            </span>
                                                            <span className="text-[9px] text-[var(--text-muted)] opacity-50 truncate">{type.desc}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div className="w-[1px] h-6 bg-white/10 mx-1 md:mx-2 shrink-0" />

                                {/* Zoom Controls */}
                                <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
                                    <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-muted)] hover:text-white">
                                        <ZoomOut size={14} />
                                    </button>
                                    <span className="text-[10px] font-mono text-[var(--text-muted)] w-8 text-center">{Math.round(zoom * 100)}%</span>
                                    <button onClick={() => setZoom(z => Math.min(z + 0.1, 3))} className="p-2 hover:bg-white/5 rounded-lg transition-colors text-[var(--text-muted)] hover:text-white">
                                        <ZoomIn size={14} />
                                    </button>
                                </div>

                                <div className="w-[1px] h-6 bg-white/10 mx-1 md:mx-2 shrink-0" />

                                <button
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-3 md:px-4 py-2 bg-[var(--neon-blue)] hover:bg-[var(--neon-blue-dark)] text-black rounded-xl transition-all shadow-[0_0_20px_rgba(0,217,255,0.3)] hover:shadow-[0_0_30px_rgba(0,217,255,0.5)] font-bold text-[10px] md:text-xs uppercase tracking-wider shrink-0"
                                >
                                    <Download size={14} strokeWidth={2.5} />
                                    <span className="hidden md:inline">Export</span>
                                </button>
                            </div>

                            {/* Canvas Area with Neon Diagram */}
                            <div className="flex-1 w-full h-full overflow-hidden flex items-center justify-center relative touch-none">
                                <div
                                    style={{
                                        transform: `scale(${zoom})`,
                                        transition: 'transform 0.4s cubic-bezier(0.2, 0, 0, 1)',
                                        transformOrigin: 'center center'
                                    }}
                                    ref={containerRef}
                                    className="mermaid-wrapper w-full h-full flex items-center justify-center p-4 md:p-12 select-none cursor-grab active:cursor-grabbing invert-0"
                                />

                                {/* Loading / Scanning Effect */}
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(0,217,255,0.05)_50%,transparent_100%)] h-[200%] w-full animate-scan pointer-events-none opacity-20" />

                                {/* Error Overlay */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20 }}
                                            className="absolute bottom-8 right-8 left-8 md:left-auto bg-black/80 border border-red-500/50 backdrop-blur-xl text-red-200 text-xs px-4 py-3 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.2)] flex gap-3 items-center z-30 justify-center md:justify-start"
                                        >
                                            <div className="p-1.5 bg-red-500/20 rounded-full animate-pulse shrink-0">
                                                <Activity size={14} className="text-red-400" />
                                            </div>
                                            <span className="truncate">{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>

            <style jsx global>{`
                @keyframes scan {
                    0% { transform: translateY(-50%); }
                    100% { transform: translateY(0%); }
                }
                .animate-scan {
                    animation: scan 4s linear infinite;
                }
                /* Custom Scrollbar for visualizer */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    );
}

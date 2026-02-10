'use client';

import { useEffect, useRef, useState } from 'react';

// --- Types ---
interface ParticleDark {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
}

interface Raindrop {
    x: number;
    y: number;
    length: number;
    speed: number;
    opacity: number;
}

interface Cloud {
    x: number;
    y: number;
    scale: number;
    speed: number;
    opacity: number;
    typeIndex: number;
}

interface Lightning {
    x: number;
    y: number;
    segments: { x: number; y: number }[];
    opacity: number;
    duration: number;
    startTime: number;
    color: string;
    glowColor: string;
}

// Anime Mode Types
interface SpeedLine {
    angle: number;
    length: number;
    speed: number;
    thickness: number;
    distance: number; // Distance from center
    opacity: number;
}

interface FloatingWord {
    x: number;
    y: number;
    text: string;
    opacity: number;
    scale: number;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
    color: string;
}

// Blackhole Mode Types
interface BlackholeParticle {
    angle: number;
    radius: number; // Distance from center
    speed: number;
    size: number;
    color: string;
    opacity: number;
}

const ANIME_WORDS = ['SPEED', 'POWER', 'IMPACT', 'BOOM', 'SWISH', 'ZAP', 'FOCUS', 'ENERGY'];
const BLACKHOLE_WORDS = ['VOID', 'INFINITY', 'SINGULARITY', 'EVENT HORIZON', 'ABYSS', 'GRAVITY', 'TIME'];

// Circuit Mode Types
interface CircuitNode {
    x: number;
    y: number;
    connected: number[]; // Indices of connected nodes
}

interface CircuitSignal {
    pathIndex: number;
    progress: number; // 0 to 1
    speed: number;
    color: string;
}

interface CircuitPath {
    nodes: { x: number, y: number }[]; // Array of points for the path
    color: string;
    width: number;
}

// Netscape Mode Types
interface NetscapeLine {
    z: number; // Depth
    speed: number;
}


export default function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [isAnimating, setIsAnimating] = useState(true);
    const [activeMode, setActiveMode] = useState<'rain' | 'dataflow' | 'anime' | 'blackhole' | 'circuit' | 'netscape' | 'jungle' | 'mountains' | 'zen' | 'forge'>('dataflow');

    // --- State Initialization ---
    useEffect(() => {
        const updateState = () => {
            const currentTheme = (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark';
            setTheme(currentTheme);

            const animAttr = document.documentElement.getAttribute('data-animate');
            setIsAnimating(animAttr !== 'off');

            const lightModePref = (document.documentElement.getAttribute('data-anim-light') || 'rain').trim();
            const darkModePref = (document.documentElement.getAttribute('data-anim-dark') || 'dataflow').trim();

            // Decide active mode based on current theme
            if (currentTheme === 'light') {
                setActiveMode(lightModePref as any);
            } else {
                setActiveMode(darkModePref as any);
            }
        };

        updateState();

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes') {
                    if (['data-theme', 'data-animate', 'data-anim-light', 'data-anim-dark'].includes(mutation.attributeName || '')) {
                        updateState();
                    }
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme', 'data-animate', 'data-anim-light', 'data-anim-dark']
        });

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let animationFrameId: number;
        let width = 0;
        let height = 0;

        // --- Collections ---
        // Data Flow (formerly Default Dark)
        let particlesDark: ParticleDark[] = [];
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 20 : 50;
        const connectionDistance = 150;
        const baseColorDark = 'rgba(0, 217, 255,';

        // Rain (formerly Default Light)
        let raindrops: Raindrop[] = [];
        let clouds: Cloud[] = [];
        let lightnings: Lightning[] = [];
        const cloudCache: HTMLCanvasElement[] = [];
        const cloudTypeCount = 5;
        const raindropCount = isMobile ? 50 : 120;
        const cloudCount = 8;
        let stormDimLevel = 0;
        let nextLightningTime = Date.now() + Math.random() * 5000 + 3000;

        // Anime
        let speedLines: SpeedLine[] = [];
        let animeWords: FloatingWord[] = [];
        const speedLineCount = isMobile ? 30 : 60;

        // Blackhole
        let blackholeParticles: BlackholeParticle[] = [];
        let blackholeWords: FloatingWord[] = [];
        const blackholeParticleCount = isMobile ? 100 : 300;

        // Circuit
        let circuitNodes: CircuitNode[] = [];
        let circuitSignals: CircuitSignal[] = [];
        let circuitPaths: CircuitPath[] = [];

        // Netscape
        let netscapeLines: NetscapeLine[] = [];
        const netscapeLineCount = 20; // Horizontal lines
        let netscapeOffset = 0;

        // Jungle Types
        interface JungleLeaf {
            x: number;
            y: number;
            size: number;
            angle: number;
            speed: number;
            type: 0 | 1 | 2; // Different leaf shapes
            color: string;
            swayOffset: number;
        }
        let jungleLeaves: JungleLeaf[] = [];
        const jungleLeafCount = isMobile ? 30 : 60;

        // Mountain Types
        interface Mountain {
            points: { x: number, y: number }[];
            color: string;
            speed: number; // For parallax
            z: number; // Depth 0-1
        }
        interface SnowParticle {
            x: number;
            y: number;
            r: number;
            speedY: number;
            speedX: number;
            opacity: number;
        }
        let mountains: Mountain[] = [];
        let snowParticles: SnowParticle[] = [];
        const snowCount = isMobile ? 40 : 100;

        // Zen Types
        interface ZenBranch {
            startX: number;
            startY: number;
            endX: number;
            endY: number;
            thickness: number;
            depth: number;
            color: string;
        }
        interface ZenPetal {
            x: number;
            y: number;
            vx: number;
            vy: number;
            rotation: number;
            size: number;
            color: string;
            falling: boolean;
        }
        let zenBranches: ZenBranch[] = [];
        let zenPetals: ZenPetal[] = [];
        let zenTreeCache: HTMLCanvasElement | null = null;

        // Forge Types
        interface ForgeGear {
            x: number;
            y: number;
            radius: number;
            teeth: number;
            speed: number;
            angle: number;
            color: string; // Base color
            cache: HTMLCanvasElement; // Cached sprite
        }
        interface ForgeSpark {
            x: number;
            y: number;
            vx: number;
            vy: number;
            life: number;
            maxLife: number;
            color: string;
        }
        interface ForgeSteam {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            opacity: number;
        }

        let forgeGears: ForgeGear[] = [];
        let forgeSparks: ForgeSpark[] = [];
        let forgeSteam: ForgeSteam[] = [];

        // --- Helpers ---
        const generateZenTree = (w: number, h: number, isDark: boolean): HTMLCanvasElement => {
            const c = document.createElement('canvas');
            c.width = w;
            c.height = h;
            const cCtx = c.getContext('2d');
            if (!cCtx) return c;

            // Gradient for trunk
            const trunkGrad = cCtx.createLinearGradient(w / 2 - 50, h, w / 2 + 50, h);
            if (isDark) {
                trunkGrad.addColorStop(0, '#2e1065'); // Deep purple
                trunkGrad.addColorStop(0.5, '#4c1d95'); // Violet
                trunkGrad.addColorStop(1, '#0f172a'); // Black-blue
            } else {
                trunkGrad.addColorStop(0, '#3f2c22'); // Dark brown
                trunkGrad.addColorStop(0.5, '#5d4037'); // Medium brown
                trunkGrad.addColorStop(1, '#271c19'); // Darker brown
            }

            // Recursive Draw with High Detail
            const drawBranch = (x: number, y: number, angle: number, length: number, thickness: number, depth: number) => {
                cCtx.save();
                cCtx.translate(x, y);
                cCtx.rotate(angle);

                // Draw segment
                cCtx.fillStyle = depth >= 10 ? trunkGrad : (isDark ? '#4c1d95' : '#5d4037');
                // Tapering width
                const endThickness = thickness * 0.7;

                cCtx.beginPath();
                cCtx.moveTo(-thickness / 2, 0);
                cCtx.lineTo(thickness / 2, 0);
                cCtx.lineTo(endThickness / 2, -length);
                cCtx.lineTo(-endThickness / 2, -length);
                cCtx.fill();

                // Glow for Dark Mode (only on main branches to saveperf)
                if (isDark && depth > 8) {
                    cCtx.shadowBlur = 20;
                    cCtx.shadowColor = '#d8b4fe'; // Lavender glow
                }

                if (depth > 0) {
                    // Sub-branches
                    const num = Math.floor(Math.random() * 2) + 2; // 2-3 branches
                    for (let i = 0; i < num; i++) {
                        // Random spread
                        const spread = (Math.random() - 0.5) * 1.2; // Wide spread
                        const newLen = length * (0.7 + Math.random() * 0.2);
                        const newThick = endThickness;

                        // Limit recursion based on detail needs vs perf of generation
                        // We are offline rendering, so we can go deep.
                        if (newThick > 1) {
                            drawBranch(0, -length, spread, newLen, newThick, depth - 1);
                        }
                    }
                }
                cCtx.restore();
            };

            // Start massive tree from bottom center
            // Initial Length: height * 0.15
            // Initial Thickness: 40
            drawBranch(w / 2, h, 0, h * 0.18, 50, 12);

            return c;
        };

        const createGearSprite = (radius: number, teeth: number, isDark: boolean): HTMLCanvasElement => {
            const c = document.createElement('canvas');
            const size = radius * 2 + 20; // Padding
            c.width = size;
            c.height = size;
            const ctx = c.getContext('2d');
            if (!ctx) return c;

            const cx = size / 2;
            const cy = size / 2;

            // Gradient
            const grad = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius);
            if (isDark) {
                // Iron/Steel
                grad.addColorStop(0, '#94a3b8'); // Slate 400
                grad.addColorStop(0.5, '#475569'); // Slate 600
                grad.addColorStop(1, '#1e293b'); // Slate 800
            } else {
                // Brass/Gold
                grad.addColorStop(0, '#fcd34d'); // Amber 300
                grad.addColorStop(0.5, '#d97706'); // Amber 600
                grad.addColorStop(1, '#78350f'); // Amber 900
            }

            ctx.translate(cx, cy);
            ctx.fillStyle = grad;
            ctx.strokeStyle = isDark ? '#0f172a' : '#451a03';
            ctx.lineWidth = 2;

            // Draw Gear Shape
            ctx.beginPath();
            const outerRadius = radius;
            const innerRadius = radius * 0.85;
            const holeRadius = radius * 0.3;

            for (let i = 0; i < teeth * 2; i++) {
                const angle = (Math.PI * 2 * i) / (teeth * 2);
                const r = (i % 2 === 0) ? outerRadius : innerRadius;
                ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();

            // Inner Hole (Transparent? No, filled with background usually, but here we want it see-through? 
            // Actually, gears have holes. Let's composite 'destination-out' to punch a hole.)
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(0, 0, holeRadius, 0, Math.PI * 2, false);
            ctx.fill();

            // Restore for rivets
            ctx.globalCompositeOperation = 'source-over';

            // Rivets
            ctx.fillStyle = isDark ? '#cbd5e1' : '#fef3c7';
            const rivetCount = 5;
            for (let i = 0; i < rivetCount; i++) {
                const angle = (Math.PI * 2 * i) / rivetCount;
                const rx = Math.cos(angle) * (radius * 0.6);
                const ry = Math.sin(angle) * (radius * 0.6);
                ctx.beginPath();
                ctx.arc(rx, ry, radius * 0.05, 0, Math.PI * 2);
                ctx.fill();
            }

            return c;
        };

        const createCloudImage = (w: number, h: number): HTMLCanvasElement => {
            const c = document.createElement('canvas');
            c.width = w + 60;
            c.height = h + 60;
            const cCtx = c.getContext('2d');
            if (!cCtx) return c;

            const puffCount = Math.floor(Math.random() * 12) + 8;
            cCtx.fillStyle = 'rgba(148, 163, 184, 0.8)';
            cCtx.filter = 'blur(25px)';
            cCtx.beginPath();
            for (let j = 0; j < puffCount; j++) {
                const px = (Math.random() * w * 0.7) + (w * 0.15);
                const py = (Math.random() * h * 0.6) + (h * 0.2);
                const pr = Math.random() * 40 + 30;
                cCtx.moveTo(px + pr, py);
                cCtx.arc(px, py, pr, 0, Math.PI * 2);
            }
            cCtx.fill();

            cCtx.fillStyle = 'rgba(100, 116, 139, 0.6)';
            cCtx.filter = 'blur(15px)';
            cCtx.beginPath();
            for (let j = 0; j < puffCount; j++) {
                const px = (Math.random() * w * 0.7) + (w * 0.15);
                const py = (Math.random() * h * 0.5) + (h * 0.2);
                const pr = Math.random() * 35 + 20;
                cCtx.moveTo(px + pr, py);
                cCtx.arc(px, py, pr, 0, Math.PI * 2);
            }
            cCtx.fill();
            cCtx.filter = 'none';
            return c;
        };

        const createLightning = () => {
            const startX = Math.random() * width;
            const segments: { x: number; y: number }[] = [{ x: startX, y: 0 }];
            let currentX = startX;
            let currentY = 0;
            const targetY = height * 0.8;

            while (currentY < targetY) {
                currentX += (Math.random() - 0.5) * 80;
                currentY += Math.random() * 40 + 20;
                segments.push({ x: currentX, y: currentY });
            }

            const isGold = Math.random() > 0.5;
            const color = isGold ? '#FFD700' : '#FFFFFF';
            const glowColor = isGold ? 'rgba(255, 215, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';

            lightnings.push({
                x: startX, y: 0, segments, opacity: 1,
                duration: 200 + Math.random() * 300,
                startTime: Date.now(), color, glowColor
            });
        };


        const initDataFlow = () => {
            particlesDark = [];
            for (let i = 0; i < particleCount; i++) {
                particlesDark.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    color: `${baseColorDark} ${Math.random() * 0.3 + 0.1})`,
                });
            }
        };

        const initRain = () => {
            raindrops = [];
            for (let i = 0; i < raindropCount; i++) {
                raindrops.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    length: Math.random() * 25 + 15,
                    speed: Math.random() * 10 + 12,
                    opacity: Math.random() * 0.2 + 0.1,
                });
            }
            // Only generate clouds if cache is empty
            if (cloudCache.length === 0) {
                for (let i = 0; i < cloudTypeCount; i++) {
                    cloudCache.push(createCloudImage(400, 200));
                }
            }
            clouds = [];
            for (let i = 0; i < cloudCount; i++) {
                clouds.push({
                    x: Math.random() * width,
                    y: Math.random() * (height * 0.3) - 50,
                    scale: Math.random() * 0.5 + 0.5,
                    speed: Math.random() * 0.4 + 0.2,
                    opacity: Math.random() * 0.4 + 0.6,
                    typeIndex: Math.floor(Math.random() * cloudTypeCount)
                });
            }
        };

        const initAnime = () => {
            speedLines = [];
            for (let i = 0; i < speedLineCount; i++) {
                speedLines.push({
                    angle: Math.random() * Math.PI * 2,
                    length: Math.random() * 300 + 100,
                    speed: Math.random() * 10 + 10,
                    thickness: Math.random() * 2 + 0.5,
                    distance: Math.random() * width,
                    opacity: Math.random()
                });
            }
            animeWords = [];
        };

        const initBlackhole = () => {
            blackholeParticles = [];
            for (let i = 0; i < blackholeParticleCount; i++) {
                blackholeParticles.push({
                    angle: Math.random() * Math.PI * 2,
                    radius: Math.random() * Math.max(width, height), // Start distributed
                    speed: Math.random() * 0.005 + 0.002,
                    size: Math.random() * 2 + 0.5,
                    color: i % 10 === 0 ? '#a855f7' : '#ffffff', // Purple accents
                    opacity: Math.random()
                });
            }
            blackholeWords = [];
        };

        const initCircuit = () => {
            const cols = Math.floor(width / 100);
            const rows = Math.floor(height / 100);
            circuitNodes = [];
            circuitPaths = [];
            circuitSignals = [];

            // Grid of possible nodes
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (Math.random() > 0.7) { // 30% chance to have a node
                        circuitNodes.push({
                            x: c * 100 + 50,
                            y: r * 100 + 50,
                            connected: []
                        });
                    }
                }
            }

            // Create Paths (orthogonal)
            const nodeCount = circuitNodes.length;
            const pathCount = isMobile ? 20 : 40;
            for (let i = 0; i < pathCount; i++) { // Create paths
                if (nodeCount < 2) break;
                const startNodeIdx = Math.floor(Math.random() * nodeCount);
                const startNode = circuitNodes[startNodeIdx];

                // Random walk
                let currX = startNode.x;
                let currY = startNode.y;
                const pathPoints = [{ x: currX, y: currY }];

                for (let step = 0; step < Math.floor(Math.random() * 5 + 3); step++) {
                    if (Math.random() > 0.5) {
                        currX += (Math.random() > 0.5 ? 100 : -100);
                    } else {
                        currY += (Math.random() > 0.5 ? 100 : -100);
                    }
                    // Keep in bounds
                    currX = Math.max(50, Math.min(width - 50, currX));
                    currY = Math.max(50, Math.min(height - 50, currY));
                    pathPoints.push({ x: currX, y: currY });
                }

                circuitPaths.push({
                    nodes: pathPoints,
                    color: '#ffffff',
                    width: 1
                });
            }

            // Init Signals based on paths
            circuitPaths.forEach((_, idx) => {
                if (Math.random() > 0.3) {
                    circuitSignals.push({
                        pathIndex: idx,
                        progress: 0,
                        speed: Math.random() * 0.01 + 0.005,
                        color: Math.random() > 0.5 ? '#00d9ff' : '#8b5cf6'
                    });
                }
            });
        };

        const initNetscape = () => {
            netscapeLines = [];
            for (let i = 0; i < netscapeLineCount; i++) {
                netscapeLines.push({
                    z: i * (height / 2) / netscapeLineCount,
                    speed: 2
                });
            }
        };

        const initJungle = () => {
            jungleLeaves = [];
            for (let i = 0; i < jungleLeafCount; i++) {
                jungleLeaves.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 10 + 5,
                    angle: Math.random() * Math.PI * 2,
                    speed: Math.random() * 0.5 + 0.2, // Falling slow
                    type: Math.floor(Math.random() * 3) as 0 | 1 | 2,
                    color: '', // Set in draw
                    swayOffset: Math.random() * Math.PI * 2
                });
            }
        };

        const initMountains = () => {
            mountains = [];
            // Helper to create jagged mountain points
            const createMountainPoints = (yBase: number, complexity: number) => {
                const points = [{ x: 0, y: height }]; // Start bottom left
                const steps = Math.ceil(width / (50 / complexity));
                let currX = 0;
                let currY = yBase;
                for (let i = 0; i < steps; i++) {
                    currX += width / steps;
                    currY = yBase + (Math.random() - 0.5) * (100 / complexity);
                    points.push({ x: currX, y: currY });
                }
                points.push({ x: width, y: height }); // End bottom right
                return points;
            };

            // 3 Layers
            for (let layer = 0; layer < 3; layer++) {
                mountains.push({
                    points: createMountainPoints(height * (0.5 + layer * 0.15), 1.5 - layer * 0.3),
                    color: '', // Set inside draw based on theme/layer
                    speed: (layer + 1) * 0.2,
                    z: layer
                });
            }

            // Init Snow
            snowParticles = [];
            for (let i = 0; i < snowCount; i++) {
                snowParticles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    speedY: Math.random() * 2 + 1,
                    speedX: (Math.random() - 0.5) * 1,
                    r: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
        };

        const initZen = () => {
            zenBranches = []; // Unused with cache
            zenPetals = [];

            // Generate Static Tree Cache
            // Only regen if needed (check logic later, here we just regen)
            zenTreeCache = generateZenTree(width, height, theme === 'dark');

            // Generate Dynamic Petals/Spirits
            const petalCount = isMobile ? 40 : 80;
            for (let i = 0; i < petalCount; i++) {
                // Scatter around the "canopy" area
                const theta = Math.random() * Math.PI * 2;
                const r = Math.sqrt(Math.random()); // Uniform disk
                const rx = width * 0.4 * r;
                const ry = height * 0.35 * r;

                zenPetals.push({
                    x: (width / 2) + rx * Math.cos(theta),
                    y: (height * 0.4) + ry * Math.sin(theta),
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: Math.random() * 0.5 + 0.2, // Slow fall
                    rotation: Math.random() * Math.PI * 2,
                    size: Math.random() * 5 + 3,
                    color: '', // Set in draw
                    falling: Math.random() > 0.4 // 60% static leaves, 40% falling
                });
            }
        };

        const initForge = () => {
            forgeGears = [];
            forgeSparks = [];
            forgeSteam = [];
            const isDark = theme === 'dark';

            // Gear Configurations (Static composition for stability)
            // 1. Top Left Giant
            forgeGears.push({
                x: 0, y: 0,
                radius: 180, teeth: 24, speed: 0.002, angle: 0, color: '',
                cache: createGearSprite(180, 24, isDark)
            });
            // 2. Connector to Top Left
            forgeGears.push({
                x: 180 + 90, y: 40,
                radius: 100, teeth: 12, speed: -0.0036, angle: 0.2, color: '',
                cache: createGearSprite(100, 12, isDark)
            });

            // 3. Bottom Right Giant
            forgeGears.push({
                x: width, y: height,
                radius: 220, teeth: 30, speed: -0.0015, angle: 0, color: '',
                cache: createGearSprite(220, 30, isDark)
            });

            // 4. Bottom Left Medium
            forgeGears.push({
                x: 0, y: height,
                radius: 140, teeth: 18, speed: 0.0025, angle: 0, color: '',
                cache: createGearSprite(140, 18, isDark)
            });

            // 5. Floating small one (Top Right ish)
            forgeGears.push({
                x: width - 50, y: 100,
                radius: 60, teeth: 8, speed: 0.01, angle: 0, color: '',
                cache: createGearSprite(60, 8, isDark)
            });
        };

        const init = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            switch (activeMode) {
                case 'dataflow': initDataFlow(); break;
                case 'rain': initRain(); break;
                case 'anime': initAnime(); break;
                case 'blackhole': initBlackhole(); break;
                case 'circuit': initCircuit(); break;
                case 'netscape': initNetscape(); break;
                case 'jungle': initJungle(); break;
                case 'mountains': initMountains(); break;
                case 'zen': initZen(); break;
                case 'forge': initForge(); break;
            }
        };

        // --- Drawing Functions ---

        const drawLightning = (lightning: Lightning) => {
            const elapsed = Date.now() - lightning.startTime;
            const progress = elapsed / lightning.duration;
            if (progress > 1) return 0;

            const flashOpacity = Math.max(0, 1 - progress * 2);
            ctx.save();
            ctx.globalAlpha = (1 - progress) * lightning.opacity;
            ctx.strokeStyle = lightning.color;
            ctx.lineWidth = 4;
            ctx.shadowColor = lightning.glowColor;
            if (!isMobile) ctx.shadowBlur = 50;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(lightning.segments[0].x, lightning.segments[0].y);
            for (let i = 1; i < lightning.segments.length; i++) {
                ctx.lineTo(lightning.segments[i].x, lightning.segments[i].y);
            }
            ctx.stroke();

            ctx.strokeStyle = lightning.glowColor;
            ctx.lineWidth = 10;
            ctx.stroke();

            ctx.lineWidth = 2;
            ctx.strokeStyle = lightning.color;
            for (let i = 2; i < lightning.segments.length - 1; i += 2) {
                if (Math.random() > 0.3) {
                    const branchX = lightning.segments[i].x + (Math.random() - 0.5) * 150;
                    const branchY = lightning.segments[i].y + Math.random() * 80 + 40;
                    ctx.beginPath();
                    ctx.moveTo(lightning.segments[i].x, lightning.segments[i].y);
                    ctx.lineTo(branchX, branchY);
                    ctx.stroke();
                }
            }
            ctx.restore();
            return flashOpacity;
        };

        const drawDataFlow = () => {
            // bg clear handled by main draw
            particlesDark.forEach((p, i) => {
                if (isAnimating) {
                    p.x += p.vx;
                    p.y += p.vy;
                }
                if (p.x < 0 || p.x > width) p.vx *= -1;
                if (p.y < 0 || p.y > height) p.vy *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

                // Color fix
                const particleBase = theme === 'light' ? 'rgba(59, 130, 246,' : baseColorDark;
                ctx.fillStyle = theme === 'light' ? `${particleBase} 0.6)` : p.color;

                ctx.fill();

                if (i % 2 === 0) {
                    for (let j = i + 1; j < particlesDark.length; j++) {
                        const p2 = particlesDark[j];
                        const dx = p.x - p2.x;
                        const dy = p.y - p2.y;
                        if (Math.abs(dx) > connectionDistance || Math.abs(dy) > connectionDistance) continue;
                        const distSq = dx * dx + dy * dy;
                        const connectionDistSq = connectionDistance * connectionDistance;
                        if (distSq < connectionDistSq) {
                            ctx.beginPath();
                            const lineBase = theme === 'light' ? 'rgba(59, 130, 246,' : baseColorDark;
                            const dist = Math.sqrt(distSq); // Need sqrt for opacity calculation, or approximate
                            ctx.strokeStyle = `${lineBase} ${0.15 - (dist / connectionDistance) * 0.15})`;
                            ctx.lineWidth = 1;
                            ctx.moveTo(p.x, p.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    }
                }
            });
        };

        const drawRain = () => {
            const now = Date.now();

            if (isAnimating) {
                if (now >= nextLightningTime - 600 && now < nextLightningTime) {
                    if (stormDimLevel < 0.35) stormDimLevel += 0.02;
                } else if (now >= nextLightningTime) {
                    createLightning();
                    nextLightningTime = now + Math.random() * 8000 + 4000;
                } else {
                    if (stormDimLevel > 0) stormDimLevel -= 0.03;
                    if (stormDimLevel < 0) stormDimLevel = 0;
                }
            }

            // Clouds
            clouds.forEach((cloud) => {
                if (isAnimating) {
                    cloud.x += cloud.speed;
                    if (cloud.x > width) {
                        cloud.x = -500;
                        cloud.y = Math.random() * (height * 0.3) - 50;
                    }
                }
                const cachedCloud = cloudCache[cloud.typeIndex];
                if (cachedCloud) {
                    ctx.save();
                    ctx.globalAlpha = cloud.opacity * (theme === 'dark' ? 0.3 : 1); // Dim clouds in dark mode
                    ctx.filter = theme === 'dark' ? 'brightness(0.5)' : 'none';
                    ctx.drawImage(cachedCloud, cloud.x, cloud.y, cachedCloud.width * cloud.scale, cachedCloud.height * cloud.scale);
                    ctx.restore();
                }
            });

            // Rain
            ctx.strokeStyle = theme === 'light' ? 'rgba(71, 85, 105, 0.5)' : 'rgba(148, 163, 184, 0.3)'; // Lighter rain in dark mode
            ctx.lineWidth = 1.5;
            raindrops.forEach((drop) => {
                if (isAnimating) {
                    drop.y += drop.speed;
                    if (drop.y > height) {
                        drop.y = -drop.length;
                        drop.x = Math.random() * width;
                    }
                }
                ctx.globalAlpha = drop.opacity;
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x - 1, drop.y + drop.length);
                ctx.stroke();
            });
            ctx.globalAlpha = 1;

            // Dim Overlay
            if (stormDimLevel > 0.01) {
                ctx.fillStyle = `rgba(0, 0, 10, ${stormDimLevel})`;
                ctx.fillRect(0, 0, width, height);
            }

            // Lightning
            let maxFlash = 0;
            lightnings = lightnings.filter((l) => now - l.startTime < l.duration);
            lightnings.forEach((l) => {
                const flash = drawLightning(l) || 0;
                if (flash > maxFlash) maxFlash = flash;
            });

            if (maxFlash > 0.1) {
                ctx.fillStyle = `rgba(255, 255, 255, ${maxFlash * 0.3})`;
                ctx.fillRect(0, 0, width, height);
            }
        };

        const drawAnime = () => {
            const centerX = width / 2;
            const centerY = height / 2;

            // Speed Lines
            ctx.save();
            ctx.translate(centerX, centerY);
            speedLines.forEach(line => {
                if (isAnimating) {
                    line.distance -= line.speed;
                    if (line.distance < 50) {
                        line.distance = Math.random() * width + 200;
                        line.angle = Math.random() * Math.PI * 2;
                    }
                }

                const x1 = Math.cos(line.angle) * line.distance;
                const y1 = Math.sin(line.angle) * line.distance;
                const x2 = Math.cos(line.angle) * (line.distance + line.length);
                const y2 = Math.sin(line.angle) * (line.distance + line.length);

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                // Theme aware lines
                const lineColor = theme === 'light' ? '0,0,0' : '255,255,255';
                ctx.strokeStyle = `rgba(${lineColor}, ${line.opacity * 0.3})`;
                ctx.lineWidth = line.thickness;
                ctx.stroke();
            });
            ctx.restore();

            // Floating sketched words
            if (isAnimating && Math.random() < 0.02) {
                const text = ANIME_WORDS[Math.floor(Math.random() * ANIME_WORDS.length)];
                animeWords.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    text,
                    opacity: 1,
                    scale: 0.5,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 100,
                    maxLife: 100,
                    color: theme === 'light' ? '#000000' : '#ffffff'
                });
            }

            animeWords = animeWords.filter(w => w.life > 0);
            animeWords.forEach(word => {
                if (isAnimating) {
                    word.x += word.vx;
                    word.y += word.vy;
                    word.scale += 0.01;
                    word.life--;
                    word.opacity = word.life / word.maxLife;
                }

                ctx.save();
                ctx.font = `900 ${30 * word.scale}px "Comic Sans MS", "Chalkboard SE", sans-serif`;
                const colorRGB = theme === 'light' ? '0,0,0' : '255,255,255';
                const inverseRGB = theme === 'light' ? '255,255,255' : '0,0,0';

                ctx.fillStyle = `rgba(${colorRGB}, ${word.opacity})`;
                ctx.strokeStyle = `rgba(${inverseRGB}, ${word.opacity})`; // Stroke with inverse for contrast
                ctx.lineWidth = 2;
                ctx.fillText(word.text, word.x, word.y);
                ctx.strokeText(word.text, word.x, word.y);
                ctx.restore();
            });
        };

        const drawBlackhole = () => {
            const centerX = width / 2;
            const centerY = height / 2;
            const holeRadius = 50;

            // Draw Blackhole Center
            // Glow
            if (!isMobile) ctx.shadowBlur = 50;
            ctx.shadowColor = theme === 'light' ? '#8b5cf6' : '#6d28d9'; // Slightly different purple
            ctx.fillStyle = theme === 'light' ? '#1e1b4b' : '#000000'; // Deep indigo instead of black for light mode hole
            ctx.beginPath();
            ctx.arc(centerX, centerY, holeRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Accretion Disk (Particles spiraling in)
            blackholeParticles.forEach(p => {
                if (isAnimating) {
                    p.angle += p.speed;
                    p.radius -= 0.5; // fall in

                    if (p.radius < holeRadius) {
                        // Reset
                        p.radius = Math.max(width, height) * 0.8 + Math.random() * 200;
                        p.opacity = 0;
                    } else {
                        // Fade in as they get closer, fade out when super close?
                        p.opacity = Math.min(1, p.opacity + 0.01);
                    }
                }

                const x = centerX + Math.cos(p.angle) * p.radius;
                const y = centerY + Math.sin(p.angle) * p.radius;

                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, Math.PI * 2);

                // Colors based on theme
                const baseColorPrefix = theme === 'light' ? '0, 0, 0' : '255, 255, 255';
                const accentColorPrefix = '168, 85, 247'; // Purple stays purple

                if (p.color.includes('a855f7')) {
                    ctx.fillStyle = `rgba(${accentColorPrefix}, ${p.opacity})`;
                } else {
                    ctx.fillStyle = `rgba(${baseColorPrefix}, ${p.opacity})`;
                }

                ctx.fill();
            });

            // Floating fading texts
            if (isAnimating && Math.random() < 0.01) {
                const text = BLACKHOLE_WORDS[Math.floor(Math.random() * BLACKHOLE_WORDS.length)];
                blackholeWords.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    text,
                    opacity: 0,
                    scale: 0.8,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    life: 200, // phase 1: fade in, phase 2: hold, phase 3: fade out
                    maxLife: 200,
                    color: theme === 'light' ? '#000000' : '#ffffff'
                });
            }

            blackholeWords = blackholeWords.filter(w => w.life > 0);
            blackholeWords.forEach(word => {
                if (isAnimating) {
                    word.x += word.vx;
                    word.y += word.vy;
                    word.life--;

                    // Fade in/out logic
                    if (word.life > 150) {
                        word.opacity += 0.02;
                    } else if (word.life < 50) {
                        word.opacity -= 0.02;
                    }
                    word.opacity = Math.max(0, Math.min(1, word.opacity));
                }

                ctx.save();
                ctx.font = `300 ${16}px "Inter", sans-serif`;
                ctx.letterSpacing = '4px';
                const textColorRGB = theme === 'light' ? '0, 0, 0' : '255, 255, 255';
                ctx.fillStyle = `rgba(${textColorRGB}, ${word.opacity * 0.7})`;
                ctx.fillText(word.text, word.x, word.y);
                ctx.restore();
            });
        };

        const drawCircuit = () => {
            const pathColor = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.05)';
            const nodeColor = theme === 'light' ? '#000000' : '#ffffff';

            circuitPaths.forEach((path, idx) => {
                ctx.beginPath();
                ctx.strokeStyle = pathColor;
                ctx.lineWidth = 2;
                ctx.moveTo(path.nodes[0].x, path.nodes[0].y);
                for (let i = 1; i < path.nodes.length; i++) {
                    ctx.lineTo(path.nodes[i].x, path.nodes[i].y);
                }
                ctx.stroke();

                // Draw nodes at ends
                ctx.fillStyle = nodeColor;
                ctx.beginPath();
                ctx.arc(path.nodes[0].x, path.nodes[0].y, 3, 0, Math.PI * 2);
                ctx.arc(path.nodes[path.nodes.length - 1].x, path.nodes[path.nodes.length - 1].y, 3, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Signals
            circuitSignals.forEach(signal => {
                if (isAnimating) {
                    signal.progress += signal.speed;
                    if (signal.progress >= 1) signal.progress = 0;
                }

                const path = circuitPaths[signal.pathIndex];
                const totalSegments = path.nodes.length - 1;
                const currentSegment = Math.floor(signal.progress * totalSegments);
                const segmentProgress = (signal.progress * totalSegments) - currentSegment;

                if (currentSegment < totalSegments) {
                    const p1 = path.nodes[currentSegment];
                    const p2 = path.nodes[currentSegment + 1];
                    const x = p1.x + (p2.x - p1.x) * segmentProgress;
                    const y = p1.y + (p2.y - p1.y) * segmentProgress;

                    ctx.shadowColor = signal.color;
                    if (!isMobile) ctx.shadowBlur = 15;
                    ctx.fillStyle = signal.color;
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });
        };

        const drawNetscape = () => {
            const horizonY = height * 0.5;
            const gridColor = theme === 'light' ? 'rgba(0,0,0,0.2)' : 'rgba(255,0,255,0.3)';

            // Dynamic movement
            if (isAnimating) {
                netscapeOffset += 2;
                if (netscapeOffset > 100) netscapeOffset = 0;
            }

            // Vertical lines (perspective)
            const centerX = width * 0.5;
            ctx.strokeStyle = gridColor;
            ctx.lineWidth = 2;

            for (let i = -20; i <= 20; i++) {
                // x pos at bottom
                const xBottom = centerX + i * 150;
                // All converge to center at horizon
                ctx.beginPath();
                ctx.moveTo(xBottom, height);
                ctx.lineTo(centerX + i * 10, horizonY); // Vanishing point perspective
                ctx.stroke();
            }

            // Horizontal lines (moving)
            for (let i = 0; i < 20; i++) {
                const z = (i * 50 + netscapeOffset) % 1000;
                // map z to y (0 is horizon, 1000 is bottom)
                // simple projection: y = horizon + (constant / z) ?
                // Linear approach for retro feel:
                const y = horizonY + (z / 1000) * (height * 0.5);

                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Sun
            const sunColor = theme === 'light' ? '#f59e0b' : '#d946ef'; // Amber or Magenta
            const sunY = horizonY - 150;

            ctx.shadowColor = sunColor;
            if (!isMobile) ctx.shadowBlur = 60;
            const grad = ctx.createLinearGradient(centerX, sunY - 100, centerX, sunY + 100);
            grad.addColorStop(0, sunColor);
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(centerX, sunY, 120, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Fill bottom grid
            const bottomGrad = ctx.createLinearGradient(0, horizonY, 0, height);
            const gridBase = theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(20,0,30, 0.8)';
            bottomGrad.addColorStop(0, gridBase);
            bottomGrad.addColorStop(1, theme === 'light' ? '#ffffff' : '#000000');
            ctx.fillStyle = bottomGrad;
            ctx.fillRect(0, horizonY, width, height - horizonY);
        };

        // THIS IS DANGEROUS without seeing the file content exactly.
        // Let's use the END of drawNetscape as a target.

        // Re-reading previous file view (Step 385)... drawNetscape ends around line 800+ ? 
        // No, step 385 was truncated before drawNetscape finished.
        // I should read the file again to find a good insertion point.
        // Or I can insert before 'const draw = () => {' which is safe.

        // Let's Insert BEFORE Main Draw Loop.
        const drawJungle = () => {
            // Colors
            const leafColorsLight = ['#4ade80', '#22c55e', '#16a34a']; // Green-400/500/600
            const leafColorsDark = ['#064e3b', '#065f46', '#047857']; // Emerald-900/800/700
            const fireflyColor = '#facc15'; // Yellow

            // Draw "Vines" or "Trees" (Static background shapes)
            // Just simple procedural trees for depth
            const trunkColor = theme === 'light' ? '#78350f' : '#3f2c22'; // Brown

            // Draw some static trees first
            ctx.fillStyle = trunkColor;
            // Left Tree
            ctx.beginPath();
            ctx.moveTo(0, height);
            ctx.lineTo(100, height);
            ctx.lineTo(50, 0);
            ctx.lineTo(0, 0);
            ctx.fill();
            // Right tree (thinner)
            ctx.beginPath();
            ctx.moveTo(width, height);
            ctx.lineTo(width - 60, height);
            ctx.lineTo(width - 40, 0);
            ctx.lineTo(width, 0);
            ctx.fill();

            // Floating Leaves/Spores
            jungleLeaves.forEach(leaf => {
                if (isAnimating) {
                    leaf.y += leaf.speed;
                    leaf.x += Math.sin(leaf.y * 0.01 + leaf.swayOffset) * 0.5;
                    leaf.angle += 0.01;

                    if (leaf.y > height) {
                        leaf.y = -20;
                        leaf.x = Math.random() * width;
                    }
                }

                ctx.save();
                ctx.translate(leaf.x, leaf.y);
                ctx.rotate(leaf.angle);

                const colors = theme === 'light' ? leafColorsLight : leafColorsDark;
                ctx.fillStyle = colors[leaf.type];

                // Draw simple leaf shape
                ctx.beginPath();
                ctx.ellipse(0, 0, leaf.size, leaf.size / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Fireflies (Dark mode only usually, but visible as specks in light)
            if (theme === 'dark') {
                if (Math.random() > 0.95) {
                    // Flicker
                }
                jungleLeaves.forEach((_, i) => { // Reuse loop count for fireflies, but separate entities ideally. 
                    // Let's just draw random fireflies based on math to save memory
                    // Use a few dedicated indices
                    if (i < 20) {
                        const fx = (Math.sin(Date.now() * 0.001 + i) * width / 2) + width / 2;
                        const fy = (Math.cos(Date.now() * 0.002 + i) * height / 2) + height / 2;
                        ctx.shadowColor = fireflyColor;
                        if (!isMobile) ctx.shadowBlur = 10;
                        ctx.fillStyle = fireflyColor;
                        ctx.beginPath();
                        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                });
            }
        };

        const drawMountains = () => {
            // Sky gradient handled by CSS variable

            // Draw Mountains (Parallax)
            mountains.forEach((mtn, idx) => {
                const parallaxX = (Date.now() * mtn.speed * 0.05) % width;

                ctx.save();
                // Determine color based on depth
                // Light: Blueish/White. Dark: Dark Blue/Black
                let color;
                if (theme === 'light') {
                    color = idx === 0 ? '#cbd5e1' : (idx === 1 ? '#94a3b8' : '#64748b'); // Slate 300/400/500
                } else {
                    color = idx === 0 ? '#1e293b' : (idx === 1 ? '#0f172a' : '#020617'); // Slate 800/900/950
                }
                ctx.fillStyle = color;

                // Draw shape twice for loop
                [0, 1].forEach(offset => {
                    ctx.translate(offset * width - parallaxX, 0);
                    ctx.beginPath();
                    ctx.moveTo(mtn.points[0].x, mtn.points[0].y);
                    for (let p of mtn.points) ctx.lineTo(p.x, p.y);
                    ctx.fill();
                    ctx.translate(-(offset * width - parallaxX), 0); // Reset
                });
                ctx.restore();
            });

            // Snow
            ctx.fillStyle = 'white';
            snowParticles.forEach(p => {
                if (isAnimating) {
                    p.y += p.speedY;
                    p.x += p.speedX;
                    if (p.y > height) {
                        p.y = -5;
                        p.x = Math.random() * width;
                    }
                }
                ctx.globalAlpha = p.opacity;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // Human Silhouette (Tiny hiker)
            // Only draw if mountains are tall enough/visible
            const hikerX = width * 0.7;
            const hikerY = height - 50; // Approximated ground

            ctx.fillStyle = theme === 'light' ? '#000' : '#000';
            // Head
            ctx.beginPath(); ctx.arc(hikerX, hikerY - 20, 3, 0, Math.PI * 2); ctx.fill();
            // Body
            ctx.fillRect(hikerX - 2, hikerY - 20, 4, 12);
            // Legs
            ctx.beginPath(); ctx.moveTo(hikerX, hikerY - 8); ctx.lineTo(hikerX - 4, hikerY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(hikerX, hikerY - 8); ctx.lineTo(hikerX + 4, hikerY); ctx.stroke();
            // Walking Stick
            ctx.beginPath(); ctx.moveTo(hikerX + 4, hikerY - 12); ctx.lineTo(hikerX + 8, hikerY); ctx.strokeStyle = theme === 'light' ? '#555' : '#888'; ctx.stroke();
        };

        const drawZen = () => {
            // Colors
            const isDark = theme === 'dark';
            const petalColor1 = isDark ? '#e879f9' : '#fbcfe8';
            const petalColor2 = isDark ? '#22d3ee' : '#f472b6';

            // 1. Draw Cached Static Tree (Zero Cost)
            if (zenTreeCache) {
                ctx.drawImage(zenTreeCache, 0, 0);
            }

            // 2. Animate Dynamic Particles (Low Cost)
            // Batch shadow setting
            if (isDark) {
                if (!isMobile) ctx.shadowBlur = 10;
                ctx.shadowColor = petalColor1;
            }

            const time = Date.now() * 0.001;

            zenPetals.forEach(p => {
                if (isAnimating) {
                    if (p.falling) {
                        p.y += p.vy;
                        p.x += p.vx + Math.sin(time * 2 + p.rotation) * 0.5;
                        p.rotation += 0.02;
                        if (p.y > height) {
                            p.y = -10;
                            // Reset to top canopy
                            const theta = Math.random() * Math.PI; // Top semi-circle approximation
                            const r = Math.random();
                            p.x = width / 2 + (Math.random() - 0.5) * width * 0.6;
                        }
                    } else {
                        // Static leaves sway with tree
                        p.x += Math.sin(time) * 0.1;
                    }
                }

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation);

                ctx.fillStyle = p.falling ? (p.vx > 0 ? petalColor1 : petalColor2) : petalColor1;

                // Simpler shape: Ellipse-like using arc or simple curve
                ctx.beginPath();
                const s = p.size;
                ctx.ellipse(0, 0, s, s / 1.5, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            });
            ctx.shadowBlur = 0;
        };

        const drawForge = () => {
            const isDark = theme === 'dark';
            const sparkColor = isDark ? '#f59e0b' : '#c2410c'; // Amber vs Dark Orange

            // 1. Draw Gears
            forgeGears.forEach(gear => {
                if (isAnimating) gear.angle += gear.speed;

                ctx.save();
                ctx.translate(gear.x, gear.y);
                ctx.rotate(gear.angle);
                // Draw cached sprite centered
                const size = gear.radius * 2 + 20;
                ctx.drawImage(gear.cache, -size / 2, -size / 2);
                ctx.restore();

                // Chance to spawn spark from this gear
                if (isAnimating && Math.random() > 0.97) {
                    forgeSparks.push({
                        x: gear.x + (Math.random() - 0.5) * gear.radius,
                        y: gear.y + (Math.random() - 0.5) * gear.radius,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        life: 1.0,
                        maxLife: 1.0,
                        color: sparkColor
                    });
                }
            });

            // 2. Draw Sparks
            // optimization: remove 'lighter' composite mode for performance
            // ctx.globalCompositeOperation = 'lighter'; 
            for (let i = forgeSparks.length - 1; i >= 0; i--) {
                const s = forgeSparks[i];
                if (isAnimating) {
                    s.x += s.vx;
                    s.y += s.vy;
                    s.vy += 0.2; // Gravity
                    s.life -= 0.02;
                }

                if (s.life <= 0) {
                    forgeSparks.splice(i, 1);
                    continue;
                }

                ctx.globalAlpha = s.life;
                ctx.fillStyle = s.color;
                ctx.beginPath();
                ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;

            // 3. Draw Steam (Rising smoke)
            if (isAnimating && Math.random() > 0.97) {
                forgeSteam.push({
                    x: Math.random() * width,
                    y: height + 20,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: -Math.random() * 1 - 0.5,
                    size: Math.random() * 30 + 20,
                    opacity: 0.4
                });
            }

            const steamColor = isDark ? '255, 255, 255' : '100, 116, 139'; // White vs Slate

            for (let i = forgeSteam.length - 1; i >= 0; i--) {
                const s = forgeSteam[i];
                if (isAnimating) {
                    s.y += s.vy;
                    s.x += s.vx;
                    s.size += 0.1;
                    s.opacity -= 0.002;
                }

                if (s.opacity <= 0) {
                    forgeSteam.splice(i, 1);
                    continue;
                }

                ctx.fillStyle = `rgba(${steamColor}, ${s.opacity})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            if (activeMode === 'rain') {
                drawRain(); // Rain logic
            } else if (activeMode === 'dataflow') {
                drawDataFlow(); // Particles logic
            } else if (activeMode === 'anime') {
                drawAnime();
            } else if (activeMode === 'blackhole') {
                drawBlackhole();
            } else if (activeMode === 'circuit') {
                drawCircuit();
            } else if (activeMode === 'netscape') {
                drawNetscape();
            } else if (activeMode === 'jungle') {
                drawJungle();
            } else if (activeMode === 'mountains') {
                drawMountains();
            } else if (activeMode === 'zen') {
                drawZen();
            } else if (activeMode === 'forge') {
                drawForge();
            }

            animationFrameId = requestAnimationFrame(draw);
        };


        const handleResize = () => {
            if (!isAnimating) return;
            init();
            draw();
        };

        let resizeTimeout: NodeJS.Timeout;
        const throttledResize = () => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 100);
        };

        init();
        window.addEventListener('resize', throttledResize);
        draw();

        return () => {
            window.removeEventListener('resize', throttledResize);
            cancelAnimationFrame(animationFrameId);
            if (resizeTimeout) clearTimeout(resizeTimeout);
        };
    }, [theme, isAnimating, activeMode]);

    // --- Dynamic Background CSS ---
    // Moved to CSS variables in globals.css for instant theme switching

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                pointerEvents: 'none',
                background: `var(--bg-anim-${activeMode})`,
                transition: 'background 0.5s ease-in-out'
            }}
        />
    );
}

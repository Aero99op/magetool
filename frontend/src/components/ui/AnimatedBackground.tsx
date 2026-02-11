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
    const [activeMode, setActiveMode] = useState<'rain' | 'dataflow' | 'anime' | 'blackhole' | 'circuit' | 'netscape' | 'jungle' | 'mountains' | 'zen' | 'forge' | 'seaside' | 'galactic' | 'planes' | 'kites' | 'ink' | 'spiderweb' | 'vande-bharat'>('dataflow');
    const mousePos = useRef({ x: 0, y: 0 });

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

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            observer.disconnect();
            window.removeEventListener('mousemove', handleMouseMove);
        };
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

        // Seaside Types
        interface SeasideWave {
            x: number;
            y: number;
            width: number;
            height: number;
            speed: number;
            amplitude: number;
            phase: number;
            color: string;
            layer: number; // 0=far, 1=mid, 2=close
        }

        interface SeasideBird {
            x: number;
            y: number;
            vx: number;
            vy: number;
            size: number;
            wingPhase: number;
            flapSpeed: number;
            type: 'gull' | 'generic';
        }

        interface SeasideStar {
            x: number;
            y: number;
            size: number;
            brightness: number;
            twinkleSpeed: number;
            phase: number;
        }

        let seasideWaves: SeasideWave[] = [];
        let seasideBirds: SeasideBird[] = [];
        let seasideStars: SeasideStar[] = [];
        let seasideTravelerImg: HTMLImageElement | null = null;
        let seasideBgDayImg: HTMLImageElement | null = null;
        let seasideBgNightImg: HTMLImageElement | null = null;

        // Galactic Types
        interface GalacticStar {
            x: number;
            y: number;
            size: number;
            brightness: number;
            twinkleSpeed: number;
            phase: number;
            layer: 0 | 1; // 0=far, 1=near
        }

        interface GalacticNebula {
            x: number;
            y: number;
            size: number;
            color: string;
            opacity: number;
            driftX: number;
            driftY: number;
        }

        interface ShootingStar {
            x: number;
            y: number;
            vx: number;
            vy: number;
            length: number;
            opacity: number;
            active: boolean;
        }

        let galacticStars: GalacticStar[] = [];
        let galacticNebulae: GalacticNebula[] = [];
        let shootingStars: ShootingStar[] = [];

        // Paper Planes Types
        interface PaperPlane {
            x: number;
            y: number;
            z: number; // Scale/Speed factor
            vx: number;
            vy: number;
            angle: number;
            turnSpeed: number;
            color: string;
            trail: { x: number, y: number }[];
        }
        let planes: PaperPlane[] = [];

        // Kites Types
        interface Kite {
            x: number;
            y: number;
            vx: number;
            vy: number;
            angle: number;
            swaySpeed: number;
            swayOffset: number;
            color: string;
            stringLength: number;
            cut: boolean; // if true, falls rapidly
        }
        let kites: Kite[] = [];

        // Ink Drop Types
        interface InkDrop {
            x: number;
            y: number;
            r: number;
            color: string;
            opacity: number;
            growthRate: number;
        }
        let inkDrops: InkDrop[] = [];

        // Spiderweb Types
        interface WebNode {
            x: number;
            y: number;
            vx: number;
            vy: number;
            baseX: number;
            baseY: number;
        }
        let webNodes: WebNode[] = [];

        // Vande Bharat Types
        interface TrainCar {
            x: number;
            type: 'engine' | 'coach';
            windows: { x: number, width: number, lit: boolean }[];
        }
        interface CityBuilding {
            x: number;
            width: number;
            height: number;
            layer: 0 | 1 | 2; // 0=far, 2=close
            type: 'modern' | 'commercial' | 'apartment' | 'tower';
            windows: { x: number, y: number, w: number, h: number }[];
            details?: { x: number, y: number, w: number, h: number, color: string }[];
        }
        interface PowerLine {
            x: number; // Pole position
            bird?: { y: number, flyAway: boolean, vx: number, vy: number };
        }

        let vbTrain: TrainCar[] = [];
        let vbBuildings: CityBuilding[] = [];
        let vbPowerLines: PowerLine[] = [];
        let vbTime = 0; // 0 to 1 for day/night cycle
        let vbTrackOffset = 0;



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

        const initSeaside = () => {
            // Load Images if not loaded
            if (!seasideTravelerImg) {
                seasideTravelerImg = new Image();
                seasideTravelerImg.src = '/assets/seaside/traveler.png'; // Placeholder path
            }
            if (!seasideBgDayImg) {
                seasideBgDayImg = new Image();
                seasideBgDayImg.src = '/assets/seaside/bg_day.png';
            }
            if (!seasideBgNightImg) {
                seasideBgNightImg = new Image();
                seasideBgNightImg.src = '/assets/seaside/bg_night.png';
            }

            // Init Waves
            seasideWaves = [];
            const waveCount = 5;
            for (let i = 0; i < waveCount; i++) {
                seasideWaves.push({
                    x: 0,
                    y: height * (0.6 + i * 0.08), // Start at 60% height
                    width: width,
                    height: height * 0.2,
                    speed: 0.02 + i * 0.01,
                    amplitude: 10 + i * 5,
                    phase: Math.random() * Math.PI * 2,
                    color: '', // Set in draw
                    layer: i
                });
            }

            // Init Birds (Day) or Stars (Night)
            seasideBirds = [];
            if (theme === 'light') {
                for (let i = 0; i < 8; i++) {
                    seasideBirds.push({
                        x: Math.random() * width,
                        y: Math.random() * (height * 0.4),
                        vx: (Math.random() * 1 + 0.5) * (Math.random() > 0.5 ? 1 : -1),
                        vy: (Math.random() - 0.5) * 0.2,
                        size: Math.random() * 5 + 5,
                        wingPhase: Math.random() * Math.PI * 2,
                        flapSpeed: 0.1 + Math.random() * 0.1,
                        type: 'gull'
                    });
                }
            }

            seasideStars = [];
            if (theme === 'dark') {
                for (let i = 0; i < 100; i++) {
                    seasideStars.push({
                        x: Math.random() * width,
                        y: Math.random() * (height * 0.6), // Top 60%
                        size: Math.random() * 2 + 0.5,
                        brightness: Math.random(),
                        twinkleSpeed: 0.01 + Math.random() * 0.02,
                        phase: Math.random() * Math.PI * 2
                    });
                }
            }
        };

        const initGalactic = () => {
            galacticStars = [];
            const starCount = isMobile ? 100 : 300;
            for (let i = 0; i < starCount; i++) {
                galacticStars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 1.5 + 0.5,
                    brightness: Math.random(),
                    twinkleSpeed: Math.random() * 0.03 + 0.01,
                    phase: Math.random() * Math.PI * 2,
                    layer: Math.random() > 0.8 ? 1 : 0
                });
            }

            galacticNebulae = [];
            const nebulaCount = 4;
            const colors = ['#4c1d95', '#be185d', '#1e3a8a', '#0f766e']; // Deep Purple, Pink, Blue, Teal
            for (let i = 0; i < nebulaCount; i++) {
                galacticNebulae.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.max(width, height) * (0.4 + Math.random() * 0.4),
                    color: colors[i % colors.length],
                    opacity: 0.1 + Math.random() * 0.1,
                    driftX: (Math.random() - 0.5) * 0.05,
                    driftY: (Math.random() - 0.5) * 0.05
                });
            }

            shootingStars = [];
        };

        const initPlanes = () => {
            planes = [];
            const planeCount = isMobile ? 15 : 30;
            for (let i = 0; i < planeCount; i++) {
                const z = Math.random() * 0.5 + 0.5; // 0.5 to 1.0
                planes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    z,
                    vx: (Math.random() * 2 + 1) * z,
                    vy: (Math.random() * 1 - 0.5) * z,
                    angle: 0,
                    turnSpeed: (Math.random() - 0.5) * 0.02,
                    color: i % 3 === 0 ? '#e2e8f0' : '#f8fafc', // Slate 200/50
                    trail: []
                });
            }
        };

        const initKites = () => {
            kites = [];
            const kiteCount = isMobile ? 12 : 25;
            const colors = ['#ef4444', '#f59e0b', '#84cc16', '#06b6d4', '#8b5cf6', '#ec4899']; // Red, Amber, Lime, Cyan, Violet, Pink

            for (let i = 0; i < kiteCount; i++) {
                kites.push({
                    x: Math.random() * width,
                    y: Math.random() * height * 0.6, // Top 60%
                    vx: 0,
                    vy: 0,
                    angle: -Math.PI / 4, // Tilted
                    swaySpeed: Math.random() * 0.02 + 0.01,
                    swayOffset: Math.random() * Math.PI * 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    stringLength: Math.random() * 100 + 50,
                    cut: false
                });
            }
        };

        const initInk = () => {
            inkDrops = [];
            // Start with one
            spawnInkDrop();
        };

        const initSpiderweb = () => {
            webNodes = [];
            const cols = Math.ceil(width / 80);
            const rows = Math.ceil(height / 80);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const x = c * 80 + (Math.random() - 0.5) * 40;
                    const y = r * 80 + (Math.random() - 0.5) * 40;
                    webNodes.push({
                        x, y,
                        vx: 0, vy: 0,
                        baseX: x, baseY: y
                    });
                }
            }
        };

        const initVandeBharat = () => {
            vbTrain = [];
            // Engine + 3 Coaches
            // Engine at front (Right side)
            const startX = width * 0.6;
            vbTrain.push({ x: startX, type: 'engine', windows: [{ x: 20, width: 40, lit: true }] });

            // Coaches trailing behind (Left side)
            for (let i = 1; i <= 3; i++) {
                vbTrain.push({
                    x: startX - i * 155, type: 'coach', windows: [
                        { x: 10, width: 30, lit: true }, { x: 50, width: 30, lit: true }, { x: 90, width: 30, lit: true }
                    ]
                });
            }

            vbBuildings = [];
            // Optimization: Reduce layers on mobile
            const layerCount = isMobile ? 2 : 3;

            for (let l = 0; l < layerCount; l++) {
                let cx = 0;
                while (cx < width * 2) {
                    const w = 60 + Math.random() * 120;
                    const h = 100 + Math.random() * 250 + l * 80;

                    const types: CityBuilding['type'][] = ['modern', 'commercial', 'apartment', 'tower'];
                    const type = types[Math.floor(Math.random() * types.length)];

                    // Init windows based on type
                    const wins: { x: number, y: number, w: number, h: number }[] = [];
                    const details: { x: number, y: number, w: number, h: number, color: string }[] = [];

                    if (type === 'modern') {
                        // strips of glass
                        for (let wy = 10; wy < h; wy += 30) {
                            wins.push({ x: 5, y: wy, w: w - 10, h: 20 });
                        }
                    } else if (type === 'commercial') {
                        // Grid
                        for (let wy = 10; wy < h - 10; wy += 25) {
                            for (let wx = 10; wx < w - 10; wx += 25) {
                                if (Math.random() > 0.2) wins.push({ x: wx, y: wy, w: 15, h: 15 });
                            }
                        }
                    } else if (type === 'apartment') {
                        // Balconies + Windows
                        for (let wy = 20; wy < h - 20; wy += 40) {
                            for (let wx = 10; wx < w - 20; wx += 30) {
                                wins.push({ x: wx + 5, y: wy, w: 10, h: 15 }); // door/window
                                details.push({ x: wx, y: wy + 15, w: 20, h: 5, color: '#333' }); // balcony
                            }
                        }
                    } else {
                        // Tower - vertical lines
                        for (let wx = 10; wx < w - 10; wx += 15) {
                            wins.push({ x: wx, y: 10, w: 5, h: h - 20 });
                        }
                    }

                    vbBuildings.push({
                        x: cx,
                        width: w,
                        height: h,
                        layer: l as 0 | 1 | 2,
                        type: type,
                        windows: wins,
                        details: details
                    });
                    cx += w + (Math.random() * 30 - 5);
                }
            }

            // Maglev - No overhead wires
            vbPowerLines = [];
            vbTime = 0; // Start at Day
        };

        const spawnInkDrop = () => {
            const colors = ['#ec4899', '#8b5cf6', '#3b82f6', '#14b8a6', '#f59e0b']; // Pink, Violet, Blue, Teal, Amber
            inkDrops.push({
                x: Math.random() * width,
                y: Math.random() * height,
                r: 0,
                color: colors[Math.floor(Math.random() * colors.length)],
                opacity: 0.8 + Math.random() * 0.2,
                growthRate: Math.random() * 2 + 1
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
                case 'seaside': initSeaside(); break;
                case 'galactic': initGalactic(); break;
                case 'planes': initPlanes(); break;
                case 'kites': initKites(); break;
                case 'ink': initInk(); break;
                case 'spiderweb': initSpiderweb(); break;
                case 'vande-bharat': initVandeBharat(); break;
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


        const drawSeaside = () => {
            const isDark = theme === 'dark';

            // 1. Draw Background
            const bgImg = isDark ? seasideBgNightImg : seasideBgDayImg;
            if (bgImg && bgImg.complete) {
                // Cover behavior
                const ratio = Math.max(width / bgImg.width, height / bgImg.height);
                const w = bgImg.width * ratio;
                const h = bgImg.height * ratio;
                const x = (width - w) / 2;
                const y = (height - h) / 2;
                ctx.drawImage(bgImg, x, y, w, h);
            } else {
                // Fallback gradient if image not loaded
                const grad = ctx.createLinearGradient(0, 0, 0, height);
                if (isDark) {
                    grad.addColorStop(0, '#0f172a'); // sky
                    grad.addColorStop(0.6, '#1e293b'); // horizon
                    grad.addColorStop(1, '#0f172a'); // sea
                } else {
                    grad.addColorStop(0, '#38bdf8'); // sky
                    grad.addColorStop(0.6, '#bae6fd'); // horizon
                    grad.addColorStop(1, '#0ea5e9'); // sea
                }
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, width, height);
            }

            // 2. Stars (Night)
            if (isDark) {
                ctx.fillStyle = 'white';
                seasideStars.forEach(star => {
                    if (isAnimating) {
                        star.phase += star.twinkleSpeed;
                        star.brightness = 0.5 + Math.sin(star.phase) * 0.5;
                    }
                    ctx.globalAlpha = star.brightness;
                    ctx.beginPath();
                    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                    ctx.fill();
                });
                ctx.globalAlpha = 1;
            }

            // 3. Waves (Procedural sine waves for "Lively" feel over static bg)
            const waveColor = isDark ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.3)';

            seasideWaves.forEach(wave => {
                if (isAnimating) {
                    wave.phase += wave.speed;
                }

                ctx.fillStyle = waveColor;
                ctx.beginPath();
                ctx.moveTo(0, height);

                for (let x = 0; x <= width; x += 10) {
                    const y = wave.y + Math.sin(x * 0.01 + wave.phase) * wave.amplitude;
                    ctx.lineTo(x, y);
                }
                ctx.lineTo(width, height);
                ctx.lineTo(0, height);
                ctx.fill();
            });

            // 4. Traveler
            if (seasideTravelerImg && seasideTravelerImg.complete && seasideTravelerImg.naturalWidth > 0) {
                // Calculate position: Center bottom, quite large
                // Let's make him stand "near seaside"
                const scale = Math.min(width, height) * 0.0008; // responsive scale
                const tW = seasideTravelerImg.width * scale;
                const tH = seasideTravelerImg.height * scale;
                const tX = width / 2 - tW / 2;
                const tY = height - tH * 0.95; // Slightly cut off bottom for depth or full footing

                // Breathing animation
                const breathY = isAnimating ? Math.sin(Date.now() * 0.002) * 5 : 0;

                ctx.save();
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 10;
                ctx.drawImage(seasideTravelerImg, tX, tY + breathY, tW, tH);
                ctx.restore();
            }

            // 5. Birds (Day)
            if (!isDark) {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                seasideBirds.forEach(bird => {
                    if (isAnimating) {
                        bird.x += bird.vx;
                        bird.y += bird.vy;
                        bird.wingPhase += bird.flapSpeed;

                        if (bird.x > width + 20) bird.x = -20;
                        if (bird.x < -20) bird.x = width + 20;
                    }

                    const wingY = Math.sin(bird.wingPhase) * 5;
                    ctx.beginPath();
                    ctx.moveTo(bird.x - bird.size, bird.y + wingY);
                    ctx.quadraticCurveTo(bird.x, bird.y - 5, bird.x + bird.size, bird.y + wingY);
                    ctx.stroke();
                });
            }
        };

        const drawGalactic = () => {
            // Deep Space Background
            const bgGrad = ctx.createRadialGradient(width / 2, height / 2, width * 0.2, width / 2, height / 2, width * 1.5);
            bgGrad.addColorStop(0, '#1e1b4b'); // Indigo 950
            bgGrad.addColorStop(0.5, '#0f172a'); // Slate 900
            bgGrad.addColorStop(1, '#020617'); // Slate 950
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            // Nebulae
            galacticNebulae.forEach(neb => {
                if (isAnimating) {
                    neb.x += neb.driftX;
                    neb.y += neb.driftY;
                    if (neb.x > width + neb.size) neb.x = -neb.size;
                    if (neb.x < -neb.size) neb.x = width + neb.size;
                    if (neb.y > height + neb.size) neb.y = -neb.size;
                    if (neb.y < -neb.size) neb.y = height + neb.size;
                }
                ctx.save();
                ctx.globalAlpha = neb.opacity;
                ctx.fillStyle = neb.color;
                ctx.filter = 'blur(60px)';
                ctx.beginPath();
                ctx.arc(neb.x, neb.y, neb.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Stars
            ctx.fillStyle = 'white';
            galacticStars.forEach(star => {
                if (isAnimating) {
                    star.phase += star.twinkleSpeed;
                    star.brightness = 0.5 + Math.sin(star.phase) * 0.5;
                }
                ctx.globalAlpha = star.layer === 1 ? star.brightness : star.brightness * 0.5;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            // Shooting Stars
            if (isAnimating && Math.random() > 0.98 && shootingStars.length < 3) {
                shootingStars.push({
                    x: Math.random() * width,
                    y: Math.random() * height * 0.5,
                    vx: (Math.random() - 0.5) * 10 + 5, // Fast
                    vy: Math.random() * 5 + 2,
                    length: Math.random() * 50 + 30,
                    opacity: 1,
                    active: true
                });
            }

            for (let i = shootingStars.length - 1; i >= 0; i--) {
                const s = shootingStars[i];
                if (isAnimating) {
                    s.x += s.vx;
                    s.y += s.vy;
                    s.opacity -= 0.02;
                }
                if (s.opacity <= 0 || s.x < 0 || s.x > width || s.y > height) {
                    shootingStars.splice(i, 1);
                    continue;
                }

                ctx.save();
                ctx.strokeStyle = `rgba(255, 255, 255, ${s.opacity})`;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(s.x, s.y);
                ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2); // Tail
                ctx.stroke();

                // Head glow
                ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
                ctx.shadowBlur = 10;
                ctx.shadowColor = 'white';
                ctx.beginPath();
                ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        };

        const drawPlanes = () => {
            // Sky Background
            const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
            if (theme === 'light') {
                bgGrad.addColorStop(0, '#e0f2fe'); // Sky 100
                bgGrad.addColorStop(1, '#bae6fd'); // Sky 200
            } else {
                bgGrad.addColorStop(0, '#0f172a'); // Slate 900
                bgGrad.addColorStop(1, '#1e293b'); // Slate 800
            }
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            planes.forEach(plane => {
                if (isAnimating) {
                    // Flight Logic
                    plane.angle += plane.turnSpeed;
                    if (Math.random() < 0.05) plane.turnSpeed = (Math.random() - 0.5) * 0.02; // Change turn

                    plane.vx = Math.cos(plane.angle) * 3 * plane.z;
                    plane.vy = Math.sin(plane.angle) * 3 * plane.z;

                    plane.x += plane.vx;
                    plane.y += plane.vy;

                    // Screen Wrap
                    if (plane.x > width + 50) plane.x = -50;
                    if (plane.x < -50) plane.x = width + 50;
                    if (plane.y > height + 50) plane.y = -50;
                    if (plane.y < -50) plane.y = height + 50;

                    // Trail
                    plane.trail.push({ x: plane.x, y: plane.y });
                    if (plane.trail.length > 20) plane.trail.shift();
                }

                // Draw Plane
                ctx.save();
                ctx.translate(plane.x, plane.y);
                ctx.rotate(plane.angle);
                ctx.scale(plane.z, plane.z);

                // Body
                ctx.fillStyle = plane.color;
                ctx.beginPath();
                ctx.moveTo(15, 0);   // Nose
                ctx.lineTo(-10, 10); // Left Wing
                ctx.lineTo(-5, 0);   // Center Back
                ctx.lineTo(-10, -10); // Right Wing
                ctx.closePath();
                ctx.fill();

                // Crease
                ctx.strokeStyle = theme === 'light' ? '#cbd5e1' : '#475569';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(15, 0);
                ctx.lineTo(-5, 0);
                ctx.stroke();

                ctx.restore();

                // Draw Trail
                if (plane.trail.length > 2) {
                    ctx.beginPath();
                    ctx.strokeStyle = theme === 'light' ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.1)';
                    ctx.lineWidth = 2 * plane.z;
                    ctx.moveTo(plane.trail[0].x, plane.trail[0].y);
                    for (let i = 1; i < plane.trail.length; i++) {
                        ctx.lineTo(plane.trail[i].x, plane.trail[i].y);
                    }
                    ctx.stroke();
                }
            });
        };

        const drawKites = () => {
            // Sunny/Blue Sky
            const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
            if (theme === 'light') {
                bgGrad.addColorStop(0, '#e0f2fe'); // Clean blue
                bgGrad.addColorStop(1, '#bae6fd');
            } else {
                // Twilight for kites? Or just dark blue
                bgGrad.addColorStop(0, '#1e1b4b');
                bgGrad.addColorStop(1, '#312e81');
            }
            // Use simple fill for now or reuse rect
            ctx.fillStyle = theme === 'light' ? '#e0f2fe' : '#1e1b4b'; // Fallback
            ctx.fillRect(0, 0, width, height);

            kites.forEach(kite => {
                if (isAnimating) {
                    if (kite.cut) {
                        // Falling logic
                        kite.y += 3;
                        kite.x += Math.sin(kite.y * 0.1) * 2;
                        kite.angle += 0.2;
                        if (kite.y > height) {
                            // Reset
                            kite.y = height + 100; // Stay off screen or respawn?
                            // Respawn
                            kite.cut = false;
                            kite.y = Math.random() * height * 0.6;
                            kite.x = Math.random() * width;
                            kite.angle = -Math.PI / 4;
                        }
                    } else {
                        // Swaying logic
                        kite.x += Math.sin(Date.now() * 0.001 + kite.swayOffset) * 0.5;
                        kite.y += Math.cos(Date.now() * 0.001 + kite.swayOffset) * 0.3;
                        kite.angle = -Math.PI / 4 + Math.sin(Date.now() * 0.002 + kite.swayOffset) * 0.1;

                        // Randomly cut
                        if (Math.random() > 0.9995) kite.cut = true;
                    }
                }

                ctx.save();
                ctx.translate(kite.x, kite.y);
                ctx.rotate(kite.angle);

                // Draw Rhombus
                ctx.fillStyle = kite.color;
                ctx.beginPath();
                ctx.moveTo(0, -20);
                ctx.lineTo(15, 0);
                ctx.lineTo(0, 20);
                ctx.lineTo(-15, 0);
                ctx.closePath();
                ctx.fill();

                // Cross spars
                ctx.strokeStyle = 'rgba(0,0,0,0.2)';
                ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(0, 20); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(15, 0); ctx.stroke();

                // Tail
                ctx.strokeStyle = kite.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, 20);
                // Wavy tail
                const tailTime = Date.now() * 0.01;
                for (let i = 0; i < 4; i++) {
                    ctx.quadraticCurveTo(
                        Math.sin(tailTime + i) * 10,
                        20 + i * 10 + 5,
                        0,
                        20 + (i + 1) * 10
                    );
                }
                ctx.stroke();

                ctx.restore();

                // String (if not cut)
                if (!kite.cut) {
                    ctx.strokeStyle = theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(kite.x, kite.y);
                    // Curve down to "ground" or just off screen
                    // Simple line for now
                    ctx.lineTo(kite.x - 20, kite.y + kite.stringLength);
                    ctx.stroke();
                }
            });
        };

        const drawInk = () => {
            // Paper-like background
            ctx.fillStyle = theme === 'light' ? '#f8fafc' : '#0f172a';
            ctx.fillRect(0, 0, width, height);

            if (isAnimating && Math.random() > 0.95 && inkDrops.length < 15) {
                spawnInkDrop();
            }

            // Blur filter for ink effect
            // NOTE: Filter is expensive, use sparingly or low values if slow
            ctx.filter = 'blur(8px)';

            for (let i = inkDrops.length - 1; i >= 0; i--) {
                const drop = inkDrops[i];
                if (isAnimating) {
                    drop.r += drop.growthRate;
                    drop.opacity -= 0.002;
                    drop.growthRate *= 0.99; // slows down expansion
                }

                if (drop.opacity <= 0) {
                    inkDrops.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(drop.x, drop.y, drop.r, 0, Math.PI * 2);
                ctx.fillStyle = drop.color;
                ctx.globalAlpha = drop.opacity;
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            ctx.filter = 'none';
        };

        const drawSpiderweb = () => {
            // Dark elegant background
            ctx.fillStyle = theme === 'light' ? '#f1f5f9' : '#020617';
            ctx.fillRect(0, 0, width, height);

            const connectionDist = 120;
            const mouseDist = 200;

            webNodes.forEach(node => {
                // Return to base logic
                if (isAnimating) {
                    const dx = node.x - node.baseX;
                    const dy = node.y - node.baseY;
                    node.vx -= dx * 0.05; // spring
                    node.vy -= dy * 0.05;
                    node.vx *= 0.8; // friction
                    node.vy *= 0.8;

                    // Mouse Interaction
                    const mdx = mousePos.current.x - node.x;
                    const mdy = mousePos.current.y - node.y;
                    const dist = Math.sqrt(mdx * mdx + mdy * mdy);
                    if (dist < mouseDist) {
                        const force = (mouseDist - dist) / mouseDist;
                        node.vx -= mdx * force * 0.05; // Repel or Attract? Let's Push away for web feel
                        node.vy -= mdy * force * 0.05;
                    }

                    node.x += node.vx;
                    node.y += node.vy;
                }

                // Draw Connections
                webNodes.forEach(other => {
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < connectionDist * connectionDist) {
                        const alpha = 1 - Math.sqrt(distSq) / connectionDist;
                        ctx.beginPath();
                        ctx.strokeStyle = theme === 'light' ? `rgba(71,85,105,${alpha})` : `rgba(203,213,225,${alpha * 0.5})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                    }
                });

                // Node
                ctx.beginPath();
                ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = theme === 'light' ? '#64748b' : '#94a3b8';
                ctx.fill();
            });

            // Draw connection to mouse
            webNodes.forEach(node => {
                const dx = node.x - mousePos.current.x;
                const dy = node.y - mousePos.current.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouseDist) {
                    const alpha = 1 - dist / mouseDist;
                    ctx.beginPath();
                    ctx.strokeStyle = theme === 'light' ? `rgba(59,130,246,${alpha})` : `rgba(139,92,246,${alpha})`; // Blue/Purple accent
                    ctx.lineWidth = 1.5;
                    ctx.moveTo(node.x, node.y);
                    ctx.lineTo(mousePos.current.x, mousePos.current.y);
                    ctx.stroke();
                }
            });
        };

        const drawVandeBharat = () => {
            // --- TIME CYCLE & OPTIMIZATION ---
            if (isAnimating) {
                if (theme === 'light') {
                    // Day (0.1) -> Dusk (0.45) -> Reset
                    if (vbTime < 0.9 && vbTime > 0.45) vbTime = 0.9;
                    vbTime += 0.0002; // Slower day cycle
                    if (vbTime > 0.45) vbTime = 0.9;
                } else {
                    // Dusk (0.45) -> Night (0.8) -> Sunrise
                    if (vbTime < 0.45 || vbTime > 0.95) vbTime = 0.45;
                    vbTime += 0.0002;
                    if (vbTime > 0.95) vbTime = 0.45;
                }
            }

            // --- SKY GRADIENT (Atmospheric Scattering) ---
            const getColor = (t: number) => {
                if (t < 0.3) return { t: '#0ea5e9', m: '#bae6fd', b: '#f0f9ff' }; // Clear Day
                if (t < 0.5) return { t: '#1e3a8a', m: '#a21caf', b: '#f97316' }; // Deep Sunset
                if (t < 0.8) return { t: '#020617', m: '#172554', b: '#1e1b4b' }; // Deep Night
                return { t: '#0f172a', m: '#581c87', b: '#f472b6' }; // Sunrise
            };
            const colors = getColor(vbTime);
            // Optimization: Detect if gradient needs update (skip every other frame on mobile?)
            // For "Super Polish", we render every frame but maybe reduce resolution impact by caching?
            // Canvas gradients are usually fast enough.
            const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
            bgGrad.addColorStop(0, colors.t);
            bgGrad.addColorStop(0.5, colors.m);
            bgGrad.addColorStop(1, colors.b);
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            // --- CELESTIAL BODY (Sun/Moon Glow) ---
            const sunY = height * 0.2 + Math.sin(vbTime * Math.PI * 2) * (height * 0.15);
            const sunX = width * 0.2 + (vbTime - 0.1) * width * 1.5; // Move across

            ctx.save();
            ctx.shadowBlur = theme === 'dark' ? 50 : 100;
            ctx.shadowColor = theme === 'dark' ? '#fefce8' : '#fcd34d';
            ctx.fillStyle = theme === 'dark' ? '#fef08a' : '#fef3c7';
            ctx.beginPath();
            ctx.arc(sunX, sunY, theme === 'dark' ? 30 : 60, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // --- STARS (Night only) ---
            if (theme === 'dark' || vbTime > 0.6) {
                ctx.fillStyle = '#ffffff';
                // Static stars (could optimize by pre-rendering)
                for (let i = 0; i < 50; i++) {
                    if ((i * 1337) % 100 > 90) continue; // Sparse
                    const sx = (i * 123456) % width;
                    const sy = (i * 789012) % (height * 0.6);
                    const twinkle = Math.random() > 0.95 ? 1.5 : 0.8;
                    ctx.globalAlpha = Math.random() * 0.8;
                    ctx.fillRect(sx, sy, twinkle, twinkle);
                }
                ctx.globalAlpha = 1;
            }

            // --- PARALLAX BUILDINGS (High Fidelity) ---
            // Render back to front
            vbBuildings.forEach(b => {
                if (isAnimating) {
                    const speed = (b.layer + 1) * 0.5; // Parallax
                    b.x -= speed;
                    if (b.x + b.width < -100) {
                        b.x = width + Math.random() * 100;
                        // Randomize new building props could happen here
                    }
                }

                // Lighting based on layer
                const distFactor = (3 - b.layer) / 3; // 1 = close, 0.33 = far
                const ambience = vbTime > 0.4 && vbTime < 0.9 ? 0.2 : 1.0;

                // Base Colors
                const hue = 220; // Slate/Blueish
                const sat = 20 * distFactor;
                const lum = (20 + (b.layer * 10)) * ambience;
                const colorFront = `hsl(${hue}, ${sat}%, ${lum}%)`;
                const colorSide = `hsl(${hue}, ${sat}%, ${lum * 0.6}%)`; // Darker side
                const colorRoof = `hsl(${hue}, ${sat}%, ${lum * 1.2}%)`;

                // --- 3D Projection ---
                const sideDepth = 20 + b.layer * 10;

                // Side Face (Visible because buildings move Left, we see Right side)
                ctx.fillStyle = colorSide;
                ctx.beginPath();
                ctx.moveTo(b.x + b.width, height - 100 - b.height);
                ctx.lineTo(b.x + b.width + sideDepth, height - 100 - b.height - 15); // Isometric-ish
                ctx.lineTo(b.x + b.width + sideDepth, height);
                ctx.lineTo(b.x + b.width, height);
                ctx.fill();

                // Roof
                ctx.fillStyle = colorRoof;
                ctx.beginPath();
                ctx.moveTo(b.x, height - 100 - b.height);
                ctx.lineTo(b.x + 10, height - 100 - b.height - 15); // Shift perspective
                ctx.lineTo(b.x + b.width + sideDepth, height - 100 - b.height - 15);
                ctx.lineTo(b.x + b.width, height - 100 - b.height);
                ctx.fill();

                // Front Face
                ctx.fillStyle = colorFront;
                ctx.fillRect(b.x, height - 100 - b.height, b.width, b.height + 100);

                // --- ARCHITECTURAL DETAILS ---
                // Windows (Lit at night)
                const windowsLit = vbTime > 0.45 && vbTime < 0.85;

                b.windows.forEach(w => {
                    // Reflection gradient for windows
                    if (windowsLit) {
                        // Random flicker
                        if (Math.random() > 0.98) return;
                        ctx.fillStyle = 'rgba(254, 240, 138, 0.8)'; // Warm light
                        ctx.shadowColor = '#fef08a';
                        ctx.shadowBlur = 4;
                    } else {
                        // Day reflection
                        ctx.fillStyle = `hsla(210, 40%, ${30 + b.layer * 10}%, 0.8)`;
                        ctx.shadowBlur = 0;
                    }
                    ctx.fillRect(b.x + w.x, height - 100 - b.height + w.y, w.w, w.h);
                    ctx.shadowBlur = 0;
                });

                // Extra Details if close layer
                if (b.details && b.layer === 2) {
                    b.details.forEach(d => {
                        ctx.fillStyle = d.color;
                        ctx.fillRect(b.x + d.x, height - 100 - b.height + d.y, d.w, d.h);
                    });
                }
            });

            // --- ATMOSPHERIC FOG ---
            // Blends the buildings into the ground
            const fogH = 200;
            const fogGrad = ctx.createLinearGradient(0, height - fogH, 0, height);
            const fogColor = vbTime > 0.45 && vbTime < 0.85 ? '2, 6, 23' : '200, 220, 255';
            fogGrad.addColorStop(0, `rgba(${fogColor}, 0)`);
            fogGrad.addColorStop(0.5, `rgba(${fogColor}, 0.3)`);
            fogGrad.addColorStop(1, `rgba(${fogColor}, 0.8)`);
            ctx.fillStyle = fogGrad;
            ctx.fillRect(0, height - fogH, width, fogH);

            // --- MAGLEV ENVIRONMENT (No Wires) ---
            // Sky is clear.

            // --- MAGNETIC TRACK (Maglev) ---
            const trackY = height - 80;

            // Base Platform (Concrete/Metallic)
            const platGrad = ctx.createLinearGradient(0, trackY, 0, height);
            platGrad.addColorStop(0, '#334155');
            platGrad.addColorStop(1, '#0f172a');
            ctx.fillStyle = platGrad;
            ctx.fillRect(0, trackY, width, 80);

            // Magnetic Rails (Glowing Blue/Cyan lines)
            const drawMaglevRail = (y: number, color: string) => {
                ctx.shadowBlur = 15;
                ctx.shadowColor = color;
                ctx.fillStyle = color;
                ctx.fillRect(0, y, width, 4); // Glowing strip
                ctx.shadowBlur = 0;

                // Metallic guard
                ctx.fillStyle = '#94a3b8';
                ctx.fillRect(0, y + 4, width, 2);
            };

            // Two guide rails
            drawMaglevRail(trackY + 15, '#06b6d4'); // Cyan glow
            drawMaglevRail(trackY + 65, '#3b82f6'); // Blue glow

            // Cross-ties (Magnetic Coils)
            if (isAnimating) vbTrackOffset = (vbTrackOffset - 25) % 100;
            ctx.fillStyle = 'rgba(56, 189, 248, 0.3)'; // Faint energy pulses
            for (let x = vbTrackOffset; x < width; x += 100) {
                ctx.fillRect(x, trackY + 20, 40, 40);
            }

            // --- VANDE BHARAT TRAIN (Polished Metallic) ---
            const isSaffron = theme === 'dark';
            // Palette
            // Saffron: Deep Orange / Black / Grey
            // Classic: White / Blue / Grey
            const primaryColor = isSaffron ? '#ea580c' : '#ffffff';
            const secondaryColor = isSaffron ? '#171717' : '#2563eb';
            const stripeColor = isSaffron ? '#737373' : '#60a5fa';

            vbTrain.forEach((car, i) => {
                const bounce = Math.sin(Date.now() / 40 + i * 1.5) * 1.5; // Heavy bounce
                const cy = height - 95 + bounce; // Lifted slightly off track

                // Train Body Shape
                const carH = 60;
                const carW = 160;

                // --- METALLIC SHADER GRADIENT ---
                // Simulating sky reflection on top, horizon line, and ground reflection
                const bodyGrad = ctx.createLinearGradient(car.x, cy - carH, car.x, cy);
                if (isSaffron) {
                    // Premium Saffron (Rich, Deep, Metallic)
                    bodyGrad.addColorStop(0, '#ffedd5'); // Gold/White Highlight
                    bodyGrad.addColorStop(0.2, '#f97316'); // Vibrant Orange
                    bodyGrad.addColorStop(0.5, '#c2410c'); // Deep Saffron
                    bodyGrad.addColorStop(0.51, '#7c2d12'); // Sharp Horizon Line (Dark)
                    bodyGrad.addColorStop(1, '#431407'); // Shadow
                } else {
                    bodyGrad.addColorStop(0, '#ffffff'); // Sky Refl
                    bodyGrad.addColorStop(0.4, '#f1f5f9'); // Body
                    bodyGrad.addColorStop(0.5, '#e2e8f0'); // Horizon
                    bodyGrad.addColorStop(0.51, '#94a3b8'); // Horizon Shadow line
                    bodyGrad.addColorStop(1, '#64748b'); // Ground Refl
                }
                ctx.fillStyle = bodyGrad;

                // Engine Nose Aerodynamics
                if (car.type === 'engine') {
                    ctx.beginPath();
                    ctx.moveTo(car.x, cy);
                    ctx.lineTo(car.x, cy - carH);
                    ctx.lineTo(car.x + 100, cy - carH);
                    // Bullet nose
                    ctx.bezierCurveTo(car.x + 140, cy - carH, car.x + 180, cy - (carH / 2), car.x + 160, cy);
                    ctx.lineTo(car.x, cy);
                    ctx.fill();

                    // Windshield (Black Glass with reflection)
                    const glassGrad = ctx.createLinearGradient(car.x + 110, cy - carH, car.x + 150, cy - 20);
                    glassGrad.addColorStop(0, '#000000');
                    glassGrad.addColorStop(0.3, '#333');
                    glassGrad.addColorStop(0.6, '#000');
                    glassGrad.addColorStop(0.8, '#555'); // Glint
                    ctx.fillStyle = glassGrad;

                    ctx.beginPath();
                    ctx.moveTo(car.x + 110, cy - carH + 2);
                    ctx.bezierCurveTo(car.x + 135, cy - carH + 5, car.x + 155, cy - 40, car.x + 150, cy - 20);
                    ctx.lineTo(car.x + 110, cy - 20);
                    ctx.fill();

                    // Headlight (LED Matrix)
                    if (theme === 'dark' || vbTime > 0.45) {
                        ctx.save();
                        // Bloom
                        ctx.shadowColor = '#fff';
                        ctx.shadowBlur = 20;
                        ctx.fillStyle = '#fff';
                        ctx.beginPath();
                        ctx.moveTo(car.x + 148, cy - 15);
                        ctx.lineTo(car.x + 152, cy - 20);
                        ctx.lineTo(car.x + 145, cy - 20);
                        ctx.fill();

                        // Beam
                        const beamGrad = ctx.createLinearGradient(car.x + 150, cy - 15, width, cy + 50);
                        beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
                        beamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                        ctx.fillStyle = beamGrad;
                        ctx.beginPath();
                        ctx.moveTo(car.x + 150, cy - 15);
                        ctx.lineTo(width, cy - 50);
                        ctx.lineTo(width, cy + 100);
                        ctx.fill();
                        ctx.restore();
                    }

                } else {
                    // Coach Body
                    ctx.fillRect(car.x, cy - carH, carW, carH);
                }

                // Stripe (Dynamic Swoosh)
                ctx.fillStyle = stripeColor;
                if (car.type === 'engine') {
                    ctx.beginPath();
                    ctx.moveTo(car.x, cy - 20);
                    ctx.lineTo(car.x + 100, cy - 20);
                    ctx.quadraticCurveTo(car.x + 120, cy - 15, car.x + 130, cy);
                    ctx.lineTo(car.x, cy);
                    ctx.fill();
                } else {
                    ctx.fillRect(car.x, cy - 20, carW, 20);
                }

                // Doors (Recessed 3D)
                const drawDoor = (dx: number) => {
                    // Inset Shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.3)';
                    ctx.fillRect(dx, cy - carH + 5, 20, carH - 10);
                    // Door Panel
                    ctx.fillStyle = bodyGrad; // Match body
                    ctx.fillRect(dx + 2, cy - carH + 7, 16, carH - 14);
                    // Window in door
                    ctx.fillStyle = '#111';
                    ctx.fillRect(dx + 4, cy - carH + 12, 12, 15);
                };
                drawDoor(car.x + 10);
                if (car.type !== 'engine') drawDoor(car.x + carW - 30);

                // Windows (Continuous Glass Strip look for modern feeling)
                // Actually Vande Bharat has individual windows but flush.
                car.windows.forEach(w => {
                    ctx.fillStyle = '#000000'; // Premium Jet Black
                    // Window Glass
                    ctx.fillRect(car.x + w.x, cy - 45, w.width, 18);

                    // Reflection on Glass
                    ctx.fillStyle = 'rgba(255,255,255,0.2)';
                    ctx.beginPath();
                    ctx.moveTo(car.x + w.x + 10, cy - 45);
                    ctx.lineTo(car.x + w.x + w.width, cy - 45);
                    ctx.lineTo(car.x + w.x + w.width - 20, cy - 27);
                    ctx.lineTo(car.x + w.x, cy - 27);
                    ctx.fill();

                    // Interior Light
                    if (theme === 'dark' || vbTime > 0.45) {
                        ctx.fillStyle = 'rgba(253, 224, 71, 0.4)'; // Warm interior
                        ctx.fillRect(car.x + w.x, cy - 45, w.width, 18);
                    }
                });

                // Underframe / Bogies (Complex 3D)
                const drawBogie = (bx: number) => {
                    // Dark metallic undercarriage
                    ctx.fillStyle = '#1c1917';
                    ctx.fillRect(bx - 20, cy, 60, 15);

                    // 3D Springs/Suspension
                    ctx.fillStyle = '#444';
                    ctx.fillRect(bx - 10, cy + 2, 8, 10);
                    ctx.fillRect(bx + 20, cy + 2, 8, 10);

                    // Wheels (Rotating with Motion Blur feel)
                    const wheelTime = Date.now() / 50;
                    const drawSingleWheel = (ox: number) => {
                        ctx.save();
                        ctx.translate(bx + ox, cy + 8);
                        ctx.rotate(wheelTime);

                        // Tire
                        ctx.fillStyle = '#262626';
                        ctx.beginPath();
                        ctx.arc(0, 0, 9, 0, Math.PI * 2);
                        ctx.fill();

                        // Chrome Hubcap
                        const hub = ctx.createRadialGradient(-2, -2, 0, 0, 0, 8);
                        hub.addColorStop(0, '#e5e5e5');
                        hub.addColorStop(1, '#525252');
                        ctx.fillStyle = hub;
                        ctx.beginPath();
                        ctx.arc(0, 0, 5, 0, Math.PI * 2);
                        ctx.fill();

                        ctx.restore();
                    };
                    drawSingleWheel(0);
                    drawSingleWheel(30);
                };
                drawBogie(car.x + 30);
                drawBogie(car.x + 110);

                // No Pantograph (Maglev Mode)

                // Connection Gangway
                if (i < vbTrain.length - 1) {
                    ctx.fillStyle = '#111';
                    ctx.fillRect(car.x + 155, cy - 40, 10, 30);
                    // Bellows texture
                    ctx.fillStyle = '#333';
                    for (let k = 0; k < 5; k++) {
                        ctx.fillRect(car.x + 155, cy - 40 + (k * 6), 10, 1);
                    }
                }

            });
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
            } else if (activeMode === 'seaside') {
                drawSeaside();
            } else if (activeMode === 'galactic') {
                drawGalactic();
            } else if (activeMode === 'planes') {
                drawPlanes();
            } else if (activeMode === 'kites') {
                drawKites();
            } else if (activeMode === 'ink') {
                drawInk();
            } else if (activeMode === 'spiderweb') {
                drawSpiderweb();
            } else if (activeMode === 'vande-bharat') {
                drawVandeBharat();
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



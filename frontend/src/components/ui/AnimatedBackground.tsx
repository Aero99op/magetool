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
    const [activeMode, setActiveMode] = useState<'rain' | 'dataflow' | 'anime' | 'blackhole' | 'circuit' | 'netscape'>('dataflow');

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
        const particleCount = 50;
        const connectionDistance = 150;
        const baseColorDark = 'rgba(0, 217, 255,';

        // Rain (formerly Default Light)
        let raindrops: Raindrop[] = [];
        let clouds: Cloud[] = [];
        let lightnings: Lightning[] = [];
        const cloudCache: HTMLCanvasElement[] = [];
        const cloudTypeCount = 5;
        const raindropCount = 120;
        const cloudCount = 8;
        let stormDimLevel = 0;
        let nextLightningTime = Date.now() + Math.random() * 5000 + 3000;

        // Anime
        let speedLines: SpeedLine[] = [];
        let animeWords: FloatingWord[] = [];
        const speedLineCount = 60;

        // Blackhole
        let blackholeParticles: BlackholeParticle[] = [];
        let blackholeWords: FloatingWord[] = [];
        const blackholeParticleCount = 300;

        // Circuit
        let circuitNodes: CircuitNode[] = [];
        let circuitSignals: CircuitSignal[] = [];
        let circuitPaths: CircuitPath[] = [];

        // Netscape
        let netscapeLines: NetscapeLine[] = [];
        const netscapeLineCount = 20; // Horizontal lines
        let netscapeOffset = 0;

        // --- Helpers ---
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

        const init = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            // Init Data Flow
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

            // Init Rain
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

            // Init Anime
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

            // Init Blackhole
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

            // Init Circuit
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
            for (let i = 0; i < 40; i++) { // Create 40 paths
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

            // Init Netscape
            netscapeLines = [];
            for (let i = 0; i < netscapeLineCount; i++) {
                netscapeLines.push({
                    z: i * (height / 2) / netscapeLineCount,
                    speed: 2
                });
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
            ctx.shadowBlur = 50;
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
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < connectionDistance) {
                            ctx.beginPath();
                            const lineBase = theme === 'light' ? 'rgba(59, 130, 246,' : baseColorDark;
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
            ctx.shadowBlur = 50;
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
                    ctx.shadowBlur = 15;
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
            ctx.shadowBlur = 60;
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
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        init();
        window.addEventListener('resize', init);
        draw();

        return () => {
            window.removeEventListener('resize', init);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme, isAnimating, activeMode]);

    // --- Dynamic Background CSS ---
    // This allows the canvas to sit on top of a base color which matches the mode
    const getBackgroundStyle = () => {
        // Debug
        // console.log('Background Calc:', { activeMode, theme });

        if (activeMode === 'anime') {
            return theme === 'light' ? '#ffffff' : '#000000';
        }
        if (activeMode === 'blackhole') {
            return theme === 'light' ? '#f0f9ff' : '#000000';
        }
        if (activeMode === 'rain') {
            // Dark rain needs a dark background
            return theme === 'light'
                ? 'linear-gradient(180deg, #94a3b8 0%, #cbd5e1 50%, #f1f5f9 100%)'
                : 'linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #334155 100%)';
        }
        // dataflow
        if (activeMode === 'dataflow') {
            return theme === 'light'
                ? '#ffffff' // Pure white
                : 'radial-gradient(circle at 50% 0%, #111113 0%, #030304 100%)';
        }
        if (activeMode === 'circuit') {
            return theme === 'light' ? '#f1f5f9' : '#0f172a'; // Slate backgrounds
        }
        if (activeMode === 'netscape') {
            return theme === 'light' ? '#fff7ed' : '#1a0b2e'; // Warm white or deep purple
        }

        // Fallback checks
        if (theme === 'light') return '#ffffff';
        return '#000000';
    };

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
                background: getBackgroundStyle(),
                transition: 'background 0.5s ease-in-out'
            }}
        />
    );
}

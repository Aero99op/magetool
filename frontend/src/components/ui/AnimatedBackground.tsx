'use client';

import { useEffect, useRef, useState } from 'react';

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

export default function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const [isAnimating, setIsAnimating] = useState(true); // NEW: Reactive state for animation toggle

    // Listen for theme changes
    useEffect(() => {
        const updateTheme = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') as 'dark' | 'light' | null;
            setTheme(currentTheme === 'light' ? 'light' : 'dark');
        };

        updateTheme();
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    updateTheme();
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    // NEW: Listen for animation toggle changes (data-animate attribute)
    useEffect(() => {
        const updateAnimation = () => {
            const animAttr = document.documentElement.getAttribute('data-animate');
            setIsAnimating(animAttr !== 'off');
        };

        updateAnimation(); // Initial check
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-animate') {
                    updateAnimation();
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-animate'] });
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

        const isDark = theme !== 'light';

        // Dark Mode
        let particlesDark: ParticleDark[] = [];
        const particleCount = 50;
        const connectionDistance = 150;
        const baseColorDark = 'rgba(0, 217, 255,';

        // Light Mode
        let raindrops: Raindrop[] = [];
        let clouds: Cloud[] = [];
        let lightnings: Lightning[] = [];
        const cloudCache: HTMLCanvasElement[] = [];
        const cloudTypeCount = 5;
        const raindropCount = 120;
        const cloudCount = 8;

        // Storm State
        let stormDimLevel = 0;
        let nextLightningTime = Date.now() + Math.random() * 5000 + 3000;

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

        const init = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;

            if (isDark) {
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
            } else {
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
            }
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

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            if (isDark) {
                // DARK MODE
                particlesDark.forEach((p, i) => {
                    if (isAnimating) {
                        p.x += p.vx;
                        p.y += p.vy;
                    }
                    if (p.x < 0 || p.x > width) p.vx *= -1;
                    if (p.y < 0 || p.y > height) p.vy *= -1;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fillStyle = p.color;
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
                                ctx.strokeStyle = `${baseColorDark} ${0.15 - (dist / connectionDistance) * 0.15})`;
                                ctx.lineWidth = 1;
                                ctx.moveTo(p.x, p.y);
                                ctx.lineTo(p2.x, p2.y);
                                ctx.stroke();
                            }
                        }
                    }
                });
            } else {
                // LIGHT MODE
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
                        ctx.globalAlpha = cloud.opacity;
                        ctx.drawImage(cachedCloud, cloud.x, cloud.y, cachedCloud.width * cloud.scale, cachedCloud.height * cloud.scale);
                        ctx.restore();
                    }
                });

                // Rain
                ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
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
    }, [theme, isAnimating]); // IMPORTANT: Re-run effect when isAnimating changes

    const isDark = theme !== 'light';

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
                background: isDark
                    ? 'radial-gradient(circle at 50% 0%, #111113 0%, #030304 100%)'
                    : 'linear-gradient(180deg, #94a3b8 0%, #cbd5e1 50%, #f1f5f9 100%)',
                transition: 'background 1s ease'
            }}
        />
    );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface Leaf {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    rotationSpeed: number;
    type: 'leaf' | 'bomb';
    sliced: boolean;
    scale: number;
}

interface LeafNinjaGameProps {
    onClose?: () => void;
}

// Leaf emojis for variety
const LEAF_TYPES = ['🍃', '🍂', '🍁', '☘️', '🌿'];
const BOMB_EMOJI = '💣';

export default function LeafNinjaGame({ onClose }: LeafNinjaGameProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [score, setScore] = useState(0);
    const [combo, setCombo] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [highScore, setHighScore] = useState(0);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [leaves, setLeaves] = useState<Leaf[]>([]);
    const [slashTrail, setSlashTrail] = useState<{ x: number, y: number }[]>([]);
    const [isSlashing, setIsSlashing] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const leafIdRef = useRef(0);
    const animationRef = useRef<number>();
    const lastSpawnRef = useRef(0);

    // Initialize audio context
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        const saved = localStorage.getItem('leafNinjaHighScore');
        if (saved) setHighScore(parseInt(saved));
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, []);

    // Play sound effects
    const playSound = useCallback((type: 'slice' | 'bomb' | 'combo') => {
        if (!soundEnabled || !audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        if (type === 'slice') {
            oscillator.frequency.value = 800 + Math.random() * 400;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.1);
        } else if (type === 'bomb') {
            oscillator.frequency.value = 100;
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.3);
        } else if (type === 'combo') {
            oscillator.frequency.value = 1200;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.15);
        }
    }, [soundEnabled]);

    // Spawn new leaves
    const spawnLeaf = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const isBomb = Math.random() < 0.15; // 15% bomb chance
        const newLeaf: Leaf = {
            id: leafIdRef.current++,
            x: Math.random() * (canvas.width - 60) + 30,
            y: canvas.height + 50,
            vx: (Math.random() - 0.5) * 4,
            vy: -(12 + Math.random() * 6),
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 0.3,
            type: isBomb ? 'bomb' : 'leaf',
            sliced: false,
            scale: 1 + Math.random() * 0.3,
        };

        setLeaves(prev => [...prev, newLeaf]);
    }, []);

    // Game loop
    useEffect(() => {
        if (gameOver) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const gameLoop = (timestamp: number) => {
            // Spawn leaves
            if (timestamp - lastSpawnRef.current > 800) {
                spawnLeaf();
                if (Math.random() < 0.4) spawnLeaf(); // Sometimes spawn 2
                lastSpawnRef.current = timestamp;
            }

            // Clear canvas
            ctx.fillStyle = 'rgba(10, 15, 30, 0.3)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Update and draw leaves
            setLeaves(prev => {
                const updated = prev.map(leaf => ({
                    ...leaf,
                    x: leaf.x + leaf.vx,
                    y: leaf.y + leaf.vy,
                    vy: leaf.vy + 0.35, // Gravity
                    rotation: leaf.rotation + leaf.rotationSpeed,
                })).filter(leaf => leaf.y < canvas.height + 100 && !leaf.sliced);

                return updated;
            });

            // Draw leaves
            leaves.forEach(leaf => {
                ctx.save();
                ctx.translate(leaf.x, leaf.y);
                ctx.rotate(leaf.rotation);
                ctx.font = `${48 * leaf.scale}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (leaf.type === 'bomb') {
                    ctx.fillText(BOMB_EMOJI, 0, 0);
                } else {
                    const leafEmoji = LEAF_TYPES[leaf.id % LEAF_TYPES.length];
                    ctx.fillText(leafEmoji, 0, 0);
                }
                ctx.restore();
            });

            // Draw slash trail
            if (slashTrail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(slashTrail[0].x, slashTrail[0].y);
                for (let i = 1; i < slashTrail.length; i++) {
                    ctx.lineTo(slashTrail[i].x, slashTrail[i].y);
                }
                ctx.strokeStyle = 'rgba(0, 255, 136, 0.8)';
                ctx.lineWidth = 4;
                ctx.lineCap = 'round';
                ctx.stroke();

                // Glow effect
                ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
                ctx.lineWidth = 12;
                ctx.stroke();
            }

            animationRef.current = requestAnimationFrame(gameLoop);
        };

        animationRef.current = requestAnimationFrame(gameLoop);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [gameOver, leaves, slashTrail, spawnLeaf]);

    // Handle mouse/touch for slashing
    const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
        if (!isSlashing || gameOver) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setSlashTrail(prev => [...prev.slice(-10), { x, y }]);

        // Check collision with leaves
        setLeaves(prev => {
            let slicedAny = false;
            let hitBomb = false;

            const updated = prev.map(leaf => {
                if (leaf.sliced) return leaf;

                const dist = Math.sqrt((leaf.x - x) ** 2 + (leaf.y - y) ** 2);
                if (dist < 40 * leaf.scale) {
                    if (leaf.type === 'bomb') {
                        hitBomb = true;
                        return { ...leaf, sliced: true };
                    } else {
                        slicedAny = true;
                        return { ...leaf, sliced: true };
                    }
                }
                return leaf;
            });

            if (hitBomb) {
                playSound('bomb');
                setGameOver(true);
                if (score > highScore) {
                    setHighScore(score);
                    localStorage.setItem('leafNinjaHighScore', score.toString());
                }
            } else if (slicedAny) {
                playSound('slice');
                setScore(s => s + 10 + combo * 5);
                setCombo(c => {
                    if (c > 0 && c % 3 === 2) playSound('combo');
                    return c + 1;
                });
            }

            return updated;
        });
    }, [isSlashing, gameOver, combo, score, highScore, playSound]);

    const handlePointerDown = () => {
        setIsSlashing(true);
        setSlashTrail([]);
    };

    const handlePointerUp = () => {
        setIsSlashing(false);
        setSlashTrail([]);
        setCombo(0);
    };

    const restartGame = () => {
        setScore(0);
        setCombo(0);
        setGameOver(false);
        setLeaves([]);
        leafIdRef.current = 0;
    };

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'linear-gradient(180deg, #0a0f1e 0%, #1a1f3e 100%)',
            border: '1px solid rgba(0, 255, 136, 0.3)',
            boxShadow: '0 0 30px rgba(0, 255, 136, 0.2)',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
            }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <span style={{ color: '#00ff88', fontWeight: 'bold' }}>🍃 Score: {score}</span>
                    {combo > 1 && <span style={{ color: '#ffaa00' }}>🔥 x{combo}</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                        }}
                    >
                        {soundEnabled ? '🔊' : '🔇'}
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            style={{
                                background: 'rgba(255,0,0,0.2)',
                                border: '1px solid rgba(255,0,0,0.5)',
                                borderRadius: '4px',
                                color: '#ff6666',
                                padding: '4px 8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                            }}
                        >
                            ✕ Close
                        </button>
                    )}
                </div>
            </div>

            {/* Game Canvas */}
            <canvas
                ref={canvasRef}
                width={400}
                height={350}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                style={{
                    width: '100%',
                    height: 'auto',
                    cursor: 'crosshair',
                    touchAction: 'none',
                }}
            />

            {/* Game Over Overlay */}
            {gameOver && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0, 0, 0, 0.85)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                }}>
                    <div style={{ fontSize: '48px' }}>💥</div>
                    <h3 style={{ color: '#ff4444', margin: 0 }}>Game Over!</h3>
                    <p style={{ color: '#fff', margin: 0 }}>Score: <strong style={{ color: '#00ff88' }}>{score}</strong></p>
                    <p style={{ color: '#888', margin: 0, fontSize: '14px' }}>High Score: {highScore}</p>
                    <button
                        onClick={restartGame}
                        style={{
                            background: 'linear-gradient(135deg, #00ff88, #00cc66)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 32px',
                            color: '#000',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            marginTop: '8px',
                        }}
                    >
                        🔄 Play Again
                    </button>
                </div>
            )}

            {/* Instructions */}
            <div style={{
                padding: '8px 16px',
                background: 'rgba(0, 0, 0, 0.5)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                textAlign: 'center',
                fontSize: '12px',
                color: '#888',
            }}>
                Slash the leaves 🍃 | Avoid bombs 💣 | High Score: {highScore}
            </div>
        </div>
    );
}


import os

file_path = r"d:\magetool website\frontend\src\components\ui\AnimatedBackground.tsx"

# Ultra-Polished 3D Vande Bharat Function
new_function = r"""        const drawVandeBharat = () => {
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
                 for(let i=0; i<50; i++) {
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
                 if(isAnimating) {
                     const speed = (b.layer + 1) * 0.5; // Parallax
                     b.x -= speed;
                     if(b.x + b.width < -100) { 
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
                         if(Math.random() > 0.98) return; 
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

            // --- 3D CATENARY WIRES (Power Lines) ---
            ctx.save();
            // Draw poles first
            vbPowerLines.forEach((pole, i) => {
                 if(isAnimating) {
                     pole.x -= 8;
                     if(pole.x < -100) pole.x = width + 500;
                 }
                 // Pole Gradient (Cylindrical)
                 const pGrad = ctx.createLinearGradient(pole.x, 0, pole.x + 12, 0);
                 pGrad.addColorStop(0, '#1e293b');
                 pGrad.addColorStop(0.4, '#94a3b8'); // Specular highlight
                 pGrad.addColorStop(1, '#0f172a');
                 ctx.fillStyle = pGrad;
                 ctx.fillRect(pole.x, height - 350, 12, 350);

                 // Arms
                 ctx.fillStyle = '#475569';
                 ctx.fillRect(pole.x - 25, height - 330, 60, 4); // Top arm
            });

            // Draw Wires (Curves)
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            for (let i = 0; i < vbPowerLines.length; i++) {
                const p1 = vbPowerLines[i];
                const p2 = vbPowerLines[(i + 1) % vbPowerLines.length];
                if (p2.x > p1.x) {
                    // Catenary Curve
                    const midX = (p1.x + p2.x) / 2;
                    const midY = height - 330 + 30; // Sag
                    ctx.moveTo(p1.x + 6, height - 330);
                    ctx.quadraticCurveTo(midX, midY, p2.x + 6, height - 330);
                }
            }
            ctx.stroke();
            ctx.restore();

            // --- 3D TRACKS (Ballast Mounds & Sleepers) ---
            const trackY = height - 80;
            
            // Ballast Mound (Trapezoid Gradient)
            const ballastGrad = ctx.createLinearGradient(0, trackY, 0, height);
            ballastGrad.addColorStop(0, '#44403c'); // Top
            ballastGrad.addColorStop(0.4, '#78716c'); // Slope Light
            ballastGrad.addColorStop(1, '#1c1917'); // Base Shadow
            ctx.fillStyle = ballastGrad;
            ctx.fillRect(0, trackY, width, 80);

            // Sleepers (Perspective)
            if (isAnimating) vbTrackOffset = (vbTrackOffset - 20) % 50; // Faster
            
            for (let x = vbTrackOffset; x < width; x += 50) {
                 // Sleeper body 3D
                 ctx.fillStyle = '#3f3f46'; // Top
                 ctx.fillRect(x, trackY, 12, 85);
                 ctx.fillStyle = '#18181b'; // Side Shadow
                 ctx.fillRect(x + 12, trackY, 4, 85);
            }

            // Rails (Hyper-Metallic)
            const drawRail = (y: number) => {
                 // Top Surface (Chrome)
                 const rTop = ctx.createLinearGradient(0, y, 0, y + 6);
                 rTop.addColorStop(0, '#d1d5db');
                 rTop.addColorStop(0.5, '#ffffff'); // Glint
                 rTop.addColorStop(1, '#9ca3af');
                 ctx.fillStyle = rTop;
                 ctx.fillRect(0, y, width, 6);

                 // Side (Rust/Dark Steel)
                 ctx.fillStyle = '#4a0404'; // Dark Rusted Steel style
                 ctx.fillRect(0, y + 6, width, 3);
            };
            drawRail(trackY + 10); // Far rail
            drawRail(trackY + 60); // Near rail

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
                    bodyGrad.addColorStop(0, '#fb923c'); // Highlight
                    bodyGrad.addColorStop(0.3, '#c2410c'); // Mid
                    bodyGrad.addColorStop(0.5, '#ea580c'); // Base
                    bodyGrad.addColorStop(0.51, '#9a3412'); // Horizon Line Dark
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
                    ctx.bezierCurveTo(car.x + 140, cy - carH, car.x + 180, cy - (carH/2), car.x + 160, cy);
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
                    ctx.fillStyle = '#0f172a'; // Dark Tint
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

                // Pantograph (Coach 1 - Delicate Lines)
                if (i === 1) {
                     ctx.lineWidth = 2;
                     ctx.strokeStyle = '#d4d4d4'; // Silver
                     ctx.beginPath();
                     // Base
                     ctx.moveTo(car.x + 50, cy - carH);
                     // Diamond shape
                     const panH = 30;
                     ctx.lineTo(car.x + 80, cy - carH - panH); // Up
                     ctx.lineTo(car.x + 110, cy - carH); // Down
                     
                     // Slider Contact
                     ctx.moveTo(car.x + 70, cy - carH - panH);
                     ctx.lineTo(car.x + 90, cy - carH - panH);
                     ctx.stroke();
                     
                     // Sparking effect
                     if (Math.random() > 0.8) {
                         ctx.fillStyle = '#60a5fa'; // Blue spark
                         ctx.shadowColor = '#fff';
                         ctx.shadowBlur = 10;
                         ctx.beginPath();
                         ctx.arc(car.x + 80 + (Math.random() * 10 - 5), cy - carH - panH, 3, 0, Math.PI*2);
                         ctx.fill();
                         ctx.shadowBlur = 0;
                     }
                }

                // Connection Gangway
                if (i < vbTrain.length - 1) {
                     ctx.fillStyle = '#111';
                     ctx.fillRect(car.x + 155, cy - 40, 10, 30);
                     // Bellows texture
                     ctx.fillStyle = '#333';
                     for(let k=0; k<5; k++) {
                         ctx.fillRect(car.x + 155, cy - 40 + (k*6), 10, 1);
                     }
                }

            });
        };
"""

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Targeting the exact block of drawVandeBharat again
# We recently removed the duplicate line, so it should be clean.
# I will define strict start/end markers logic or just direct index if I am sure.
# Previous file view showed `drawVandeBharat` starts around 2402.

# Let's find the start index dynamically to be safe
start_index = -1
end_index = -1

for idx, line in enumerate(lines):
    if "const drawVandeBharat = () => {" in line:
        start_index = idx
        break

# Find the end of dataVandeBharat
# It ends before 'const draw = () => {'
for idx, line in enumerate(lines):
    if "const draw = () => {" in line:
        end_index = idx
        break

if start_index != -1 and end_index != -1:
    # We want to replace from start_index to end_index - 1 (the closing brace of drawVandeBharat is likely at end_index - 2 or -3)
    # Actually, let's look at the gap between them.
    # The previous view showed `draw` starting at line 2841, and `drawVandeBharat` end brace at 2839? or 2837.
    # Let's just blindly take everything before start_index and everything starting from end_index, and insert new function.
    
    # Check if there is a closing brace before `const draw`?
    # Yes, typically.
    
    prefix = lines[:start_index]
    suffix = lines[end_index:]
    
    final_content = "".join(prefix) + new_function + "\n" + "".join(suffix)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    print(f"Replaced lines {start_index} to {end_index}")
else:
    print("Could not find function boundaries.")


import os

file_path = r"d:\magetool website\frontend\src\components\ui\AnimatedBackground.tsx"

new_function = r"""        const drawVandeBharat = () => {
            // --- Time Cycle based on Theme ---
            if (isAnimating) {
                if (theme === 'light') {
                    // Day (0.1) to Dusk (0.45)
                    vbTime += 0.0001;
                    if (vbTime > 0.45) vbTime = 0.1;
                    if (vbTime < 0.1) vbTime = 0.1;
                } else {
                     // Sunset (0.5) to Midnight (0.85)
                     vbTime += 0.0001;
                     if (vbTime > 0.85) vbTime = 0.5;
                     if (vbTime < 0.5) vbTime = 0.5;
                }
            }

            // Sky Gradient
            let topColor, midColor, bottomColor;
            // Day (0-0.3) -> Sunset (0.3-0.5) -> Night (0.5-0.8) -> Sunrise (0.8-1.0)
            const getColor = (t) => {
                if (t < 0.3) return { t: '#38bdf8', m: '#bae6fd', b: '#e0f2fe' }; // Day
                if (t < 0.5) return { t: '#1e3a8a', m: '#c026d3', b: '#f97316' }; // Sunset (Blue->Purple->Orange)
                if (t < 0.8) return { t: '#020617', m: '#0f172a', b: '#1e1b4b' }; // Night
                return { t: '#020617', m: '#4c1d95', b: '#f472b6' }; // Sunrise
            };
            
            const colors = getColor(vbTime);
            // Linear interpolation could be smoother, but direct switch for now
            const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
            bgGrad.addColorStop(0, colors.t);
            bgGrad.addColorStop(0.5, colors.m);
            bgGrad.addColorStop(1, colors.b);
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, width, height);

            // sun / moon
            const celestialY = height * 0.2 + Math.sin(vbTime * Math.PI * 2) * (height * 0.1);
            const celestialX = width * 0.2 + vbTime * width * 0.6;
            ctx.beginPath();
            ctx.arc(celestialX, celestialY, 40, 0, Math.PI * 2);
            if (vbTime > 0.45 && vbTime < 0.85) {
                ctx.fillStyle = '#fef08a'; // Moon
                ctx.shadowColor = '#fef9c3';
                ctx.shadowBlur = 20;
            } else {
                ctx.fillStyle = '#fcd34d'; // Sun
                ctx.shadowColor = '#fbbf24';
                ctx.shadowBlur = 50;
            }
            ctx.fill();
            ctx.shadowBlur = 0;

            // --- Parallax Buildings ---
            vbBuildings.forEach(b => {
                 if(isAnimating) {
                     const speed = (b.layer + 1) * 0.5;
                     b.x -= speed;
                     if(b.x + b.width < -50) { 
                         b.x = width + Math.random() * 50; 
                     }
                 }
                 // Draw Front Face
                 const baseLight = vbTime > 0.4 && vbTime < 0.9 ? 20 : 80;
                 const layerDim = (2 - b.layer) * 15;
                 const light = Math.max(5, baseLight - layerDim);
                 ctx.fillStyle = `hsl(220, 20%, ${light}%)`;
                 ctx.fillRect(b.x, height - 100 - b.height, b.width, b.height + 100);

                 // Draw Side Face (Right side)
                 const depth = 15 + b.layer * 5;
                 ctx.fillStyle = `hsl(220, 20%, ${light - 10}%)`; // Darker
                 ctx.beginPath();
                 ctx.moveTo(b.x + b.width, height - 100 - b.height);
                 ctx.lineTo(b.x + b.width + depth, height - 100 - b.height - 10);
                 ctx.lineTo(b.x + b.width + depth, height);
                 ctx.lineTo(b.x + b.width, height);
                 ctx.fill();

                 // Roof
                 ctx.fillStyle = `hsl(220, 20%, ${light + 10}%)`; // Lighter
                 ctx.beginPath();
                 ctx.moveTo(b.x, height - 100 - b.height);
                 ctx.lineTo(b.x + depth, height - 100 - b.height - 10);
                 ctx.lineTo(b.x + b.width + depth, height - 100 - b.height - 10);
                 ctx.lineTo(b.x + b.width, height - 100 - b.height);
                 ctx.fill();

                 // Windows
                 if(vbTime > 0.45 && vbTime < 0.85) {
                     ctx.fillStyle = 'rgba(253, 224, 71, 0.6)'; // Lit windows at night
                     b.windows.forEach(w => {
                         ctx.fillRect(b.x + w.x, height - 100 - b.height + w.y, 8, 12);
                     });
                 }
            });

            // Fog
            const fogGrad = ctx.createLinearGradient(0, height - 150, 0, height);
            fogGrad.addColorStop(0, 'rgba(0,0,0,0)');
            fogGrad.addColorStop(1, vbTime > 0.45 && vbTime < 0.85 ? 'rgba(2, 6, 23, 0.5)' : 'rgba(255,255,255,0.3)');
            ctx.fillStyle = fogGrad;
            ctx.fillRect(0, height - 150, width, 150);

            // --- Power Lines (Behind Train) ---
            ctx.save();
            vbPowerLines.forEach((pole, i) => {
                const nextPole = vbPowerLines[(i + 1) % vbPowerLines.length];
                // Parallax move
                if (isAnimating) {
                     pole.x -= 8; // Fast foreground
                     if(pole.x < -100) pole.x = width + 500; // Recycle
                }

                // Draw Pole
                const poleGrad = ctx.createLinearGradient(pole.x, 0, pole.x + 10, 0);
                poleGrad.addColorStop(0, '#334155');
                poleGrad.addColorStop(1, '#1e293b');
                ctx.fillStyle = poleGrad;
                ctx.fillRect(pole.x, height - 300, 10, 300);
                
                // Crossbar
                ctx.fillRect(pole.x - 20, height - 280, 50, 5);

                // Wire to next pole (if next pole is to the right)
                if (nextPole.x > pole.x) {
                    ctx.beginPath();
                    ctx.moveTo(pole.x + 5, height - 280);
                    ctx.quadraticCurveTo((pole.x + nextPole.x)/2, height - 250, nextPole.x + 5, height - 280);
                    ctx.strokeStyle = '#1e293b';
                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Birds
                    if (pole.bird) {
                        const birdX = pole.x + 200; 
                        const birdY = height - 265; 
                        
                        if (pole.bird.flyAway || (pole.x < width * 0.3)) {
                             pole.bird.flyAway = true;
                             pole.bird.vx = -2 - Math.random();
                             pole.bird.vy = -2 - Math.random();
                        }

                        if (!pole.bird.flyAway) {
                             ctx.fillStyle = '#000';
                             ctx.beginPath();
                             ctx.arc(birdX, birdY, 3, 0, Math.PI * 2);
                             ctx.fill();
                        } else {
                             // Flying
                             if(isAnimating) {
                                 pole.bird.y += pole.bird.vy;
                             }
                             ctx.fillStyle = '#000';
                             ctx.beginPath();
                             ctx.moveTo(birdX + (pole.x < -50 ? 0 : 0), birdY + pole.bird.y); 
                             ctx.arc(birdX + pole.bird.vx * 10, birdY + pole.bird.y, 3, 0, Math.PI * 2); 
                             ctx.fill();
                        }
                    }
                }
            });
            ctx.restore();


            // --- Tracks ---
            // Ballast with Gradient
            const ballastGrad = ctx.createLinearGradient(0, height - 80, 0, height);
            ballastGrad.addColorStop(0, '#44403c');
            ballastGrad.addColorStop(0.5, '#57534e'); 
            ballastGrad.addColorStop(1, '#292524');
            ctx.fillStyle = ballastGrad;
            ctx.fillRect(0, height - 80, width, 80);

            // Rails
            ctx.fillStyle = '#d6d3d1';
            ctx.fillRect(0, height - 75, width, 5); // Far rail
            ctx.fillStyle = '#78716c';
            ctx.fillRect(0, height - 70, width, 2);

            ctx.fillStyle = '#d6d3d1';
            ctx.fillRect(0, height - 25, width, 5); // Near rail
            ctx.fillStyle = '#78716c';
            ctx.fillRect(0, height - 20, width, 2);

            // Sleepers with depth
            if (isAnimating) vbTrackOffset = (vbTrackOffset - 15) % 40;
            for (let x = vbTrackOffset; x < width; x += 40) {
                ctx.fillStyle = '#57534e';
                ctx.fillRect(x, height - 80, 10, 60);
                ctx.fillStyle = '#292524';
                ctx.fillRect(x + 10, height - 80, 2, 60);
            }

            // --- Train (Vande Bharat) ---
            const isSaffron = theme === 'dark';
            const mainColor = isSaffron ? '#ea580c' : '#ffffff'; 
            const secColor = isSaffron ? '#262626' : '#2563eb'; 
            const stripColor = isSaffron ? '#525252' : '#60a5fa'; 

            vbTrain.forEach((car, i) => {
                // Bounce
                const bounce = Math.sin(Date.now() / 50 + i) * 1;
                const cy = height - 85 + bounce;

                // Draw Headlight (Engine only)
                if (car.type === 'engine' && theme === 'dark') {
                     ctx.save();
                     ctx.beginPath();
                     ctx.moveTo(car.x + 140, cy - 25);
                     ctx.lineTo(width, cy - 60);
                     ctx.lineTo(width, cy + 50);
                     ctx.lineTo(car.x + 140, cy);
                     const grad = ctx.createLinearGradient(car.x + 140, cy, car.x + 500, cy);
                     grad.addColorStop(0, 'rgba(255, 255, 200, 0.4)');
                     grad.addColorStop(1, 'rgba(255, 255, 200, 0)');
                     ctx.fillStyle = grad;
                     ctx.fill();
                     ctx.restore();
                }

                // 3D Metal Gradient for scale
                const bodyGrad = ctx.createLinearGradient(car.x, cy - 50, car.x, cy);
                bodyGrad.addColorStop(0, '#ffffff'); // Shine top
                bodyGrad.addColorStop(0.2, mainColor);
                bodyGrad.addColorStop(0.8, mainColor);
                bodyGrad.addColorStop(1, 'rgba(0,0,0,0.3)'); // Shadow bottom
                ctx.fillStyle = bodyGrad;

                // Car Body
                if (car.type === 'engine') {
                    ctx.beginPath();
                    ctx.moveTo(car.x, cy); // Rear Bottom
                    ctx.lineTo(car.x, cy - 50); // Rear Top
                    ctx.lineTo(car.x + 110, cy - 50); // Roof start curve
                    // Aerodynamic Nose (Facing Right)
                    ctx.bezierCurveTo(car.x + 150, cy - 45, car.x + 160, cy - 25, car.x + 150, cy);
                    ctx.lineTo(car.x, cy);
                    ctx.fill();

                    // Cockpit Mask (Black)
                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.moveTo(car.x + 110, cy - 50);
                    ctx.bezierCurveTo(car.x + 135, cy - 48, car.x + 145, cy - 30, car.x + 140, cy - 20);
                    ctx.lineTo(car.x + 108, cy - 20);
                    ctx.lineTo(car.x + 105, cy - 50);
                    ctx.fill();

                    // Side Stripe (Engine)
                    ctx.fillStyle = stripColor;
                    ctx.beginPath();
                    ctx.moveTo(car.x + 105, cy - 20); 
                    ctx.lineTo(car.x, cy - 20);       
                    ctx.lineTo(car.x, cy);            
                    ctx.lineTo(car.x + 90, cy);       
                    ctx.quadraticCurveTo(car.x + 100, cy - 10, car.x + 105, cy - 20);
                    ctx.fill();

                } else {
                    // Coach
                    ctx.fillRect(car.x, cy - 50, 150, 50);
                    // Stripe
                    ctx.fillStyle = stripColor;
                    ctx.fillRect(car.x, cy - 20, 150, 20);
                }

                // Pantograph (Power) - On 2nd car (Coach 1)
                if (i === 1) {
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(car.x + 40, cy - 50);
                    ctx.lineTo(car.x + 75, cy - 70); 
                    ctx.lineTo(car.x + 110, cy - 50); 
                    ctx.moveTo(car.x + 65, cy - 70);
                    ctx.lineTo(car.x + 85, cy - 70); 
                    ctx.stroke();
                }

                // Doors
                ctx.fillStyle = isSaffron ? '#404040' : '#e2e8f0';
                ctx.fillRect(car.x + 5, cy - 45, 12, 35); // Rear Door
                if (car.type !== 'engine') {
                    ctx.fillRect(car.x + 133, cy - 45, 12, 35); // Front Door
                }

                // Windows (Glowing)
                const winColor = (theme === 'dark' || vbTime > 0.45) ? '#fef08a' : '#1e293b';
                ctx.fillStyle = winColor;
                if(theme === 'dark') {
                    ctx.shadowColor = '#fef08a';
                    ctx.shadowBlur = 5;
                }
                car.windows.forEach(w => {
                    ctx.fillRect(car.x + w.x, cy - 40, w.width, 15);
                });
                ctx.shadowBlur = 0;

                // People
                if (Math.random() > 0.5) {
                    ctx.fillStyle = '#000';
                    car.windows.forEach(w => {
                        if (Math.random() > 0.7) {
                            ctx.beginPath();
                            ctx.arc(car.x + w.x + w.width / 2, cy - 30, 4, 0, Math.PI * 2);
                            ctx.fill();
                        }
                    });
                }

                // Wheels
                const wheelTime = Date.now() / 100;
                const drawWheel = (wx) => {
                    ctx.save();
                    ctx.translate(wx, cy + 5);
                    // Bogie Shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    ctx.fillRect(-12, -8, 24, 16);
                    
                    ctx.rotate(wheelTime);
                    ctx.fillStyle = '#171717';
                    ctx.beginPath();
                    ctx.arc(0, 0, 9, 0, Math.PI * 2);
                    ctx.fill();
                    // Chrome Hub
                    const hubGrad = ctx.createRadialGradient(0,0,0, 0,0,6);
                    hubGrad.addColorStop(0, '#fff');
                    hubGrad.addColorStop(1, '#525252');
                    ctx.fillStyle = hubGrad;
                    ctx.beginPath();
                    ctx.arc(0, 0, 6, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.restore();
                };
                drawWheel(car.x + 30);
                drawWheel(car.x + 120);

                // Connection
                if (i < vbTrain.length - 1) {
                    ctx.fillStyle = '#171717';
                    ctx.fillRect(car.x + 150, cy - 15, 10, 10);
                }
            });
        };
"""

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 1-indexed lines to 0-indexed indices
# Keep lines 1..2400 -> indices 0..2399
# Replaced block starts at 2402 (index 2401)
# Replaced block ends at 2840 (index 2839)
# Keep lines 2841..end -> indices 2840..end

prefix = lines[:2402] # Up to 2402 (exclusive) -> 0..2401
# Check last line of prefix
print(f"Last line of prefix (2402): {prefix[-1]}")

# Suffix starts from line 2841 -> index 2840
suffix = lines[2840:] # 2841..end

# Verify boundaries logic
# Line 2402 in file (index 2401) is "        const drawVandeBharat = () => {"
# Line 2841 in file (index 2840) is "const draw = () => {"

# Actually, verifying via print before writing is safer
# But I will just write because I am confident in the view_file data

final_content = "".join(prefix) + new_function + "\n" + "".join(suffix)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(final_content)

print("File updated successfully.")

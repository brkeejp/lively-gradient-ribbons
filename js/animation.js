/**
 * Lively Gradient Ribbons
 * Copyright (c) 2025 Berk Ege (brkee) All rights reserved.
 * Contact Information: brkee.jp@gmail.com
 */

// Configuration parameters
const c = document.getElementById('bgcanvas');
const ctx = c.getContext('2d');
function resize() { c.width = innerWidth; c.height = innerHeight; }
resize();
addEventListener('resize', resize);

let scale = ((innerWidth / 3440) + (innerHeight / 1440)) / 2;

let ribbonEnergy = new Array(6).fill(0);

let ribbons = [];
let selectedRibbons = [];
for (let i = 0; i < 30; i++) {
    ribbons.push({
        offset: (Math.random() * Math.PI * 2) * 20,
        speed: (0.0008 + Math.random() * 0.0010) * scale,
        color: Math.random() * 360, // stays static
        size: (40 + Math.random() * 80) * scale, // random ribbon radius
        thickness: (140 + Math.random() * 160) * scale, // how far waves swing
        reactivity: Math.random() * 5 // how strong each ribbon reacts
    });
}

function updateRibbonCount() {
	selectedRibbons = ribbons.slice(0, config.ribbonsCount);
}
updateRibbonCount();

let t = 0;
function draw() {
    ctx.fillStyle = config.backgroundColor || '#000000';
    ctx.fillRect(0, 0, c.width, c.height);

    selectedRibbons.forEach((r, i) => {
        const points = [];

        // Smooth amplitude per ribbon (slow movement)
        const amp = 1 + ribbonEnergy[i % 6] * r.reactivity * 1.2;

        for (let x = 0; x < c.width; x += 10) {
            const y =
                c.height / 2 +
                Math.sin(x * 0.002 + t * (r.speed * Math.sqrt(i + 1)) + r.offset) *
                r.thickness * amp *
                Math.sin(t * 0.00025 + i * 0.8) * config.ribbonsDiversity * 1;

            points.push({ x, y });
        }

        points.forEach(p => {
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r.size);
            g.addColorStop(0, `hsla(${r.color},90%,65%,0.25)`);
            g.addColorStop(1, `hsla(${(r.color + 60) % 360},90%,45%,0)`);

            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, r.size, 0, Math.PI * 2);
            ctx.fill();
        });
    });

    t += 1; // constant speed (no audio speed boost)
    requestAnimationFrame(draw);
}
requestAnimationFrame(draw);


function livelyAudioListener(audioArray) {
    if (!Array.isArray(audioArray) || audioArray.length !== 128) return;

    const bandSize = Math.floor(128 / 6);

    for (let b = 0; b < 6; b++) {
        let sum = 0;
        const start = b * bandSize;
        const end = b === 5 ? 128 : start + bandSize;

        // Weighted sensitivity: more response to mid/high
        for (let i = start; i < end; i++) {
            const level = Math.abs(audioArray[i]);
            const weight = 0.8 + (i / 128) * 1.6;  // gently bias highs
            sum += level * weight;
        }

        const raw = Math.min(sum / (end - start), 1);

        // Faster attack, medium release
        const attack = 0.5;   // speed up reaction
        const release = 0.1;  // controlled falloff

        if (raw > ribbonEnergy[b]) {
            ribbonEnergy[b] = ribbonEnergy[b] * (1 - attack) + raw * attack;
        } else {
            ribbonEnergy[b] = ribbonEnergy[b] * (1 - release) + raw * release;
        }
    }
}

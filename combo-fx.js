// Epic combo effects for the high combo tiers (5..10 = 200, 300, 400, 500, 750, 1000 clicks).
// CSS (style.css, body[data-combo-tier] / .combo[data-tier]) draws the panel itself;
// this module adds ONE shared canvas for particles (embers, plasma arcs, ice, black-hole
// spiral, shockwaves, sparks flying onto the Study button) plus one-shot tier-up moments
// (flash, shake, banner, sound). Everything is transform/opacity/canvas: no layout work per frame.

const TAU = Math.PI * 2;
const FIRST_FX_TIER = 5;
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const FIRE = ['#ff6a00', '#ffb347', '#ffe08a', '#ff3d00'];
const ICE = ['#7fe7ff', '#cfffff', '#ffffff', '#5aa9ff'];
const PLASMA = ['#7fd0ff', '#b57bff', '#ff7bf0', '#ffffff'];
const VOID = ['#b57bff', '#ffd27a', '#ffffff', '#7a3cff'];
const NUKE = ['#fff7a8', '#ffb300', '#ff6a00', '#ff2d2d'];
const RAINBOW = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#1dd1a1', '#ffffff'];
const PALETTE = { 5: FIRE, 6: PLASMA, 7: FIRE.concat(ICE), 8: VOID, 9: NUKE, 10: RAINBOW };

// Spawn rates (particles/second) per tier. Higher tiers combine the lower ideas.
// btn*: effects that live on the Study button itself and grow with the tier
// (toBtn = sparks flying from the panel, btnSpark = sparks off the rim,
// btnBolt = tiny lightning arcs, btnSpiral = particles swirling into the button).
const EMIT = {
    5: { ember: 38, toBtn: 4 },
    6: { spark: 26, bolt: 7, toBtn: 6, btnSpark: 6, btnBolt: 0.8 },
    7: { ember: 20, ice: 22, toBtn: 8, btnSpark: 14, btnBolt: 1.6 },
    8: { spiral: 40, star: 14, toBtn: 8, btnSpark: 10, btnSpiral: 18 },
    9: { radial: 46, toBtn: 22, btnSpark: 20, ringEvery: 1.4 },
    10: { spiral: 28, star: 10, radial: 30, toBtn: 30, btnSpark: 26, btnSpiral: 14, bolt: 4, btnBolt: 2, ringEvery: 1.0 }
};

const BANNER = {
    5: { icon: '🔥', text: 'SCHOLAR', sub: 'The panel is on fire!', ms: 1500 },
    6: { icon: '⚡', text: 'PROFESSOR', sub: 'Plasma surge!', ms: 1500 },
    7: { icon: '🔥❄️', text: 'GENIUS', sub: 'Fire and ice!', ms: 1600 },
    8: { icon: '🌀', text: 'PRODIGY', sub: 'A black hole opens...', ms: 1800 },
    9: { icon: '☢️', text: 'LEGEND', sub: 'NUCLEAR BLAST!', ms: 2400 },
    10: { icon: '🌟', text: 'ABSOLUTE MIND', sub: '1000 COMBO · SUPERNOVA OF THE MIND!', ms: 4000 }
};

export class ComboFx {
    constructor({ combo, button, sound, reduceMotion }) {
        this.combo = combo;
        this.button = button;
        this.sound = sound;
        this.reduce = reduceMotion;
        this.tier = 0;
        this.parts = [];
        this.rings = [];
        this.bolts = [];
        this.acc = {};
        this.ringTimer = 0;
        this.lastT = 0;
        this.rectCountdown = 0;
        this.pr = null;  // panel rect
        this.br = null;  // button rect
        this.canvas = null;
        this.ctx = null;
        this.dirty = false;  // canvas has pixels that must be cleared
        // Phones / weak CPUs get fewer particles and a lower canvas resolution
        const weak = window.matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency || 8) <= 4;
        this.maxParts = weak ? 80 : 220;
        this.dprCap = weak ? 1 : 1.5;
        this.bannerEl = null;
        this.bannerAnim = null;
        window.addEventListener('resize', () => this.resize());
    }

    // ===== Public API =====

    /** Called every frame (from the game loop) with the current tier (0 = no combo) */
    setTier(tier) {
        if (tier === this.tier) return;
        const prev = this.tier;
        this.tier = tier;
        document.body.dataset.comboTier = tier;
        if (tier > prev && tier >= FIRST_FX_TIER) this.onTierUp(tier);
        if (tier < FIRST_FX_TIER) this.ringTimer = 0;
        this.rectCountdown = 0;
    }

    /** Called every frame after setTier */
    update(now) {
        const dt = Math.min((now - this.lastT) / 1000, 0.05);
        this.lastT = now;
        if (this.reduce) return;
        const live = this.tier >= FIRST_FX_TIER;
        if (!live && !this.parts.length && !this.rings.length && !this.bolts.length) {
            if (this.dirty) this.clear();
            return;
        }
        if (!this.canvas) this.createCanvas();
        if (--this.rectCountdown <= 0) this.refreshRects();
        if (!this.pr) return;

        if (live) this.emit(dt);
        this.step(dt);
        this.draw();
    }

    // ===== Setup =====

    createCanvas() {
        const c = document.createElement('canvas');
        c.className = 'combo-fx-canvas';
        c.setAttribute('aria-hidden', 'true');
        document.body.appendChild(c);
        this.canvas = c;
        this.ctx = c.getContext('2d');
        this.resize();
    }

    resize() {
        if (!this.canvas) return;
        this.dpr = Math.min(window.devicePixelRatio || 1, this.dprCap);
        this.canvas.width = Math.ceil(window.innerWidth * this.dpr);
        this.canvas.height = Math.ceil(window.innerHeight * this.dpr);
    }

    refreshRects() {
        this.rectCountdown = 10;
        const p = this.combo.getBoundingClientRect();
        const b = this.button.getBoundingClientRect();
        this.pr = p.width ? p : null;
        this.br = b;
    }

    clear() {
        if (this.ctx) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.dirty = false;
    }

    // ===== Tier-up moments =====

    onTierUp(tier) {
        this.showBanner(tier);
        this.sound.playComboTier(tier);
        if (this.reduce) return;

        // Panel pop and a burst of the tier's colours (the combo pop itself lives in app.js)
        this.refreshRects();
        if (!this.pr) return;
        const cx = this.pr.left + this.pr.width / 2;
        const cy = this.pr.top + this.pr.height / 2;
        this.burstAt(cx, cy, tier >= 9 ? 40 : 24, PALETTE[tier]);
        this.addRing(cx, cy, PALETTE[tier][0], 220, 0, 3);

        if (tier < 9 && this.br) {
            // Lower tiers: a small share of the effect hops onto the Study button
            const bx = this.br.left + this.br.width / 2;
            const by = this.br.top + this.br.height / 2;
            this.burstAt(bx, by, 6 + (tier - 5) * 4, PALETTE[tier]);
            this.addRing(bx, by, PALETTE[tier][0], this.br.width * (0.8 + (tier - 5) * 0.1), 0.1, 2 + (tier - 5) * 0.5);
        }
        if (tier >= 9) {
            this.flash(tier === 10 ? 'rgba(255,255,255,0.95)' : 'rgba(255,170,60,0.85)', tier === 10 ? 900 : 600);
            this.shake(this.combo, tier === 10 ? 10 : 7, 600);
            this.shake(document.querySelector('.play'), tier === 10 ? 5 : 3, 700);
            for (let i = 0; i < (tier === 10 ? 4 : 2); i++) {
                this.addRing(cx, cy, pick(PALETTE[tier]), Math.max(window.innerWidth, 600) * 0.7, i * 0.18, 5);
            }
            // Sparks leap onto the Study button
            const bx = this.br.left + this.br.width / 2;
            const by = this.br.top + this.br.height / 2;
            this.burstAt(bx, by, tier === 10 ? 36 : 22, PALETTE[tier]);
            this.addRing(bx, by, PALETTE[tier][1], this.br.width * 1.2, 0.1, 4);
        }
    }

    flash(color, ms) {
        const f = document.createElement('div');
        f.className = 'combo-flash';
        f.style.background = `radial-gradient(circle at 50% 60%, ${color}, rgba(255,255,255,0) 85%), ${color}`;
        document.body.appendChild(f);
        f.animate([{ opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 0 }], { duration: ms, easing: 'ease-out' })
            .onfinish = () => f.remove();
    }

    shake(el, amp, ms) {
        if (!el) return;
        const frames = [{ transform: 'translate(0,0)' }];
        for (let i = 1; i < 10; i++) {
            const k = amp * (1 - i / 10);
            frames.push({ transform: `translate(${rnd(-k, k).toFixed(1)}px, ${rnd(-k, k).toFixed(1)}px)` });
        }
        frames.push({ transform: 'translate(0,0)' });
        el.animate(frames, { duration: ms, easing: 'linear' });
    }

    showBanner(tier) {
        const cfg = BANNER[tier];
        if (!cfg) return;
        if (!this.bannerEl) {
            const b = document.createElement('div');
            b.className = 'combo-banner';
            b.setAttribute('aria-hidden', 'true');
            b.innerHTML = '<div class="combo-banner-title"></div><div class="combo-banner-sub"></div>';
            document.body.appendChild(b);
            this.bannerEl = b;
        }
        const b = this.bannerEl;
        b.dataset.tier = tier;
        b.firstChild.textContent = `${cfg.icon} ${cfg.text} ${cfg.icon}`;
        b.lastChild.textContent = cfg.sub;
        if (this.bannerAnim) this.bannerAnim.cancel();
        const keys = this.reduce
            ? [{ opacity: 0 }, { opacity: 1, offset: 0.1 }, { opacity: 1, offset: 0.8 }, { opacity: 0 }]
            : [
                { opacity: 0, transform: 'translate(-50%, 0) scale(2.4)' },
                { opacity: 1, transform: 'translate(-50%, 0) scale(1)', offset: 0.1 },
                { opacity: 1, transform: 'translate(-50%, 0) scale(1.06)', offset: 0.2 },
                { opacity: 1, transform: 'translate(-50%, 0) scale(1)', offset: 0.8 },
                { opacity: 0, transform: 'translate(-50%, -20px) scale(0.9)' }
            ];
        this.bannerAnim = b.animate(keys, { duration: cfg.ms, easing: 'ease-out', fill: 'both' });
    }

    // ===== Particles =====

    add(p) {
        if (this.parts.length >= this.maxParts) return;
        this.parts.push(p);
    }

    addRing(x, y, color, max, delay, lw) {
        if (this.rings.length < 8) this.rings.push({ x, y, r: 8, max, color, delay, lw, t: 0 });
    }

    burstAt(x, y, n, palette) {
        for (let i = 0; i < n; i++) this.spawnSpark(x, y, palette, rnd(120, 320), 0.5 + Math.random() * 0.5);
    }

    spawnSpark(x, y, palette, speed, life) {
        const a = rnd(0, TAU);
        this.add({
            k: 'spark', x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed,
            life, max: life, size: rnd(1.5, 3.2), color: pick(palette)
        });
    }

    emit(dt) {
        const e = EMIT[this.tier];
        const pr = this.pr;
        const pal = PALETTE[this.tier];
        const cx = pr.left + pr.width / 2;
        const cy = pr.top + pr.height / 2;
        const n = (key, rate) => {
            this.acc[key] = (this.acc[key] || 0) + rate * dt;
            const c = Math.floor(this.acc[key]);
            this.acc[key] -= c;
            return c;
        };

        for (let i = n('ember', e.ember || 0); i > 0; i--) {
            // Tier 7 splits the panel: fire on the left half only
            const x = this.tier === 7 ? rnd(pr.left, cx) : rnd(pr.left, pr.right);
            const life = rnd(0.8, 1.4);
            this.add({ k: 'ember', x, y: rnd(cy, pr.bottom - 4), vx: rnd(-14, 14), vy: -rnd(40, 110), life, max: life, size: rnd(2, 4.2), color: pick(this.tier === 7 ? FIRE : pal), ph: rnd(0, TAU) });
        }
        for (let i = n('ice', e.ice || 0); i > 0; i--) {
            const life = rnd(1, 1.7);
            this.add({ k: 'ice', x: rnd(cx, pr.right), y: pr.top + rnd(0, 10), vx: rnd(-10, 22), vy: rnd(18, 55), life, max: life, size: rnd(2, 4), color: pick(ICE), ph: rnd(0, TAU) });
        }
        for (let i = n('spark', e.spark || 0); i > 0; i--) {
            const x = rnd(pr.left, pr.right);
            const y = pick([pr.top, pr.bottom]);
            this.spawnSpark(x, y, pal, rnd(50, 150), rnd(0.25, 0.5));
        }
        for (let i = n('radial', e.radial || 0); i > 0; i--) {
            this.spawnSpark(rnd(pr.left, pr.right), rnd(pr.top, pr.bottom), pal, rnd(90, 260), rnd(0.4, 0.8));
        }
        for (let i = n('spiral', e.spiral || 0); i > 0; i--) {
            const r = rnd(110, 190);
            this.add({ k: 'spiral', cx, cy, r, a: rnd(0, TAU), w: rnd(1.4, 2.4), vr: rnd(40, 70), px: 0, py: 0, life: 1, max: 1, size: rnd(1.5, 2.8), color: pick(pal), trail: true });
        }
        for (let i = n('star', e.star || 0); i > 0; i--) {
            const r = rnd(60, 220);
            const life = rnd(0.9, 1.8);
            this.add({ k: 'spiral', cx, cy, r, a: rnd(0, TAU), w: rnd(0.3, 0.7), vr: rnd(2, 10), px: 0, py: 0, life, max: life, size: rnd(1, 2), color: '#ffffff', trail: false, twinkle: true });
        }
        if (this.br) {
            for (let i = n('toBtn', e.toBtn || 0); i > 0; i--) {
                const sx = rnd(pr.left, pr.right);
                const sy = pr.bottom;
                const life = rnd(0.45, 0.8);
                this.add({
                    k: 'toBtn', sx, sy, ex: this.br.left + this.br.width * rnd(0.2, 0.8), ey: this.br.top + this.br.height * rnd(0.2, 0.7),
                    bend: rnd(-60, 60), t: 0, life, max: life, size: rnd(2, 3.6), color: pick(pal), x: sx, y: sy, px: sx, py: sy
                });
            }
        }
        if (e.bolt) for (let i = n('bolt', e.bolt); i > 0; i--) this.spawnBolt(pal);
        if (this.br) this.emitButton(e, n, pal);

        if (e.ringEvery) {
            this.ringTimer -= dt;
            if (this.ringTimer <= 0) {
                this.ringTimer = e.ringEvery;
                this.addRing(cx, cy, pick(pal), 190, 0, 3);
                if (this.br) this.addRing(this.br.left + this.br.width / 2, this.br.top + this.br.height / 2, pick(pal), this.br.width * 0.8, 0.15, 3);
            }
        }
    }

    /** Effects hugging the Study button (tiers 6+) */
    emitButton(e, n, pal) {
        const br = this.br;
        const bx = br.left + br.width / 2;
        const by = br.top + br.height / 2;
        const rad = br.width / 2;
        for (let i = n('btnSpark', e.btnSpark || 0); i > 0; i--) {
            // Spark leaves the rim, mostly outward
            const a = rnd(0, TAU);
            const sp = rnd(40, 120);
            const life = rnd(0.25, 0.5);
            this.add({
                k: 'spark', x: bx + Math.cos(a) * rad * 0.95, y: by + Math.sin(a) * rad * 0.95,
                vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 20, life, max: life, size: rnd(1.4, 2.6), color: pick(pal)
            });
        }
        for (let i = n('btnSpiral', e.btnSpiral || 0); i > 0; i--) {
            const life = rnd(0.9, 1.5);
            this.add({
                k: 'spiral', cx: bx, cy: by, r: rad * rnd(0.55, 0.8), a: rnd(0, TAU), w: rnd(1.6, 2.6), vr: rad * rnd(0.12, 0.25),
                px: 0, py: 0, life, max: life, size: rnd(1.3, 2.4), color: pick(pal), trail: true, rmin: rad * 0.25
            });
        }
        for (let i = n('btnBolt', e.btnBolt || 0); i > 0; i--) {
            if (this.bolts.length > 6) break;
            // A short arc off the rim
            const a = rnd(0, TAU);
            const sx = bx + Math.cos(a) * rad * 0.98;
            const sy = by + Math.sin(a) * rad * 0.98;
            const len = rnd(18, 42);
            const ex = sx + Math.cos(a + rnd(-0.5, 0.5)) * len;
            const ey = sy + Math.sin(a + rnd(-0.5, 0.5)) * len;
            const pts = [[sx, sy]];
            for (let k = 1; k < 4; k++) {
                const t = k / 4;
                pts.push([sx + (ex - sx) * t + rnd(-5, 5), sy + (ey - sy) * t + rnd(-5, 5)]);
            }
            pts.push([ex, ey]);
            this.bolts.push({ pts, life: 0.12, max: 0.12, color: pick(pal) });
        }
    }

    spawnBolt(palette) {
        if (this.bolts.length > 6) return;
        const pr = this.pr;
        const side = Math.random();
        // Start on the panel edge, end a short way outside it
        const sx = rnd(pr.left, pr.right);
        const sy = side < 0.5 ? pr.top : pr.bottom;
        const dir = side < 0.5 ? -1 : 1;
        const ex = sx + rnd(-70, 70);
        const ey = sy + dir * rnd(25, 70);
        const pts = [[sx, sy]];
        const segs = 7;
        for (let i = 1; i < segs; i++) {
            const t = i / segs;
            pts.push([sx + (ex - sx) * t + rnd(-10, 10), sy + (ey - sy) * t + rnd(-10, 10)]);
        }
        pts.push([ex, ey]);
        this.bolts.push({ pts, life: 0.14, max: 0.14, color: pick(palette) });
    }

    step(dt) {
        const ps = this.parts;
        for (let i = ps.length - 1; i >= 0; i--) {
            const p = ps[i];
            p.life -= dt;
            let dead = p.life <= 0;
            if (p.k === 'spark') {
                p.x += p.vx * dt; p.y += p.vy * dt;
                p.vx *= 0.94; p.vy = p.vy * 0.94 + 40 * dt;
            } else if (p.k === 'ember') {
                p.ph += dt * 6;
                p.x += (p.vx + Math.sin(p.ph) * 22) * dt; p.y += p.vy * dt;
            } else if (p.k === 'ice') {
                p.ph += dt * 3;
                p.x += (p.vx + Math.sin(p.ph) * 18) * dt; p.y += p.vy * dt;
            } else if (p.k === 'spiral') {
                p.px = p.cx + Math.cos(p.a) * p.r * 1.5;
                p.py = p.cy + Math.sin(p.a) * p.r * 0.7;
                // Falls in faster as it nears the hole
                p.a += p.w * dt * (1 + 90 / (p.r + 20));
                p.r -= p.vr * dt * (1 + 60 / (p.r + 20));
                p.x = p.cx + Math.cos(p.a) * p.r * 1.5;
                p.y = p.cy + Math.sin(p.a) * p.r * 0.7;
                if (p.r < (p.rmin || 10)) dead = true;
            } else if (p.k === 'toBtn') {
                p.t += dt / p.max;
                const t = Math.min(p.t, 1);
                p.px = p.x; p.py = p.y;
                const mx = (p.sx + p.ex) / 2 + p.bend;
                const my = (p.sy + p.ey) / 2;
                p.x = (1 - t) * (1 - t) * p.sx + 2 * (1 - t) * t * mx + t * t * p.ex;
                p.y = (1 - t) * (1 - t) * p.sy + 2 * (1 - t) * t * my + t * t * p.ey;
                if (p.t >= 1) {
                    dead = true;
                    for (let k = 0; k < 2; k++) this.spawnSpark(p.ex, p.ey, PALETTE[this.tier] || FIRE, rnd(40, 110), rnd(0.2, 0.4));
                }
            }
            if (dead) { ps[i] = ps[ps.length - 1]; ps.pop(); }
        }
        for (let i = this.rings.length - 1; i >= 0; i--) {
            const r = this.rings[i];
            if (r.delay > 0) { r.delay -= dt; continue; }
            r.t += dt / 0.8;
            r.r = 8 + (r.max - 8) * (1 - Math.pow(1 - Math.min(r.t, 1), 3));
            if (r.t >= 1) this.rings.splice(i, 1);
        }
        for (let i = this.bolts.length - 1; i >= 0; i--) {
            this.bolts[i].life -= dt;
            if (this.bolts[i].life <= 0) this.bolts.splice(i, 1);
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineCap = 'round';
        this.dirty = true;

        for (const p of this.parts) {
            const f = Math.max(p.life / p.max, 0);
            ctx.fillStyle = p.color;
            ctx.strokeStyle = p.color;
            if (p.k === 'spark') {
                ctx.globalAlpha = f;
                ctx.lineWidth = p.size;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
                ctx.stroke();
            } else if (p.k === 'ember') {
                ctx.globalAlpha = f * 0.9;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * (0.4 + f * 0.6), 0, TAU);
                ctx.fill();
            } else if (p.k === 'ice') {
                ctx.globalAlpha = Math.min(f * 1.5, 0.9);
                const s = p.size;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y - s * 1.6);
                ctx.lineTo(p.x + s, p.y);
                ctx.lineTo(p.x, p.y + s * 1.6);
                ctx.lineTo(p.x - s, p.y);
                ctx.fill();
            } else if (p.k === 'spiral') {
                const fade = p.twinkle ? Math.sin(Math.PI * (1 - f)) * (0.6 + Math.random() * 0.4) : Math.min(1, p.r / 40);
                ctx.globalAlpha = fade;
                if (p.trail) {
                    ctx.lineWidth = p.size;
                    ctx.beginPath();
                    ctx.moveTo(p.px, p.py);
                    ctx.lineTo(p.x, p.y);
                    ctx.stroke();
                } else {
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, TAU);
                    ctx.fill();
                }
            } else if (p.k === 'toBtn') {
                ctx.globalAlpha = 0.95;
                ctx.lineWidth = p.size;
                ctx.beginPath();
                ctx.moveTo(p.px, p.py);
                ctx.lineTo(p.x, p.y);
                ctx.stroke();
            }
        }
        for (const r of this.rings) {
            if (r.delay > 0) continue;
            ctx.globalAlpha = Math.max(1 - r.t, 0) * 0.85;
            ctx.strokeStyle = r.color;
            ctx.lineWidth = r.lw * (1 - r.t * 0.6);
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, TAU);
            ctx.stroke();
        }
        for (const b of this.bolts) {
            const f = b.life / b.max;
            ctx.beginPath();
            ctx.moveTo(b.pts[0][0], b.pts[0][1]);
            for (let i = 1; i < b.pts.length; i++) ctx.lineTo(b.pts[i][0], b.pts[i][1]);
            ctx.globalAlpha = f * 0.5; ctx.strokeStyle = b.color; ctx.lineWidth = 4;
            ctx.stroke();
            ctx.globalAlpha = f; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.3;
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }
}

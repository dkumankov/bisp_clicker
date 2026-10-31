// Study-button effects start at tier 1 (CSS surface layer + flares landing on it).
// Epic combo effects for the high combo tiers (5..10 = 200, 300, 400, 500, 750, 1000 clicks)
// and the school-themed tiers 11..22 (1250 .. 20000 clicks: chalk, quiz, science, books, magic,
// rockets, robots, time, galaxy, Nobel, quantum, Big Bang), each with its own particles, a
// persistent decoration around the Study button (DECOR) and a signature burst on tier-up.
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
const WARM = ['#ffb347', '#ffe08a', '#ff9f43'];
// Tiers 1-4 follow the panel fills (orange, red, purple, rainbow) — keep in sync with the
// "Tier palette" block in style.css, which is the source of truth for panel AND button.
const T1 = ['#ff9f43', '#ffc27a', '#ffe0b8'];
const T2 = ['#ee5253', '#ff7b7b', '#ffb3b3'];
const T3 = ['#9c27b0', '#d36bff', '#f0b3ff'];
// Tiers 11-22 mirror their rows in the style.css tier palette too
const CHALK = ['#ffffff', '#e8f5e9', '#a5d6a7', '#fff59d'];
const QUIZ = ['#ff4081', '#ffeb3b', '#00e5ff', '#76ff03', '#ffffff'];
const SCIENCE = ['#64ffda', '#1de9b6', '#b2ff59', '#e0f7fa'];
const BOOK = ['#fff8e1', '#ffe0b2', '#ffecb3', '#ffffff'];
const MAGIC = ['#b388ff', '#ffd740', '#e040fb', '#ffffff'];
const ROCKET = ['#ff9100', '#ffea00', '#40c4ff', '#ffffff'];
const ROBOT = ['#00e676', '#18ffff', '#69f0ae', '#ccff90'];
const TIME = ['#ffd180', '#ffab40', '#80deea', '#fff3e0'];
const GALAXY = ['#7c4dff', '#ff80ab', '#40c4ff', '#ffffff', '#b388ff'];
const GOLD = ['#ffd700', '#ffecb3', '#ffc107', '#fff8e1'];
const QUANTUM = ['#00e5ff', '#ff1744', '#d500f9', '#ffffff'];
const COSMIC = RAINBOW.concat(GOLD, ['#ffffff']);
const PALETTE = {
    1: T1, 2: T2, 3: T3, 4: RAINBOW, 5: FIRE, 6: PLASMA, 7: FIRE.concat(ICE), 8: VOID, 9: NUKE, 10: RAINBOW,
    11: CHALK, 12: QUIZ, 13: SCIENCE, 14: BOOK, 15: MAGIC, 16: ROCKET, 17: ROBOT, 18: TIME, 19: GALAXY, 20: GOLD, 21: QUANTUM, 22: COSMIC
};

// Spawn rates (particles/second) per tier. Higher tiers combine the lower ideas.
// btn*: effects that live on the Study button itself and grow with the tier
// (toBtn = sparks flying from the panel, btnSpark = sparks off the rim,
// btnBolt = tiny lightning arcs, btnSpiral = particles swirling into the button).
// surf = flares that ignite ON the button surface (toBtn sparks also land and flare there).
const EMIT = {
    // Tiers 1-4 (10..100 clicks): the button warms up.
    1: { surf: 1.5, toBtn: 0.4 },
    2: { btnSpark: 0.8, surf: 3, toBtn: 0.9 },
    3: { btnSpark: 2, btnEmber: 3, toBtn: 1.8, surf: 6 },
    4: { btnSpark: 4, btnEmber: 7, toBtn: 3, surf: 10 },
    5: { ember: 38, toBtn: 6, surf: 18, btnEmber: 6 },
    6: { spark: 26, bolt: 7, toBtn: 7, btnSpark: 6, btnBolt: 0.8, surf: 16 },
    7: { ember: 20, ice: 22, toBtn: 9, btnSpark: 14, btnBolt: 1.6, surf: 18 },
    8: { spiral: 40, star: 14, toBtn: 9, btnSpark: 10, btnSpiral: 18, surf: 14 },
    9: { radial: 46, toBtn: 22, btnSpark: 20, ringEvery: 1.4, surf: 32 },
    10: { spiral: 28, star: 10, radial: 30, toBtn: 30, btnSpark: 26, btnSpiral: 14, bolt: 4, btnBolt: 2, ringEvery: 1.0, surf: 30 },
    // Tiers 11-22: keys with a SPAWN entry below, plus the shared toBtn / surf / btnSpark / star
    11: { chalk: 9, btnScribble: 3, btnChalk: 8, toBtn: 7, surf: 10 },
    12: { quiz: 4, confetti: 24, btnConfetti: 10, btnQuiz: 2.5, toBtn: 6, surf: 8 },
    13: { bubble: 16, fizz: 22, btnBubble: 7, toBtn: 5 },
    14: { page: 12, btnPage: 9, toBtn: 6, surf: 8 },
    15: { rune: 4, star: 14, toBtn: 8, surf: 12 },
    16: { rocket: 2.5, btnRocket: 3.5, btnSpark: 8, toBtn: 6, surf: 10 },
    17: { binary: 20, btnTrace: 5, trace: 3, surf: 8 },
    18: { clock: 0.9, sand: 26, btnSpark: 6, toBtn: 6 },
    19: { planet: 0.9, nebula: 6, star: 14, toBtn: 6 },
    20: { coin: 9, btnCoin: 4, btnSpark: 8, toBtn: 8, surf: 12 },
    21: { qbit: 2.5, btnQbit: 2.5, toBtn: 6, surf: 10 },
    22: { streak: 28, confetti: 6, coin: 2.5, bubble: 4, planet: 0.4, toBtn: 10, surf: 14, bangEvery: 2.2 }
};

const BANNER = {
    5: { icon: '🔥', text: 'SCHOLAR', sub: 'The panel is on fire!', ms: 1500 },
    6: { icon: '⚡', text: 'PROFESSOR', sub: 'Plasma surge!', ms: 1500 },
    7: { icon: '🔥❄️', text: 'GENIUS', sub: 'Fire and ice!', ms: 1600 },
    8: { icon: '🌀', text: 'PRODIGY', sub: 'A black hole opens...', ms: 1800 },
    9: { icon: '☢️', text: 'LEGEND', sub: 'NUCLEAR BLAST!', ms: 2400 },
    10: { icon: '🌟', text: 'ABSOLUTE MIND', sub: '1000 COMBO · SUPERNOVA OF THE MIND!', ms: 4000 },
    11: { icon: '🖍️', text: 'CHALK STORM', sub: 'The blackboard explodes!', ms: 1600 },
    12: { icon: '❓', text: 'POP QUIZ', sub: 'Surprise! You know every answer!', ms: 1600 },
    13: { icon: '🧪', text: 'SCIENCE FAIR', sub: 'It is fizzing!', ms: 1600 },
    14: { icon: '📚', text: 'BOOK TORNADO', sub: 'The whole library takes off!', ms: 1700 },
    15: { icon: '🧙', text: 'MATH WIZARD', sub: 'π · √ · ∑ — pure magic!', ms: 2400, big: 1, flash: 'rgba(179,136,255,0.8)' },
    16: { icon: '🚀', text: 'ROCKET LAB', sub: '3... 2... 1... LIFTOFF!', ms: 1800 },
    17: { icon: '🤖', text: 'ROBOT BRAIN', sub: '5000 COMBO · BEEP BOOP!', ms: 2400, big: 1, flash: 'rgba(0,230,118,0.75)' },
    18: { icon: '⏰', text: 'TIME MACHINE', sub: 'Time bends around you!', ms: 1800 },
    19: { icon: '🪐', text: 'GALAXY BRAIN', sub: 'Planets orbit your brain!', ms: 2000 },
    20: { icon: '🏅', text: 'NOBEL PRIZE', sub: '10 000 COMBO · THE WORLD APPLAUDS!', ms: 4000, big: 2, flash: 'rgba(255,215,0,0.9)' },
    21: { icon: '⚛️', text: 'QUANTUM LEAP', sub: 'You are in two places at once!', ms: 2000 },
    22: { icon: '💥', text: 'BIG BANG', sub: '20 000 COMBO · A NEW UNIVERSE OF KNOWLEDGE!', ms: 4500, big: 2, flash: 'rgba(255,255,255,0.95)' }
};
// Old finale tiers keep their exact moments: 9 = blast, 10 = supernova
BANNER[9].big = 1; BANNER[9].flash = 'rgba(255,170,60,0.85)';
BANNER[10].big = 2; BANNER[10].flash = 'rgba(255,255,255,0.95)';

// Tier-up signature: a handful of the tier's own particles bursts out of the Study button
const SIGNATURE = {
    11: ['btnChalk', 10], 12: ['btnConfetti', 18], 13: ['btnBubble', 12], 14: ['btnPage', 10], 15: ['rune', 8], 16: ['btnRocket', 5],
    17: ['btnTrace', 8], 18: ['clock', 2], 19: ['planet', 3], 20: ['btnCoin', 14], 21: ['btnQbit', 4], 22: ['streak', 30]
};
// Kinds drawn with normal blending (solid paper, coins, smoke...); the rest glow (additive)
const SOLID = { confetti: 1, page: 1, smoke: 1, coin: 1, planet: 1, quizGlyph: 1 };
const QUIZ_CHARS = ['?', '!', 'A+', '✓', '100', '★'];
const RUNES = ['π', '√', '∑', '∞', '÷', '×', '=', '%'];

const FADE_S = 0.3;  // orphaned particles fade out over this long when the streak resets / tier drops

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
        this.weak = weak;
        this.dprCap = weak ? 1 : 1.5;
        this.setBudget();
        this.decor = { tier: 0, a: 0 };  // persistent decoration around the button, fades between tiers
        this.time = 0;
        this.bannerEl = null;
        this.bannerAnim = null;
        window.addEventListener('resize', () => { this.setBudget(); this.resize(); });
    }

    /** Particle budget: one global cap, smaller on phones / weak CPUs and on narrow screens; spawn rates scale with it */
    setBudget() {
        const small = window.innerWidth < 420;
        this.maxParts = small ? 60 : this.weak ? 80 : 220;
        this.rateScale = small ? 0.45 : this.weak ? 0.6 : 1;
    }

    // ===== Public API =====

    /** Called every frame (from the game loop) with the current tier (0 = no combo) */
    setTier(tier) {
        if (tier === this.tier) return;
        const prev = this.tier;
        this.tier = tier;
        document.body.dataset.comboTier = tier;
        // CSS: "1" = the hand-made tiers 5-10, "2" = the generic school tiers 11+ (palette-driven layers)
        if (tier >= FIRST_FX_TIER) document.body.dataset.comboEpic = tier >= 11 ? '2' : '1';
        else delete document.body.dataset.comboEpic;
        if (tier > prev && tier >= FIRST_FX_TIER) this.onTierUp(tier);
        else if (tier > prev && tier >= 2) this.onLowTierUp(tier);
        if (tier < FIRST_FX_TIER) this.ringTimer = 0;
        if (tier < prev) this.fadeOut();
        this.rectCountdown = 0;
    }

    /** Everything alive right now fades out over FADE_S (streak reset or tier drop); later emissions are unaffected */
    fadeOut() {
        this.acc = {};
        for (const list of [this.parts, this.rings, this.bolts]) {
            for (const o of list) if (o.fo === undefined) o.fo = FADE_S;
        }
    }

    /** Called every frame after setTier */
    update(now) {
        const dt = Math.min((now - this.lastT) / 1000, 0.05);
        this.lastT = now;
        if (this.reduce) return;
        this.time += dt;
        const live = !!EMIT[this.tier];
        this.stepDecor(dt);
        if (!live && !this.parts.length && !this.rings.length && !this.bolts.length && !this.decor.a) {
            if (this.dirty) this.clear();
            return;
        }
        if (!this.canvas) this.createCanvas();
        if (--this.rectCountdown <= 0) this.refreshRects();

        if (live && this.pr) this.emit(dt);
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
        this.lastFont = null;  // resizing the canvas resets the context state
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
        const big = (BANNER[tier] && BANNER[tier].big) || 0;
        const pal = PALETTE[tier];
        const cx = this.pr.left + this.pr.width / 2;
        const cy = this.pr.top + this.pr.height / 2;
        const bx = this.br.left + this.br.width / 2;
        const by = this.br.top + this.br.height / 2;
        this.burstAt(cx, cy, big ? 40 : 24, pal);
        this.addRing(cx, cy, pal[0], 220, 0, 3);

        if (!big && this.br) {
            // Lower tiers: a small share of the effect hops onto the Study button
            const k = Math.min(tier - 5, 4);
            this.burstAt(bx, by, 6 + k * 4, pal);
            this.addRing(bx, by, pal[0], this.br.width * (0.8 + k * 0.1), 0.1, 2 + k * 0.5);
        }
        if (big) {
            this.flash(BANNER[tier].flash, big === 2 ? 900 : 600);
            this.shake(this.combo, big === 2 ? 10 : 7, 600);
            this.shake(document.querySelector('.play'), big === 2 ? 5 : 3, 700);
            for (let i = 0; i < (big === 2 ? 4 : 2); i++) {
                this.addRing(cx, cy, pick(pal), Math.max(window.innerWidth, 600) * 0.7, i * 0.18, 5);
            }
            // Sparks leap onto the Study button
            this.burstAt(bx, by, big === 2 ? 36 : 22, pal);
            this.addRing(bx, by, pal[1], this.br.width * 1.2, 0.1, 4);
        }
        const sig = SIGNATURE[tier];
        if (sig) {
            const g = this.geom();
            for (let i = 0; i < sig[1]; i++) SPAWN[sig[0]].call(this, g, pal);
        }
    }

    /** Tiers 2-4: a small warm pop on the Study button */
    onLowTierUp(tier) {
        if (this.reduce) return;
        this.refreshRects();
        if (!this.br) return;
        const bx = this.br.left + this.br.width / 2;
        const by = this.br.top + this.br.height / 2;
        this.burstAt(bx, by, 3 * (tier - 1), PALETTE[tier]);
        this.addRing(bx, by, PALETTE[tier][0], this.br.width * (0.65 + (tier - 2) * 0.08), 0, 1.5 + (tier - 2) * 0.5);
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
        const scale = this.rateScale;
        const n = (key, rate) => {
            this.acc[key] = (this.acc[key] || 0) + rate * scale * dt;
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

        // School tiers (11+): every key with a spawner
        if (this.tier >= 11 && this.br) {
            const g = this.geom();
            for (const key in e) {
                const fn = SPAWN[key];
                if (fn) for (let i = n(key, e[key]); i > 0; i--) fn.call(this, g, pal);
            }
            if (e.bangEvery) {
                this.bangTimer = (this.bangTimer || 0) - dt;
                if (this.bangTimer <= 0) {
                    this.bangTimer = e.bangEvery;
                    this.addRing(g.bx, g.by, '#ffffff', g.rad * 3.2, 0, 4);
                    this.addRing(g.bx, g.by, pick(pal), g.rad * 2.2, 0.12, 3);
                    this.burstAt(g.bx, g.by, 14, pal);
                    for (let i = 0; i < 10; i++) SPAWN.streak.call(this, g, pal);
                }
            }
        }

        if (e.ringEvery) {
            this.ringTimer -= dt;
            if (this.ringTimer <= 0) {
                this.ringTimer = e.ringEvery;
                this.addRing(cx, cy, pick(pal), 190, 0, 3);
                if (this.br) this.addRing(this.br.left + this.br.width / 2, this.br.top + this.br.height / 2, pick(pal), this.br.width * 0.8, 0.15, 3);
            }
        }
    }

    /** Effects hugging the Study button (tiers 2+) */
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
        for (let i = n('btnEmber', e.btnEmber || 0); i > 0; i--) {
            // Coals drift up off the top half of the button
            const a = rnd(Math.PI * 1.1, Math.PI * 1.9);
            const life = rnd(0.7, 1.2);
            this.add({
                k: 'ember', x: bx + Math.cos(a) * rad * 0.85, y: by + Math.sin(a) * rad * 0.85,
                vx: rnd(-10, 10), vy: -rnd(30, 70), life, max: life, size: rnd(1.6, 3), color: pick(pal), ph: rnd(0, TAU)
            });
        }
        for (let i = n('surf', e.surf || 0); i > 0; i--) {
            // A flare ignites on the button surface and burns out there
            this.spawnSurf(bx, by, rad, null);
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

    /** Flare on the button surface. (x, y) = landing point, or null for a random spot on the disc. */
    spawnSurf(bx, by, rad, at) {
        const tier = this.tier;
        let x, y;
        if (at) { x = at[0]; y = at[1]; } else {
            const a = rnd(0, TAU), r = rad * 0.9 * Math.sqrt(Math.random());
            x = bx + Math.cos(a) * r; y = by + Math.sin(a) * r;
            if (tier === 5 || tier === 9) y = by + rad * rnd(-0.2, 0.85);  // fire licks the lower part more
        }
        let color = pick(PALETTE[tier] || WARM);
        let vy = -rnd(10, 34), vx = rnd(-8, 8);
        const life = rnd(0.35, 0.9);
        if (tier === 7) {                       // left half fire, right half frost
            const fire = x < bx;
            color = pick(fire ? FIRE : ICE);
            if (!fire) { vy = rnd(-4, 4); vx = rnd(-4, 4); }
        }
        if (tier === 6) { vy = rnd(-20, 20); vx = rnd(-20, 20); }
        this.add({ k: 'surf', x, y, vx, vy, bx, by, rr: rad * 0.94, life, max: life, size: rnd(1.6, 3.4), color, pull: tier === 8, sq: tier === 7 && x >= bx, ph: rnd(0, TAU) });
    }

    /** Panel and button geometry for the spawners (rects refreshed every few frames) */
    geom() {
        const pr = this.pr || this.br, br = this.br;
        const rad = br.width / 2;
        return {
            pr, br, rad,
            cx: pr.left + pr.width / 2, cy: pr.top + pr.height / 2,
            bx: br.left + rad, by: br.top + br.height / 2
        };
    }

    /** The decoration follows the tier: fades out, switches, fades in */
    stepDecor(dt) {
        const d = this.decor;
        const target = DECOR[this.tier] ? this.tier : 0;
        if (d.tier !== target) {
            d.a = Math.max(0, d.a - dt / FADE_S);
            if (d.a === 0) d.tier = target;
        } else if (d.tier) {
            d.a = Math.min(1, d.a + dt / 0.4);
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
            if (p.fo !== undefined && (p.fo -= dt) <= 0) dead = true;
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
                if (p.t >= 1 && p.fo === undefined) {
                    dead = true;
                    // Lands: a few sparks bounce off and the rest flare on the surface
                    this.spawnSpark(p.ex, p.ey, PALETTE[this.tier] || FIRE, rnd(40, 110), rnd(0.2, 0.4));
                    if (this.br) {
                        const rad = this.br.width / 2;
                        const bx = this.br.left + rad, by = this.br.top + this.br.height / 2;
                        for (let k = 0; k < 3; k++) this.spawnSurf(bx, by, rad, [p.ex + rnd(-6, 6), p.ey + rnd(-6, 6)]);
                    }
                }
            } else if (p.k === 'surf') {
                p.ph += dt * 9;
                p.x += (p.vx + Math.sin(p.ph) * 6) * dt; p.y += p.vy * dt;
                if (p.pull) {                   // gravity: drawn into the centre
                    p.x += (p.bx - p.x) * 1.6 * dt; p.y += (p.by - p.y) * 1.6 * dt;
                }
                if (Math.hypot(p.x - p.bx, p.y - p.by) > p.rr) dead = true;
            } else if (STEP[p.k]) {
                if (STEP[p.k].call(this, p, dt)) dead = true;
            }
            if (dead) { ps[i] = ps[ps.length - 1]; ps.pop(); }
        }
        for (let i = this.rings.length - 1; i >= 0; i--) {
            const r = this.rings[i];
            if (r.fo !== undefined && (r.fo -= dt) <= 0) { this.rings.splice(i, 1); continue; }
            if (r.delay > 0) { r.delay -= dt; continue; }
            r.t += dt / 0.8;
            r.r = 8 + (r.max - 8) * (1 - Math.pow(1 - Math.min(r.t, 1), 3));
            if (r.t >= 1) this.rings.splice(i, 1);
        }
        for (let i = this.bolts.length - 1; i >= 0; i--) {
            const b = this.bolts[i];
            b.life -= dt;
            if (b.fo !== undefined) b.fo -= dt;
            if (b.life <= 0 || b.fo <= 0) this.bolts.splice(i, 1);
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.lineCap = 'round';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        this.dirty = true;

        // Solid things (paper, coins, smoke) first with normal blending, then everything that glows
        ctx.globalCompositeOperation = 'source-over';
        for (const p of this.parts) if (SOLID[p.k]) this.drawPart(ctx, p);
        ctx.globalCompositeOperation = 'lighter';
        for (const p of this.parts) if (!SOLID[p.k]) this.drawPart(ctx, p);

        for (const r of this.rings) {
            if (r.delay > 0) continue;
            ctx.globalAlpha = Math.max(1 - r.t, 0) * 0.85 * (r.fo === undefined ? 1 : Math.max(r.fo / FADE_S, 0));
            ctx.strokeStyle = r.color;
            ctx.lineWidth = r.lw * (1 - r.t * 0.6);
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.r, 0, TAU);
            ctx.stroke();
        }
        for (const b of this.bolts) {
            const f = (b.life / b.max) * (b.fo === undefined ? 1 : Math.max(b.fo / FADE_S, 0));
            ctx.beginPath();
            ctx.moveTo(b.pts[0][0], b.pts[0][1]);
            for (let i = 1; i < b.pts.length; i++) ctx.lineTo(b.pts[i][0], b.pts[i][1]);
            ctx.globalAlpha = f * 0.5; ctx.strokeStyle = b.color; ctx.lineWidth = 4;
            ctx.stroke();
            ctx.globalAlpha = f; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.3;
            ctx.stroke();
        }
        if (this.decor.a > 0 && this.br) DECOR[this.decor.tier].call(this, ctx, this.geom(), this.time, this.decor.a);
        ctx.globalAlpha = 1;
    }

    /** Canvas font, set only when it changes (setting ctx.font is slow) */
    font(ctx, size) {
        const f = `900 ${Math.round(size)}px system-ui, -apple-system, "Segoe UI", sans-serif`;
        if (this.lastFont !== f) { ctx.font = f; this.lastFont = f; }
    }

    /** Draw in a rotated frame at (x, y); call unrotate() afterwards */
    rotate(ctx, x, y, a) {
        const c = Math.cos(a) * this.dpr, sn = Math.sin(a) * this.dpr;
        ctx.setTransform(c, sn, -sn, c, x * this.dpr, y * this.dpr);
    }

    unrotate(ctx) {
        ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    }

    /** One particle (old kinds inline, school kinds via DRAW) */
    drawPart(ctx, p) {
        const f = Math.max(p.life / p.max, 0);
        const m = p.fo === undefined ? 1 : Math.max(p.fo / FADE_S, 0);
        ctx.fillStyle = p.color;
        ctx.strokeStyle = p.color;
        if (p.k === 'spark') {
            ctx.globalAlpha = (f) * m;
            ctx.lineWidth = p.size;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03);
            ctx.stroke();
        } else if (p.k === 'ember') {
            ctx.globalAlpha = (f * 0.9) * m;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * (0.4 + f * 0.6), 0, TAU);
            ctx.fill();
        } else if (p.k === 'ice') {
            ctx.globalAlpha = (Math.min(f * 1.5, 0.9)) * m;
            const s = p.size;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y - s * 1.6);
            ctx.lineTo(p.x + s, p.y);
            ctx.lineTo(p.x, p.y + s * 1.6);
            ctx.lineTo(p.x - s, p.y);
            ctx.fill();
        } else if (p.k === 'spiral') {
            const fade = p.twinkle ? Math.sin(Math.PI * (1 - f)) * (0.6 + Math.random() * 0.4) : Math.min(1, p.r / 40);
            ctx.globalAlpha = (fade) * m;
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
        } else if (p.k === 'surf') {
            // Flash in fast, fade out: a soft halo plus a hot core (additive blend)
            const a = Math.sin(Math.PI * (1 - f)) * (0.75 + 0.25 * Math.sin(p.ph));
            const s = p.size * (0.6 + 0.6 * a);
            ctx.globalAlpha = (a * 0.3) * m;
            ctx.beginPath(); ctx.arc(p.x, p.y, s * 2.6, 0, TAU); ctx.fill();
            ctx.globalAlpha = (Math.min(a * 1.1, 1)) * m;
            ctx.beginPath();
            if (p.sq) {                     // frost glint
                ctx.moveTo(p.x, p.y - s * 1.7); ctx.lineTo(p.x + s * 0.6, p.y);
                ctx.lineTo(p.x, p.y + s * 1.7); ctx.lineTo(p.x - s * 0.6, p.y);
            } else ctx.arc(p.x, p.y, s, 0, TAU);
            ctx.fill();
        } else if (p.k === 'toBtn') {
            ctx.globalAlpha = (0.95) * m;
            ctx.lineWidth = p.size;
            ctx.beginPath();
            ctx.moveTo(p.px, p.py);
            ctx.lineTo(p.x, p.y);
            ctx.stroke();
        } else if (DRAW[p.k]) {
            DRAW[p.k].call(this, ctx, p, f, m);
        }
    }
}

// ===== School tiers (11-22): spawners, motion and drawing per particle kind =====
// Spawners run with `this` = ComboFx and g = geom() (panel pr/cx/cy, button br/bx/by/rad).

const sign = () => (Math.random() < 0.5 ? -1 : 1);
const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]];

/** Axis-aligned circuit path from (x, y): nseg segments of up to `step` px, 90-degree turns */
function circuitPath(x, y, step, nseg) {
    const pts = [[x, y]];
    const lens = [0];
    let d = Math.floor(Math.random() * 4);
    for (let i = 0; i < nseg; i++) {
        if (i > 0 && Math.random() < 0.6) d = (d + (Math.random() < 0.5 ? 1 : 3)) % 4;
        const len = rnd(step * 0.5, step);
        x += DIRS[d][0] * len; y += DIRS[d][1] * len;
        pts.push([x, y]);
        lens.push(lens[i] + len);
    }
    return { pts, lens, total: lens[lens.length - 1] };
}

function qbitPair(fx, hx, hy, rx, ry) {
    const life = rnd(1.2, 1.8);
    const mk = (color) => ({ k: 'qbit', hx, hy, rx, ry, x: hx + rnd(-rx, rx), y: hy + rnd(-ry, ry), jump: rnd(0.05, 0.25), flash: 0, life, max: life, color });
    const a = mk('#00e5ff'), b = mk('#ff1744');
    a.lead = true; a.mate = b;
    fx.add(a); fx.add(b);
}

const SPAWN = {
    // 11 · Chalk Storm: chalk clouds over the panel, puffs off the rim, scribbles on the button
    chalk(g, pal) {
        const life = rnd(1.2, 2);
        this.add({ k: 'dust', x: rnd(g.pr.left, g.pr.right), y: rnd(g.pr.top, g.pr.bottom), vx: rnd(-25, 25), vy: rnd(-20, 10), life, max: life, size: rnd(5, 10), color: pick(pal) });
    },
    btnChalk(g, pal) {
        const a = rnd(0, TAU), sp = rnd(20, 55), life = rnd(0.7, 1.2);
        this.add({ k: 'dust', x: g.bx + Math.cos(a) * g.rad, y: g.by + Math.sin(a) * g.rad, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 10, life, max: life, size: rnd(3, 7), color: pick(pal) });
    },
    btnScribble(g) {
        const lim = g.rad * 0.8;
        let a = rnd(0, TAU), r = g.rad * 0.55 * Math.sqrt(Math.random());
        let x = g.bx + Math.cos(a) * r, y = g.by + Math.sin(a) * r, dir = rnd(0, TAU);
        const pts = [[x, y]];
        for (let i = 0; i < 5; i++) {
            dir += rnd(-2.2, 2.2);
            const len = g.rad * rnd(0.12, 0.25);
            x += Math.cos(dir) * len; y += Math.sin(dir) * len;
            const dx = x - g.bx, dy = y - g.by, d = Math.hypot(dx, dy);
            if (d > lim) { x = g.bx + dx / d * lim; y = g.by + dy / d * lim; }
            pts.push([x, y]);
        }
        const life = rnd(0.8, 1.2);
        this.add({ k: 'scribble', pts, life, max: life, size: rnd(1.6, 2.6), color: pick(CHALK) });
    },

    // 12 · Pop Quiz: ? ! A+ pop out, confetti rains, confetti bursts off the button
    quiz(g, pal) {
        const life = rnd(0.9, 1.3);
        this.add({ k: 'quizGlyph', ch: pick(QUIZ_CHARS), x: rnd(g.pr.left, g.pr.right), y: rnd(g.pr.top, g.pr.bottom), vx: rnd(-30, 30), vy: -rnd(40, 90), life, max: life, size: rnd(14, 22), color: pick(pal), ph: rnd(0, TAU) });
    },
    btnQuiz(g, pal) {
        const a = rnd(Math.PI * 1.1, Math.PI * 1.9), life = rnd(0.9, 1.3);
        this.add({ k: 'quizGlyph', ch: pick(QUIZ_CHARS), x: g.bx + Math.cos(a) * g.rad, y: g.by + Math.sin(a) * g.rad, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60 - 30, life, max: life, size: rnd(16, 24), color: pick(pal), ph: rnd(0, TAU) });
    },
    confetti(g, pal) {
        const life = rnd(1.2, 1.9);
        this.add({ k: 'confetti', x: rnd(g.pr.left - 20, g.pr.right + 20), y: g.pr.top + rnd(-10, g.pr.height), vx: rnd(-40, 40), vy: rnd(-80, -20), rot: rnd(0, TAU), vr: rnd(-8, 8), w: rnd(4, 7), h: rnd(6, 10), life, max: life, color: pick(pal), ph: rnd(0, TAU) });
    },
    btnConfetti(g, pal) {
        const a = rnd(0, TAU), sp = rnd(80, 200), life = rnd(1, 1.6);
        this.add({ k: 'confetti', x: g.bx + Math.cos(a) * g.rad * 0.9, y: g.by + Math.sin(a) * g.rad * 0.9, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, rot: rnd(0, TAU), vr: rnd(-10, 10), w: rnd(4, 6), h: rnd(6, 9), life, max: life, color: pick(pal), ph: rnd(0, TAU) });
    },

    // 13 · Science Fair: bubbles rise from the panel, fizz inside the button, big bubbles off its top
    bubble(g, pal) {
        const life = rnd(1, 1.8);
        this.add({ k: 'bubble', x: rnd(g.pr.left, g.pr.right), y: g.pr.bottom - rnd(0, 8), vx: rnd(-10, 10), vy: -rnd(30, 70), life, max: life, size: rnd(3, 7), color: pick(pal), ph: rnd(0, TAU) });
    },
    fizz(g, pal) {
        const life = rnd(0.6, 1.2);
        this.add({ k: 'bubble', inDisc: true, bx: g.bx, by: g.by, rr: g.rad * 0.92, x: g.bx + rnd(-0.7, 0.7) * g.rad, y: g.by + g.rad * rnd(0.2, 0.8), vx: rnd(-5, 5), vy: -rnd(25, 60), life, max: life, size: rnd(1.5, 3.5), color: pick(pal), ph: rnd(0, TAU) });
    },
    btnBubble(g, pal) {
        const a = rnd(Math.PI * 1.15, Math.PI * 1.85), life = rnd(1, 1.6);
        this.add({ k: 'bubble', x: g.bx + Math.cos(a) * g.rad, y: g.by + Math.sin(a) * g.rad, vx: Math.cos(a) * 20, vy: -rnd(40, 80), life, max: life, size: rnd(4, 9), color: pick(pal), ph: rnd(0, TAU) });
    },

    // 14 · Book Tornado: pages spiral up out of the panel and around the button
    page(g, pal) {
        const life = rnd(1.2, 1.8);
        this.add({ k: 'page', cx: g.cx, cy: g.pr.bottom, a: rnd(0, TAU), w: rnd(3, 5), r: rnd(10, 30), vr: rnd(20, 40), oy: 0, rise: rnd(40, 80), rot: rnd(0, TAU), spin: rnd(4, 9), x: g.cx, y: g.pr.bottom, life, max: life, size: rnd(5, 8), color: pick(pal) });
    },
    btnPage(g, pal) {
        const life = rnd(1.4, 2);
        const cy = g.by + g.rad * 0.6;
        this.add({ k: 'page', cx: g.bx, cy, a: rnd(0, TAU), w: rnd(2.5, 4), r: g.rad * rnd(0.9, 1.1), vr: rnd(5, 20), oy: 0, rise: rnd(40, 70), rot: rnd(0, TAU), spin: rnd(4, 9), x: g.bx, y: cy, life, max: life, size: rnd(5, 8), color: pick(pal) });
    },

    // 15 · Math Wizard: math runes orbit the button (plus the rune circle in DECOR)
    rune(g, pal) {
        const life = rnd(1.6, 2.6), r = g.rad * rnd(1.15, 1.45), a = rnd(0, TAU);
        this.add({ k: 'glyph', orbit: true, ch: pick(RUNES), cx: g.bx, cy: g.by, a, r, grow: g.rad * 0.12, w: rnd(1, 2) * sign(), x: g.bx + Math.cos(a) * r, y: g.by + Math.sin(a) * r, life, max: life, size: rnd(13, 20), color: pick(pal) });
    },

    // 16 · Rocket Lab: rockets with smoke trails launch from the panel and the button and pop like fireworks
    rocket(g, pal) {
        const life = rnd(0.6, 0.9);
        this.add({ k: 'rocket', x: rnd(g.pr.left, g.pr.right), y: g.pr.bottom, vx: rnd(-40, 40), vy: -rnd(140, 220), life, max: life, color: pick(pal), puff: 0 });
    },
    btnRocket(g, pal) {
        const a = rnd(-Math.PI * 0.85, -Math.PI * 0.15), sp = rnd(120, 200), life = rnd(0.6, 0.9);
        this.add({ k: 'rocket', x: g.bx + Math.cos(a) * g.rad, y: g.by + Math.sin(a) * g.rad, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life, max: life, color: pick(pal), puff: 0 });
    },

    // 17 · Robot Brain: binary rain from the panel to the button, circuit traces (plus the scan line in DECOR)
    binary(g, pal) {
        const life = rnd(0.8, 1.4);
        const l = Math.min(g.pr.left, g.br.left), r = Math.max(g.pr.right, g.br.right);
        this.add({ k: 'glyph', ch: Math.random() < 0.5 ? '0' : '1', x: rnd(l, r), y: g.pr.bottom + rnd(-g.pr.height, 0), vy: rnd(70, 140), life, max: life, size: rnd(10, 15), color: pick(pal) });
    },
    trace(g, pal) {
        const life = rnd(0.7, 1.1);
        const path = circuitPath(rnd(g.pr.left, g.pr.right), Math.random() < 0.5 ? g.pr.top : g.pr.bottom, 26, 5);
        this.add({ k: 'trace', ...path, life, max: life, size: 1.6, color: pick(pal) });
    },
    btnTrace(g, pal) {
        const life = rnd(0.7, 1.1), a = rnd(0, TAU), r = g.rad * rnd(0, 0.35);
        const path = circuitPath(g.bx + Math.cos(a) * r, g.by + Math.sin(a) * r, g.rad * 0.3, 6);
        this.add({ k: 'trace', ...path, life, max: life, size: 1.6, color: pick(pal) });
    },

    // 18 · Time Machine: clock rings with a sweeping hand expand from the button, sand pours inside it (clock face in DECOR)
    clock(g, pal) {
        if (this.parts.filter(p => p.k === 'clock').length >= 3) return;
        const life = 1.4;
        this.add({ k: 'clock', x: g.bx, y: g.by, r0: g.rad * 0.9, r1: g.rad * rnd(1.8, 2.4), r: g.rad * 0.9, a: rnd(0, TAU), w: rnd(6, 10) * sign(), life, max: life, color: pick(pal) });
    },
    sand(g) {
        const life = 1.5;
        this.add({ k: 'sand', x: g.bx + rnd(-0.06, 0.06) * g.rad, y: g.by - g.rad * rnd(0.55, 0.75), vx: rnd(-6, 6), vy: rnd(10, 30), bx: g.bx, by: g.by, rr: g.rad * 0.9, life, max: life, color: pick(['#ffd180', '#ffab40', '#fff3e0']) });
    },

    // 19 · Galaxy Brain: planets orbit the button (orbits in DECOR), nebula clouds over the panel
    planet(g, pal) {
        if (this.parts.filter(p => p.k === 'planet').length >= 5) return;
        const outer = Math.random() < 0.5;
        const rx = g.rad * (outer ? 1.75 : 1.38), life = rnd(3.5, 5.5), a = rnd(0, TAU);
        this.add({ k: 'planet', cx: g.bx, cy: g.by, rad: g.rad, a, w: (outer ? 0.9 : 1.4) * rnd(0.8, 1.2), rx, ry: rx * 0.36, x: g.bx + Math.cos(a) * rx, y: g.by, size: rnd(4, 8), color: pick(pal), ring: Math.random() < 0.35, life, max: life });
    },
    nebula(g) {
        const life = rnd(2, 3);
        this.add({ k: 'dust', x: rnd(g.pr.left - 20, g.pr.right + 20), y: rnd(g.pr.top - 10, g.pr.bottom + 10), vx: rnd(-8, 8), vy: rnd(-8, 8), life, max: life, size: rnd(10, 18), color: pick(GALAXY) });
    },

    // 20 · Nobel Prize: gold medals rain past the panel and fountain out of the button (laurel in DECOR)
    coin(g) {
        const life = rnd(1.2, 1.8);
        this.add({ k: 'coin', x: rnd(g.pr.left - 20, g.pr.right + 20), y: g.pr.top - rnd(0, 20), vx: rnd(-20, 20), vy: rnd(20, 80), ph: rnd(0, TAU), w: rnd(6, 12), size: rnd(5, 8), life, max: life });
    },
    btnCoin(g) {
        const life = rnd(1, 1.4);
        this.add({ k: 'coin', x: g.bx + rnd(-0.4, 0.4) * g.rad, y: g.by - g.rad * 0.7, vx: rnd(-90, 90), vy: -rnd(160, 260), ph: rnd(0, TAU), w: rnd(6, 12), size: rnd(5, 8), life, max: life });
    },

    // 21 · Quantum Leap: entangled pairs teleport around the panel and the button (counter-rotating arcs in DECOR)
    qbit(g) { qbitPair(this, g.cx, g.cy, g.pr.width * 0.55, g.pr.height * 1.2); },
    btnQbit(g) { qbitPair(this, g.bx, g.by, g.rad * 1.3, g.rad * 1.3); },

    // 22 · Big Bang: hyperspace streaks out of the button (plus a bang every few seconds, see emit)
    streak(g, pal) {
        const life = rnd(0.4, 0.7);
        this.add({ k: 'streak', cx: g.bx, cy: g.by, a: rnd(0, TAU), d: g.rad * rnd(0.1, 0.5), v: rnd(150, 300), x: g.bx, y: g.by, life, max: life, color: pick(pal) });
    }
};

/** Motion per kind; return true to kill the particle */
const STEP = {
    dust(p, dt) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= 0.98; p.vy *= 0.98;
    },
    quizGlyph(p, dt) {
        p.x += p.vx * dt; p.y += p.vy * dt;
        p.vx *= 0.95; p.vy *= 0.96; p.ph += dt * 8;
    },
    glyph(p, dt) {
        if (p.orbit) {
            p.a += p.w * dt; p.r += p.grow * dt;
            p.x = p.cx + Math.cos(p.a) * p.r; p.y = p.cy + Math.sin(p.a) * p.r * 0.9;
        } else p.y += p.vy * dt;
    },
    confetti(p, dt) {
        p.ph += dt * 6;
        p.vy = Math.min(p.vy + 260 * dt, 120); p.vx *= 0.97;
        p.x += (p.vx + Math.sin(p.ph) * 35) * dt; p.y += p.vy * dt;
        p.rot += p.vr * dt;
    },
    bubble(p, dt) {
        p.ph += dt * 5;
        p.x += (p.vx + Math.sin(p.ph) * 14) * dt; p.y += p.vy * dt;
        if (p.inDisc) return Math.hypot(p.x - p.bx, p.y - p.by) > p.rr;
        if (p.life <= 0 && p.fo === undefined) {   // pop!
            for (let i = 0; i < 3; i++) this.spawnSpark(p.x, p.y, [p.color, '#ffffff'], rnd(40, 90), rnd(0.15, 0.3));
        }
    },
    page(p, dt) {
        p.a += p.w * dt; p.r += p.vr * dt; p.oy -= p.rise * dt; p.rot += p.spin * dt;
        p.x = p.cx + Math.cos(p.a) * p.r; p.y = p.cy + p.oy + Math.sin(p.a) * p.r * 0.35;
    },
    rocket(p, dt) {
        const acc = 1 + 1.2 * dt;
        p.vx *= acc; p.vy *= acc;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.fo !== undefined) return;
        if ((p.puff -= dt) <= 0) {
            p.puff = 0.035;
            const life = rnd(0.5, 0.8);
            this.add({ k: 'smoke', x: p.x, y: p.y, vx: -p.vx * 0.05 + rnd(-10, 10), vy: -p.vy * 0.05 + rnd(-10, 10), life, max: life, size: rnd(2, 4), color: '#cfd8dc' });
        }
        if (p.life <= 0) {                          // firework pop at the end
            for (let i = 0; i < 8; i++) this.spawnSpark(p.x, p.y, PALETTE[this.tier] || ROCKET, rnd(60, 160), rnd(0.3, 0.6));
        }
    },
    smoke(p, dt) {
        p.x += p.vx * dt; p.y += p.vy * dt; p.vy -= 10 * dt;
    },
    clock(p, dt) {
        const t = 1 - p.life / p.max;
        p.r = p.r0 + (p.r1 - p.r0) * (1 - (1 - t) * (1 - t));
        p.a += p.w * dt;
    },
    sand(p, dt) {
        p.vy += 260 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        return Math.hypot(p.x - p.bx, p.y - p.by) > p.rr;
    },
    planet(p, dt) {
        p.a += p.w * dt;
        p.x = p.cx + Math.cos(p.a) * p.rx; p.y = p.cy + Math.sin(p.a) * p.ry;
    },
    coin(p, dt) {
        p.vy += 320 * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.ph += p.w * dt;
    },
    qbit(p, dt) {
        p.flash = Math.max(0, p.flash - dt);
        if ((p.jump -= dt) <= 0) {
            p.jump = rnd(0.12, 0.3); p.flash = 0.12;
            p.x = p.hx + rnd(-p.rx, p.rx); p.y = p.hy + rnd(-p.ry, p.ry);
        }
    },
    streak(p, dt) {
        p.v *= 1 + 2.5 * dt; p.d += p.v * dt;
        p.x = p.cx + Math.cos(p.a) * p.d; p.y = p.cy + Math.sin(p.a) * p.d;
    }
};

/** Drawing per kind: f = life left (1 -> 0), m = fade-out factor */
const DRAW = {
    dust(ctx, p, f, m) {
        ctx.globalAlpha = Math.sin(Math.PI * (1 - f)) * 0.32 * m;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 + (1 - f) * 1.4), 0, TAU); ctx.fill();
    },
    scribble(ctx, p, f, m) {
        // Drawn in stroke by stroke, then fades
        const segs = (p.pts.length - 1) * Math.min(1, (1 - f) * 3);
        const full = Math.floor(segs);
        ctx.globalAlpha = Math.min(1, f / 0.35) * 0.9 * m;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.pts[0][0], p.pts[0][1]);
        for (let i = 1; i <= full; i++) ctx.lineTo(p.pts[i][0], p.pts[i][1]);
        if (full < p.pts.length - 1) {
            const a = p.pts[full], b = p.pts[full + 1], t = segs - full;
            ctx.lineTo(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
        }
        ctx.stroke();
    },
    quizGlyph(ctx, p, f, m) {
        const grow = Math.min(1, (1 - f) / 0.15);
        this.font(ctx, p.size * (0.4 + 0.6 * grow) * (1 + 0.1 * Math.sin(p.ph)));
        ctx.globalAlpha = Math.min(1, f / 0.3) * m;
        ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.strokeText(p.ch, p.x, p.y);
        ctx.fillText(p.ch, p.x, p.y);
    },
    glyph(ctx, p, f, m) {
        this.font(ctx, p.size);
        ctx.globalAlpha = (p.orbit ? Math.sin(Math.PI * (1 - f)) : f) * m;
        ctx.fillText(p.ch, p.x, p.y);
    },
    confetti(ctx, p, f, m) {
        ctx.globalAlpha = Math.min(1, f * 2) * m;
        this.rotate(ctx, p.x, p.y, p.rot);
        const h = p.h * Math.abs(Math.cos(p.ph)) + 1;
        ctx.fillRect(-p.w / 2, -h / 2, p.w, h);
        this.unrotate(ctx);
    },
    page(ctx, p, f, m) {
        ctx.globalAlpha = Math.min(1, f * 2) * m;
        this.rotate(ctx, p.x, p.y, Math.sin(p.rot) * 0.6);
        const w = p.size * 1.4 * Math.abs(Math.cos(p.rot)) + 1, h = p.size * 1.8;
        ctx.fillRect(-w / 2, -h / 2, w, h);
        if (w > 4) {                                // lines of text
            ctx.strokeStyle = 'rgba(120,90,60,0.6)'; ctx.lineWidth = 0.8;
            ctx.beginPath();
            for (const y of [-h / 4, 0, h / 4]) { ctx.moveTo(-w / 2 + 1, y); ctx.lineTo(w / 2 - 1, y); }
            ctx.stroke();
        }
        this.unrotate(ctx);
    },
    bubble(ctx, p, f, m) {
        const a = Math.min(1, f * 3) * m;
        ctx.globalAlpha = 0.8 * a; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, TAU); ctx.stroke();
        ctx.globalAlpha = a; ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(p.x - p.size * 0.35, p.y - p.size * 0.35, p.size * 0.25, 0, TAU); ctx.fill();
    },
    rocket(ctx, p, f, m) {
        ctx.globalAlpha = m; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.05, p.y - p.vy * 0.05); ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, TAU); ctx.fill();
    },
    smoke(ctx, p, f, m) {
        ctx.globalAlpha = 0.22 * f * m;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * (1 + (1 - f) * 3), 0, TAU); ctx.fill();
    },
    trace(ctx, p, f, m) {
        const len = p.total * Math.min(1, (1 - f) * 2.2);
        ctx.globalAlpha = Math.min(1, f * 1.6) * m; ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.pts[0][0], p.pts[0][1]);
        let hx = p.pts[0][0], hy = p.pts[0][1];
        for (let i = 1; i < p.pts.length; i++) {
            const a = p.pts[i - 1], b = p.pts[i];
            if (p.lens[i] <= len) { ctx.lineTo(b[0], b[1]); hx = b[0]; hy = b[1]; continue; }
            const t = (len - p.lens[i - 1]) / (p.lens[i] - p.lens[i - 1]);
            hx = a[0] + (b[0] - a[0]) * t; hy = a[1] + (b[1] - a[1]) * t;
            ctx.lineTo(hx, hy);
            break;
        }
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(hx, hy, 2, 0, TAU); ctx.fill();
    },
    clock(ctx, p, f, m) {
        ctx.globalAlpha = f * 0.8 * m; ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, TAU);
        for (let i = 0; i < 12; i++) {
            const a = i * TAU / 12, c = Math.cos(a), s = Math.sin(a);
            ctx.moveTo(p.x + c * p.r * 0.88, p.y + s * p.r * 0.88); ctx.lineTo(p.x + c * p.r, p.y + s * p.r);
        }
        ctx.moveTo(p.x, p.y); ctx.lineTo(p.x + Math.cos(p.a) * p.r * 0.9, p.y + Math.sin(p.a) * p.r * 0.9);
        ctx.stroke();
    },
    sand(ctx, p, f, m) {
        ctx.globalAlpha = 0.9 * m;
        ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    },
    planet(ctx, p, f, m) {
        const depth = Math.sin(p.a);
        const behind = depth < 0 && Math.hypot(p.x - p.cx, p.y - p.cy) < p.rad;  // passing behind the button
        const ends = Math.min(1, (1 - f) * 4, f * 4);
        const a = ends * (behind ? 0.18 : depth < 0 ? 0.6 : 1) * m;
        const s = p.size * (0.75 + 0.25 * depth);
        ctx.globalAlpha = a;
        ctx.beginPath(); ctx.arc(p.x, p.y, s, 0, TAU); ctx.fill();
        if (p.ring) {
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.ellipse(p.x, p.y, s * 2, s * 0.6, -0.4, 0, TAU); ctx.stroke();
        }
        ctx.globalAlpha = a * 0.6; ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(p.x - s * 0.35, p.y - s * 0.35, s * 0.35, 0, TAU); ctx.fill();
    },
    coin(ctx, p, f, m) {
        const rx = p.size * Math.abs(Math.cos(p.ph)) + 0.6;
        ctx.globalAlpha = Math.min(1, f * 2.5) * m;
        ctx.fillStyle = '#ffd700'; ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.ellipse(p.x, p.y, rx, p.size, 0, 0, TAU); ctx.fill(); ctx.stroke();
        if (rx > p.size * 0.5) {
            ctx.strokeStyle = '#fff3b0'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.ellipse(p.x, p.y, rx * 0.55, p.size * 0.55, 0, 0, TAU); ctx.stroke();
        }
    },
    qbit(ctx, p, f, m) {
        const e = Math.min(1, f * 4) * m;
        if (p.lead && p.mate && p.mate.life > 0) {   // entanglement line, flickering
            ctx.globalAlpha = e * (0.25 + 0.35 * Math.random()); ctx.strokeStyle = '#d500f9'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.mate.x, p.mate.y); ctx.stroke();
            ctx.strokeStyle = p.color;
        }
        ctx.globalAlpha = e * 0.3;
        ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, TAU); ctx.fill();
        ctx.globalAlpha = e;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2.6, 0, TAU); ctx.fill();
        if (p.flash > 0) {                          // teleport blink
            const k = p.flash / 0.12;
            ctx.globalAlpha = k * e; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(p.x, p.y, 3 + (1 - k) * 10, 0, TAU); ctx.stroke();
        }
    },
    streak(ctx, p, f, m) {
        const tail = Math.min(40, p.v * 0.08);
        ctx.globalAlpha = f * m; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.cx + Math.cos(p.a) * (p.d - tail), p.cy + Math.sin(p.a) * (p.d - tail));
        ctx.stroke();
    }
};

/** Persistent decoration around the Study button for some school tiers (a = fade 0..1, t = seconds) */
const DECOR = {
    15(ctx, g, t, a) {                              // rune circles, turning opposite ways
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7 * a; ctx.strokeStyle = '#e040fb';
        ctx.setLineDash([6, 9]); ctx.lineDashOffset = -t * 40;
        ctx.beginPath(); ctx.arc(g.bx, g.by, g.rad * 1.12, 0, TAU); ctx.stroke();
        ctx.strokeStyle = '#ffd740';
        ctx.setLineDash([2, 7]); ctx.lineDashOffset = t * 30;
        ctx.beginPath(); ctx.arc(g.bx, g.by, g.rad * 1.24, 0, TAU); ctx.stroke();
        ctx.setLineDash([]);
    },
    17(ctx, g, t, a) {                              // scan line sweeping the button
        const dy = (((t % 1.4) / 1.4) * 2 - 1) * g.rad * 0.95;
        const half = Math.sqrt(Math.max(0, g.rad * g.rad - dy * dy));
        for (const [w, al, c] of [[7, 0.35, '#18ffff'], [1.5, 0.9, '#ccff90']]) {
            ctx.globalAlpha = al * a; ctx.lineWidth = w; ctx.strokeStyle = c;
            ctx.beginPath(); ctx.moveTo(g.bx - half, g.by + dy); ctx.lineTo(g.bx + half, g.by + dy); ctx.stroke();
        }
    },
    18(ctx, g, t, a) {                              // clock face: ticks and racing hands
        ctx.globalAlpha = 0.55 * a; ctx.strokeStyle = '#ffe0b2';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
            const an = i * TAU / 12, c = Math.cos(an), s = Math.sin(an);
            ctx.moveTo(g.bx + c * g.rad * 0.84, g.by + s * g.rad * 0.84); ctx.lineTo(g.bx + c * g.rad * 0.95, g.by + s * g.rad * 0.95);
        }
        ctx.stroke();
        const hand = (an, len, w) => {
            ctx.lineWidth = w;
            ctx.beginPath(); ctx.moveTo(g.bx, g.by); ctx.lineTo(g.bx + Math.cos(an) * len, g.by + Math.sin(an) * len); ctx.stroke();
        };
        hand(t * TAU / 1.5 - Math.PI / 2, g.rad * 0.62, 3);
        hand(t * TAU / 18 - Math.PI / 2, g.rad * 0.4, 4);
    },
    19(ctx, g, t, a) {                              // planet orbits
        ctx.globalAlpha = 0.28 * a; ctx.strokeStyle = '#b388ff'; ctx.lineWidth = 1;
        for (const k of [1.38, 1.75]) {
            ctx.beginPath(); ctx.ellipse(g.bx, g.by, g.rad * k, g.rad * k * 0.36, 0, 0, TAU); ctx.stroke();
        }
    },
    20(ctx, g, t, a) {                              // golden laurel wreath
        ctx.globalAlpha = 0.85 * a; ctx.fillStyle = '#ffd54f';
        const r = g.rad * 1.13;
        for (const side of [-1, 1]) {
            for (let i = 0; i < 8; i++) {
                const an = Math.PI / 2 + side * (0.35 + i * 0.2);
                const rot = an + side * Math.PI / 2 + (i % 2 ? 0.5 : -0.5) * side + Math.sin(t * 2 + i) * 0.08;
                ctx.beginPath();
                ctx.ellipse(g.bx + Math.cos(an) * r, g.by + Math.sin(an) * r, 7 * (1 - i * 0.05), 3, rot, 0, TAU);
                ctx.fill();
            }
        }
    },
    21(ctx, g, t, a) {                              // two counter-rotating arcs
        ctx.lineWidth = 3; ctx.globalAlpha = 0.8 * a;
        ctx.strokeStyle = '#00e5ff';
        ctx.beginPath(); ctx.arc(g.bx, g.by, g.rad * 1.1, t * 3, t * 3 + 2.1); ctx.stroke();
        ctx.strokeStyle = '#ff1744';
        ctx.beginPath(); ctx.arc(g.bx, g.by, g.rad * 1.18, -t * 3 + Math.PI, -t * 3 + Math.PI + 2.1); ctx.stroke();
    },
    22(ctx, g, t, a) {                              // rainbow pulse rings
        const hue = (t * 140) % 360;
        const r = g.rad * (1.12 + 0.06 * Math.sin(t * 6));
        ctx.lineWidth = 4;
        ctx.globalAlpha = 0.9 * a; ctx.strokeStyle = `hsl(${hue.toFixed(0)}, 100%, 65%)`;
        ctx.beginPath(); ctx.arc(g.bx, g.by, r, 0, TAU); ctx.stroke();
        ctx.globalAlpha = 0.5 * a; ctx.strokeStyle = `hsl(${((hue + 180) % 360).toFixed(0)}, 100%, 65%)`;
        ctx.beginPath(); ctx.arc(g.bx, g.by, r * 1.12, 0, TAU); ctx.stroke();
    }
};


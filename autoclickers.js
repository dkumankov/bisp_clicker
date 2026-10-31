// Auto-clickers: one pointing finger per owned auto-clicker, orbiting the Study button.
// Each finger really clicks the button once per second; the clicks of all fingers are spread
// evenly over the second (a global timer fires every 1/n s and hands the click to the next
// finger), so there is no synchronous wave. The module only decides WHEN a click happens and
// animates the fingers (transform only, one write per finger per frame, driven by the game's
// single rAF loop); the app turns each click into a real game click.

const TAU = Math.PI * 2;
const PRESS_IN_S = 0.07;     // finger travels to the button
const PRESS_OUT_S = 0.2;     // and back
const MAX_CLICKS_PER_FRAME = 30;
const MAX_RINGS_DESKTOP = 3;
const MAX_RINGS_COARSE = 2;  // phones: stay within the screen and away from the combo panel

export class AutoClickers {
    /**
     * @param {{host: HTMLElement, button: HTMLElement, reduceMotion: boolean,
     *          onClick: (angle: number) => void}} opts
     *  host: zero-size element at the button's centre; onClick gets the finger's angle (radians, 0 = up)
     */
    constructor({ host, button, reduceMotion, onClick }) {
        this.host = host;
        this.button = button;
        this.reduce = reduceMotion;
        this.onClick = onClick;
        this.count = 0;
        this.fingers = [];       // {el, press: seconds since the press began, or -1, angle, ring, r}
        this.acc = 0;            // clicks owed (1 = one click due)
        this.cursor = 0;         // next finger to press
        this.rot = 0;            // ring rotation (radians)
        this.lastT = 0;
        this.layoutDirty = true;
        this.coarse = window.matchMedia('(pointer: coarse)').matches;
        this.size = 22;          // finger glyph size, px
        this.btnR = 95;

        if (typeof ResizeObserver !== 'undefined') {
            new ResizeObserver(() => { this.layoutDirty = true; }).observe(button);
        } else {
            window.addEventListener('resize', () => { this.layoutDirty = true; });
        }
    }

    setCount(n) {
        if (n === this.count) return;
        this.count = n;
        this.layoutDirty = true;
        if (n === 0) { this.acc = 0; this.cursor = 0; }
        this.host.dataset.count = String(n);
    }

    /** Finger training level (0 plain, 1 trained, 2 golden): only the look changes here, via CSS */
    setLevel(level) {
        const v = String(level);
        if (this.host.dataset.level !== v) this.host.dataset.level = v;
    }

    /** Number of fingers that fit: full rings only, extra fingers still click but are not drawn */
    visibleCount() {
        const rings = this.coarse ? MAX_RINGS_COARSE : MAX_RINGS_DESKTOP;
        let cap = 0;
        for (let k = 0; k < rings; k++) cap += this.ringCapacity(k);
        return Math.min(this.count, cap);
    }

    ringRadius(k) {
        return this.btnR + this.size * (0.7 + 0.95 * k);
    }

    ringCapacity(k) {
        return Math.max(6, Math.floor(TAU * this.ringRadius(k) / (this.size * 0.95)));
    }

    /** Create/remove finger elements and assign each one a ring and a slot (even spacing per ring) */
    layout() {
        this.layoutDirty = false;
        this.btnR = this.button.offsetWidth / 2 || 95;
        this.size = this.button.offsetWidth < 160 ? 18 : 22;
        this.host.style.setProperty('--finger-size', this.size + 'px');

        const visible = this.visibleCount();
        while (this.fingers.length > visible) this.fingers.pop().el.remove();
        while (this.fingers.length < visible) {
            const el = document.createElement('i');
            el.className = 'finger';
            el.textContent = '👇';
            this.host.appendChild(el);
            this.fingers.push({ el, press: -1, angle: 0, ring: 0, r: 0 });
        }

        // Fill ring 0 first, then ring 1, ...; each ring is spaced evenly, odd rings are staggered
        let placed = 0;
        for (let k = 0; placed < visible; k++) {
            const inRing = Math.min(this.ringCapacity(k), visible - placed);
            for (let j = 0; j < inRing; j++) {
                const f = this.fingers[placed + j];
                f.ring = k;
                f.r = this.ringRadius(k);
                f.angle = (j / inRing + (k % 2) * 0.5 / inRing) * TAU;
            }
            placed += inRing;
        }
        this.render();
    }

    /** Called every frame with the rAF timestamp (ms) */
    update(now) {
        const dt = Math.min(Math.max((now - this.lastT) / 1000, 0), 0.25);
        this.lastT = now;
        if (this.layoutDirty) this.layout();
        if (this.count === 0) return;

        // Evenly spaced clicks: n clicks per second overall
        this.acc += this.count * dt;
        let fired = 0;
        while (this.acc >= 1 && fired < MAX_CLICKS_PER_FRAME) {
            this.acc -= 1;
            fired++;
            this.fire();
        }
        if (this.acc > 1) this.acc = 1;  // after a long stall don't catch up in a burst

        if (!this.reduce) {
            // The ring turns a bit faster the more fingers there are
            this.rot = (this.rot + dt * (0.12 + Math.min(this.count, 100) * 0.003)) % TAU;
            for (const f of this.fingers) if (f.press >= 0) {
                f.press += dt;
                if (f.press > PRESS_IN_S + PRESS_OUT_S) f.press = -1;
            }
        }
        this.render();
    }

    fire() {
        const visible = this.fingers.length;
        let angle = Math.random() * TAU;
        if (visible > 0) {
            const f = this.fingers[this.cursor++ % visible];
            if (!this.reduce) f.press = 0;
            angle = f.angle + this.rot;
        }
        this.onClick(angle);
    }

    render() {
        const size = this.size;
        for (const f of this.fingers) {
            let push = 0;  // 0 = resting, 1 = pressed against the button
            if (f.press >= 0) {
                push = f.press < PRESS_IN_S
                    ? f.press / PRESS_IN_S
                    : 1 - (f.press - PRESS_IN_S) / PRESS_OUT_S;
            }
            const r = f.r - push * size * 0.32;
            const a = (f.angle + this.rot) * 180 / Math.PI;
            f.el.style.transform = `rotate(${a.toFixed(1)}deg) translateY(${(-r).toFixed(1)}px) translate(-50%, -50%) scale(${(1 - push * 0.12).toFixed(3)})`;
        }
    }
}

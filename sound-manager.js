const SETTINGS_KEY = 'bisp_clicker_sound';

// Note frequencies (Hz) used by the jingles
const N = {
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
    C6: 1046.5, E6: 1318.5, G6: 1568.0, C7: 2093.0
};

// Major pentatonic run over two octaves (harp glissandi, sparkles)
const PENTA = [N.C5, N.D5, N.E5, N.G5, N.A5, N.C6, 1174.7, N.E6, N.G6, 1760.0, N.C7];

/** Low boom (sine drop + noise crack); `size` 1 = Legend-sized, 2 = finale */
function boom(sm, size = 1) {
    sm.playTone(110 / size, 0.8 * size, { type: 'sine', volume: 0.35, slideTo: 28 });
    sm.playNoise(0.5 * size, { volume: 0.12, freq: 600 / size });
}

// Combo tiers 11-22: each gets its own little synthesised theme (called with this = SoundManager)
const SCHOOL_FANFARES = {
    // Chalk Storm: three chalk squeaks, then a bright triad
    11() {
        for (let i = 0; i < 3; i++) {
            this.playNoise(0.07, { delay: i * 0.09, volume: 0.07, freq: 3500 + i * 900 });
            this.playTone(2400 + i * 300, 0.06, { delay: i * 0.09, type: 'square', volume: 0.025, slideTo: 2900 + i * 300 });
        }
        [N.C5, N.E5, N.G5, N.C6].forEach((f, i) => this.playTone(f, 0.2, { type: 'triangle', volume: 0.12, delay: 0.3 + i * 0.06 }));
    },
    // Pop Quiz: game-show "ding ding!" and a pop
    12() {
        this.playTone(N.E6, 0.25, { type: 'square', volume: 0.06 });
        this.playTone(N.C7, 0.4, { type: 'square', volume: 0.06, delay: 0.14 });
        this.playTone(900, 0.08, { type: 'sine', volume: 0.2, delay: 0.42, slideTo: 200 });
        this.playNoise(0.05, { delay: 0.42, volume: 0.06, freq: 2000 });
    },
    // Science Fair: bubbly bloops climbing up
    13() {
        for (let i = 0; i < 7; i++) {
            const f = 300 + i * 120 + Math.random() * 80;
            this.playTone(f, 0.1, { type: 'sine', volume: 0.16, delay: i * 0.07, slideTo: f * 2.2 });
        }
        this.playTone(N.G6, 0.35, { type: 'sine', volume: 0.1, delay: 0.5 });
    },
    // Book Tornado: page flips swirl, then a warm chord
    14() {
        for (let i = 0; i < 5; i++) this.playNoise(0.06, { delay: i * 0.06, volume: 0.08, freq: 1200 + i * 300 });
        [N.C5, N.G5, N.E6].forEach(f => this.playTone(f, 0.7, { type: 'triangle', volume: 0.1, delay: 0.32 }));
    },
    // Math Wizard: magic harp glissando + shimmer + a soft boom
    15() {
        boom(this, 1);
        PENTA.forEach((f, i) => this.playTone(f, 0.25, { type: 'sine', volume: 0.1, delay: 0.15 + i * 0.045 }));
        this.playNoise(0.6, { delay: 0.6, volume: 0.05, freq: 8000 });
        this.playTone(N.C7, 0.8, { type: 'sine', volume: 0.08, delay: 0.65 });
    },
    // Rocket Lab: rumble, liftoff whoosh up, bright chord in the sky
    16() {
        this.playTone(70, 0.9, { type: 'sawtooth', volume: 0.08, slideTo: 900 });
        this.playNoise(0.9, { volume: 0.1, freq: 300 });
        [N.C6, N.E6, N.G6].forEach(f => this.playTone(f, 0.5, { type: 'triangle', volume: 0.1, delay: 0.85 }));
    },
    // Robot Brain: boom + beep-boop computer melody
    17() {
        boom(this, 1);
        const steps = [880, 660, 990, 550, 1320, 770, 1100, 1760];
        steps.forEach((f, i) => this.playTone(f, 0.07, { type: 'square', volume: 0.06, delay: 0.25 + i * 0.075 }));
        this.playTone(N.C7, 0.3, { type: 'square', volume: 0.05, delay: 0.9 });
    },
    // Time Machine: tick-tock, a rewind sweep, then a chord
    18() {
        for (let i = 0; i < 4; i++) this.playTone(i % 2 ? 900 : 1300, 0.04, { type: 'sine', volume: 0.18, delay: i * 0.13 });
        this.playTone(2000, 0.5, { type: 'triangle', volume: 0.08, delay: 0.55, slideTo: 200 });
        [N.D5, N.A5, N.E6].forEach(f => this.playTone(f, 0.6, { type: 'sine', volume: 0.1, delay: 1.0 }));
    },
    // Galaxy Brain: wide detuned space pad with a sparkle on top
    19() {
        [N.C5, N.G5, N.E6].forEach(f => {
            this.playTone(f, 1.6, { type: 'sine', volume: 0.08 });
            this.playTone(f * 1.006, 1.6, { type: 'triangle', volume: 0.05, slideTo: f * 1.5 });
        });
        [N.G6, N.C7, N.G6, N.C7].forEach((f, i) => this.playTone(f, 0.15, { type: 'sine', volume: 0.06, delay: 0.6 + i * 0.12 }));
    },
    // Nobel Prize: boom + triumphant brass fanfare + applause noise
    20() {
        boom(this, 1.5);
        const melody = [N.C5, N.C5, N.G5, N.E5, N.G5, N.C6, N.E6, N.G6, N.C7];
        melody.forEach((f, i) => this.playTone(f, 0.24, { type: 'sawtooth', volume: 0.08, delay: 0.3 + i * 0.1 }));
        [N.C5, N.E5, N.G5, N.C6, N.E6].forEach(f => this.playTone(f, 1.6, { type: 'triangle', volume: 0.12, delay: 1.25 }));
        for (let i = 0; i < 8; i++) this.playNoise(0.05, { delay: 1.25 + i * 0.09 + Math.random() * 0.04, volume: 0.05, freq: 2500 });
    },
    // Quantum Leap: two glissandi crossing each other + blips
    21() {
        this.playTone(300, 0.8, { type: 'square', volume: 0.045, slideTo: 2400 });
        this.playTone(2400, 0.8, { type: 'square', volume: 0.045, slideTo: 300 });
        for (let i = 0; i < 6; i++) this.playTone(PENTA[4 + Math.floor(Math.random() * 7)], 0.05, { type: 'sine', volume: 0.12, delay: 0.85 + i * 0.06 });
    },
    // Big Bang: the biggest boom, a two-octave run and a huge final chord with shimmer
    22() {
        boom(this, 2);
        PENTA.forEach((f, i) => this.playTone(f, 0.22, { type: 'sawtooth', volume: 0.07, delay: 0.5 + i * 0.07 }));
        [N.C5, N.G5, N.C6, N.E6, N.G6, N.C7].forEach(f => this.playTone(f, 2.0, { type: 'triangle', volume: 0.1, delay: 1.3 }));
        this.playNoise(1.2, { volume: 0.08, delay: 1.3, freq: 6000 });
    }
};

/**
 * Synthesised sound effects (WebAudio, no audio files).
 * The AudioContext is only created on the first user gesture (required by
 * mobile browsers), so nothing plays before the first tap.
 */
export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.master = null;
        this.enabled = this.loadPreference();
        this.lastClickTime = 0;
        this.lastAutoClickTime = 0;

        this.installUnlockHandlers();
    }

    // ===== Setup =====

    loadPreference() {
        try {
            return localStorage.getItem(SETTINGS_KEY) !== 'off';
        } catch (e) {
            return true;
        }
    }

    /** Create/resume the audio context on the first tap or key press */
    installUnlockHandlers() {
        const unlock = () => {
            this.unlock();
            if (this.audioContext && this.audioContext.state === 'running') {
                ['pointerdown', 'touchend', 'keydown'].forEach(evt =>
                    window.removeEventListener(evt, unlock, true));
            }
        };
        ['pointerdown', 'touchend', 'keydown'].forEach(evt =>
            window.addEventListener(evt, unlock, true));
    }

    unlock() {
        if (!this.audioContext) {
            try {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (!Ctx) return;
                this.audioContext = new Ctx();
                this.master = this.audioContext.createGain();
                this.master.gain.value = 0.7;
                this.master.connect(this.audioContext.destination);
            } catch (e) {
                console.warn('Web Audio API not supported', e);
                return;
            }
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume().catch(() => { });
        }
    }

    /** True only once the user has interacted and sound is switched on */
    get ready() {
        return this.enabled && this.audioContext && this.audioContext.state === 'running';
    }

    // ===== Building blocks =====

    /**
     * Play one enveloped oscillator note.
     * @param {number} freq - frequency in Hz
     * @param {number} duration - seconds
     * @param {object} opts - delay (s), type, volume, slideTo (Hz)
     */
    playTone(freq, duration, { delay = 0, type = 'sine', volume = 0.2, slideTo = null } = {}) {
        if (!this.ready) return;
        const ctx = this.audioContext;
        const start = ctx.currentTime + delay;
        const end = start + duration;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, end);

        // Quick attack avoids clicks, exponential decay sounds natural
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        osc.connect(gain);
        gain.connect(this.master);
        osc.start(start);
        osc.stop(end + 0.02);
    }

    /** Short burst of filtered noise (for tick/sparkle textures) */
    playNoise(duration, { delay = 0, volume = 0.08, freq = 3000 } = {}) {
        if (!this.ready) return;
        const ctx = this.audioContext;
        const start = ctx.currentTime + delay;

        const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(volume, start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);
        src.start(start);
    }

    // ===== Game sounds =====

    /** Juicy click: pitch climbs with the combo (0..1 intensity) */
    playClick(comboLevel = 0) {
        if (!this.ready) return;
        const now = performance.now();
        if (now - this.lastClickTime < 35) return;  // Avoid stacking on rapid taps
        this.lastClickTime = now;

        const pitch = 520 * Math.pow(2, Math.min(comboLevel, 1) * 1.2);
        this.playTone(pitch, 0.09, { type: 'triangle', volume: 0.22, slideTo: pitch * 1.5 });
        this.playNoise(0.03, { volume: 0.05 });
    }

    /**
     * Quiet, slightly detuned click for auto-clickers: same pitch curve as playClick, but softer and
     * rate-limited so a crowd of fingers sounds like a soft background rhythm, not a wall of noise.
     */
    playAutoClick(comboLevel = 0) {
        if (!this.ready) return;
        const now = performance.now();
        if (now - this.lastAutoClickTime < 110) return;
        this.lastAutoClickTime = now;

        const pitch = 520 * Math.pow(2, Math.min(comboLevel, 1) * 1.2) * (0.94 + Math.random() * 0.12);
        this.playTone(pitch, 0.07, { type: 'triangle', volume: 0.08, slideTo: pitch * 1.4 });
    }

    /** Coin-like two-tone chime */
    playPurchase() {
        this.playTone(N.E5, 0.12, { type: 'triangle', volume: 0.2 });
        this.playTone(N.A5, 0.22, { type: 'triangle', volume: 0.2, delay: 0.07 });
        this.playNoise(0.05, { volume: 0.04, delay: 0.07, freq: 6000 });
    }

    /** Rising arpeggio for upgrades and facilities */
    playUpgrade() {
        [N.C5, N.E5, N.G5, N.C6].forEach((f, i) =>
            this.playTone(f, 0.16, { type: 'square', volume: 0.09, delay: i * 0.07 }));
        this.playTone(N.E6, 0.35, { type: 'sine', volume: 0.15, delay: 0.3 });
    }

    /** Big celebration for graduating (prestige) */
    playGraduate() {
        const melody = [N.C5, N.E5, N.G5, N.C6, N.G5, N.C6, N.E6, N.G6];
        melody.forEach((f, i) =>
            this.playTone(f, 0.2, { type: 'triangle', volume: 0.2, delay: i * 0.1 }));
        [N.C5, N.E5, N.G5, N.C6].forEach(f =>
            this.playTone(f, 0.9, { type: 'sine', volume: 0.1, delay: 0.85 }));
        this.playNoise(0.4, { volume: 0.05, delay: 0.85, freq: 7000 });
    }

    /** Fanfare for achievements */
    playAchievement() {
        this.playTone(N.E5, 0.1, { type: 'triangle', volume: 0.2 });
        this.playTone(N.G5, 0.1, { type: 'triangle', volume: 0.2, delay: 0.1 });
        this.playTone(N.C6, 0.1, { type: 'triangle', volume: 0.2, delay: 0.2 });
        this.playTone(N.E6, 0.4, { type: 'sine', volume: 0.18, delay: 0.3 });
    }

    /** Small sparkle for milestones and campus stages */
    playMilestone() {
        [N.G5, N.C6, N.E6, N.G6].forEach((f, i) =>
            this.playTone(f, 0.14, { type: 'sine', volume: 0.14, delay: i * 0.06 }));
    }

    /** Combo tier-up (tier 5..10): grows from a chime to a nuclear boom and a full fanfare; 11+ have their own themes */
    playComboTier(tier) {
        if (!this.ready) return;
        if (SCHOOL_FANFARES[tier]) {
            SCHOOL_FANFARES[tier].call(this);
            return;
        }
        const rise = [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6];
        if (tier <= 8) {
            rise.slice(0, 3 + (tier - 5)).forEach((f, i) =>
                this.playTone(f, 0.18, { type: 'sawtooth', volume: 0.07, delay: i * 0.06 }));
            this.playTone(N.C7, 0.4, { type: 'sine', volume: 0.12, delay: 0.3 });
            return;
        }
        // Boom: low sine drop plus a noise crack
        this.playTone(110, 0.8, { type: 'sine', volume: 0.35, slideTo: 28 });
        this.playNoise(0.5, { volume: 0.12, freq: 600 });
        if (tier === 9) {
            rise.forEach((f, i) => this.playTone(f, 0.2, { type: 'square', volume: 0.07, delay: 0.25 + i * 0.06 }));
            return;
        }
        // Tier 10: triumphant fanfare
        [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6, N.C7].forEach((f, i) =>
            this.playTone(f, 0.25, { type: 'sawtooth', volume: 0.09, delay: 0.3 + i * 0.09 }));
        [N.C5, N.G5, N.C6, N.E6].forEach(f =>
            this.playTone(f, 1.4, { type: 'triangle', volume: 0.13, delay: 1.0 }));
        this.playNoise(0.8, { volume: 0.08, delay: 1.0, freq: 5000 });
    }

    /** Golden badge appears (soft shimmer) */
    playGoldenSpawn() {
        this.playTone(N.G6, 0.25, { type: 'sine', volume: 0.1 });
        this.playTone(N.C7, 0.3, { type: 'sine', volume: 0.08, delay: 0.12 });
    }

    /** Golden badge caught */
    playGoldenCatch() {
        [N.C5, N.E5, N.G5, N.C6, N.E6, N.G6, N.C7].forEach((f, i) =>
            this.playTone(f, 0.18, { type: 'triangle', volume: 0.16, delay: i * 0.05 }));
        this.playNoise(0.3, { volume: 0.05, delay: 0.3, freq: 7000 });
    }

    /** Soft "can't do that" buzz */
    playError() {
        this.playTone(180, 0.15, { type: 'sawtooth', volume: 0.08, slideTo: 120 });
    }

    /** Tiny tick for tab switches and toggles */
    playTab() {
        this.playTone(900, 0.05, { type: 'sine', volume: 0.1 });
    }

    // ===== Settings =====

    setEnabled(on) {
        this.enabled = !!on;
        try {
            localStorage.setItem(SETTINGS_KEY, this.enabled ? 'on' : 'off');
        } catch (e) { /* storage unavailable: preference just won't persist */ }
        if (this.enabled) this.unlock();
        return this.enabled;
    }

    toggle() {
        return this.setEnabled(!this.enabled);
    }
}

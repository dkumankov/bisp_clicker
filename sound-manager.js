const SETTINGS_KEY = 'bisp_clicker_sound';

// Note frequencies (Hz) used by the jingles
const N = {
    C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880.0,
    C6: 1046.5, E6: 1318.5, G6: 1568.0, C7: 2093.0
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

    /** Combo tier-up (tier 5..10): grows from a chime to a nuclear boom and a full fanfare */
    playComboTier(tier) {
        if (!this.ready) return;
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

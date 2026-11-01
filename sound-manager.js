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

// Context lifecycle tuning (see the comments in SoundManager)
const RESUME_CHECK_MS = 1500;   // a gesture-driven resume() that hasn't reached 'running' by then has failed
const MAX_FAILED_RESUMES = 3;   // ...this many in a row: the context is dead (iOS), build a new one on the next tap
const KICK_AFTER_HIDDEN_MS = 3000;  // back from the background after this long: suspend+resume on the first tap
const MAX_VOICES = 64;          // hard cap on overlapping notes; new ones are dropped beyond it
const NOISE_SECONDS = 2;        // one shared noise buffer, every burst plays a random slice of it
// Envelope edges: a gain that jumps (or rises within a couple of ms) is heard as a high click on top of
// the note. Measured in an OfflineAudioContext render of fast taps + fanfares, these remove those steps.
const TONE_ATTACK = 0.02;       // linear fade-in of a note (capped to a quarter of very short notes)
const NOISE_ATTACK = 0.005;     // noise slices start at a random sample, never at full volume
// Notes start this far ahead of currentTime: on mobile the render thread can already be past the value
// main-thread JS sees, and a note scheduled "in the past" starts mid-fade-in, i.e. with a jump
const LOOKAHEAD = 0.01;
// The compressor adds automatic makeup gain (~+4 dB at these settings): 0.45 into it is as loud as
// the old plain 0.7 for a single sound (measured), only stacked peaks get squashed
const MASTER_WITH_COMPRESSOR = 0.45;

/**
 * Synthesised sound effects (WebAudio, no audio files).
 * The AudioContext is only created on the first user gesture (required by
 * mobile browsers), so nothing plays before the first tap.
 *
 * Signal chain: notes -> master gain -> compressor -> speakers. The compressor only bites when many
 * sounds stack up (fanfares over a crowd of auto-clicks) and keeps the sum from clipping.
 * All timing is scheduled on the audio clock (ctx.currentTime), never with timers, so melodies are
 * unaffected by throttled background tabs.
 */
export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.master = null;
        this.enabled = this.loadPreference();
        this.lastClickTime = 0;
        this.lastAutoClickTime = 0;

        this.noiseBuffer = null;
        this.voiceEnds = [];          // audio-clock end times of the notes still sounding
        this.failedResumes = 0;
        this.resumeCheck = null;      // timer verifying the last gesture-driven resume()
        this.needsRecreate = false;   // the context is beyond repair: replace it on the next gesture
        this.needsKick = false;       // back from the background: suspend+resume on the next gesture
        this.hiddenAt = 0;
        this.clockProbe = null;       // {ctx, wall} sample to spot a 'running' context whose clock is frozen

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

    /**
     * Create/resume the audio context on user gestures. The listeners stay for the whole session:
     * resume() is async (the state may still read 'suspended' right after the first tap), and iOS
     * suspends or 'interrupts' the context whenever the app is backgrounded, the screen locks or a call
     * comes in. Only a gesture is guaranteed to bring it back, so every tap retries until it runs.
     */
    installUnlockHandlers() {
        const onGesture = () => {
            if (!this.enabled) return;
            if (this.clockFrozen()) this.needsKick = true;
            if (this.running && !this.needsKick) return;  // cheap no-op once sound works
            this.unlock(true);
        };
        ['pointerdown', 'touchend', 'click', 'keydown'].forEach(evt =>
            window.addEventListener(evt, onGesture, true));

        // Back from the background / bfcache / a frozen tab: try right away (allowed once unlocked on
        // most browsers); if that isn't enough, the next tap retries with a gesture
        const onReturn = () => {
            if (document.hidden) return;
            if (this.hiddenAt && performance.now() - this.hiddenAt > KICK_AFTER_HIDDEN_MS) this.needsKick = true;
            this.hiddenAt = 0;
            this.clockProbe = null;   // the clock legitimately stood still while hidden
            if (this.enabled && this.audioContext && !this.running) this.unlock(false);
        };
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) this.hiddenAt = this.hiddenAt || performance.now();
            else onReturn();
        });
        window.addEventListener('pageshow', onReturn);
        window.addEventListener('focus', onReturn);
        document.addEventListener('resume', onReturn);   // Page Lifecycle: tab unfrozen (Chrome)
        document.addEventListener('freeze', () => { this.hiddenAt = this.hiddenAt || performance.now(); });
    }

    /** Build a fresh context and master chain (must run inside a gesture to start unlocked) */
    createContext() {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return false;
        // Play even in silent mode (iOS mute switch). Requires iOS 17+; harmless elsewhere.
        // Tradeoff (Stas's decision): this session type pauses the player's own music.
        try {
            if (navigator.audioSession) navigator.audioSession.type = 'playback';
        } catch (e) { /* not supported: keep the default (silent switch wins) */ }
        try {
            const ctx = new Ctx();
            const master = ctx.createGain();
            master.gain.value = 0.7;
            let out = ctx.destination;
            if (ctx.createDynamicsCompressor) {
                // Transparent for single sounds (its auto makeup gain is offset by the lower master
                // level), squashes only the peaks of many overlapping ones
                const comp = ctx.createDynamicsCompressor();
                comp.threshold.value = -12;
                comp.knee.value = 6;
                comp.ratio.value = 4;
                comp.attack.value = 0.003;
                comp.release.value = 0.25;
                comp.connect(ctx.destination);
                out = comp;
                master.gain.value = MASTER_WITH_COMPRESSOR;
            }
            master.connect(out);
            // React to the browser's own state changes too, not only to taps: iOS goes
            // 'interrupted' on calls/Siri/lock and may come back by itself
            ctx.addEventListener?.('statechange', () => this.onStateChange(ctx));
            this.audioContext = ctx;
            this.master = master;
            this.noiseBuffer = null;
            this.voiceEnds = [];
            this.failedResumes = 0;
            this.needsRecreate = false;
            this.needsKick = false;
            this.clockProbe = null;
            return true;
        } catch (e) {
            console.warn('Web Audio API not supported', e);
            this.audioContext = null;
            this.master = null;
            return false;
        }
    }

    onStateChange(ctx) {
        if (ctx !== this.audioContext) return;   // an old, replaced context
        if (ctx.state === 'running') {
            this.failedResumes = 0;
            return;
        }
        // 'suspended' / 'interrupted' while we're visible: ask to resume (may need a tap on iOS; the
        // gesture handler covers that). Not when hidden: the browser suspends on purpose then.
        if (ctx.state !== 'closed' && this.enabled && !document.hidden) this.resume(ctx);
    }

    resume(ctx) {
        try {
            return Promise.resolve(ctx.resume()).catch(() => { });
        } catch (e) {
            return Promise.resolve();
        }
    }

    /**
     * Create the context (gesture only) or resume a suspended/interrupted one.
     * @param {boolean} gesture - called from inside a user gesture (only then may we create/replace)
     */
    unlock(gesture = true) {
        let ctx = this.audioContext;
        if (!ctx || ctx.state === 'closed' || this.needsRecreate) {
            if (!gesture) return;
            if (ctx && ctx.state !== 'closed') ctx.close?.().catch(() => { });
            if (!this.createContext()) return;
            ctx = this.audioContext;
        }

        if (ctx.state === 'running') {
            // iOS can report 'running' while the output is muted (after another app played audio, or
            // after a long background): suspend+resume re-attaches the output. A frozen clock means
            // the same (needsKick is set for both). Only inside a gesture, so the resume half is allowed.
            if (gesture && this.needsKick) {
                this.needsKick = false;
                this.clockProbe = null;
                Promise.resolve(ctx.suspend?.()).catch(() => { }).then(() => this.resume(ctx));
                this.verifyResume(ctx);
            }
            return;
        }

        // 'suspended' everywhere, 'interrupted' on iOS after calls / app switches
        this.resume(ctx);
        if (gesture) {
            this.verifyResume(ctx);
            // Older iOS only unlocks output once something actually starts inside the gesture: a silent sample
            try {
                const src = ctx.createBufferSource();
                src.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
                src.connect(ctx.destination);
                src.start(0);
            } catch (e) { /* not fatal: resume() alone works on current browsers */ }
        }
    }

    /**
     * A gesture-driven resume must reach 'running' shortly. iOS 17+ sometimes leaves a context stuck in
     * 'interrupted'/'suspended' for good after a long background: count the failures and, after a few,
     * close it and build a new one on the next tap (a fresh context works again).
     */
    verifyResume(ctx) {
        if (this.resumeCheck) return;   // one check in flight is enough, taps don't stack them
        const t0 = ctx.currentTime;
        this.resumeCheck = setTimeout(() => {
            this.resumeCheck = null;
            if (ctx !== this.audioContext) return;
            // Running *and* the clock moved (a 'running' context with a stopped clock is just as dead)
            if (ctx.state === 'running' && ctx.currentTime - t0 > RESUME_CHECK_MS / 1000 * 0.25) {
                this.failedResumes = 0;
                return;
            }
            if (document.hidden) return;   // not a failure: we left before it could resume
            if (++this.failedResumes >= MAX_FAILED_RESUMES) {
                this.needsRecreate = true;
                ctx.close?.().catch(() => { });
            }
        }, RESUME_CHECK_MS);
    }

    /**
     * 'running' but the audio clock doesn't move: the output is dead (seen on iOS after interruptions).
     * Compares how far ctx.currentTime moved against wall time since the previous probe.
     */
    clockFrozen() {
        const ctx = this.audioContext;
        if (!ctx || ctx.state !== 'running' || document.hidden) return false;
        const wall = performance.now();
        const probe = this.clockProbe;
        if (!probe || probe.ctx !== ctx) {
            this.clockProbe = { ctx, time: ctx.currentTime, wall };
            return false;
        }
        const dWall = (wall - probe.wall) / 1000;
        if (dWall < 1) return false;   // too short to judge (the clock advances in blocks)
        const dCtx = ctx.currentTime - probe.time;
        this.clockProbe = { ctx, time: ctx.currentTime, wall };
        return dCtx < dWall * 0.25;
    }

    /** The context exists and is producing sound */
    get running() {
        return !!this.audioContext && this.audioContext.state === 'running';
    }

    /** True only once the user has interacted and sound is switched on */
    get ready() {
        return this.enabled && this.running;
    }

    // ===== Building blocks =====

    /** Reserve a voice until `end` (audio clock); false when MAX_VOICES notes are already sounding */
    takeVoice(end) {
        const now = this.audioContext.currentTime;
        if (this.voiceEnds.length >= MAX_VOICES) this.voiceEnds = this.voiceEnds.filter(t => t > now);
        if (this.voiceEnds.length >= MAX_VOICES) return false;
        this.voiceEnds.push(end);
        return true;
    }

    /**
     * Play one enveloped oscillator note.
     * @param {number} freq - frequency in Hz
     * @param {number} duration - seconds
     * @param {object} opts - delay (s), type, volume, slideTo (Hz)
     */
    playTone(freq, duration, { delay = 0, type = 'sine', volume = 0.2, slideTo = null } = {}) {
        if (!this.ready) return;
        const ctx = this.audioContext;
        const start = ctx.currentTime + LOOKAHEAD + delay;
        const end = start + duration;
        if (!this.takeVoice(end + 0.02)) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, start);
        if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, end);

        // Linear attack from silence (an exponential one sits near zero, then shoots up in its last
        // 1-2 ms: a click), exponential decay sounds natural; stop only once the gain is ~0.
        // The ramp adds energy the old near-instant attack didn't have (+3 dB on a 90 ms click):
        // scale the peak so every note keeps its old loudness (long notes are barely touched)
        const attack = Math.min(TONE_ATTACK, duration / 4);
        const tail = 2 * Math.log(Math.max(volume, 0.001) / 0.0001);   // energy decay of the tail per second
        const peak = volume * Math.sqrt((duration / tail) / (attack / 3 + (duration - attack) / tail));
        // value = 0 first: a GainNode is 1 until its first event, and a source starting a fraction of a
        // sample early would put one full-scale sample through it
        gain.gain.value = 0;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(peak, start + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);

        osc.connect(gain);
        gain.connect(this.master);
        // Free the nodes right away (some WebKit versions keep finished, still-connected nodes alive)
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
        osc.start(start);
        osc.stop(end + 0.02);
    }

    /** Shared white noise for this context, made once instead of on every burst */
    getNoiseBuffer() {
        const ctx = this.audioContext;
        if (!this.noiseBuffer) {
            const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * NOISE_SECONDS), ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
            this.noiseBuffer = buffer;
        }
        return this.noiseBuffer;
    }

    /** Short burst of filtered noise (for tick/sparkle textures) */
    playNoise(duration, { delay = 0, volume = 0.08, freq = 3000 } = {}) {
        if (!this.ready) return;
        const ctx = this.audioContext;
        const start = ctx.currentTime + LOOKAHEAD + delay;
        duration = Math.min(duration, NOISE_SECONDS);
        if (!this.takeVoice(start + duration)) return;

        const src = ctx.createBufferSource();
        src.buffer = this.getNoiseBuffer();
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = freq;
        const gain = ctx.createGain();
        gain.gain.value = 0;   // see playTone
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(volume, start + Math.min(NOISE_ATTACK, duration / 4));
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

        src.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);
        src.onended = () => { src.disconnect(); filter.disconnect(); gain.disconnect(); };
        // A random slice of the shared buffer, so repeated bursts don't sound identical
        src.start(start, Math.random() * (NOISE_SECONDS - duration));
        src.stop(start + duration);
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

export class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;

        // Initialize audio context on first user interaction
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.warn('Web Audio API not supported', e);
            this.enabled = false;
        }
    }

    /**
     * Play a click sound (short beep)
     */
    playClick() {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Short, pleasant click sound
        oscillator.frequency.value = 800; // Higher pitch
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    /**
     * Play a purchase sound (success chime)
     */
    playPurchase() {
        if (!this.enabled || !this.audioContext) return;

        // Two-tone success sound
        this.playTone(523.25, 0.15, 0); // C5
        this.playTone(659.25, 0.2, 0.1); // E5
    }

    /**
     * Play a graduate sound (celebration)
     */
    playGraduate() {
        if (!this.enabled || !this.audioContext) return;

        // Ascending celebration melody
        this.playTone(523.25, 0.15, 0);    // C5
        this.playTone(659.25, 0.15, 0.15); // E5
        this.playTone(783.99, 0.3, 0.3);   // G5
    }

    /**
     * Play achievement unlock sound
     */
    playAchievement() {
        if (!this.enabled || !this.audioContext) return;

        // Triumphant sound
        this.playTone(659.25, 0.1, 0);    // E5
        this.playTone(783.99, 0.1, 0.1);  // G5
        this.playTone(1046.50, 0.3, 0.2); // C6
    }

    /**
     * Helper function to play a tone
     */
    playTone(frequency, duration, delay = 0) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        const startTime = this.audioContext.currentTime + delay;
        const endTime = startTime + duration;

        gainNode.gain.setValueAtTime(0.2, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);

        oscillator.start(startTime);
        oscillator.stop(endTime);
    }

    /**
     * Toggle sound on/off
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Set volume (0.0 to 1.0)
     */
    setVolume(volume) {
        // For future implementation with master gain node
        console.log('Volume control not yet implemented');
    }
}

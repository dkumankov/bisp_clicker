// Save format version. v1 = original format (no version field).
// v2 only ADDS optional fields (best_combo, golden_clicks, leaderboard_name, last_bonus_date), so v1 saves load unchanged.
const SAVE_VERSION = 2;

// Ignore "away" times shorter than this when showing the welcome-back screen
const MIN_OFFLINE_SECONDS = 30;
const MAX_OFFLINE_SECONDS = 86400;  // 24 hours

/** Return a finite number, or the fallback for NaN/undefined/garbage */
function num(value, fallback = 0) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/** Copy saved values over the defaults, so ids added in newer versions are never missing */
function mergeMap(defaults, saved) {
    return { ...defaults, ...(saved && typeof saved === 'object' ? saved : {}) };
}

export class SaveManager {
    constructor(saveKey = 'bisp_clicker_save') {
        this.saveKey = saveKey;
        this.locked = false;  // Set while resetting so nothing re-writes the save
    }

    saveGame(gameEngine) {
        if (this.locked) return false;

        const saveData = {
            version: SAVE_VERSION,
            iq: gameEngine.iq,
            total_iq_earned: gameEngine.total_iq_earned,
            lifetime_iq: gameEngine.lifetime_iq,
            click_power: gameEngine.click_power,
            clicks: gameEngine.clicks,
            students: gameEngine.students,
            teachers: gameEngine.teachers,
            facilities: gameEngine.facilities,
            upgrades: gameEngine.upgrades,
            achievements: gameEngine.achievements,
            certificates: gameEngine.certificates,
            graduations: gameEngine.graduations,
            best_combo: gameEngine.best_combo,
            golden_clicks: gameEngine.golden_clicks,
            leaderboard_name: gameEngine.leaderboard_name,
            last_bonus_date: gameEngine.last_bonus_date,
            last_save_time: Date.now(),
            // Steady rate without temporary events, so bonuses don't inflate offline progress
            iq_per_second: gameEngine.calculateIQPerSecond(false)
        };

        try {
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('Error saving game:', e);
            return false;
        }
    }

    /**
     * Load a save into the engine.
     * @returns {{loaded: boolean, offlineIQ: number, offlineSeconds: number}}
     */
    loadGame(gameEngine) {
        const result = { loaded: false, offlineIQ: 0, offlineSeconds: 0 };
        try {
            const saveDataStr = localStorage.getItem(this.saveKey);
            if (!saveDataStr) {
                return result;
            }

            const saveData = JSON.parse(saveDataStr);

            // Restore game state
            gameEngine.iq = num(saveData.iq);
            gameEngine.total_iq_earned = num(saveData.total_iq_earned);
            gameEngine.lifetime_iq = num(saveData.lifetime_iq);
            gameEngine.click_power = num(saveData.click_power, 1.0) || 1.0;
            gameEngine.clicks = num(saveData.clicks);
            gameEngine.students = mergeMap(gameEngine.students, saveData.students);
            gameEngine.teachers = mergeMap(gameEngine.teachers, saveData.teachers);
            gameEngine.facilities = mergeMap(gameEngine.facilities, saveData.facilities);
            gameEngine.upgrades = mergeMap(gameEngine.upgrades, saveData.upgrades);
            gameEngine.achievements = mergeMap(gameEngine.achievements, saveData.achievements);
            gameEngine.certificates = num(saveData.certificates);
            gameEngine.graduations = num(saveData.graduations);
            gameEngine.best_combo = num(saveData.best_combo);      // Missing in v1 saves
            gameEngine.golden_clicks = num(saveData.golden_clicks);  // Missing in v1 saves
            gameEngine.leaderboard_name = typeof saveData.leaderboard_name === 'string' ? saveData.leaderboard_name : '';  // Missing in older saves
            gameEngine.last_bonus_date = typeof saveData.last_bonus_date === 'string' ? saveData.last_bonus_date : '';  // Missing in older saves
            result.loaded = true;

            // Calculate offline progress
            const lastSaveTime = num(saveData.last_save_time, Date.now());
            const iqPerSecond = num(saveData.iq_per_second);
            const seconds = this.getAwaySeconds(lastSaveTime);
            const offlineIQ = iqPerSecond * seconds;

            if (offlineIQ > 0) {
                gameEngine.addIQ(offlineIQ);
                if (seconds >= MIN_OFFLINE_SECONDS) {
                    result.offlineIQ = offlineIQ;
                    result.offlineSeconds = seconds;
                }
            }
            return result;
        } catch (e) {
            console.error('Error loading game:', e);
            return result;
        }
    }

    /** Seconds since the given timestamp, capped at 24 hours (clock changes can't go negative) */
    getAwaySeconds(lastTime) {
        const elapsed = (Date.now() - lastTime) / 1000;
        return Math.min(Math.max(elapsed, 0), MAX_OFFLINE_SECONDS);
    }

    saveExists() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    /** Erase the save and block further saves until the page is reloaded */
    deleteSave() {
        this.locked = true;
        try {
            localStorage.removeItem(this.saveKey);
            return true;
        } catch (e) {
            console.error('Error deleting save:', e);
            return false;
        }
    }
}

export { MIN_OFFLINE_SECONDS };

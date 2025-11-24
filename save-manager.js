export class SaveManager {
    constructor(saveKey = 'bisp_clicker_save') {
        this.saveKey = saveKey;
    }

    saveGame(gameEngine) {
        const saveData = {
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
            last_save_time: Date.now(),
            iq_per_second: gameEngine.iq_per_second
        };

        try {
            localStorage.setItem(this.saveKey, JSON.stringify(saveData));
            return true;
        } catch (e) {
            console.error('Error saving game:', e);
            return false;
        }
    }

    loadGame(gameEngine) {
        try {
            const saveDataStr = localStorage.getItem(this.saveKey);
            if (!saveDataStr) {
                return false;
            }

            const saveData = JSON.parse(saveDataStr);

            // Restore game state
            gameEngine.iq = saveData.iq || 0.0;
            gameEngine.total_iq_earned = saveData.total_iq_earned || 0.0;
            gameEngine.lifetime_iq = saveData.lifetime_iq || 0.0;
            gameEngine.click_power = saveData.click_power || 1.0;
            gameEngine.clicks = saveData.clicks || 0;
            gameEngine.students = saveData.students || {};
            gameEngine.teachers = saveData.teachers || {};
            gameEngine.facilities = saveData.facilities || {};
            gameEngine.upgrades = saveData.upgrades || {};
            gameEngine.achievements = saveData.achievements || {};
            gameEngine.certificates = saveData.certificates || 0;
            gameEngine.graduations = saveData.graduations || 0;

            // Calculate offline progress
            const lastSaveTime = saveData.last_save_time || Date.now();
            const iqPerSecond = saveData.iq_per_second || 0.0;
            const offlineIQ = this.calculateOfflineProgress(lastSaveTime, iqPerSecond);

            if (offlineIQ > 0) {
                gameEngine.addIQ(offlineIQ);
                return offlineIQ;  // Return offline IQ for display
            }

            return true;
        } catch (e) {
            console.error('Error loading game:', e);
            return false;
        }
    }

    calculateOfflineProgress(lastSaveTime, iqPerSecond) {
        const currentTime = Date.now();
        let timeElapsed = (currentTime - lastSaveTime) / 1000;  // Convert to seconds

        // Cap at 24 hours (86400 seconds)
        timeElapsed = Math.min(timeElapsed, 86400);

        // Calculate offline IQ
        const offlineIQ = iqPerSecond * timeElapsed;

        return offlineIQ;
    }

    saveExists() {
        return localStorage.getItem(this.saveKey) !== null;
    }

    deleteSave() {
        try {
            localStorage.removeItem(this.saveKey);
            return true;
        } catch (e) {
            console.error('Error deleting save:', e);
            return false;
        }
    }
}

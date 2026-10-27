import { STUDENTS, TEACHERS, FACILITIES, UPGRADES, ACHIEVEMENTS, PRESTIGE_CONFIG, COMBO_CONFIG, GOLDEN_CONFIG, CAMPUS_STAGES } from './data.js?v=3';

export class GameEngine {
    constructor() {
        this.iq = 0.0;
        this.total_iq_earned = 0.0;
        this.lifetime_iq = 0.0;  // Never resets, for prestige calculation
        this.click_power = 1.0;
        this.clicks = 0;

        // Buildings
        this.students = {};
        STUDENTS.forEach(s => this.students[s.id] = 0);

        this.teachers = {};
        TEACHERS.forEach(t => this.teachers[t.id] = 0);

        this.facilities = {};
        FACILITIES.forEach(f => this.facilities[f.id] = false);

        // Upgrades and achievements
        this.upgrades = {};
        UPGRADES.forEach(u => this.upgrades[u.id] = false);

        this.achievements = {};
        ACHIEVEMENTS.forEach(a => this.achievements[a.id] = false);

        // Prestige
        this.certificates = 0;
        this.graduations = 0;

        // Combo streak (runtime only, except best_combo which is saved)
        this.combo = 0;
        this.best_combo = 0;
        this.last_click_time = 0;

        // Golden badges caught (saved)
        this.golden_clicks = 0;

        // Active events (runtime only)
        this.active_events = [];

        // Stats
        this.last_update = Date.now();
        this.iq_per_second = 0.0;

        // Achievement notifications queue
        this.achievement_notifications = [];
    }

    handleClick(now = performance.now()) {
        this.clicks++;

        // Extend the combo streak if the click is quick enough, otherwise restart it
        if (this.combo > 0 && now - this.last_click_time <= COMBO_CONFIG.window_ms) {
            this.combo++;
        } else {
            this.combo = 1;
        }
        this.last_click_time = now;
        this.best_combo = Math.max(this.best_combo, this.combo);

        const clickValue = this.calculateClickPower() * this.getComboMultiplier();
        this.addIQ(clickValue);
        return clickValue;
    }

    getComboMultiplier() {
        let mult = 1;
        for (const tier of COMBO_CONFIG.tiers) {
            if (this.combo >= tier.min) mult = tier.mult;
        }
        return mult;
    }

    /** Fraction (0..1) of the combo window that is still left, for the combo meter */
    getComboTimeLeft(now = performance.now()) {
        if (this.combo === 0) return 0;
        return Math.max(0, 1 - (now - this.last_click_time) / COMBO_CONFIG.window_ms);
    }

    /** Called when a Golden School Badge is caught: temporary IQ/s boost */
    catchGoldenBadge() {
        this.golden_clicks++;
        this.active_events = this.active_events.filter(e => e.id !== 'golden');
        this.active_events.push({
            id: 'golden',
            type: 'student_bonus',
            multiplier: GOLDEN_CONFIG.multiplier,
            time_remaining: GOLDEN_CONFIG.duration
        });
    }

    /** Index of the current campus stage, based on lifetime IQ */
    getCampusStage() {
        let stage = 0;
        CAMPUS_STAGES.forEach((s, i) => {
            if (this.lifetime_iq >= s.threshold) stage = i;
        });
        return stage;
    }

    calculateClickPower() {
        let power = this.click_power;

        // Apply click upgrades
        for (const [upgradeId, purchased] of Object.entries(this.upgrades)) {
            if (purchased) {
                const upgrade = UPGRADES.find(u => u.id === upgradeId);
                if (upgrade && upgrade.type === "click_power") {
                    power *= upgrade.value;
                }
            }
        }

        // Apply achievement bonuses
        for (const [achId, unlocked] of Object.entries(this.achievements)) {
            if (unlocked) {
                const ach = ACHIEVEMENTS.find(a => a.id === achId);
                if (ach && ach.reward_type === "click_power") {
                    power *= ach.reward_value;
                }
            }
        }

        return power;
    }

    /**
     * @param {boolean} includeEvents - false gives the steady rate (used for offline progress)
     */
    calculateIQPerSecond(includeEvents = true) {
        let total = 0.0;

        // 1. Calculate production from students (with teacher synergy)
        for (const studentData of STUDENTS) {
            const studentId = studentData.id;
            const count = this.students[studentId] || 0;
            if (count > 0) {
                let baseProduction = studentData.base_production * count;

                // Apply teacher synergy multipliers
                let synergyMult = 1.0;
                for (const teacherData of TEACHERS) {
                    const targets = teacherData.targets || [];
                    if (targets.includes(studentId)) {
                        const teacherCount = this.teachers[teacherData.id] || 0;
                        if (teacherCount > 0) {
                            const bonus = teacherData.bonus_per_unit || 0.10;
                            synergyMult += teacherCount * bonus;
                        }
                    }
                }

                // Apply student-specific upgrade multipliers
                let upgradeMult = 1.0;
                for (const [upgradeId, purchased] of Object.entries(this.upgrades)) {
                    if (purchased) {
                        const upgrade = UPGRADES.find(u => u.id === upgradeId);
                        if (upgrade && upgrade.type === "student_multiplier") {
                            const target = upgrade.target || [];
                            if (target.includes(studentId)) {
                                upgradeMult *= upgrade.value;
                            }
                        }
                    }
                }

                total += baseProduction * synergyMult * upgradeMult;
            }
        }

        // 2. Calculate production from teachers themselves
        for (const teacherData of TEACHERS) {
            const teacherId = teacherData.id;
            const count = this.teachers[teacherId] || 0;
            if (count > 0) {
                total += teacherData.base_production * count;
            }
        }

        // 3. Apply global multipliers (Facilities, Upgrades, Achievements, Prestige)
        let globalMult = 1.0;

        // Facilities (Additive)
        let facilitiesMult = 1.0;
        for (const facility of FACILITIES) {
            if (this.facilities[facility.id]) {
                if (facility.effect_type === "global_multiplier") {
                    facilitiesMult += (facility.effect_value - 1.0);
                }
            }
        }
        globalMult *= facilitiesMult;

        // Global upgrades
        for (const [upgradeId, purchased] of Object.entries(this.upgrades)) {
            if (purchased) {
                const upgrade = UPGRADES.find(u => u.id === upgradeId);
                if (upgrade && upgrade.type === "global_multiplier") {
                    globalMult *= upgrade.value;
                }
            }
        }

        // Achievement bonuses
        for (const [achId, unlocked] of Object.entries(this.achievements)) {
            if (unlocked) {
                const ach = ACHIEVEMENTS.find(a => a.id === achId);
                if (ach && ach.reward_type === "global_multiplier") {
                    globalMult *= ach.reward_value;
                }
            }
        }

        // Certificate bonuses (prestige)
        if (this.certificates > 0) {
            globalMult *= (1 + this.certificates * PRESTIGE_CONFIG.certificate_bonus);
        }

        // Active event bonuses
        if (includeEvents) {
            for (const event of this.active_events) {
                if (event.type === "student_bonus" || event.type === "teacher_boost") {
                    globalMult *= event.multiplier;
                }
            }
        }

        total *= globalMult;

        return total;
    }

    calculateBuildingCost(buildingType, buildingId) {
        if (buildingType === "student") {
            const studentData = STUDENTS.find(s => s.id === buildingId);
            if (studentData) {
                const count = this.students[buildingId] || 0;
                const baseCost = studentData.base_cost;
                const multiplier = studentData.cost_multiplier;
                return Math.floor(baseCost * Math.pow(multiplier, count));
            }
        } else if (buildingType === "teacher") {
            const teacherData = TEACHERS.find(t => t.id === buildingId);
            if (teacherData) {
                const count = this.teachers[buildingId] || 0;
                const baseCost = teacherData.base_cost;
                const multiplier = teacherData.cost_multiplier || 1.2;
                return Math.floor(baseCost * Math.pow(multiplier, count));
            }
        } else if (buildingType === "facility") {
            const facilityData = FACILITIES.find(f => f.id === buildingId);
            if (facilityData) {
                return facilityData.cost;
            }
        }
        return 0;
    }

    canAfford(cost) {
        return this.iq >= cost;
    }

    purchaseStudent(studentId) {
        const cost = this.calculateBuildingCost("student", studentId);
        if (this.canAfford(cost)) {
            this.iq -= cost;
            this.students[studentId]++;
            return true;
        }
        return false;
    }

    purchaseTeacher(teacherId) {
        const cost = this.calculateBuildingCost("teacher", teacherId);
        if (this.canAfford(cost)) {
            this.iq -= cost;
            this.teachers[teacherId] = (this.teachers[teacherId] || 0) + 1;
            return true;
        }
        return false;
    }

    purchaseFacility(facilityId) {
        if (this.facilities[facilityId]) {
            return false;  // Already purchased
        }

        const cost = this.calculateBuildingCost("facility", facilityId);
        if (this.canAfford(cost)) {
            this.iq -= cost;
            this.facilities[facilityId] = true;
            return true;
        }
        return false;
    }

    purchaseUpgrade(upgradeId) {
        if (this.upgrades[upgradeId]) {
            return false;  // Already purchased
        }

        const upgrade = UPGRADES.find(u => u.id === upgradeId);
        if (!upgrade) {
            return false;
        }

        // Check requirements
        if (upgrade.requires) {
            const req = upgrade.requires;
            // Check if it's a facility requirement
            if (req in this.facilities) {
                if (!this.facilities[req]) {
                    return false;
                }
            }
            // Check if it's an upgrade requirement
            else if (req in this.upgrades) {
                if (!this.upgrades[req]) {
                    return false;
                }
            }
        }

        if (this.canAfford(upgrade.cost)) {
            this.iq -= upgrade.cost;
            this.upgrades[upgradeId] = true;
            return true;
        }
        return false;
    }

    canGraduate() {
        const threshold = PRESTIGE_CONFIG.base_threshold * Math.pow(PRESTIGE_CONFIG.threshold_multiplier, this.graduations);
        return this.total_iq_earned >= threshold;
    }

    graduate() {
        if (!this.canGraduate()) {
            return false;
        }

        // Calculate certificates earned
        const threshold = PRESTIGE_CONFIG.base_threshold * Math.pow(PRESTIGE_CONFIG.threshold_multiplier, this.graduations);
        const newCertificates = Math.floor(this.lifetime_iq / threshold);

        // Reset game state
        this.iq = 0.0;
        this.total_iq_earned = 0.0;
        this.students = {};
        STUDENTS.forEach(s => this.students[s.id] = 0);
        this.teachers = {};
        TEACHERS.forEach(t => this.teachers[t.id] = 0);
        this.facilities = {};
        FACILITIES.forEach(f => this.facilities[f.id] = false);
        this.upgrades = {};
        UPGRADES.forEach(u => this.upgrades[u.id] = false);

        // Keep achievements and prestige stats
        this.certificates += newCertificates;
        this.graduations++;

        return true;
    }

    addIQ(amount) {
        this.iq += amount;
        this.total_iq_earned += amount;
        this.lifetime_iq += amount;
    }

    update(deltaTime) {
        // Calculate IQ per second
        this.iq_per_second = this.calculateIQPerSecond();

        // Add passive IQ
        const iqGained = this.iq_per_second * deltaTime;
        this.addIQ(iqGained);

        // Update active events
        this.updateEvents(deltaTime);

        // Drop the combo once the streak window has passed
        if (this.combo > 0 && this.getComboTimeLeft() === 0) {
            this.combo = 0;
        }

        // Check achievements
        this.checkAchievements();

        this.last_update = Date.now();
    }

    updateEvents(deltaTime) {
        // Remove expired events
        this.active_events = this.active_events.filter(e => (e.time_remaining || 0) > 0);

        // Decrease timers
        for (const event of this.active_events) {
            if ('time_remaining' in event) {
                event.time_remaining -= deltaTime;
            }
        }
    }

    checkAchievements() {
        for (const ach of ACHIEVEMENTS) {
            const achId = ach.id;
            if (this.achievements[achId]) {
                continue;  // Already unlocked
            }

            let unlocked = false;
            const condition = ach.condition;
            const threshold = ach.threshold;

            if (condition === "clicks") {
                unlocked = this.clicks >= threshold;
            } else if (condition === "total_iq") {
                unlocked = this.total_iq_earned >= threshold;
            } else if (condition === "total_students") {
                const total = Object.values(this.students).reduce((sum, count) => sum + count, 0);
                unlocked = total >= threshold;
            } else if (condition === "total_teachers") {
                const total = Object.values(this.teachers).reduce((sum, count) => sum + count, 0);
                unlocked = total >= threshold;
            } else if (condition === "all_facilities") {
                const total = Object.values(this.facilities).filter(v => v).length;
                unlocked = total >= threshold;
            } else if (condition === "graduations") {
                unlocked = this.graduations >= threshold;
            } else if (condition === "best_combo") {
                unlocked = this.best_combo >= threshold;
            } else if (condition === "golden_clicks") {
                unlocked = this.golden_clicks >= threshold;
            }

            if (unlocked) {
                this.achievements[achId] = true;
                this.achievement_notifications.push(ach);
            }
        }
    }

    getTotalStudents() {
        return Object.values(this.students).reduce((sum, count) => sum + count, 0);
    }

    getTotalTeachers() {
        return Object.values(this.teachers).reduce((sum, count) => sum + count, 0);
    }

    /**
     * Calculate actual production for a single student type
     * Includes teacher synergies, upgrades, and global multipliers
     */
    calculateStudentProduction(studentId) {
        const studentData = STUDENTS.find(s => s.id === studentId);
        if (!studentData) return 0;

        let production = studentData.base_production;

        // Apply teacher synergy multipliers
        let synergyMult = 1.0;
        for (const teacherData of TEACHERS) {
            const targets = teacherData.targets || [];
            if (targets.includes(studentId)) {
                const teacherCount = this.teachers[teacherData.id] || 0;
                if (teacherCount > 0) {
                    const bonus = teacherData.bonus_per_unit || 0.10;
                    synergyMult += teacherCount * bonus;
                }
            }
        }

        // Apply student-specific upgrade multipliers
        let upgradeMult = 1.0;
        for (const [upgradeId, purchased] of Object.entries(this.upgrades)) {
            if (purchased) {
                const upgrade = UPGRADES.find(u => u.id === upgradeId);
                if (upgrade && upgrade.type === "student_multiplier") {
                    const target = upgrade.target || [];
                    if (target.includes(studentId)) {
                        upgradeMult *= upgrade.value;
                    }
                }
            }
        }

        // Apply global multipliers
        let globalMult = 1.0;

        // Facilities (Additive)
        let facilitiesMult = 1.0;
        for (const facility of FACILITIES) {
            if (this.facilities[facility.id]) {
                if (facility.effect_type === "global_multiplier") {
                    facilitiesMult += (facility.effect_value - 1.0);
                }
            }
        }
        globalMult *= facilitiesMult;

        // Global upgrades
        for (const [upgradeId, purchased] of Object.entries(this.upgrades)) {
            if (purchased) {
                const upgrade = UPGRADES.find(u => u.id === upgradeId);
                if (upgrade && upgrade.type === "global_multiplier") {
                    globalMult *= upgrade.value;
                }
            }
        }

        // Achievement bonuses
        for (const [achId, unlocked] of Object.entries(this.achievements)) {
            if (unlocked) {
                const ach = ACHIEVEMENTS.find(a => a.id === achId);
                if (ach && ach.reward_type === "global_multiplier") {
                    globalMult *= ach.reward_value;
                }
            }
        }

        // Certificate bonuses (prestige)
        if (this.certificates > 0) {
            globalMult *= (1 + this.certificates * PRESTIGE_CONFIG.certificate_bonus);
        }

        return production * synergyMult * upgradeMult * globalMult;
    }

    formatNumber(num) {
        if (num < 10) {
            return num.toFixed(1);
        } else if (num < 1000) {
            return Math.floor(num).toString();
        } else if (num < 1000000) {
            return (num / 1000).toFixed(1) + 'K';
        } else if (num < 1000000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num < 1000000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else {
            return (num / 1000000000000).toFixed(1) + 'T';
        }
    }

    formatNumberShort(num) {
        if (num < 10) {
            return parseFloat(num.toFixed(1)).toString();
        } else if (num < 1000) {
            return Math.floor(num).toString();
        } else if (num < 1000000) {
            return parseFloat((num / 1000).toFixed(1)) + 'K';
        } else if (num < 1000000000) {
            return parseFloat((num / 1000000).toFixed(1)) + 'M';
        } else if (num < 1000000000000) {
            return parseFloat((num / 1000000000).toFixed(1)) + 'B';
        } else {
            return parseFloat((num / 1000000000000).toFixed(1)) + 'T';
        }
    }
}


import { STUDENTS, TEACHERS, FACILITIES, UPGRADES, ACHIEVEMENTS, PRESTIGE_CONFIG, COMBO_CONFIG, GOLDEN_CONFIG, DAILY_BONUS_CONFIG, CAMPUS_STAGES, ECONOMY_CONFIG } from './data.js?v=c725eec6';

export class GameEngine {
    constructor() {
        this.iq = 0.0;
        this.total_iq_earned = 0.0;
        this.lifetime_iq = 0.0;  // Never resets, for prestige calculation
        this.click_power = 1.0;
        this.clicks = 0;
        this.last_bonus_date = '';  // Local date (YYYY-MM-DD) of the last daily bonus
        this.leaderboard_name = '';  // Player name for the leaderboard (never reset by graduation)

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
        if (this.combo > 0 && now - this.last_click_time <= this.getComboWindow()) {
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

    /** Tier number (0 = none, 1..N = COMBO_CONFIG.tiers position) reached by a streak length */
    getComboTier(count = this.combo) {
        return COMBO_CONFIG.tiers.filter(t => count >= t.min).length;
    }

    /** Fraction (0..1) of the combo window that is still left, for the combo meter */
    getComboTimeLeft(now = performance.now()) {
        if (this.combo === 0) return 0;
        return Math.max(0, 1 - (now - this.last_click_time) / this.getComboWindow());
    }

    /** Called when a Golden School Badge is caught: temporary IQ/s boost */
    catchGoldenBadge() {
        this.golden_clicks++;
        this.active_events = this.active_events.filter(e => e.id !== 'golden');
        this.active_events.push({
            id: 'golden',
            type: 'student_bonus',
            multiplier: GOLDEN_CONFIG.multiplier,
            duration: this.getGoldenDuration(),
            time_remaining: this.getGoldenDuration()
        });
    }

    /** Local calendar date as YYYY-MM-DD (honest per-day cooldown, not 24h) */
    static localDateKey(d = new Date()) {
        const p = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    }

    canClaimDailyBonus() {
        return this.last_bonus_date !== GameEngine.localDateKey();
    }

    /** Reward preview: IQ pack scaled by steady IQ/s and graduations, plus a click boost */
    getDailyBonus() {
        const cfg = DAILY_BONUS_CONFIG;
        const scale = 1 + Math.min(this.graduations, PRESTIGE_CONFIG.daily_graduation_cap) * cfg.prestige_step;
        const iq = Math.floor(Math.max(cfg.min_iq, this.calculateIQPerSecond(false) * cfg.iq_seconds) * scale);
        return { iq, click_multiplier: cfg.click_multiplier, click_duration: cfg.click_duration };
    }

    /** Grant the daily bonus once per local date. @returns the reward, or null if already claimed */
    claimDailyBonus() {
        if (!this.canClaimDailyBonus()) return null;
        const reward = this.getDailyBonus();
        this.last_bonus_date = GameEngine.localDateKey();
        this.addIQ(reward.iq);
        this.active_events = this.active_events.filter(e => e.id !== 'daily_click');
        this.active_events.push({
            id: 'daily_click',
            type: 'click_bonus',
            multiplier: reward.click_multiplier,
            time_remaining: reward.click_duration
        });
        return reward;
    }

    /** Index of the current campus stage, based on lifetime IQ */
    getCampusStage() {
        let stage = 0;
        CAMPUS_STAGES.forEach((s, i) => {
            if (this.lifetime_iq >= s.threshold) stage = i;
        });
        return stage;
    }

    /** Purchased upgrades of one type */
    getUpgrades(type) {
        return UPGRADES.filter(u => this.upgrades[u.id] && u.type === type);
    }

    /** Owned facilities with one effect type */
    getFacilityEffects(type) {
        return FACILITIES.filter(f => this.facilities[f.id] && f.effect_type === type);
    }

    /** Product of the unlocked achievement rewards of one type */
    getAchievementMultiplier(rewardType) {
        let mult = 1.0;
        for (const ach of ACHIEVEMENTS) {
            if (this.achievements[ach.id] && ach.reward_type === rewardType) mult *= ach.reward_value;
        }
        return mult;
    }

    /** Sum of the bonuses (value - 1) of owned facilities of one type, e.g. 1.15 and 1.10 give +0.25 */
    getFacilityBonus(type) {
        return this.getFacilityEffects(type).reduce((sum, f) => sum + (f.effect_value - 1.0), 0);
    }

    /** Combo window in ms, stretched by the legendary combo facility */
    getComboWindow() {
        return this.getFacilityEffects('combo_extend').reduce((w, f) => w * f.effect_value, COMBO_CONFIG.window_ms);
    }

    /** Seconds the golden bonus lasts, stretched by legendary upgrades */
    getGoldenDuration() {
        return this.getUpgrades('golden_duration').reduce((d, u) => d * u.value, GOLDEN_CONFIG.duration);
    }

    /** Delay range (seconds) between golden badges; the legendary facility guarantees a badge within its value */
    getGoldenDelayRange() {
        let min = GOLDEN_CONFIG.min_delay;
        let max = GOLDEN_CONFIG.max_delay;
        for (const f of this.getFacilityEffects('golden_guarantee')) {
            max = Math.min(max, f.effect_value);
            min = Math.min(min, f.effect_value * 0.6);
        }
        return { min, max };
    }

    /** Certificates a graduation would grant: 1, +1 per N past graduations, plus legendary facility bonuses */
    getCertificatesForGraduation() {
        const c = PRESTIGE_CONFIG;
        const bonus = this.getFacilityEffects('certificate_bonus').reduce((sum, f) => sum + f.effect_value, 0);
        return 1 + Math.floor(this.graduations / c.bonus_certificate_every) + bonus;
    }

    calculateClickPower() {
        let power = this.click_power;

        for (const upgrade of this.getUpgrades("click_power")) {
            power *= upgrade.value;
        }

        // Click facilities (additive between themselves)
        power *= 1.0 + this.getFacilityBonus("click_power");

        power *= this.getAchievementMultiplier("click_power");

        // Flat bonuses on top of the multiplied power: IQ per owned student, and a share of the steady IQ/s (legendary facility)
        const students = this.getTotalStudents();
        for (const upgrade of this.getUpgrades("per_student_click")) {
            power += upgrade.value * students;
        }
        for (const f of this.getFacilityEffects("click_ips_share")) {
            power += this.calculateIQPerSecond(false) * f.effect_value;
        }

        for (const event of this.active_events) {
            if (event.type === 'click_bonus') power *= event.multiplier;
        }

        return power;
    }

    /** Standard global upgrades multiply together, but past the soft cap they only count by sqrt */
    softCapGlobalUpgrades(mult) {
        const { cap, exponent } = ECONOMY_CONFIG.global_upgrade_soft_cap;
        return mult <= cap ? mult : cap * Math.pow(mult / cap, exponent);
    }

    /**
     * Multiplier applied to all IQ/s: facilities, capped upgrades, achievements, certificates, prestige upgrades
     * @param {boolean} includeEvents - false gives the steady rate (used for offline progress)
     */
    getGlobalMultiplier(includeEvents = true) {
        // Facilities (additive between themselves)
        let mult = 1.0 + this.getFacilityBonus("global_multiplier");

        // Standard global upgrades (multiplicative, soft-capped)
        let upgradeMult = 1.0;
        for (const upgrade of this.getUpgrades("global_multiplier")) {
            upgradeMult *= upgrade.value;
        }
        mult *= this.softCapGlobalUpgrades(upgradeMult);

        mult *= this.getAchievementMultiplier("global_multiplier");

        if (this.certificates > 0) {
            mult *= this.getCertificateMultiplier();
        }

        // Prestige synergy (outside the soft cap): bonus per graduation / certificate, or compounding per graduation
        for (const upgrade of this.getUpgrades("prestige_synergy")) {
            const units = upgrade.per === "certificate" ? this.certificates : this.graduations;
            mult *= 1.0 + upgrade.value * units;
        }
        for (const upgrade of this.getUpgrades("prestige_compound")) {
            mult *= Math.pow(upgrade.value, Math.min(this.graduations, upgrade.cap));
        }

        if (includeEvents) {
            for (const event of this.active_events) {
                if (event.type === "student_bonus" || event.type === "teacher_boost") {
                    mult *= event.multiplier;
                }
            }
        }

        return mult;
    }

    /** 1 + teacher bonuses for one student type; regular teachers stop at the synergy cap */
    getTeacherSynergy(studentId) {
        let regular = 0.0;
        let exempt = 0.0;
        for (const teacherData of TEACHERS) {
            const count = this.teachers[teacherData.id] || 0;
            if (count === 0 || !(teacherData.targets || []).includes(studentId)) continue;
            const bonus = (teacherData.bonus_per_unit || 0.10) * (1 + (teacherData.prestige_scale || 0) * this.graduations) * count;
            if (teacherData.cap_exempt) exempt += bonus;
            else regular += bonus;
        }
        return 1.0 + Math.min(regular, ECONOMY_CONFIG.teacher_synergy_cap) + exempt;
    }

    /** Per-unit multiplier of one student type before global multipliers: teachers, upgrades, legendary traits */
    getStudentMultiplier(studentData, count) {
        let mult = this.getTeacherSynergy(studentData.id);

        for (const upgrade of this.getUpgrades("student_multiplier")) {
            if ((upgrade.target || []).includes(studentData.id)) mult *= upgrade.value;
        }

        // Legendary traits
        if (studentData.milestone_every) {
            mult *= Math.pow(studentData.milestone_mult, Math.floor(count / studentData.milestone_every));
        }
        if (studentData.prestige_scale) {
            mult *= 1 + studentData.prestige_scale * this.graduations;
        }
        if (studentData.crowd_scale) {
            mult *= 1 + studentData.crowd_scale * this.getTotalStudents();
        }
        return mult;
    }

    /**
     * @param {boolean} includeEvents - false gives the steady rate (used for offline progress)
     */
    calculateIQPerSecond(includeEvents = true) {
        let total = 0.0;

        // 1. Production from students (teacher synergy, upgrades, legendary traits)
        for (const studentData of STUDENTS) {
            const count = this.students[studentData.id] || 0;
            if (count > 0) {
                total += studentData.base_production * count * this.getStudentMultiplier(studentData, count);
            }
        }

        // 2. Production from teachers themselves
        for (const teacherData of TEACHERS) {
            const count = this.teachers[teacherData.id] || 0;
            if (count > 0) {
                total += teacherData.base_production * count;
            }
        }

        // 3. Global multipliers
        return total * this.getGlobalMultiplier(includeEvents);
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
        return this.total_iq_earned >= this.getGraduationThreshold();
    }

    /** IQ (earned this run) needed for the next graduation: 2x per step early, steeper later */
    getGraduationThreshold() {
        const c = PRESTIGE_CONFIG;
        const early = Math.min(this.graduations, c.soft_graduations);
        const late = Math.max(0, this.graduations - c.soft_graduations);
        return c.base_threshold * Math.pow(c.threshold_multiplier, early) * Math.pow(c.late_threshold_multiplier, late);
    }

    /** Global multiplier from certificates: linear up to the soft cap, sqrt growth after it */
    getCertificateMultiplier() {
        const c = PRESTIGE_CONFIG;
        const linear = Math.min(this.certificates, c.certificate_soft_cap);
        const extra = Math.sqrt(Math.max(0, this.certificates - c.certificate_soft_cap)) * 2;
        return 1 + (linear + extra) * c.certificate_bonus;
    }

    graduate() {
        if (!this.canGraduate()) {
            return false;
        }

        const newCertificates = this.getCertificatesForGraduation();

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

        const count = this.students[studentId] || 0;
        return studentData.base_production * this.getStudentMultiplier(studentData, count) * this.getGlobalMultiplier(false);
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


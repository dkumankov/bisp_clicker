// Student types (auto-generators)
export const STUDENTS = [
    {
        id: "year1",
        name: "👶 Year 1 Student",
        base_cost: 15,
        base_production: 1,
        cost_multiplier: 1.15,
        description: "A young learner just starting their journey"
    },
    {
        id: "year3",
        name: "🧒 Year 3 Student",
        base_cost: 350,
        base_production: 5,
        cost_multiplier: 1.16,
        description: "Building foundational skills"
    },
    {
        id: "year6",
        name: "📚 Year 6 Student",
        base_cost: 6500,
        base_production: 40,
        cost_multiplier: 1.17,
        description: "Mastering primary education"
    },
    {
        id: "year9",
        name: "🎯 Year 9 Student",
        base_cost: 100000,
        base_production: 500,
        cost_multiplier: 1.18,
        description: "Developing critical thinking"
    },
    {
        id: "year11",
        name: "📝 Year 11 Student",
        base_cost: 1500000,
        base_production: 6000,
        cost_multiplier: 1.19,
        description: "Preparing for IGCSE exams"
    },
    {
        id: "year13",
        name: "🎓 Year 13 Student",
        base_cost: 20000000,
        base_production: 75000,
        cost_multiplier: 1.20,
        description: "A-Level excellence"
    },
    {
        id: "uni_student",
        name: "🏛️ University Student",
        base_cost: 300000000,
        base_production: 1000000,
        cost_multiplier: 1.22,
        description: "Higher education achiever"
    },
    {
        id: "masters",
        name: "🔬 Masters Student",
        base_cost: 5000000000,
        base_production: 15000000,
        cost_multiplier: 1.24,
        description: "Advanced research specialist"
    },
    {
        id: "phd",
        name: "🧪 PhD Candidate",
        base_cost: 80000000000,
        base_production: 200000000,
        cost_multiplier: 1.26,
        description: "Pushing boundaries of knowledge"
    },
    {
        id: "professor",
        name: "👨‍🏫 Professor",
        base_cost: 1500000000000,
        base_production: 3000000000,
        cost_multiplier: 1.28,
        description: "World-class academic leader"
    }
];

// Teachers - Now purchasable multiple times!
// They produce IQ AND boost specific students by 10% each
export const TEACHERS = [
    {
        id: "ta",
        name: "👩‍🏫 Teaching Assistant",
        base_cost: 1000,
        base_production: 10,
        cost_multiplier: 1.2,
        targets: ["year1", "year3"],
        bonus_per_unit: 0.05,
        description: "+5% to Year 1-3 Students"
    },
    {
        id: "subject_teacher",
        name: "📊 Subject Teacher",
        base_cost: 25000,
        base_production: 80,
        cost_multiplier: 1.2,
        targets: ["year6", "year9"],
        bonus_per_unit: 0.05,
        description: "+5% to Year 6-9 Students"
    },
    {
        id: "head_dept",
        name: "👔 Head of Department",
        base_cost: 5000000,
        base_production: 400,
        cost_multiplier: 1.2,
        targets: ["year11", "year13"],
        bonus_per_unit: 0.03,
        description: "+3% to Year 11-13 Students"
    },
    {
        id: "principal",
        name: "👑 Principal",
        base_cost: 1000000000,
        base_production: 5000,
        cost_multiplier: 1.25,
        targets: ["uni_student"],
        bonus_per_unit: 0.03,
        description: "+3% to Uni Students"
    },
    {
        id: "consultant",
        name: "💼 Educational Consultant",
        base_cost: 20000000000,
        base_production: 50000,
        cost_multiplier: 1.25,
        targets: ["masters"],
        bonus_per_unit: 0.03,
        description: "+3% to Masters Students"
    },
    {
        id: "dean",
        name: "🎖️ Dean of Research",
        base_cost: 300000000000,
        base_production: 500000,
        cost_multiplier: 1.25,
        targets: ["phd"],
        bonus_per_unit: 0.01,
        description: "+1% to PhD Candidates"
    },
    {
        id: "chancellor",
        name: "⭐ University Chancellor",
        base_cost: 5000000000000,
        base_production: 5000000,
        cost_multiplier: 1.3,
        targets: ["professor"],
        bonus_per_unit: 0.01,
        description: "+1% to Professors"
    }
];

// School facilities - Based on real BISP Campus
export const FACILITIES = [
    {
        id: "refectory",
        name: "🍽️ Refectory",
        description: "Healthy food for growing minds. +10% Global IQ",
        cost: 2000,
        effect_type: "global_multiplier",
        effect_value: 1.10
    },
    {
        id: "mtb_library",
        name: "📚 MTB Library",
        description: "Main Teaching Building Library. +15% Global IQ",
        cost: 10000,
        effect_type: "global_multiplier",
        effect_value: 1.15
    },
    {
        id: "sports_hall",
        name: "🏀 Sports Hall",
        description: "Indoor sports facilities. +20% Global IQ",
        cost: 50000,
        effect_type: "global_multiplier",
        effect_value: 1.20
    },
    {
        id: "olympic_pool",
        name: "🏊 Olympic Pool",
        description: "50m competition pool. +25% Global IQ",
        cost: 500000,
        effect_type: "global_multiplier",
        effect_value: 1.25
    },
    {
        id: "stem_lab",
        name: "🔬 STEM Lab",
        description: "Science & Technology labs. +30% Global IQ",
        cost: 5000000,
        effect_type: "global_multiplier",
        effect_value: 1.30
    },
    {
        id: "art_studio",
        name: "🎨 Art Studio",
        description: "Creative space for artists. +35% Global IQ",
        cost: 50000000,
        effect_type: "global_multiplier",
        effect_value: 1.35
    },
    {
        id: "auditorium",
        name: "🎭 Auditorium",
        description: "300-seat performance venue. +40% Global IQ",
        cost: 500000000,
        effect_type: "global_multiplier",
        effect_value: 1.40
    },
    {
        id: "boarding_house",
        name: "🏠 Boarding House",
        description: "Home away from home. +50% Global IQ",
        cost: 10000000000,
        effect_type: "global_multiplier",
        effect_value: 1.50
    },
    {
        id: "aerial_arts",
        name: "🎪 Aerial Arts Academy",
        description: "Trapeze and circus skills. +60% Global IQ",
        cost: 200000000000,
        effect_type: "global_multiplier",
        effect_value: 1.60
    },
    {
        id: "wellbeing_centre",
        name: "🧘 Wellbeing Centre",
        description: "Support and counseling. +75% Global IQ",
        cost: 5000000000000,
        effect_type: "global_multiplier",
        effect_value: 1.75
    }
];

// Upgrades
export const UPGRADES = [
    {
        id: "click1",
        name: "✏️ Better Pencil",
        cost: 100,
        type: "click_power",
        value: 2,
        description: "Double click power",
        requires: null
    },
    {
        id: "click2",
        name: "🪑 Ergonomic Desk",
        cost: 1000,
        type: "click_power",
        value: 5,
        description: "5x click power",
        requires: "click1"
    },
    {
        id: "click3",
        name: "🎵 Study Music",
        cost: 10000,
        type: "click_power",
        value: 10,
        description: "10x click power",
        requires: "click2"
    },
    {
        id: "click4",
        name: "🧘 Focus Meditation",
        cost: 100000,
        type: "click_power",
        value: 25,
        description: "25x click power",
        requires: "click3"
    },

    // Student efficiency upgrades
    {
        id: "student_eff1",
        name: "New Textbooks",
        cost: 2500,
        type: "student_multiplier",
        value: 1.5,
        target: ["year1", "year3"],
        description: "1.5x for early students",
        requires: null
    },
    {
        id: "student_eff2",
        name: "Interactive Whiteboards",
        cost: 25000,
        type: "student_multiplier",
        value: 1.5,
        target: ["year6", "year9"],
        description: "1.5x for middle students",
        requires: null
    },
    {
        id: "student_eff3",
        name: "Exam Prep Materials",
        cost: 5000000,
        type: "student_multiplier",
        value: 1.5,
        target: ["year11", "year13"],
        description: "1.5x for senior students",
        requires: null
    },

    // Global upgrades
    {
        id: "global1",
        name: "School Spirit",
        cost: 25000,
        type: "global_multiplier",
        value: 1.1,
        description: "+10% to all IQ generation",
        requires: null
    },
    {
        id: "global2",
        name: "BISP Excellence",
        cost: 250000,
        type: "global_multiplier",
        value: 1.2,
        description: "+20% to all IQ generation",
        requires: "global1"
    },
    {
        id: "global3",
        name: "World-Class Education",
        cost: 2500000,
        type: "global_multiplier",
        value: 1.5,
        description: "+50% to all IQ generation",
        requires: "global2"
    },

    // Science upgrades (requires STEM Lab)
    {
        id: "science1",
        name: "Chemistry Set",
        cost: 500000,
        type: "student_multiplier",
        value: 2.0,
        target: ["year9"],
        description: "2x for Year 9 students",
        requires: "stem_lab"
    },
    {
        id: "science2",
        name: "Physics Lab Equipment",
        cost: 5000000,
        type: "student_multiplier",
        value: 2.0,
        target: ["year11"],
        description: "2x for Year 11 students",
        requires: "stem_lab"
    }
];

// Achievements
export const ACHIEVEMENTS = [
    {
        id: "first_click",
        name: "First Day",
        description: "Click 1 time",
        condition: "clicks",
        threshold: 1,
        reward_type: "click_power",
        reward_value: 1.005
    },
    {
        id: "clicker",
        name: "Dedicated Student",
        description: "Click 100 times",
        condition: "clicks",
        threshold: 100,
        reward_type: "click_power",
        reward_value: 1.01
    },
    {
        id: "super_clicker",
        name: "Study Master",
        description: "Click 1,000 times",
        condition: "clicks",
        threshold: 1000,
        reward_type: "click_power",
        reward_value: 1.01
    },
    {
        id: "iq_100",
        name: "Getting Smart",
        description: "Reach 100 IQ",
        condition: "total_iq",
        threshold: 100,
        reward_type: "global_multiplier",
        reward_value: 1.005
    },
    {
        id: "iq_1000",
        name: "Bright Mind",
        description: "Reach 1,000 IQ",
        condition: "total_iq",
        threshold: 1000,
        reward_type: "global_multiplier",
        reward_value: 1.005
    },
    {
        id: "iq_10000",
        name: "Genius",
        description: "Reach 10,000 IQ",
        condition: "total_iq",
        threshold: 10000,
        reward_type: "global_multiplier",
        reward_value: 1.01
    },
    {
        id: "iq_1m",
        name: "Prodigy",
        description: "Reach 1 Million IQ",
        condition: "total_iq",
        threshold: 1000000,
        reward_type: "global_multiplier",
        reward_value: 1.01
    },
    {
        id: "hire_student",
        name: "Classmate",
        description: "Hire your first student",
        condition: "total_students",
        threshold: 1,
        reward_type: "click_power",
        reward_value: 1.005
    },
    {
        id: "hire_teacher",
        name: "Hiring Staff",
        description: "Hire your first teacher",
        condition: "total_teachers",
        threshold: 1,
        reward_type: "global_multiplier",
        reward_value: 1.005
    },
    {
        id: "build_facility",
        name: "Expansion",
        description: "Build your first facility",
        condition: "all_facilities",
        threshold: 1,
        reward_type: "global_multiplier",
        reward_value: 1.005
    }
];

// Prestige configuration
export const PRESTIGE_CONFIG = {
    certificate_bonus: 0.1,  // +10% per certificate
    base_threshold: 1000000,  // IQ needed for first graduation
    threshold_multiplier: 2.0  // Cost increase per graduation (2x each time)
};


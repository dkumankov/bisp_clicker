// Student types (auto-generators)
export const STUDENTS = [
    {
        id: "year1",
        name: "👶 Year 1 Student",
        base_cost: 15,
        base_production: 0.22,
        cost_multiplier: 1.18,
        description: "Tiny steps, steady IQ"
    },
    {
        id: "year2",
        name: "🧒 Year 2 Student",
        base_cost: 24,
        base_production: 0.3,
        cost_multiplier: 1.18,
        description: "ABCs on autopilot"
    },
    {
        id: "year3",
        name: "👧 Year 3 Student",
        base_cost: 43,
        base_production: 0.42,
        cost_multiplier: 1.18,
        description: "Phonics on repeat"
    },
    {
        id: "year4",
        name: "🎒 Year 4 Student",
        base_cost: 86,
        base_production: 0.65,
        cost_multiplier: 1.18,
        description: "Times tables, nonstop"
    },
    {
        id: "year5",
        name: "🖍️ Year 5 Student",
        base_cost: 170,
        base_production: 0.97,
        cost_multiplier: 1.18,
        description: "Asks why. Learns more."
    },
    {
        id: "year6",
        name: "📚 Year 6 Student",
        base_cost: 350,
        base_production: 1.4,
        cost_multiplier: 1.18,
        description: "Primary school pro"
    },
    {
        id: "chess",
        name: "♟️ Chess Club Kid",
        base_cost: 700,
        base_production: 2.1,
        cost_multiplier: 1.18,
        description: "Thinks five moves ahead"
    },
    {
        id: "year7",
        name: "🏫 Year 7 Student",
        base_cost: 1400,
        base_production: 3,
        cost_multiplier: 1.18,
        description: "New blazer, new brain"
    },
    {
        id: "year8",
        name: "🧪 Year 8 Student",
        base_cost: 2900,
        base_production: 4.3,
        cost_multiplier: 1.18,
        description: "Lab goggles always on"
    },
    {
        id: "year9",
        name: "🎯 Year 9 Student",
        base_cost: 6000,
        base_production: 6,
        cost_multiplier: 1.18,
        description: "Questions everything"
    },
    {
        id: "physicist",
        name: "⚛️ Young Physicist",
        base_cost: 12000,
        base_production: 8.2,
        cost_multiplier: 1.18,
        description: "Argues about black holes"
    },
    {
        id: "robotics",
        name: "🤖 Robotics Whiz",
        base_cost: 25000,
        base_production: 11,
        cost_multiplier: 1.18,
        description: "Robots from spare parts"
    },
    {
        id: "year10",
        name: "📐 Year 10 Student",
        base_cost: 53000,
        base_production: 15,
        cost_multiplier: 1.18,
        description: "IGCSE picks locked in"
    },
    {
        id: "year11",
        name: "📝 Year 11 Student",
        base_cost: 110000,
        base_production: 20,
        cost_multiplier: 1.18,
        description: "IGCSE cram mode"
    },
    {
        id: "tutor",
        name: "🧑‍🏫 Private Tutor Pupil",
        base_cost: 230000,
        base_production: 27,
        cost_multiplier: 1.18,
        description: "Weekend lessons pay off"
    },
    {
        id: "olympiad",
        name: "🥇 Olympiad Champion",
        base_cost: 490000,
        base_production: 37,
        cost_multiplier: 1.17,
        description: "Wins maths contests for fun"
    },
    {
        id: "year12",
        name: "📖 Year 12 Student",
        base_cost: 1000000,
        base_production: 50,
        cost_multiplier: 1.17,
        description: "A-Level warm-up"
    },
    {
        id: "year13",
        name: "🎓 Year 13 Student",
        base_cost: 2200000,
        base_production: 67,
        cost_multiplier: 1.17,
        description: "A-Level ace"
    },
    {
        id: "uni_student",
        name: "🏛️ University Student",
        base_cost: 4700000,
        base_production: 90,
        cost_multiplier: 1.17,
        description: "Lecture-hall powerhouse"
    },
    {
        id: "masters",
        name: "🔬 Masters Student",
        base_cost: 10000000,
        base_production: 120,
        cost_multiplier: 1.17,
        description: "Deep-dive researcher"
    },
    {
        id: "phd",
        name: "🧬 PhD Candidate",
        base_cost: 22000000,
        base_production: 160,
        cost_multiplier: 1.17,
        description: "Thesis-powered genius"
    },
    {
        id: "professor",
        name: "👨‍🏫 Professor",
        base_cost: 48000000,
        base_production: 220,
        cost_multiplier: 1.17,
        description: "Writes the textbooks"
    },
    {
        id: "alumnus",
        name: "⏳ Time-Travelling Alumnus",
        base_cost: 100000000,
        base_production: 300,
        cost_multiplier: 1.15,
        legendary: true,
        description: "Legendary: +25% per graduation",
        prestige_scale: 0.25
    },
    {
        id: "twins",
        name: "👯 Prodigy Twins",
        base_cost: 230000000,
        base_production: 400,
        cost_multiplier: 1.15,
        legendary: true,
        description: "Legendary: ×2 per 25 owned",
        milestone_every: 25,
        milestone_mult: 2
    },
    {
        id: "council",
        name: "🏅 Student Council President",
        base_cost: 500000000,
        base_production: 550,
        cost_multiplier: 1.15,
        legendary: true,
        description: "Legendary: +0.5% per student",
        crowd_scale: 0.005
    }
];

// Teachers - purchasable multiple times!
// They produce IQ AND boost specific students by bonus_per_unit each (regular teachers stop at ECONOMY_CONFIG.teacher_synergy_cap)
export const TEACHERS = [
    {
        id: "ta",
        name: "👩‍🏫 Teaching Assistant",
        base_cost: 1000,
        base_production: 3,
        cost_multiplier: 1.25,
        targets: ["year1", "year2", "year3"],
        bonus_per_unit: 0.05,
        description: "+5% to Years 1–3"
    },
    {
        id: "class_teacher",
        name: "🍎 Class Teacher",
        base_cost: 1500,
        base_production: 1.8,
        cost_multiplier: 1.25,
        targets: ["year4", "year5"],
        bonus_per_unit: 0.05,
        description: "+5% to Years 4–5"
    },
    {
        id: "subject_teacher",
        name: "📊 Subject Teacher",
        base_cost: 23000,
        base_production: 11,
        cost_multiplier: 1.25,
        targets: ["year6", "year7", "year8"],
        bonus_per_unit: 0.05,
        description: "+5% to Years 6–8"
    },
    {
        id: "chess_coach",
        name: "♞ Chess Coach",
        base_cost: 35000,
        base_production: 6.7,
        cost_multiplier: 1.25,
        targets: ["chess"],
        bonus_per_unit: 0.06,
        description: "+6% to Chess Kids"
    },
    {
        id: "form_tutor",
        name: "🗂️ Form Tutor",
        base_cost: 420000,
        base_production: 32,
        cost_multiplier: 1.25,
        targets: ["year9", "year10"],
        bonus_per_unit: 0.04,
        description: "+4% to Years 9–10"
    },
    {
        id: "science_teacher",
        name: "🥼 Science Teacher",
        base_cost: 630000,
        base_production: 19,
        cost_multiplier: 1.25,
        targets: ["physicist", "year9"],
        bonus_per_unit: 0.05,
        description: "+5% to Physicists, Y9"
    },
    {
        id: "robotics_mentor",
        name: "🛠️ Robotics Mentor",
        base_cost: 950000,
        base_production: 12,
        cost_multiplier: 1.25,
        targets: ["robotics"],
        bonus_per_unit: 0.05,
        description: "+5% to Robotics Whiz"
    },
    {
        id: "head_dept",
        name: "👔 Head of Department",
        base_cost: 8000000,
        base_production: 39,
        cost_multiplier: 1.25,
        targets: ["year11", "year12"],
        bonus_per_unit: 0.03,
        description: "+3% to Years 11–12"
    },
    {
        id: "olympiad_coach",
        name: "🏆 Olympiad Coach",
        base_cost: 12000000,
        base_production: 24,
        cost_multiplier: 1.25,
        targets: ["olympiad", "tutor"],
        bonus_per_unit: 0.04,
        description: "+4% to Olympiad, Tutor"
    },
    {
        id: "sixth_form_head",
        name: "🎖️ Head of Sixth Form",
        base_cost: 18000000,
        base_production: 14,
        cost_multiplier: 1.25,
        targets: ["year13", "year12"],
        bonus_per_unit: 0.03,
        description: "+3% to Years 12–13"
    },
    {
        id: "principal",
        name: "👑 Principal",
        base_cost: 38000000,
        base_production: 12,
        cost_multiplier: 1.25,
        targets: ["uni_student"],
        bonus_per_unit: 0.03,
        description: "+3% to Uni Students"
    },
    {
        id: "consultant",
        name: "💼 Educational Consultant",
        base_cost: 80000000,
        base_production: 10,
        cost_multiplier: 1.25,
        targets: ["masters"],
        bonus_per_unit: 0.03,
        description: "+3% to Masters"
    },
    {
        id: "dean",
        name: "🏛️ Dean of Research",
        base_cost: 180000000,
        base_production: 9.1,
        cost_multiplier: 1.25,
        targets: ["phd"],
        bonus_per_unit: 0.025,
        description: "+2.5% to PhDs"
    },
    {
        id: "chancellor",
        name: "⭐ University Chancellor",
        base_cost: 380000000,
        base_production: 7.7,
        cost_multiplier: 1.25,
        targets: ["professor"],
        bonus_per_unit: 0.02,
        description: "+2% to Professors"
    },
    {
        id: "exam_board",
        name: "📋 Exam Board Chair",
        base_cost: 570000000,
        base_production: 4.6,
        cost_multiplier: 1.25,
        targets: ["year11", "year13", "olympiad"],
        bonus_per_unit: 0.02,
        description: "+2% to Y11, Y13, Olympiad"
    },
    {
        id: "curriculum_lead",
        name: "🧭 Curriculum Leader",
        base_cost: 860000000,
        base_production: 2.8,
        cost_multiplier: 1.25,
        targets: ["year2", "year4", "year6", "year8", "year10", "year12"],
        bonus_per_unit: 0.015,
        description: "+1.5% to 6 student types"
    },
    {
        id: "master_edu",
        name: "🌍 Master of Education",
        base_cost: 2200000000,
        base_production: 2.8,
        cost_multiplier: 1.3,
        legendary: true,
        targets: ["year1", "year2", "year3", "year4", "year5", "year6", "chess", "year7", "year8", "year9", "physicist", "robotics", "year10", "year11", "tutor", "olympiad", "year12", "year13", "uni_student", "masters", "phd", "professor", "alumnus", "twins", "council"],
        bonus_per_unit: 0.012,
        cap_exempt: true,
        description: "Legendary: +1.2% all, uncapped"
    },
    {
        id: "laureate",
        name: "🏅 Nobel Laureate Lecturer",
        base_cost: 3400000000,
        base_production: 1.8,
        cost_multiplier: 1.3,
        legendary: true,
        targets: ["tutor", "olympiad", "year12", "year13", "uni_student", "masters", "phd", "professor"],
        bonus_per_unit: 0.04,
        cap_exempt: true,
        description: "Legendary: +4% top 8, uncapped"
    },
    {
        id: "dream_team",
        name: "🌈 Dream Team Coach",
        base_cost: 4700000000,
        base_production: 0.97,
        cost_multiplier: 1.3,
        legendary: true,
        targets: ["year1", "year2", "year3", "year4", "year5", "year6", "chess", "year7", "year8", "year9", "physicist", "robotics", "year10", "year11", "tutor", "olympiad", "year12", "year13", "uni_student", "masters", "phd", "professor"],
        bonus_per_unit: 0.02,
        prestige_scale: 0.1,
        cap_exempt: true,
        description: "Legendary: +2%, +10%/grad, uncapped"
    },
    {
        id: "headmaster",
        name: "🪄 Legendary Headmaster",
        base_cost: 6000000000,
        base_production: 0.49,
        cost_multiplier: 1.3,
        legendary: true,
        targets: ["chess", "year7", "year8", "year9", "physicist", "robotics", "year10", "year11", "tutor", "olympiad", "year12", "year13", "uni_student", "masters", "phd", "professor"],
        bonus_per_unit: 0.03,
        cap_exempt: true,
        description: "Legendary: +3% to 16, uncapped"
    }
];

// School facilities - Based on real BISP Campus
// effect_value 1.10 = +10%. Legendary facilities have one-of-a-kind effects.
export const FACILITIES = [
    {
        id: "refectory",
        name: "🍽️ Refectory",
        description: "Brain food · +5% IQ",
        cost: 2000,
        effect_type: "global_multiplier",
        effect_value: 1.05
    },
    {
        id: "mtb_library",
        name: "📚 MTB Library",
        description: "Quiet notes · +6% clicks",
        cost: 4200,
        effect_type: "click_power",
        effect_value: 1.06
    },
    {
        id: "playground",
        name: "🛝 Playground",
        description: "Recess recharge · +7% IQ",
        cost: 8800,
        effect_type: "global_multiplier",
        effect_value: 1.07
    },
    {
        id: "sports_hall",
        name: "🏀 Sports Hall",
        description: "Team taps · +8% clicks",
        cost: 19000,
        effect_type: "click_power",
        effect_value: 1.08
    },
    {
        id: "it_suite",
        name: "💻 IT Suite",
        description: "PCs everywhere · +9% IQ",
        cost: 39000,
        effect_type: "global_multiplier",
        effect_value: 1.09
    },
    {
        id: "bakery",
        name: "🥐 School Bakery",
        description: "Croissant fuel · +10% clicks",
        cost: 82000,
        effect_type: "click_power",
        effect_value: 1.1
    },
    {
        id: "music_room",
        name: "🎵 Music Room",
        description: "In harmony · +11% IQ",
        cost: 170000,
        effect_type: "global_multiplier",
        effect_value: 1.11
    },
    {
        id: "olympic_pool",
        name: "🏊 Olympic Pool",
        description: "Laser focus · +12% clicks",
        cost: 360000,
        effect_type: "click_power",
        effect_value: 1.12
    },
    {
        id: "stem_lab",
        name: "🔬 STEM Lab",
        description: "Lab magic · +13% IQ",
        cost: 760000,
        effect_type: "global_multiplier",
        effect_value: 1.13
    },
    {
        id: "art_studio",
        name: "🎨 Art Studio",
        description: "Quick hands · +14% clicks",
        cost: 1600000,
        effect_type: "click_power",
        effect_value: 1.14
    },
    {
        id: "fitness_gym",
        name: "🏋️ Fitness Gym",
        description: "Fit minds · +15% IQ",
        cost: 3300000,
        effect_type: "global_multiplier",
        effect_value: 1.15
    },
    {
        id: "auditorium",
        name: "🎭 Auditorium",
        description: "Stage nerve · +16% clicks",
        cost: 7000000,
        effect_type: "click_power",
        effect_value: 1.16
    },
    {
        id: "tennis_courts",
        name: "🎾 Tennis Courts",
        description: "Friendly rivals · +17% IQ",
        cost: 15000000,
        effect_type: "global_multiplier",
        effect_value: 1.17
    },
    {
        id: "observatory",
        name: "🔭 Observatory",
        description: "Star-sharp · +18% clicks",
        cost: 31000000,
        effect_type: "click_power",
        effect_value: 1.18
    },
    {
        id: "boarding_house",
        name: "🏠 Boarding House",
        description: "Home from home · +19% IQ",
        cost: 65000000,
        effect_type: "global_multiplier",
        effect_value: 1.19
    },
    {
        id: "robotics_lab",
        name: "🤖 Robotics Lab",
        description: "Robot helpers · +20% clicks",
        cost: 140000000,
        effect_type: "click_power",
        effect_value: 1.2
    },
    {
        id: "aerial_arts",
        name: "🎪 Aerial Arts Academy",
        description: "Circus skills · +21% IQ",
        cost: 290000000,
        effect_type: "global_multiplier",
        effect_value: 1.21
    },
    {
        id: "eco_garden",
        name: "🌱 Eco Garden",
        description: "Fresh air · +22% clicks",
        cost: 600000000,
        effect_type: "click_power",
        effect_value: 1.22
    },
    {
        id: "wellbeing_centre",
        name: "🧘 Wellbeing Centre",
        description: "Calm minds · +23% IQ",
        cost: 1300000000,
        effect_type: "global_multiplier",
        effect_value: 1.23
    },
    {
        id: "recording_studio",
        name: "🎙️ Recording Studio",
        description: "Podcast power · +24% clicks",
        cost: 2600000000,
        effect_type: "click_power",
        effect_value: 1.24
    },
    {
        id: "football_pitch",
        name: "⚽ Football Pitch",
        description: "Whole-school cheer · +25% IQ",
        cost: 5600000000,
        effect_type: "global_multiplier",
        effect_value: 1.25
    },
    {
        id: "starfall",
        name: "🌠 Starfall Observatory",
        description: "Legendary: Golden Badge every ≤100s",
        cost: 14000000000,
        effect_type: "golden_guarantee",
        effect_value: 100,
        legendary: true
    },
    {
        id: "alumni_hall",
        name: "🏆 Alumni Hall of Fame",
        description: "Legendary: +1 certificate per graduation",
        cost: 35000000000,
        effect_type: "certificate_bonus",
        effect_value: 1,
        legendary: true
    },
    {
        id: "cheer_arena",
        name: "📣 Grand Cheer Arena",
        description: "Legendary: combo window ×1.5",
        cost: 88000000000,
        effect_type: "combo_extend",
        effect_value: 1.5,
        legendary: true
    },
    {
        id: "time_vault",
        name: "⏳ Time Capsule Vault",
        description: "Legendary: clicks add 1% of IQ/s",
        cost: 220000000000,
        effect_type: "click_ips_share",
        effect_value: 0.01,
        legendary: true
    }
];

// Upgrades
export const UPGRADES = [
    {
        id: "click1",
        name: "✏️ Better Pencil",
        cost: 150,
        type: "click_power",
        value: 2,
        description: "Sharp tip · clicks ×2",
        requires: null
    },
    {
        id: "click2",
        name: "🪑 Ergonomic Desk",
        cost: 600,
        type: "click_power",
        value: 2,
        description: "Comfy taps · clicks ×2",
        requires: "click1"
    },
    {
        id: "click3",
        name: "🎵 Study Music",
        cost: 2400,
        type: "click_power",
        value: 2,
        description: "Lo-fi beats · clicks ×2",
        requires: "click2"
    },
    {
        id: "click4",
        name: "🧘 Focus Meditation",
        cost: 9600,
        type: "click_power",
        value: 2,
        description: "Calm focus · clicks ×2",
        requires: "click3"
    },
    {
        id: "click5",
        name: "📖 Speed Reading",
        cost: 38000,
        type: "click_power",
        value: 2,
        description: "Skim fast · clicks ×2",
        requires: "click4"
    },
    {
        id: "click6",
        name: "🏛️ Memory Palace",
        cost: 150000,
        type: "click_power",
        value: 2,
        description: "Recall all · clicks ×2",
        requires: "click5"
    },
    {
        id: "click7",
        name: "💻 Smart Laptop",
        cost: 600000,
        type: "click_power",
        value: 2,
        description: "Turbo notes · clicks ×2",
        requires: "click6"
    },
    {
        id: "click8",
        name: "⚡ Lightning Reflexes",
        cost: 2400000,
        type: "click_power",
        value: 2,
        description: "Blink-fast · clicks ×2",
        requires: "click7"
    },
    {
        id: "click9",
        name: "🤖 AI Study Buddy",
        cost: 9800000,
        type: "click_power",
        value: 2,
        description: "AI on your side · clicks ×2",
        requires: "click8"
    },
    {
        id: "click10",
        name: "🧠 Photographic Notes",
        cost: 39000000,
        type: "click_power",
        value: 1.5,
        description: "Snapshot memory · clicks ×1.5",
        requires: "click9"
    },
    {
        id: "click11",
        name: "🚀 Study Rocket",
        cost: 150000000,
        type: "click_power",
        value: 1.5,
        description: "Liftoff · clicks ×1.5",
        requires: "click10"
    },
    {
        id: "click12",
        name: "🌟 Genius Mode",
        cost: 630000000,
        type: "click_power",
        value: 1.5,
        description: "Big brain · clicks ×1.5",
        requires: "click11"
    },
    {
        id: "ps_click1",
        name: "🤝 Peer Tutoring",
        cost: 36000,
        type: "per_student_click",
        value: 0.1,
        description: "+0.1 per click per student",
        requires: "click2"
    },
    {
        id: "ps_click2",
        name: "👥 Study Groups",
        cost: 10000000,
        type: "per_student_click",
        value: 0.3,
        description: "+0.3 per click per student",
        requires: "ps_click1"
    },
    {
        id: "ps_click3",
        name: "🏫 School Newspaper",
        cost: 3800000000,
        type: "per_student_click",
        value: 1,
        description: "+1 per click per student",
        requires: "ps_click2"
    },
    {
        id: "student_eff1",
        name: "New Textbooks",
        cost: 2500,
        type: "student_multiplier",
        value: 1.5,
        target: ["year1", "year2", "year3", "year4", "year5"],
        description: "Early students ×1.5",
        requires: null
    },
    {
        id: "student_early2",
        name: "🌈 Colourful Flashcards",
        cost: 15000,
        type: "student_multiplier",
        value: 2,
        target: ["year1", "year2", "year3", "year4", "year5"],
        description: "Early students ×2",
        requires: "student_eff1"
    },
    {
        id: "student_early3",
        name: "🤝 Reading Buddies",
        cost: 370000,
        type: "student_multiplier",
        value: 2,
        target: ["year1", "year2", "year3", "year4", "year5"],
        description: "Early students ×2",
        requires: "student_early2"
    },
    {
        id: "student_early4",
        name: "🔤 Phonics Games",
        cost: 3800000,
        type: "student_multiplier",
        value: 2.5,
        target: ["year1", "year2", "year3", "year4", "year5"],
        description: "Early students ×2.5",
        requires: "student_early3"
    },
    {
        id: "student_eff2",
        name: "Interactive Whiteboards",
        cost: 28000,
        type: "student_multiplier",
        value: 1.5,
        target: ["year6", "chess", "year7", "year8", "year9"],
        description: "Middle students ×1.5",
        requires: null
    },
    {
        id: "student_mid2",
        name: "🚌 School Field Trips",
        cost: 780000,
        type: "student_multiplier",
        value: 2,
        target: ["year6", "chess", "year7", "year8", "year9"],
        description: "Middle students ×2",
        requires: "student_eff2"
    },
    {
        id: "student_mid3",
        name: "📱 Learning Tablets",
        cost: 22000000,
        type: "student_multiplier",
        value: 2,
        target: ["year6", "chess", "year7", "year8", "year9"],
        description: "Middle students ×2",
        requires: "student_mid2"
    },
    {
        id: "student_mid4",
        name: "🏆 House Competitions",
        cost: 620000000,
        type: "student_multiplier",
        value: 2.5,
        target: ["year6", "chess", "year7", "year8", "year9"],
        description: "Middle students ×2.5",
        requires: "student_mid3"
    },
    {
        id: "student_eff3",
        name: "Exam Prep Materials",
        cost: 2100000,
        type: "student_multiplier",
        value: 1.5,
        target: ["physicist", "robotics", "year10", "year11", "tutor", "olympiad", "year12", "year13"],
        description: "Senior students ×1.5",
        requires: null
    },
    {
        id: "student_senior2",
        name: "📝 Revision Guides",
        cost: 60000000,
        type: "student_multiplier",
        value: 2,
        target: ["physicist", "robotics", "year10", "year11", "tutor", "olympiad", "year12", "year13"],
        description: "Senior students ×2",
        requires: "student_eff3"
    },
    {
        id: "student_senior3",
        name: "🎤 Debate Society",
        cost: 1300000000,
        type: "student_multiplier",
        value: 2,
        target: ["physicist", "robotics", "year10", "year11", "tutor", "olympiad", "year12", "year13"],
        description: "Senior students ×2",
        requires: "student_senior2"
    },
    {
        id: "student_senior4",
        name: "🎓 University Mentors",
        cost: 13000000000,
        type: "student_multiplier",
        value: 2.5,
        target: ["physicist", "robotics", "year10", "year11", "tutor", "olympiad", "year12", "year13"],
        description: "Senior students ×2.5",
        requires: "student_senior3"
    },
    {
        id: "uni_eff1",
        name: "📚 Research Library Pass",
        cost: 29000000,
        type: "student_multiplier",
        value: 1.5,
        target: ["uni_student", "masters", "phd", "professor"],
        description: "Uni students ×1.5",
        requires: null
    },
    {
        id: "uni_eff2",
        name: "🔭 Research Grants",
        cost: 750000000,
        type: "student_multiplier",
        value: 2,
        target: ["uni_student", "masters", "phd", "professor"],
        description: "Uni students ×2",
        requires: "uni_eff1"
    },
    {
        id: "uni_eff3",
        name: "📰 Published Papers",
        cost: 7500000000,
        type: "student_multiplier",
        value: 2,
        target: ["uni_student", "masters", "phd", "professor"],
        description: "Uni students ×2",
        requires: "uni_eff2"
    },
    {
        id: "science1",
        name: "Chemistry Set",
        cost: 780000,
        type: "student_multiplier",
        value: 2,
        target: ["year9"],
        description: "Year 9 ×2",
        requires: "stem_lab"
    },
    {
        id: "science2",
        name: "Physics Lab Equipment",
        cost: 22000000,
        type: "student_multiplier",
        value: 2,
        target: ["year11"],
        description: "Year 11 ×2",
        requires: "stem_lab"
    },
    {
        id: "science3",
        name: "📕 Science Encyclopedia",
        cost: 140000,
        type: "student_multiplier",
        value: 2,
        target: ["year6"],
        description: "Year 6 ×2",
        requires: "mtb_library"
    },
    {
        id: "science4",
        name: "🔭 Planetarium Shows",
        cost: 2500000000,
        type: "student_multiplier",
        value: 2,
        target: ["year13"],
        description: "Year 13 ×2",
        requires: "auditorium"
    },
    {
        id: "science5",
        name: "🧲 Young Physicist Kits",
        cost: 5800000,
        type: "student_multiplier",
        value: 2,
        target: ["physicist"],
        description: "Young Physicists ×2",
        requires: "science1"
    },
    {
        id: "chess_up",
        name: "🏁 Chess Tournaments",
        cost: 98000,
        type: "student_multiplier",
        value: 2,
        target: ["chess"],
        description: "Chess Kids ×2",
        requires: "student_eff2"
    },
    {
        id: "robot_up",
        name: "🔧 Robot Wars Arena",
        cost: 16000000,
        type: "student_multiplier",
        value: 2,
        target: ["robotics"],
        description: "Robotics Whizzes ×2",
        requires: "robotics_lab"
    },
    {
        id: "olympiad_up",
        name: "🌐 Olympiad Training Camp",
        cost: 450000000,
        type: "student_multiplier",
        value: 2,
        target: ["olympiad", "tutor"],
        description: "Olympiad & Tutor kids ×2",
        requires: "student_senior2"
    },
    {
        id: "global1",
        name: "School Spirit",
        cost: 28000,
        type: "global_multiplier",
        value: 1.1,
        description: "All IQ +10%",
        requires: null
    },
    {
        id: "global2",
        name: "BISP Excellence",
        cost: 780000,
        type: "global_multiplier",
        value: 1.15,
        description: "All IQ +15%",
        requires: "global1"
    },
    {
        id: "global3",
        name: "World-Class Education",
        cost: 22000000,
        type: "global_multiplier",
        value: 1.3,
        description: "All IQ +30%",
        requires: "global2"
    },
    {
        id: "global4",
        name: "👨‍👩‍👧 Parent-Teacher Association",
        cost: 210000,
        type: "global_multiplier",
        value: 1.1,
        description: "All IQ +10%",
        requires: "global1"
    },
    {
        id: "global5",
        name: "⭐ Outstanding Inspection",
        cost: 620000000,
        type: "global_multiplier",
        value: 1.2,
        description: "All IQ +20%",
        requires: "global3"
    },
    {
        id: "global6",
        name: "🌏 International Partnerships",
        cost: 13000000000,
        type: "global_multiplier",
        value: 1.3,
        description: "All IQ +30%",
        requires: "global5"
    },
    {
        id: "global7",
        name: "🏫 Best School in Asia",
        cost: 75000000000,
        type: "global_multiplier",
        value: 1.5,
        description: "All IQ +50%",
        requires: "global6"
    },
    {
        id: "global8",
        name: "🎓 Scholarship Fund",
        cost: 4200000,
        type: "global_multiplier",
        value: 1.1,
        description: "All IQ +10%",
        requires: "it_suite"
    },
    {
        id: "global9",
        name: "🖥️ Digital Classroom",
        cost: 210000000,
        type: "global_multiplier",
        value: 1.15,
        description: "All IQ +15%",
        requires: "global8"
    },
    {
        id: "alumni_donations",
        name: "💌 Alumni Donations",
        cost: 1500000,
        type: "prestige_synergy",
        value: 0.04,
        per: "graduation",
        description: "+4% IQ per graduation",
        requires: "global1"
    },
    {
        id: "cert_frames",
        name: "🖼️ Framed Certificates",
        cost: 120000000,
        type: "prestige_synergy",
        value: 0.02,
        per: "certificate",
        description: "+2% IQ per certificate",
        requires: "alumni_donations"
    },
    {
        id: "legend_eternal",
        name: "🌌 Eternal Scholar",
        cost: 38000000000,
        type: "prestige_compound",
        value: 1.12,
        cap: 10,
        legendary: true,
        description: "Legendary: ×1.12 IQ per grad (max 10)",
        requires: "global6"
    },
    {
        id: "legend_lucky",
        name: "🍀 Lucky Charm",
        cost: 63000000000,
        type: "golden_duration",
        value: 2,
        legendary: true,
        description: "Legendary: Golden Badge lasts 2×",
        requires: "global6"
    },
    {
        id: "legend_mentor",
        name: "🧙 Legendary Mentor",
        cost: 100000000000,
        type: "per_student_click",
        value: 3,
        legendary: true,
        description: "Legendary: +3 per click per student",
        requires: "ps_click3"
    },
    {
        id: "legend_plan",
        name: "📜 The Grand Plan",
        cost: 200000000000,
        type: "prestige_synergy",
        value: 0.06,
        per: "certificate",
        legendary: true,
        description: "Legendary: +6% IQ per certificate",
        requires: "cert_frames"
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
    },
    {
        id: "combo_25",
        name: "Combo Starter",
        description: "Reach a 25-click combo",
        condition: "best_combo",
        threshold: 25,
        reward_type: "click_power",
        reward_value: 1.01
    },
    {
        id: "combo_100",
        name: "Combo Master",
        description: "Reach a 100-click combo",
        condition: "best_combo",
        threshold: 100,
        reward_type: "click_power",
        reward_value: 1.02
    },
    {
        id: "combo_500",
        name: "Black Hole Mind",
        description: "Reach a 500-click combo",
        condition: "best_combo",
        threshold: 500,
        reward_type: "click_power",
        reward_value: 1.02
    },
    {
        id: "combo_1000",
        name: "Supernova",
        description: "Reach a 1000-click combo",
        condition: "best_combo",
        threshold: 1000,
        reward_type: "click_power",
        reward_value: 1.03
    },
    {
        id: "combo_5000",
        name: "Robot Brain",
        description: "Reach a 5000-click combo",
        condition: "best_combo",
        threshold: 5000,
        reward_type: "click_power",
        reward_value: 1.03
    },
    {
        id: "combo_20000",
        name: "Big Bang",
        description: "Reach a 20000-click combo",
        condition: "best_combo",
        threshold: 20000,
        reward_type: "click_power",
        reward_value: 1.05
    },
    {
        id: "golden_1",
        name: "Lucky Find",
        description: "Catch a Golden School Badge",
        condition: "golden_clicks",
        threshold: 1,
        reward_type: "global_multiplier",
        reward_value: 1.005
    },
    {
        id: "golden_10",
        name: "Badge Hunter",
        description: "Catch 10 Golden School Badges",
        condition: "golden_clicks",
        threshold: 10,
        reward_type: "global_multiplier",
        reward_value: 1.01
    }
];

// Economy limits that keep multipliers from exploding
export const ECONOMY_CONFIG = {
    global_upgrade_soft_cap: { cap: 1.8, exponent: 0.5 },  // Standard global upgrades multiply, but above cap only (x/cap)^exponent counts
    teacher_synergy_cap: 2  // Max total teacher bonus per student type (+400% = x5); legendary cap_exempt teachers ignore it
};

// Auto-clickers (fingers around the Study button): every one is a real click once per second.
// Price of the next one: base_cost, then each step multiplies by a factor that itself grows
// (x2.5, x2.75, x3, x3.25 ...), so the 10th finger costs ~67,000x the first: every finger is a choice.
// Finger training (levels) multiplies the IQ of every finger click and is KEPT on graduation;
// the fingers themselves are reset like any other purchase.
export const AUTOCLICKER_CONFIG = {
    base_cost: 100000,
    cost_multiplier: 2.5,       // 1st -> 2nd finger
    cost_multiplier_step: 0.25, // every next step is this much steeper
    clicks_per_second: 1,
    levels: [                   // index = finger level (saved as finger_level)
        { name: "Finger", icon: "👆", mult: 1 },
        { name: "Trained Fingers", icon: "🎓", mult: 2, cost: 5000000, requires: 4 },
        { name: "Golden Fingers", icon: "✨", mult: 4, cost: 500000000, requires: 7 }
    ]
};

// Prestige configuration
export const PRESTIGE_CONFIG = {
    certificate_bonus: 0.1,  // +10% per certificate
    base_threshold: 1000000,  // IQ needed for first graduation
    threshold_multiplier: 2.0,  // Cost increase per graduation (2x each time)...
    soft_graduations: 5,  // ...for the first N graduations, then the steeper factor below
    late_threshold_multiplier: 4.0,  // Income grows faster than 2x per run, so late runs need a steeper climb
    certificate_soft_cap: 50,  // Certificates past this count give diminishing (sqrt) returns
    daily_graduation_cap: 10,  // Graduations beyond this don't raise the daily bonus
    bonus_certificate_every: 10  // A graduation grants 1 certificate, +1 for every N graduations already earned
};

// Click combo: tapping quickly builds a streak that multiplies click power.
// Auto-clicker fingers push the streak only while the player taps too (see GameEngine.handleClick),
// so the high tiers stay a goal for active play and are never reached idle.
export const COMBO_CONFIG = {
    window_ms: 1200,  // Max gap between the player's own clicks to keep the streak alive
    tiers: [          // Highest matching tier wins; array position + 1 = tier number (data-combo-tier)
        { min: 10, mult: 1.25, name: "Warm-up" },
        { min: 25, mult: 1.5, name: "Student" },
        { min: 50, mult: 2, name: "Honor Roll" },
        { min: 100, mult: 3, name: "Straight-A" },
        { min: 200, mult: 3.5, name: "Scholar" },        // flame
        { min: 300, mult: 4, name: "Professor" },        // plasma
        { min: 400, mult: 4.5, name: "Genius" },         // fire + ice
        { min: 500, mult: 5, name: "Prodigy" },          // black hole
        { min: 750, mult: 6, name: "Legend" },           // nuclear blast
        { min: 1000, mult: 8, name: "Absolute Mind" },   // supernova
        { min: 1250, mult: 9, name: "Chalk Storm" },     // chalk dust + scribbles
        { min: 1500, mult: 10, name: "Pop Quiz" },       // ? ! A+ pop-ups + confetti
        { min: 2000, mult: 11, name: "Science Fair" },   // bubbles + fizz
        { min: 2500, mult: 12, name: "Book Tornado" },   // flying pages
        { min: 3000, mult: 13.5, name: "Math Wizard" },  // orbiting math runes
        { min: 4000, mult: 15, name: "Rocket Lab" },     // rockets + smoke
        { min: 5000, mult: 16.5, name: "Robot Brain" },  // circuit traces + binary rain
        { min: 6000, mult: 18, name: "Time Machine" },   // clock rings + sand
        { min: 7500, mult: 20, name: "Galaxy Brain" },   // planets + nebula
        { min: 10000, mult: 22, name: "Nobel Prize" },   // gold medals rain + laurel
        { min: 15000, mult: 25, name: "Quantum Leap" },  // teleporting entangled pairs
        { min: 20000, mult: 30, name: "Big Bang" }       // white hole: everything at once
    ]
};

// Golden School Badge: a random bonus that appears on screen
export const DAILY_BONUS_CONFIG = {
    min_iq: 500,             // Floor for the IQ pack so brand-new players get something
    iq_seconds: 600,         // IQ pack = this many seconds of steady IQ/s
    prestige_step: 0.5,      // +50% reward per graduation (up to PRESTIGE_CONFIG.daily_graduation_cap)
    click_multiplier: 3,     // Click power multiplier during the boost
    click_duration: 300      // Seconds (5 minutes)
};

export const GOLDEN_CONFIG = {
    first_min_delay: 190,  // Seconds until the very first badge (random range): never in the first 3 minutes
    first_max_delay: 260,
    min_delay: 180,   // Seconds until the next badge appears (random range)
    max_delay: 420,
    lifetime: 12,     // Seconds the badge stays on screen
    multiplier: 3.5,  // IQ/s multiplier while the bonus is active
    duration: 30      // Seconds the bonus lasts
};

// Campus evolution stages, unlocked by lifetime IQ (never goes backwards)
export const CAMPUS_STAGES = [
    { name: "Study Corner", scene: "📖🪑✏️", threshold: 0 },
    { name: "Classroom", scene: "🏫🌳📚", threshold: 1000 },
    { name: "Primary School", scene: "🏫⚽🌳🚌", threshold: 100000 },
    { name: "BISP Campus", scene: "🏫🏊🎨🌴🚌", threshold: 10000000 },
    { name: "Grand Academy", scene: "🏛️🔬🏊🎭🌴🚀", threshold: 1000000000 },
    { name: "Genius City", scene: "🏙️🛰️🔭🚀🌟🏛️", threshold: 100000000000 }
];

// Number milestones that trigger a small celebration
export const MILESTONES = {
    iq: [100, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e11, 1e12, 1e13, 1e14, 1e15],
    clicks: [100, 500, 1000, 5000, 10000, 50000, 100000]
};


// Leaderboard API (Cloudflare Worker routed at game.dimario.pro/api/*).
// For local worker dev use 'http://localhost:8787'.
export const LEADERBOARD_API = 'https://bisp-clicker-leaderboard.steobase.workers.dev';

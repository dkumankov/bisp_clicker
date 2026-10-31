// Student types (auto-generators)
export const STUDENTS = [
    {
        id: "year1",
        name: "👶 Year 1 Student",
        base_cost: 15,
        base_production: 0.22,
        cost_multiplier: 1.18,
        description: "A young learner just starting their journey"
    },
    {
        id: "year2",
        name: "🧒 Year 2 Student",
        base_cost: 24,
        base_production: 0.3,
        cost_multiplier: 1.18,
        description: "Learning to read and count"
    },
    {
        id: "year3",
        name: "👧 Year 3 Student",
        base_cost: 43,
        base_production: 0.42,
        cost_multiplier: 1.18,
        description: "Building foundational skills"
    },
    {
        id: "year4",
        name: "🎒 Year 4 Student",
        base_cost: 86,
        base_production: 0.65,
        cost_multiplier: 1.18,
        description: "Times tables and big ideas"
    },
    {
        id: "year5",
        name: "🖍️ Year 5 Student",
        base_cost: 170,
        base_production: 0.97,
        cost_multiplier: 1.18,
        description: "Curious about everything"
    },
    {
        id: "year6",
        name: "📚 Year 6 Student",
        base_cost: 350,
        base_production: 1.4,
        cost_multiplier: 1.18,
        description: "Mastering primary education"
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
        description: "Brand new at secondary school"
    },
    {
        id: "year8",
        name: "🧪 Year 8 Student",
        base_cost: 2900,
        base_production: 4.3,
        cost_multiplier: 1.18,
        description: "Loves science experiments"
    },
    {
        id: "year9",
        name: "🎯 Year 9 Student",
        base_cost: 6000,
        base_production: 6,
        cost_multiplier: 1.18,
        description: "Developing critical thinking"
    },
    {
        id: "physicist",
        name: "⚛️ Young Physicist",
        base_cost: 12000,
        base_production: 8.2,
        cost_multiplier: 1.18,
        description: "Already arguing about black holes"
    },
    {
        id: "robotics",
        name: "🤖 Robotics Whiz",
        base_cost: 25000,
        base_production: 11,
        cost_multiplier: 1.18,
        description: "Builds robots from spare parts"
    },
    {
        id: "year10",
        name: "📐 Year 10 Student",
        base_cost: 53000,
        base_production: 15,
        cost_multiplier: 1.18,
        description: "Choosing IGCSE subjects"
    },
    {
        id: "year11",
        name: "📝 Year 11 Student",
        base_cost: 110000,
        base_production: 20,
        cost_multiplier: 1.18,
        description: "Preparing for IGCSE exams"
    },
    {
        id: "tutor",
        name: "🧑‍🏫 Private Tutor Pupil",
        base_cost: 230000,
        base_production: 27,
        cost_multiplier: 1.18,
        description: "Gets extra lessons every weekend"
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
        description: "Starting A-Level subjects"
    },
    {
        id: "year13",
        name: "🎓 Year 13 Student",
        base_cost: 2200000,
        base_production: 67,
        cost_multiplier: 1.17,
        description: "A-Level excellence"
    },
    {
        id: "uni_student",
        name: "🏛️ University Student",
        base_cost: 4700000,
        base_production: 90,
        cost_multiplier: 1.17,
        description: "Higher education achiever"
    },
    {
        id: "masters",
        name: "🔬 Masters Student",
        base_cost: 10000000,
        base_production: 120,
        cost_multiplier: 1.17,
        description: "Advanced research specialist"
    },
    {
        id: "phd",
        name: "🧬 PhD Candidate",
        base_cost: 22000000,
        base_production: 160,
        cost_multiplier: 1.17,
        description: "Pushing boundaries of knowledge"
    },
    {
        id: "professor",
        name: "👨‍🏫 Professor",
        base_cost: 48000000,
        base_production: 220,
        cost_multiplier: 1.17,
        description: "World-class academic leader"
    },
    {
        id: "alumnus",
        name: "⏳ Time-Travelling Alumnus",
        base_cost: 100000000,
        base_production: 300,
        cost_multiplier: 1.15,
        legendary: true,
        description: "Legendary: Comes back from the future. Production +25% per graduation",
        prestige_scale: 0.25
    },
    {
        id: "twins",
        name: "👯 Prodigy Twins",
        base_cost: 230000000,
        base_production: 400,
        cost_multiplier: 1.15,
        legendary: true,
        description: "Legendary: Production doubles for every 25 twins owned",
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
        description: "Legendary: Production +0.5% for every student you own",
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
        description: "+5% to Year 1 Student, Year 2 Student, Year 3 Student each"
    },
    {
        id: "class_teacher",
        name: "🍎 Class Teacher",
        base_cost: 1500,
        base_production: 1.8,
        cost_multiplier: 1.25,
        targets: ["year4", "year5"],
        bonus_per_unit: 0.05,
        description: "+5% to Year 4 Student, Year 5 Student each"
    },
    {
        id: "subject_teacher",
        name: "📊 Subject Teacher",
        base_cost: 23000,
        base_production: 11,
        cost_multiplier: 1.25,
        targets: ["year6", "year7", "year8"],
        bonus_per_unit: 0.05,
        description: "+5% to Year 6 Student, Year 7 Student, Year 8 Student each"
    },
    {
        id: "chess_coach",
        name: "♞ Chess Coach",
        base_cost: 35000,
        base_production: 6.7,
        cost_multiplier: 1.25,
        targets: ["chess"],
        bonus_per_unit: 0.06,
        description: "+6% to Chess Club Kid each"
    },
    {
        id: "form_tutor",
        name: "🗂️ Form Tutor",
        base_cost: 420000,
        base_production: 32,
        cost_multiplier: 1.25,
        targets: ["year9", "year10"],
        bonus_per_unit: 0.04,
        description: "+4% to Year 9 Student, Year 10 Student each"
    },
    {
        id: "science_teacher",
        name: "🥼 Science Teacher",
        base_cost: 630000,
        base_production: 19,
        cost_multiplier: 1.25,
        targets: ["physicist", "year9"],
        bonus_per_unit: 0.05,
        description: "+5% to Young Physicist, Year 9 Student each"
    },
    {
        id: "robotics_mentor",
        name: "🛠️ Robotics Mentor",
        base_cost: 950000,
        base_production: 12,
        cost_multiplier: 1.25,
        targets: ["robotics"],
        bonus_per_unit: 0.05,
        description: "+5% to Robotics Whiz each"
    },
    {
        id: "head_dept",
        name: "👔 Head of Department",
        base_cost: 8000000,
        base_production: 39,
        cost_multiplier: 1.25,
        targets: ["year11", "year12"],
        bonus_per_unit: 0.03,
        description: "+3% to Year 11 Student, Year 12 Student each"
    },
    {
        id: "olympiad_coach",
        name: "🏆 Olympiad Coach",
        base_cost: 12000000,
        base_production: 24,
        cost_multiplier: 1.25,
        targets: ["olympiad", "tutor"],
        bonus_per_unit: 0.04,
        description: "+4% to Olympiad Champion, Private Tutor Pupil each"
    },
    {
        id: "sixth_form_head",
        name: "🎖️ Head of Sixth Form",
        base_cost: 18000000,
        base_production: 14,
        cost_multiplier: 1.25,
        targets: ["year13", "year12"],
        bonus_per_unit: 0.03,
        description: "+3% to Year 13 Student, Year 12 Student each"
    },
    {
        id: "principal",
        name: "👑 Principal",
        base_cost: 38000000,
        base_production: 12,
        cost_multiplier: 1.25,
        targets: ["uni_student"],
        bonus_per_unit: 0.03,
        description: "+3% to University Student each"
    },
    {
        id: "consultant",
        name: "💼 Educational Consultant",
        base_cost: 80000000,
        base_production: 10,
        cost_multiplier: 1.25,
        targets: ["masters"],
        bonus_per_unit: 0.03,
        description: "+3% to Masters Student each"
    },
    {
        id: "dean",
        name: "🏛️ Dean of Research",
        base_cost: 180000000,
        base_production: 9.1,
        cost_multiplier: 1.25,
        targets: ["phd"],
        bonus_per_unit: 0.025,
        description: "+2.5% to PhD Candidate each"
    },
    {
        id: "chancellor",
        name: "⭐ University Chancellor",
        base_cost: 380000000,
        base_production: 7.7,
        cost_multiplier: 1.25,
        targets: ["professor"],
        bonus_per_unit: 0.02,
        description: "+2% to Professor each"
    },
    {
        id: "exam_board",
        name: "📋 Exam Board Chair",
        base_cost: 570000000,
        base_production: 4.6,
        cost_multiplier: 1.25,
        targets: ["year11", "year13", "olympiad"],
        bonus_per_unit: 0.02,
        description: "+2% to Year 11 Student, Year 13 Student, Olympiad Champion each"
    },
    {
        id: "curriculum_lead",
        name: "🧭 Curriculum Leader",
        base_cost: 860000000,
        base_production: 2.8,
        cost_multiplier: 1.25,
        targets: ["year2", "year4", "year6", "year8", "year10", "year12"],
        bonus_per_unit: 0.015,
        description: "+1.5% to 6 student types each"
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
        description: "Legendary: Boosts EVERY student type. +1.2% each, beyond the teacher cap"
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
        description: "Legendary: Boosts the eight most advanced students. +4% each, beyond the teacher cap"
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
        description: "Legendary: Bonus grows +10% for every graduation. +2% each, beyond the teacher cap"
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
        description: "Legendary: Boosts sixteen student types at once. +3% each, beyond the teacher cap"
    }
];

// School facilities - Based on real BISP Campus
// effect_value 1.10 = +10%. Legendary facilities have one-of-a-kind effects.
export const FACILITIES = [
    {
        id: "refectory",
        name: "🍽️ Refectory",
        description: "Healthy food for growing minds. +5% Global IQ",
        cost: 2000,
        effect_type: "global_multiplier",
        effect_value: 1.05
    },
    {
        id: "mtb_library",
        name: "📚 MTB Library",
        description: "Quiet study corner: faster notes. +6% Click Power",
        cost: 4200,
        effect_type: "click_power",
        effect_value: 1.06
    },
    {
        id: "playground",
        name: "🛝 Playground",
        description: "Break time recharges everyone. +7% Global IQ",
        cost: 8800,
        effect_type: "global_multiplier",
        effect_value: 1.07
    },
    {
        id: "sports_hall",
        name: "🏀 Sports Hall",
        description: "Teamwork makes every tap stronger. +8% Click Power",
        cost: 19000,
        effect_type: "click_power",
        effect_value: 1.08
    },
    {
        id: "it_suite",
        name: "💻 IT Suite",
        description: "Computers in every classroom. +9% Global IQ",
        cost: 39000,
        effect_type: "global_multiplier",
        effect_value: 1.09
    },
    {
        id: "bakery",
        name: "🥐 School Bakery",
        description: "Fresh croissants fuel fast tapping. +10% Click Power",
        cost: 82000,
        effect_type: "click_power",
        effect_value: 1.1
    },
    {
        id: "music_room",
        name: "🎵 Music Room",
        description: "Harmony across the whole school. +11% Global IQ",
        cost: 170000,
        effect_type: "global_multiplier",
        effect_value: 1.11
    },
    {
        id: "olympic_pool",
        name: "🏊 Olympic Pool",
        description: "Swimming sharpens focus on every tap. +12% Click Power",
        cost: 360000,
        effect_type: "click_power",
        effect_value: 1.12
    },
    {
        id: "stem_lab",
        name: "🔬 STEM Lab",
        description: "Science & Technology labs. +13% Global IQ",
        cost: 760000,
        effect_type: "global_multiplier",
        effect_value: 1.13
    },
    {
        id: "art_studio",
        name: "🎨 Art Studio",
        description: "Creative hands, quicker clicks. +14% Click Power",
        cost: 1600000,
        effect_type: "click_power",
        effect_value: 1.14
    },
    {
        id: "fitness_gym",
        name: "🏋️ Fitness Gym",
        description: "Strong body, strong mind. +15% Global IQ",
        cost: 3300000,
        effect_type: "global_multiplier",
        effect_value: 1.15
    },
    {
        id: "auditorium",
        name: "🎭 Auditorium",
        description: "300-seat venue: confidence for every tap. +16% Click Power",
        cost: 7000000,
        effect_type: "click_power",
        effect_value: 1.16
    },
    {
        id: "tennis_courts",
        name: "🎾 Tennis Courts",
        description: "Friendly competition for all. +17% Global IQ",
        cost: 15000000,
        effect_type: "global_multiplier",
        effect_value: 1.17
    },
    {
        id: "observatory",
        name: "🔭 Observatory",
        description: "Stargazing inspires sharper tapping. +18% Click Power",
        cost: 31000000,
        effect_type: "click_power",
        effect_value: 1.18
    },
    {
        id: "boarding_house",
        name: "🏠 Boarding House",
        description: "Home away from home. +19% Global IQ",
        cost: 65000000,
        effect_type: "global_multiplier",
        effect_value: 1.19
    },
    {
        id: "robotics_lab",
        name: "🤖 Robotics Lab",
        description: "Robot helpers press the button. +20% Click Power",
        cost: 140000000,
        effect_type: "click_power",
        effect_value: 1.2
    },
    {
        id: "aerial_arts",
        name: "🎪 Aerial Arts Academy",
        description: "Trapeze and circus skills for the whole school. +21% Global IQ",
        cost: 290000000,
        effect_type: "global_multiplier",
        effect_value: 1.21
    },
    {
        id: "eco_garden",
        name: "🌱 Eco Garden",
        description: "Fresh air and fast fingers. +22% Click Power",
        cost: 600000000,
        effect_type: "click_power",
        effect_value: 1.22
    },
    {
        id: "wellbeing_centre",
        name: "🧘 Wellbeing Centre",
        description: "Support and counselling for all. +23% Global IQ",
        cost: 1300000000,
        effect_type: "global_multiplier",
        effect_value: 1.23
    },
    {
        id: "recording_studio",
        name: "🎙️ Recording Studio",
        description: "Podcast skills, powerful taps. +24% Click Power",
        cost: 2600000000,
        effect_type: "click_power",
        effect_value: 1.24
    },
    {
        id: "football_pitch",
        name: "⚽ Football Pitch",
        description: "The whole school cheers together. +25% Global IQ",
        cost: 5600000000,
        effect_type: "global_multiplier",
        effect_value: 1.25
    },
    {
        id: "starfall",
        name: "🌠 Starfall Observatory",
        description: "Legendary: A Golden Badge appears at least every 100 seconds",
        cost: 14000000000,
        effect_type: "golden_guarantee",
        effect_value: 100,
        legendary: true
    },
    {
        id: "alumni_hall",
        name: "🏆 Alumni Hall of Fame",
        description: "Legendary: +1 extra certificate on every graduation",
        cost: 35000000000,
        effect_type: "certificate_bonus",
        effect_value: 1,
        legendary: true
    },
    {
        id: "cheer_arena",
        name: "📣 Grand Cheer Arena",
        description: "Legendary: Combo window is 1.5x longer",
        cost: 88000000000,
        effect_type: "combo_extend",
        effect_value: 1.5,
        legendary: true
    },
    {
        id: "time_vault",
        name: "⏳ Time Capsule Vault",
        description: "Legendary: Every click also gives 1% of your IQ/s",
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
        description: "Double click power",
        requires: null
    },
    {
        id: "click2",
        name: "🪑 Ergonomic Desk",
        cost: 600,
        type: "click_power",
        value: 2,
        description: "2x click power",
        requires: "click1"
    },
    {
        id: "click3",
        name: "🎵 Study Music",
        cost: 2400,
        type: "click_power",
        value: 2,
        description: "2x click power",
        requires: "click2"
    },
    {
        id: "click4",
        name: "🧘 Focus Meditation",
        cost: 9600,
        type: "click_power",
        value: 2,
        description: "2x click power",
        requires: "click3"
    },
    {
        id: "click5",
        name: "📖 Speed Reading",
        cost: 38000,
        type: "click_power",
        value: 2,
        description: "2x click power",
        requires: "click4"
    },
    {
        id: "click6",
        name: "🏛️ Memory Palace",
        cost: 150000,
        type: "click_power",
        value: 2,
        description: "2x click power",
        requires: "click5"
    },
    {
        id: "click7",
        name: "💻 Smart Laptop",
        cost: 600000,
        type: "click_power",
        value: 2,
        description: "2x click power",
        requires: "click6"
    },
    {
        id: "click8",
        name: "⚡ Lightning Reflexes",
        cost: 2400000,
        type: "click_power",
        value: 2,
        description: "2x click power",
        requires: "click7"
    },
    {
        id: "click9",
        name: "🤖 AI Study Buddy",
        cost: 9800000,
        type: "click_power",
        value: 2,
        description: "2x click power",
        requires: "click8"
    },
    {
        id: "click10",
        name: "🧠 Photographic Notes",
        cost: 39000000,
        type: "click_power",
        value: 1.5,
        description: "1.5x click power",
        requires: "click9"
    },
    {
        id: "click11",
        name: "🚀 Study Rocket",
        cost: 150000000,
        type: "click_power",
        value: 1.5,
        description: "1.5x click power",
        requires: "click10"
    },
    {
        id: "click12",
        name: "🌟 Genius Mode",
        cost: 630000000,
        type: "click_power",
        value: 1.5,
        description: "1.5x click power",
        requires: "click11"
    },
    {
        id: "ps_click1",
        name: "🤝 Peer Tutoring",
        cost: 36000,
        type: "per_student_click",
        value: 0.1,
        description: "+0.1 IQ per click for every student you own",
        requires: "click2"
    },
    {
        id: "ps_click2",
        name: "👥 Study Groups",
        cost: 10000000,
        type: "per_student_click",
        value: 0.3,
        description: "+0.3 IQ per click for every student you own",
        requires: "ps_click1"
    },
    {
        id: "ps_click3",
        name: "🏫 School Newspaper",
        cost: 3800000000,
        type: "per_student_click",
        value: 1,
        description: "+1 IQ per click for every student you own",
        requires: "ps_click2"
    },
    {
        id: "student_eff1",
        name: "New Textbooks",
        cost: 2500,
        type: "student_multiplier",
        value: 1.5,
        target: ["year1", "year2", "year3", "year4", "year5"],
        description: "1.5x for early students",
        requires: null
    },
    {
        id: "student_early2",
        name: "🌈 Colourful Flashcards",
        cost: 15000,
        type: "student_multiplier",
        value: 2,
        target: ["year1", "year2", "year3", "year4", "year5"],
        description: "2x for early students",
        requires: "student_eff1"
    },
    {
        id: "student_early3",
        name: "🤝 Reading Buddies",
        cost: 370000,
        type: "student_multiplier",
        value: 2,
        target: ["year1", "year2", "year3", "year4", "year5"],
        description: "2x for early students",
        requires: "student_early2"
    },
    {
        id: "student_early4",
        name: "🔤 Phonics Games",
        cost: 3800000,
        type: "student_multiplier",
        value: 2.5,
        target: ["year1", "year2", "year3", "year4", "year5"],
        description: "2.5x for early students",
        requires: "student_early3"
    },
    {
        id: "student_eff2",
        name: "Interactive Whiteboards",
        cost: 28000,
        type: "student_multiplier",
        value: 1.5,
        target: ["year6", "chess", "year7", "year8", "year9"],
        description: "1.5x for middle students",
        requires: null
    },
    {
        id: "student_mid2",
        name: "🚌 School Field Trips",
        cost: 780000,
        type: "student_multiplier",
        value: 2,
        target: ["year6", "chess", "year7", "year8", "year9"],
        description: "2x for middle students",
        requires: "student_eff2"
    },
    {
        id: "student_mid3",
        name: "📱 Learning Tablets",
        cost: 22000000,
        type: "student_multiplier",
        value: 2,
        target: ["year6", "chess", "year7", "year8", "year9"],
        description: "2x for middle students",
        requires: "student_mid2"
    },
    {
        id: "student_mid4",
        name: "🏆 House Competitions",
        cost: 620000000,
        type: "student_multiplier",
        value: 2.5,
        target: ["year6", "chess", "year7", "year8", "year9"],
        description: "2.5x for middle students",
        requires: "student_mid3"
    },
    {
        id: "student_eff3",
        name: "Exam Prep Materials",
        cost: 2100000,
        type: "student_multiplier",
        value: 1.5,
        target: ["physicist", "robotics", "year10", "year11", "tutor", "olympiad", "year12", "year13"],
        description: "1.5x for senior students",
        requires: null
    },
    {
        id: "student_senior2",
        name: "📝 Revision Guides",
        cost: 60000000,
        type: "student_multiplier",
        value: 2,
        target: ["physicist", "robotics", "year10", "year11", "tutor", "olympiad", "year12", "year13"],
        description: "2x for senior students",
        requires: "student_eff3"
    },
    {
        id: "student_senior3",
        name: "🎤 Debate Society",
        cost: 1300000000,
        type: "student_multiplier",
        value: 2,
        target: ["physicist", "robotics", "year10", "year11", "tutor", "olympiad", "year12", "year13"],
        description: "2x for senior students",
        requires: "student_senior2"
    },
    {
        id: "student_senior4",
        name: "🎓 University Mentors",
        cost: 13000000000,
        type: "student_multiplier",
        value: 2.5,
        target: ["physicist", "robotics", "year10", "year11", "tutor", "olympiad", "year12", "year13"],
        description: "2.5x for senior students",
        requires: "student_senior3"
    },
    {
        id: "uni_eff1",
        name: "📚 Research Library Pass",
        cost: 29000000,
        type: "student_multiplier",
        value: 1.5,
        target: ["uni_student", "masters", "phd", "professor"],
        description: "1.5x for university students",
        requires: null
    },
    {
        id: "uni_eff2",
        name: "🔭 Research Grants",
        cost: 750000000,
        type: "student_multiplier",
        value: 2,
        target: ["uni_student", "masters", "phd", "professor"],
        description: "2x for university students",
        requires: "uni_eff1"
    },
    {
        id: "uni_eff3",
        name: "📰 Published Papers",
        cost: 7500000000,
        type: "student_multiplier",
        value: 2,
        target: ["uni_student", "masters", "phd", "professor"],
        description: "2x for university students",
        requires: "uni_eff2"
    },
    {
        id: "science1",
        name: "Chemistry Set",
        cost: 780000,
        type: "student_multiplier",
        value: 2,
        target: ["year9"],
        description: "2x for Year 9 students",
        requires: "stem_lab"
    },
    {
        id: "science2",
        name: "Physics Lab Equipment",
        cost: 22000000,
        type: "student_multiplier",
        value: 2,
        target: ["year11"],
        description: "2x for Year 11 students",
        requires: "stem_lab"
    },
    {
        id: "science3",
        name: "📕 Science Encyclopedia",
        cost: 140000,
        type: "student_multiplier",
        value: 2,
        target: ["year6"],
        description: "2x for Year 6 students",
        requires: "mtb_library"
    },
    {
        id: "science4",
        name: "🔭 Planetarium Shows",
        cost: 2500000000,
        type: "student_multiplier",
        value: 2,
        target: ["year13"],
        description: "2x for Year 13 students",
        requires: "auditorium"
    },
    {
        id: "science5",
        name: "🧲 Young Physicist Kits",
        cost: 5800000,
        type: "student_multiplier",
        value: 2,
        target: ["physicist"],
        description: "2x for Young Physicists",
        requires: "science1"
    },
    {
        id: "chess_up",
        name: "🏁 Chess Tournaments",
        cost: 98000,
        type: "student_multiplier",
        value: 2,
        target: ["chess"],
        description: "2x for Chess Club Kids",
        requires: "student_eff2"
    },
    {
        id: "robot_up",
        name: "🔧 Robot Wars Arena",
        cost: 16000000,
        type: "student_multiplier",
        value: 2,
        target: ["robotics"],
        description: "2x for Robotics Whizzes",
        requires: "robotics_lab"
    },
    {
        id: "olympiad_up",
        name: "🌐 Olympiad Training Camp",
        cost: 450000000,
        type: "student_multiplier",
        value: 2,
        target: ["olympiad", "tutor"],
        description: "2x for Olympiad Champions and Tutor Pupils",
        requires: "student_senior2"
    },
    {
        id: "global1",
        name: "School Spirit",
        cost: 28000,
        type: "global_multiplier",
        value: 1.1,
        description: "+10% to all IQ generation",
        requires: null
    },
    {
        id: "global2",
        name: "BISP Excellence",
        cost: 780000,
        type: "global_multiplier",
        value: 1.15,
        description: "+15% to all IQ generation",
        requires: "global1"
    },
    {
        id: "global3",
        name: "World-Class Education",
        cost: 22000000,
        type: "global_multiplier",
        value: 1.3,
        description: "+30% to all IQ generation",
        requires: "global2"
    },
    {
        id: "global4",
        name: "👨‍👩‍👧 Parent-Teacher Association",
        cost: 210000,
        type: "global_multiplier",
        value: 1.1,
        description: "+10% to all IQ generation",
        requires: "global1"
    },
    {
        id: "global5",
        name: "⭐ Outstanding Inspection",
        cost: 620000000,
        type: "global_multiplier",
        value: 1.2,
        description: "+20% to all IQ generation",
        requires: "global3"
    },
    {
        id: "global6",
        name: "🌏 International Partnerships",
        cost: 13000000000,
        type: "global_multiplier",
        value: 1.3,
        description: "+30% to all IQ generation",
        requires: "global5"
    },
    {
        id: "global7",
        name: "🏫 Best School in Asia",
        cost: 75000000000,
        type: "global_multiplier",
        value: 1.5,
        description: "+50% to all IQ generation",
        requires: "global6"
    },
    {
        id: "global8",
        name: "🎓 Scholarship Fund",
        cost: 4200000,
        type: "global_multiplier",
        value: 1.1,
        description: "+10% to all IQ generation",
        requires: "it_suite"
    },
    {
        id: "global9",
        name: "🖥️ Digital Classroom",
        cost: 210000000,
        type: "global_multiplier",
        value: 1.15,
        description: "+15% to all IQ generation",
        requires: "global8"
    },
    {
        id: "alumni_donations",
        name: "💌 Alumni Donations",
        cost: 1500000,
        type: "prestige_synergy",
        value: 0.04,
        per: "graduation",
        description: "+4% IQ per graduation you have earned",
        requires: "global1"
    },
    {
        id: "cert_frames",
        name: "🖼️ Framed Certificates",
        cost: 120000000,
        type: "prestige_synergy",
        value: 0.02,
        per: "certificate",
        description: "+2% IQ per certificate you own",
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
        description: "Legendary: x1.12 IQ for every graduation (up to 10)",
        requires: "global6"
    },
    {
        id: "legend_lucky",
        name: "🍀 Lucky Charm",
        cost: 63000000000,
        type: "golden_duration",
        value: 2,
        legendary: true,
        description: "Legendary: Golden Badge bonus lasts twice as long",
        requires: "global6"
    },
    {
        id: "legend_mentor",
        name: "🧙 Legendary Mentor",
        cost: 100000000000,
        type: "per_student_click",
        value: 3,
        legendary: true,
        description: "Legendary: +3 IQ per click for every student you own",
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
        description: "Legendary: +6% IQ per certificate you own",
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
// Cost of the next one = base_cost * cost_multiplier^owned.
export const AUTOCLICKER_CONFIG = {
    base_cost: 100000,
    cost_multiplier: 1.5,
    clicks_per_second: 1
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

// Click combo: tapping quickly builds a streak that multiplies click power
export const COMBO_CONFIG = {
    window_ms: 1200,  // Max gap between clicks to keep the streak alive
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
        { min: 1000, mult: 8, name: "Absolute Mind" }    // supernova
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

import { GameEngine } from './game-engine.js';
import { SaveManager } from './save-manager.js';
import { SoundManager } from './sound-manager.js';
import { STUDENTS, TEACHERS, FACILITIES, UPGRADES } from './data.js';

// Initialize game engine, save manager, and sound manager
const game = new GameEngine();
const saveManager = new SaveManager();
const soundManager = new SoundManager();

// Global state
let currentTab = 'students';
let lastFrameTime = Date.now();

// Animated counter for IQ display
let displayedIQ = 0; // The value currently shown on screen
let lastActualIQ = 0; // Track previous actual IQ for pulse effect

// DOM Elements
const studyButton = document.getElementById('study-button');
const iqDisplay = document.getElementById('iq-display');
const iqPerSecDisplay = document.getElementById('iq-per-sec');
const graduationsDisplay = document.getElementById('graduations-display');
const clickPowerDisplay = document.getElementById('click-power');
const graduateButton = document.getElementById('graduate-button');
const floatingNumbersContainer = document.getElementById('floating-numbers');
const achievementPopup = document.getElementById('achievement-popup');
const offlineModal = document.getElementById('offline-modal');
const closeOfflineModalBtn = document.getElementById('close-offline-modal');

// Tab elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Content containers
const studentsGrid = document.getElementById('students-grid');
const teachersGrid = document.getElementById('teachers-grid');
const facilitiesList = document.getElementById('facilities-list');
const upgradesList = document.getElementById('upgrades-list');

// ===== Initialization =====
function init() {
    // Load saved game
    const loadResult = saveManager.loadGame(game);

    if (loadResult && typeof loadResult === 'number' && loadResult > 0) {
        // Show offline progress modal
        showOfflineProgress(loadResult);
    }

    // Setup event listeners
    setupEventListeners();

    // Initial render
    renderAll();

    // Start game loop
    gameLoop();

    // Auto-save every 10 seconds
    setInterval(() => {
        saveManager.saveGame(game);
    }, 10000);
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Study button
    studyButton.addEventListener('click', handleStudyClick);

    // Tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });

    // Graduate button
    graduateButton.addEventListener('click', handleGraduate);

    // Close offline modal
    closeOfflineModalBtn.addEventListener('click', () => {
        offlineModal.classList.add('hidden');
    });
}

// ===== Study Button Handler =====
function handleStudyClick(e) {
    const value = game.handleClick();

    // Play click sound
    soundManager.playClick();

    // Create floating number
    const rect = studyButton.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    createFloatingNumber(value, x, y);

    // Update displays
    updateStats();
}

// ===== Tab Switching =====
function switchTab(tabName) {
    currentTab = tabName;

    // Update tab buttons
    tabs.forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Update tab contents
    tabContents.forEach(content => {
        if (content.id === `${tabName}-content`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });

    // Render current tab
    renderCurrentTab();
}

// ===== Rendering Functions =====
function renderAll() {
    updateStats();
    renderCurrentTab();
    checkGraduateButton();
    checkAchievements();
}

function updateStats() {
    // Smooth counter animation for IQ
    const actualIQ = game.iq;

    // Initialize displayedIQ on first run
    if (displayedIQ === 0 && actualIQ > 0) {
        displayedIQ = actualIQ;
        lastActualIQ = actualIQ;
    }

    // Smoothly interpolate toward actual value
    // Speed depends on the difference - larger differences animate faster
    const difference = actualIQ - displayedIQ;

    // Disable smoothing for low values to prevent "laggy" feel
    if (actualIQ < 1000) {
        displayedIQ = actualIQ;
    } else {
        const animationSpeed = 0.15; // Higher = faster animation (0.1 to 0.3 works well)
        displayedIQ += difference * animationSpeed;

        // Snap to actual value if very close (prevents endless tiny updates)
        if (Math.abs(difference) < 0.01) {
            displayedIQ = actualIQ;
        }
    }

    // Format both displayed and actual values
    const formattedDisplayed = game.formatNumber(displayedIQ);

    iqDisplay.textContent = formattedDisplayed;
    iqPerSecDisplay.textContent = game.formatNumber(game.iq_per_second) + ' IQ/s';
    graduationsDisplay.textContent = game.graduations;
    clickPowerDisplay.textContent = '+' + game.formatNumber(game.calculateClickPower()) + ' IQ';

    lastActualIQ = actualIQ;
}

function renderCurrentTab() {
    if (currentTab === 'students') {
        renderStudents();
    } else if (currentTab === 'teachers') {
        renderTeachers();
    } else if (currentTab === 'facilities') {
        renderFacilities();
    } else if (currentTab === 'upgrades') {
        renderUpgrades();
    }
}

// Update affordability without re-rendering (for game loop)
function updateAffordability() {
    if (currentTab === 'students') {
        updateStudentsAffordability();
    } else if (currentTab === 'teachers') {
        updateTeachersAffordability();
    } else if (currentTab === 'facilities') {
        updateFacilitiesAffordability();
    } else if (currentTab === 'upgrades') {
        updateUpgradesAffordability();
    }
}

function updateStudentsAffordability() {
    const cards = studentsGrid.querySelectorAll('.building-card');
    STUDENTS.forEach((student, index) => {
        if (index < cards.length) {
            const cost = game.calculateBuildingCost('student', student.id);
            const canAfford = game.canAfford(cost);
            const card = cards[index];
            const button = card.querySelector('.building-button');

            if (canAfford) {
                card.classList.add('affordable');
                button.classList.add('affordable');
            } else {
                card.classList.remove('affordable');
                button.classList.remove('affordable');
            }
        }
    });
}

function updateTeachersAffordability() {
    const cards = teachersGrid.querySelectorAll('.building-card');
    TEACHERS.forEach((teacher, index) => {
        if (index < cards.length) {
            const cost = game.calculateBuildingCost('teacher', teacher.id);
            const canAfford = game.canAfford(cost);
            const card = cards[index];
            const button = card.querySelector('.building-button');

            if (canAfford) {
                card.classList.add('affordable');
                button.classList.add('affordable');
            } else {
                card.classList.remove('affordable');
                button.classList.remove('affordable');
            }
        }
    });
}

function updateFacilitiesAffordability() {
    const items = facilitiesList.querySelectorAll('.list-item');
    FACILITIES.forEach((facility, index) => {
        if (index < items.length) {
            const owned = game.facilities[facility.id];
            if (!owned) {
                const cost = facility.cost;
                const canAfford = game.canAfford(cost);
                const item = items[index];
                const button = item.querySelector('.list-item-button');

                if (canAfford) {
                    item.classList.add('affordable');
                    if (button) button.classList.add('affordable');
                } else {
                    item.classList.remove('affordable');
                    if (button) button.classList.remove('affordable');
                }
            }
        }
    });
}

function updateUpgradesAffordability() {
    const items = upgradesList.querySelectorAll('.list-item');
    const availableUpgrades = UPGRADES.filter(upgrade => {
        if (!upgrade.requires) return true;
        const req = upgrade.requires;
        if (req in game.facilities) {
            return game.facilities[req];
        } else if (req in game.upgrades) {
            return game.upgrades[req];
        }
        return true;
    }).sort((a, b) => a.cost - b.cost); // Sort by cost (cheapest first)

    availableUpgrades.forEach((upgrade, index) => {
        if (index < items.length) {
            const owned = game.upgrades[upgrade.id];
            if (!owned) {
                const cost = upgrade.cost;
                const canAfford = game.canAfford(cost);
                const item = items[index];
                const button = item.querySelector('.list-item-button');

                if (canAfford) {
                    item.classList.add('affordable');
                    if (button) button.classList.add('affordable');
                } else {
                    item.classList.remove('affordable');
                    if (button) button.classList.remove('affordable');
                }
            }
        }
    });
}

function renderStudents() {
    studentsGrid.innerHTML = '';

    STUDENTS.forEach(student => {
        const count = game.students[student.id] || 0;
        const cost = game.calculateBuildingCost('student', student.id);
        const canAfford = game.canAfford(cost);

        // Calculate actual production with all bonuses
        const actualProduction = game.calculateStudentProduction(student.id);

        const card = document.createElement('div');
        card.className = `building-card ${canAfford ? 'affordable' : ''}`;

        card.innerHTML = `
            <div class="building-header">
                <div class="building-name">${student.name}</div>
                <div class="building-count">${count}</div>
            </div>
            <div class="building-desc">${student.description}</div>
            <button class="building-button ${canAfford ? 'affordable' : ''}" data-id="${student.id}">
                Buy: ${game.formatNumberShort(cost)} (+${game.formatNumberShort(actualProduction)}/s)
            </button>
        `;

        const button = card.querySelector('button');
        button.addEventListener('click', () => {
            if (game.purchaseStudent(student.id)) {
                soundManager.playPurchase();
                renderAll();
            }
        });

        studentsGrid.appendChild(card);
    });
}

function renderTeachers() {
    teachersGrid.innerHTML = '';

    TEACHERS.forEach(teacher => {
        const count = game.teachers[teacher.id] || 0;
        const cost = game.calculateBuildingCost('teacher', teacher.id);
        const canAfford = game.canAfford(cost);

        const card = document.createElement('div');
        card.className = `building-card ${canAfford ? 'affordable' : ''}`;

        card.innerHTML = `
            <div class="building-header">
                <div class="building-name">${teacher.name}</div>
                <div class="building-count">${count}</div>
            </div>
            <div class="building-desc">${teacher.description}</div>
            <button class="building-button ${canAfford ? 'affordable' : ''}" data-id="${teacher.id}">
                Hire: ${game.formatNumberShort(cost)}
            </button>
        `;

        const button = card.querySelector('button');
        button.addEventListener('click', () => {
            if (game.purchaseTeacher(teacher.id)) {
                soundManager.playPurchase();
                renderAll();
            }
        });

        teachersGrid.appendChild(card);
    });
}

function renderFacilities() {
    facilitiesList.innerHTML = '';

    FACILITIES.forEach(facility => {
        const owned = game.facilities[facility.id];
        const cost = facility.cost;
        const canAfford = game.canAfford(cost);

        const item = document.createElement('div');
        item.className = `list-item ${owned ? 'owned' : (canAfford ? 'affordable' : '')}`;

        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-name">${facility.name}${owned ? ' ✓' : ''}</div>
                <div class="list-item-desc">${facility.description}</div>
            </div>
            ${owned
                ? '<div class="list-item-status">BUILT</div>'
                : `<button class="list-item-button ${canAfford ? 'affordable' : ''}" data-id="${facility.id}">
                    Build: ${game.formatNumberShort(cost)} IQ
                   </button>`
            }
        `;

        if (!owned) {
            const button = item.querySelector('button');
            button.addEventListener('click', () => {
                if (game.purchaseFacility(facility.id)) {
                    soundManager.playPurchase();
                    renderAll();
                }
            });
        }

        facilitiesList.appendChild(item);
    });
}

function renderUpgrades() {
    upgradesList.innerHTML = '';

    // Filter available upgrades
    const availableUpgrades = UPGRADES.filter(upgrade => {
        if (!upgrade.requires) return true;

        const req = upgrade.requires;
        if (req in game.facilities) {
            return game.facilities[req];
        } else if (req in game.upgrades) {
            return game.upgrades[req];
        }
        return true;
    }).sort((a, b) => a.cost - b.cost); // Sort by cost (cheapest first)

    availableUpgrades.forEach(upgrade => {
        const owned = game.upgrades[upgrade.id];
        const cost = upgrade.cost;
        const canAfford = game.canAfford(cost);

        const item = document.createElement('div');
        item.className = `list-item ${owned ? 'owned' : (canAfford ? 'affordable' : '')}`;

        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-name">${upgrade.name}${owned ? ' ✓' : ''}</div>
                <div class="list-item-desc">${upgrade.description}</div>
            </div>
            ${owned
                ? '<div class="list-item-status">PURCHASED</div>'
                : `<button class="list-item-button ${canAfford ? 'affordable' : ''}" data-id="${upgrade.id}">
                    Buy: ${game.formatNumberShort(cost)} IQ
                   </button>`
            }
        `;

        if (!owned) {
            const button = item.querySelector('button');
            button.addEventListener('click', () => {
                if (game.purchaseUpgrade(upgrade.id)) {
                    soundManager.playPurchase();
                    renderAll();
                }
            });
        }

        upgradesList.appendChild(item);
    });
}

// ===== Graduate Button =====
function checkGraduateButton() {
    if (game.canGraduate()) {
        graduateButton.classList.remove('hidden');
    } else {
        graduateButton.classList.add('hidden');
    }
}

function handleGraduate() {
    if (confirm('Are you sure you want to graduate? This will reset your progress but grant you certificates for permanent bonuses!')) {
        game.graduate();
        soundManager.playGraduate();
        renderAll();
    }
}

// ===== Floating Numbers =====
function createFloatingNumber(value, x, y) {
    const floatingNum = document.createElement('div');
    floatingNum.className = 'floating-number';
    floatingNum.textContent = '+' + game.formatNumber(value);
    floatingNum.style.left = x + 'px';
    floatingNum.style.top = y + 'px';

    floatingNumbersContainer.appendChild(floatingNum);

    // Remove after animation
    setTimeout(() => {
        floatingNum.remove();
    }, 1000);
}

// ===== Achievements =====
let achievementTimer = 0;

function checkAchievements() {
    if (game.achievement_notifications.length > 0) {
        const achievement = game.achievement_notifications.shift();
        showAchievement(achievement);
    }
}

function showAchievement(achievement) {
    document.getElementById('achievement-name').textContent = achievement.name;
    document.getElementById('achievement-desc').textContent = achievement.description;

    soundManager.playAchievement();
    achievementPopup.classList.remove('hidden');
    achievementTimer = 3;

    setTimeout(() => {
        achievementPopup.classList.add('hidden');
    }, 3000);
}

// ===== Offline Progress =====
function showOfflineProgress(offlineIQ) {
    document.getElementById('offline-iq').textContent = game.formatNumber(offlineIQ) + ' IQ';
    offlineModal.classList.remove('hidden');
}

// ===== Game Loop =====
function gameLoop() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - lastFrameTime) / 1000; // Convert to seconds
    lastFrameTime = currentTime;

    // Update game state
    game.update(deltaTime);

    // Update UI
    updateStats();
    updateAffordability(); // Only update CSS classes, don't recreate DOM
    checkGraduateButton();
    checkAchievements();

    // Continue loop
    requestAnimationFrame(gameLoop);
}

// ===== Start the game =====
init();

// Make game accessible in console for debugging
window.game = game;

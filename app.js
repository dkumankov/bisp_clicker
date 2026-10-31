import { GameEngine } from './game-engine.js?v=598c4ac0';
import { SaveManager, MIN_OFFLINE_SECONDS } from './save-manager.js?v=5f0aa341';
import { SoundManager } from './sound-manager.js?v=8666558e';
import { ComboFx } from './combo-fx.js?v=3872703e';
import { AutoClickers } from './autoclickers.js?v=4287a611';
import { fetchLeaderboard, postScore, validateName, cleanName, timeAgo, SUBMIT_INTERVAL_MS } from './leaderboard.js?v=0209c219';
import { STUDENTS, TEACHERS, FACILITIES, UPGRADES, COMBO_CONFIG, AUTOCLICKER_CONFIG, GOLDEN_CONFIG, CAMPUS_STAGES, MILESTONES } from './data.js?v=0193ac63';

// Initialize game engine, save manager, and sound manager
const game = new GameEngine();
const saveManager = new SaveManager();
const soundManager = new SoundManager();
let comboFx = null;  // created in init once the DOM refs exist
let autoClickers = null;

const $ = (id) => document.getElementById(id);
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Phones in portrait use the shop as a bottom sheet
const sheetQuery = window.matchMedia('(max-width: 768px) and (orientation: portrait)');

// ===== Global state =====
let currentTab = 'students';
let lastFrameTime = performance.now();
let displayedIQ = 0;            // Value currently shown (animated towards game.iq)
let hiddenAt = null;            // Timestamp when the page was hidden
let justBought = null;          // Key of the card to animate after the next render
let lastComboTier = 0;
let campusStage = -1;
let lastIqMilestone = 0;
let lastClickMilestone = 0;

// Golden badge scheduling (performance.now() timestamps)
let nextGoldenAt = 0;
let goldenExpiresAt = 0;

// ===== DOM elements =====
const studyButton = $('study-button');
const fingerCount = $('finger-count');
const iqDisplay = $('iq-display');
const iqPerSecDisplay = $('iq-per-sec');
const graduationsDisplay = $('graduations-display');
const clickPowerDisplay = $('click-power');
const graduateButton = $('graduate-button');
const fxLayer = $('floating-numbers');
const toastsEl = $('toasts');
const goldenBadge = $('golden-badge');
const shop = $('shop');
const sheetScrim = $('sheet-scrim');
const contentPanel = $('content-panel');

const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const TAB_ORDER = Array.from(tabs).map(t => t.dataset.tab);

const studentsGrid = $('students-grid');
const teachersGrid = $('teachers-grid');
const facilitiesList = $('facilities-list');
const upgradesList = $('upgrades-list');

// ===== Initialization =====
function init() {
    const loadResult = saveManager.loadGame(game);

    // Start milestones/campus from the loaded state so a returning player isn't spammed
    lastIqMilestone = highestReached(MILESTONES.iq, game.lifetime_iq);
    lastClickMilestone = highestReached(MILESTONES.clicks, game.clicks);
    displayedIQ = game.iq;
    scheduleGolden(true);

    autoClickers = new AutoClickers({ host: $('finger-orbit'), button: studyButton, reduceMotion, onClick: handleAutoClick });
    setupEventListeners();
    setupLeaderboard();
    syncSoundUI();
    renderAll();
    updateCampus(true);

    if (loadResult.offlineIQ > 0) {
        showOfflineProgress(loadResult.offlineIQ, loadResult.offlineSeconds);
    }

    if (!game.leaderboard_name) openNameModal();
    maybeShowDailyBonus();  // Waits for any open modal (name, welcome back) to close first

    requestAnimationFrame(gameLoop);

    // Auto-save every 10 seconds
    setInterval(() => saveManager.saveGame(game), 10000);
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Block pinch-zoom, double-tap zoom and pull-to-refresh on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) {
        // Only zoom / scroll defaults are cancelled here. Study taps are pointerdown and shop
        // buys are pointerup, both dispatched before these touch events, so multi-finger
        // tapping keeps registering.
        const block = (e) => { if (e.cancelable) e.preventDefault(); };
        const nonPassive = { passive: false };
        // iOS Safari ignores user-scalable=no: kill its native pinch gestures
        for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
            document.addEventListener(type, block, nonPassive);
        }
        // Pinch: any move with 2+ fingers or a non-1 scale never reaches the browser
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 1 || (e.scale !== undefined && e.scale !== 1)) block(e);
        }, nonPassive);
        // Double-tap zoom: cancel a touchend within 350ms of the previous one. Controls that
        // rely on the synthesized click (tabs, modal buttons, inputs) are exempt; they already
        // have touch-action without double-tap zoom.
        const CLICK_TARGETS = 'a, input, select, textarea, label, [role="button"], button:not(#study-button)';
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = e.timeStamp;
            const rapid = now - lastTouchEnd < 350;
            lastTouchEnd = now;
            if (rapid && !e.target.closest?.(CLICK_TARGETS)) block(e);
        }, nonPassive);
    }
    // Study button: pointerdown for instant response (and multi-touch); click only for keyboard
    studyButton.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        handleStudyClick(e.clientX, e.clientY);
    });
    studyButton.addEventListener('click', (e) => {
        if (e.detail !== 0) return;  // Real pointer clicks were handled on pointerdown
        const rect = studyButton.getBoundingClientRect();
        handleStudyClick(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    studyButton.addEventListener('contextmenu', (e) => e.preventDefault());

    setupPurchaseTaps();

    // Tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => handleTabClick(tab.dataset.tab));
    });
    $('sheet-handle').addEventListener('click', () => setSheetOpen(!shop.classList.contains('open')));
    sheetScrim.addEventListener('click', () => setSheetOpen(false));
    sheetQuery.addEventListener('change', () => setSheetOpen(false));
    setupSheetSwipe();

    graduateButton.addEventListener('click', handleGraduate);
    goldenBadge.addEventListener('pointerdown', handleGoldenCatch);

    // Modals
    $('daily-claim').addEventListener('click', claimDaily);
    $('close-offline-modal').addEventListener('click', () => closeModal($('offline-modal')));
    $('settings-button').addEventListener('click', openSettings);
    $('close-settings').addEventListener('click', () => closeModal($('settings-modal')));
    $('reset-button').addEventListener('click', handleReset);

    // Sound switch lives in the settings modal
    $('sound-switch').addEventListener('change', (e) => {
        soundManager.setEnabled(e.target.checked);
        syncSoundUI();
        soundManager.playTab();
    });

    // Close the top modal on Escape / backdrop tap
    document.addEventListener('keydown', (e) => {
        if (e.key !== 'Escape') return;
        if ($('confirm-modal').classList.contains('open')) $('confirm-cancel').click();
        else if ($('name-modal').classList.contains('open')) return;  // Name is required on first run
        else if ($('leaderboard-modal').classList.contains('open')) closeModal($('leaderboard-modal'));
        else if ($('settings-modal').classList.contains('open')) closeModal($('settings-modal'));
        else if ($('offline-modal').classList.contains('open')) closeModal($('offline-modal'));
        else setSheetOpen(false);
    });
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('pointerdown', (e) => {
            if (e.target !== modal) return;
            if (modal.id === 'confirm-modal') $('confirm-cancel').click();
            else if (modal.id !== 'name-modal') closeModal(modal);
        });
    });

    // Save when the player leaves, and award progress for time spent in the background
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', () => { saveManager.saveGame(game); submitScore(); });
}

function handleVisibilityChange() {
    if (document.hidden) {
        hiddenAt = Date.now();
        saveManager.saveGame(game);
        submitScore();
        return;
    }
    lastFrameTime = performance.now();
    if (hiddenAt === null) return;

    const seconds = saveManager.getAwaySeconds(hiddenAt);
    hiddenAt = null;

    // Always credit the time away; only longer absences get the welcome-back screen
    const earned = game.calculateIQPerSecond(false) * seconds;
    if (earned <= 0) return;
    game.addIQ(earned);
    if (seconds >= MIN_OFFLINE_SECONDS) {
        showOfflineProgress(earned, seconds);
    }
}

// ===== Study Button =====
function handleStudyClick(x, y) {
    const value = game.handleClick();
    const comboMult = game.getComboMultiplier();

    soundManager.playClick(game.combo / CLICK_PITCH_TOP);
    spawnClickFx(x, y, value, comboMult);
    updateStats();
}

// Click pitch climbs with the streak and tops out at this combo (Absolute Mind); higher tiers have their own fanfares
const CLICK_PITCH_TOP = 1000;

// ===== Auto-clickers =====
const AUTO_FX_GAP_MS = 120;     // visual feedback for auto-clicks is rate-limited, the clicks themselves are not
const AUTO_SOUNDS_PER_SEC = 4;  // target rate of the quiet auto-click sound
let lastAutoFxAt = 0;
let autoFxValue = 0;            // IQ of the clicks since the last floating number
let autoClickSeq = 0;

/** One finger taps Study: a full game click (counter, combo streak, IQ), with throttled feedback */
function handleAutoClick(angle) {
    const value = game.handleClick(performance.now(), true);
    autoFxValue += value;

    // Few fingers: every tap clicks softly. Many: every k-th tap, so it stays a rhythm and not noise
    const every = Math.max(1, Math.ceil(game.getAutoclicksPerSecond() / AUTO_SOUNDS_PER_SEC));
    if (autoClickSeq++ % every === 0) {
        soundManager.playAutoClick(game.combo / CLICK_PITCH_TOP);
    }

    const now = performance.now();
    if (now - lastAutoFxAt < AUTO_FX_GAP_MS) return;
    lastAutoFxAt = now;
    // Landing point: on the button rim, where this finger touches it
    const rect = studyButton.getBoundingClientRect();
    const rad = rect.width / 2 * 0.8;
    const x = rect.left + rect.width / 2 + Math.sin(angle) * rad;
    const y = rect.top + rect.height / 2 - Math.cos(angle) * rad;
    spawnClickFx(x, y, autoFxValue, game.getComboMultiplier(), true);
    autoFxValue = 0;
}

/** Juicy click feedback: button pulse, ripple, flying number, sparkles */
function spawnClickFx(x, y, value, comboMult, auto = false) {
    // Button squish (softer for auto-clicks)
    if (!reduceMotion) {
        const dip = auto ? 0.96 : 0.9;
        studyButton.animate(
            [{ transform: 'scale(1)' }, { transform: `scale(${dip})` }, { transform: 'scale(1.03)' }, { transform: 'scale(1)' }],
            { duration: 240, easing: 'ease-out' }
        );
        if (!auto) iqDisplay.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }],
            { duration: 160 }
        );
    }

    // Ripple ring inside the button
    const rect = studyButton.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = (x - rect.left) + 'px';
    ripple.style.top = (y - rect.top) + 'px';
    $('study-ripples').appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());

    // Keep the DOM light when someone taps very fast
    if (fxLayer.childElementCount > 50) return;

    // Floating "+N" number drifting up
    const num = document.createElement('div');
    num.className = 'fx-number' + (comboMult > 1 ? ' fx-number-combo' : '');
    num.textContent = '+' + game.formatNumber(value);
    placeFx(num, x, y);
    const drift = (Math.random() - 0.5) * 70;
    animateFx(num, [
        { transform: 'translate(-50%, -50%) scale(0.6)', opacity: 0 },
        { transform: 'translate(calc(-50% + ' + drift * 0.3 + 'px), -90%) scale(1.2)', opacity: 1, offset: 0.2 },
        { transform: 'translate(calc(-50% + ' + drift + 'px), -' + (110 + Math.random() * 50) + 'px) scale(1)', opacity: 0 }
    ], 900 + Math.random() * 200);

    // Sparkle particles
    if (!reduceMotion && !auto) {
        burst(x, y, 5 + Math.min(game.combo, 20) / 4, ['✨', '⭐', '💡'], 70);
    }
}

function placeFx(el, x, y) {
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    fxLayer.appendChild(el);
}

function animateFx(el, keyframes, duration, easing = 'cubic-bezier(0.2, 0.7, 0.3, 1)') {
    const anim = el.animate(keyframes, { duration, easing, fill: 'forwards' });
    anim.onfinish = () => el.remove();
}

/** Radial burst of emoji particles (clicks, golden badge, graduation) */
function burst(x, y, count, emojis, distance, gravity = 30) {
    if (reduceMotion) return;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('div');
        p.className = 'fx-particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        placeFx(p, x, y);
        const angle = Math.random() * Math.PI * 2;
        const dist = distance * (0.4 + Math.random() * 0.8);
        const dx = Math.cos(angle) * dist;
        const dy = Math.sin(angle) * dist - 20;
        animateFx(p, [
            { transform: 'translate(-50%, -50%) scale(0.3)', opacity: 1 },
            { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy + gravity}px)) scale(1) rotate(${Math.random() * 180 - 90}deg)`, opacity: 0 }
        ], 600 + Math.random() * 400, 'cubic-bezier(0.1, 0.8, 0.3, 1)');
    }
}

// ===== Tabs and the mobile bottom sheet =====
function handleTabClick(tabName) {
    soundManager.playTab();
    if (sheetQuery.matches) {
        // Tapping the active tab again collapses the sheet
        if (shop.classList.contains('open') && tabName === currentTab) {
            setSheetOpen(false);
            return;
        }
        setSheetOpen(true);
    }
    switchTab(tabName);
}

function setSheetOpen(open) {
    shop.classList.toggle('open', open);
    sheetScrim.classList.toggle('visible', open);
    document.body.classList.toggle('sheet-open', open);
}

// Swipe-to-dismiss for the bottom sheet. Drag starts from the grab handle, tabs,
// scrim, or the content panel when it is scrolled to the top and pulled down.
function setupSheetSwipe() {
    const SLOP = 8;             // px before a gesture is classified
    const DISMISS_DIST = 80;    // px drag that closes the sheet
    const FLICK_SPEED = 0.5;    // px/ms downward velocity that closes the sheet
    let startX = 0, startY = 0, lastY = 0, lastT = 0, velocity = 0;
    let mode = 'idle';          // idle | pending | drag | ignore
    let fromContent = false;
    let suppressClickUntil = 0;

    const reset = () => {
        shop.style.transition = '';
        shop.style.transform = '';
        shop.classList.remove('sheet-dragging', 'sheet-snap');
        sheetScrim.style.opacity = '';
    };

    const onStart = (e) => {
        if (!sheetQuery.matches || !shop.classList.contains('open') || e.touches.length !== 1) {
            mode = 'ignore';
            return;
        }
        const t = e.touches[0];
        startX = t.clientX;
        startY = lastY = t.clientY;
        lastT = e.timeStamp;
        velocity = 0;
        fromContent = contentPanel.contains(e.target);
        mode = 'pending';
    };

    const onMove = (e) => {
        if (mode === 'idle' || mode === 'ignore') return;
        const t = e.touches[0];
        const dy = t.clientY - startY;
        const dx = t.clientX - startX;

        if (mode === 'pending') {
            if (Math.abs(dy) < SLOP && Math.abs(dx) < SLOP) return;
            // Inside the content only a downward pull from scrollTop 0 counts as dismiss
            const canDrag = Math.abs(dy) > Math.abs(dx) && dy > 0 &&
                (!fromContent || contentPanel.scrollTop <= 0);
            if (!canDrag) { mode = 'ignore'; return; }
            mode = 'drag';
            shop.classList.add('sheet-dragging');
        }

        // Stop native scroll/overscroll while the sheet follows the finger
        if (e.cancelable) e.preventDefault();
        const dt = e.timeStamp - lastT;
        if (dt > 0) velocity = (t.clientY - lastY) / dt;
        lastY = t.clientY;
        lastT = e.timeStamp;

        const offset = Math.max(0, dy - SLOP);
        shop.style.transform = `translateY(${offset}px)`;
        sheetScrim.style.opacity = String(Math.max(0, 1 - offset / 300));
    };

    const onEnd = () => {
        const wasDrag = mode === 'drag';
        mode = 'idle';
        if (!wasDrag) return;
        // A drag must not also trigger a click on a tab or button under the finger
        suppressClickUntil = Date.now() + 350;

        const offset = Math.max(0, lastY - startY - SLOP);
        const dismiss = offset >= DISMISS_DIST || (velocity > FLICK_SPEED && offset > 10);
        shop.classList.add('sheet-snap');
        if (dismiss) {
            // Slide down by the content height: leaves exactly the closed tab bar showing
            const panelH = contentPanel.offsetHeight;
            shop.style.transition = 'transform 0.22s ease-in';
            shop.style.transform = `translateY(${panelH}px)`;
            sheetScrim.style.opacity = '0';
            let done = false;
            const finish = () => {
                if (done) return;
                done = true;
                // Collapse with no transition so the swap from transform to height is seamless
                setSheetOpen(false);
                reset();
                shop.classList.add('sheet-snap');
                requestAnimationFrame(() => requestAnimationFrame(() => shop.classList.remove('sheet-snap')));
            };
            shop.addEventListener('transitionend', finish, { once: true });
            setTimeout(finish, 300);
        } else {
            // Springy return to the open position
            shop.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            shop.style.transform = 'translateY(0)';
            sheetScrim.style.opacity = '';
            setTimeout(reset, 320);
        }
    };

    // Non-passive so preventDefault works; the global zoom guard only cancels pinch (scale != 1)
    for (const el of [shop, sheetScrim]) {
        el.addEventListener('touchstart', onStart, { passive: true });
        el.addEventListener('touchmove', onMove, { passive: false });
        el.addEventListener('touchend', onEnd);
        el.addEventListener('touchcancel', onEnd);
    }
    document.addEventListener('click', (e) => {
        if (Date.now() < suppressClickUntil) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);
}

function switchTab(tabName) {
    // Slide direction follows the tab order
    const dir = TAB_ORDER.indexOf(tabName) >= TAB_ORDER.indexOf(currentTab) ? 1 : -1;
    contentPanel.style.setProperty('--slide-from', (dir * 28) + 'px');
    currentTab = tabName;

    tabs.forEach(tab => {
        const active = tab.dataset.tab === tabName;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active);
    });
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-content`);
    });

    contentPanel.scrollTop = 0;
    renderCurrentTab();
}

// ===== Rendering =====
function renderAll() {
    updateStats();
    renderCurrentTab();
    checkGraduateButton();
}

let lastIqText = '';
let lastPerSecText = '';
let lastClickText = '';
let glowTimer = 0;

/** Soft glow on the HUD IQ number while it is growing */
function glowIq() {
    iqDisplay.classList.add('glow');
    clearTimeout(glowTimer);
    glowTimer = setTimeout(() => iqDisplay.classList.remove('glow'), 450);
}

/** Short pop when a stat value changes (skipped for reduced motion) */
function popElement(el) {
    if (reduceMotion) return;
    el.animate(
        [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }],
        { duration: 260, easing: 'cubic-bezier(.2,1.4,.4,1)' }
    );
}

// Exact IQ (e.g. "1 234 567") while it fits the HUD, compact (K/M/B) once it would overflow
const hudEl = $('hud');
const logoEl = $('logo');
function formatIqForHud(value) {
    const compact = game.formatNumber(value);
    if (value < 1000) return compact;
    const exact = Math.floor(value).toLocaleString('en-US').replace(/,/g, '\u00A0');
    const prev = iqDisplay.textContent;
    iqDisplay.textContent = exact;
    const cs = getComputedStyle(hudEl);
    let avail = hudEl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (logoEl.offsetParent !== null) {
        avail -= 2 * (logoEl.offsetWidth + (parseFloat(cs.columnGap) || 0));
    }
    const fits = iqDisplay.scrollWidth <= avail - 4;
    iqDisplay.textContent = prev;
    return fits ? exact : compact;
}

function updateStats() {
    // Smooth counter: snap for small numbers, ease towards the real value for big ones
    const diff = game.iq - displayedIQ;
    const prevIQ = displayedIQ;
    if (Math.abs(diff) < 1) {
        displayedIQ = game.iq;
    } else {
        displayedIQ += diff * 0.25;
    }

    // Only touch the DOM when the text really changed
    const iqText = formatIqForHud(displayedIQ);
    if (iqText !== lastIqText) {
        iqDisplay.textContent = lastIqText = iqText;
        if (displayedIQ > prevIQ) glowIq();
    }
    const perSecText = game.formatNumber(game.iq_per_second + game.getAutoclickIPS());
    if (perSecText !== lastPerSecText) {
        iqPerSecDisplay.textContent = lastPerSecText = perSecText;
        popElement(iqPerSecDisplay);
    }
    // While a streak is active the button shows what a click is worth right now (streak multiplier applied)
    const streakMult = game.combo >= 2 ? game.getComboMultiplier() : 1;
    const clickText = '+' + game.formatNumber(game.calculateClickPower() * streakMult);
    if (clickText !== lastClickText) {
        clickPowerDisplay.textContent = lastClickText = clickText;
        // Long strings (e.g. "+1234.5T") get a smaller font so the button never overflows
        clickPowerDisplay.dataset.len = clickText.length >= 8 ? 'xl' : clickText.length >= 6 ? 'l' : '';
        popElement(clickPowerDisplay);
    }
    graduationsDisplay.textContent = game.graduations;
}

function renderCurrentTab() {
    // Rebuilding the list collapses it briefly, so remember and restore the scroll position
    const scroll = contentPanel.scrollTop;

    if (currentTab === 'students') renderStudents();
    else if (currentTab === 'teachers') renderTeachers();
    else if (currentTab === 'facilities') renderFacilities();
    else if (currentTab === 'upgrades') renderUpgrades();

    contentPanel.scrollTop = scroll;
    playBoughtAnimation();
}

/** Toggle the "affordable" glow without rebuilding the DOM (runs every frame) */
function updateAffordability() {
    const panel = document.querySelector('.tab-content.active');
    panel.querySelectorAll('[data-cost]').forEach(item => {
        const affordable = game.canAfford(Number(item.dataset.cost));
        item.classList.toggle('affordable', affordable);
        const button = item.querySelector('button');
        if (button) button.classList.toggle('affordable', affordable);
    });
}

/**
 * Try to buy something; plays sounds, animation and a toast.
 * @param {string} key - unique card key, used for the purchase animation
 * @param {() => boolean} purchase - engine purchase call
 * @param {{toast: string, sound: 'purchase'|'upgrade'}} info
 */
function attemptPurchase(key, purchase, info) {
    if (!purchase()) {
        soundManager.playError();
        const card = document.querySelector(`[data-key="${key}"]`);
        if (card && !reduceMotion) {
            card.animate(
                [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
                { duration: 220 }
            );
        }
        return;
    }
    if (info.sound === 'upgrade') soundManager.playUpgrade();
    else soundManager.playPurchase();

    justBought = key;
    showToast({ key, icon: '✓', title: info.toast, kind: 'buy' });
    renderAll();
}

/** Flash the card that was just bought and show a check mark on it */
function playBoughtAnimation() {
    if (!justBought) return;
    const card = document.querySelector(`[data-key="${justBought}"]`);
    justBought = null;
    if (!card) return;

    card.classList.add('bought');
    const check = document.createElement('span');
    check.className = 'bought-check';
    check.textContent = '✓';
    card.appendChild(check);
    setTimeout(() => {
        card.classList.remove('bought');
        check.remove();
    }, 900);
}

// Latest purchase callback per card key (refreshed on every render)
const purchaseHandlers = new Map();

/**
 * Buy buttons are handled on pointerup via delegation, keyed by data-key. A per-button
 * click listener loses rapid taps: renderAll() rebuilds the cards after each purchase, so
 * the next tap's pointerdown/pointerup land on different nodes and no click is fired.
 */
function setupPurchaseTaps() {
    let down = null;
    const keyOf = (e) => {
        const btn = e.target.closest('.building-button, .list-item-button');
        return btn ? btn.closest('[data-key]')?.dataset.key : null;
    };
    contentPanel.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        const key = keyOf(e);
        down = key ? { id: e.pointerId, key, x: e.clientX, y: e.clientY } : null;
    });
    contentPanel.addEventListener('pointerup', (e) => {
        const d = down;
        down = null;
        if (!d || d.id !== e.pointerId) return;
        if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 12) return;  // scroll/drag, not a tap
        if (keyOf(e) !== d.key && !document.querySelector(`[data-key="${d.key}"]`)) return;
        purchaseHandlers.get(d.key)?.();
    });
    contentPanel.addEventListener('pointercancel', () => { down = null; });
    // Keyboard activation only (real pointer clicks were handled on pointerup)
    contentPanel.addEventListener('click', (e) => {
        if (e.detail !== 0) return;
        const key = keyOf(e);
        if (key) purchaseHandlers.get(key)?.();
    });
}

function createBuildingCard({ key, data, count, cost, label, buy, toast, sound = 'purchase' }) {
    const canAfford = game.canAfford(cost);
    const card = document.createElement('div');
    card.className = `building-card ${canAfford ? 'affordable' : ''}`;
    card.dataset.key = key;
    card.dataset.cost = cost;
    card.innerHTML = `
        <div class="building-header">
            <div class="building-name">${data.name}</div>
            <div class="building-count">${count}</div>
        </div>
        <div class="building-desc">${data.description}</div>
        <button class="building-button ${canAfford ? 'affordable' : ''}">${label}</button>
    `;
    purchaseHandlers.set(key, () => attemptPurchase(key, buy, { toast, sound }));
    return card;
}

function createListItem({ key, data, owned, cost, label, ownedLabel, buy, toast, locked = false }) {
    const canAfford = !owned && !locked && game.canAfford(cost);
    const item = document.createElement('div');
    item.className = `list-item ${owned ? 'owned' : (canAfford ? 'affordable' : '')}`;
    item.dataset.key = key;
    if (!owned) item.dataset.cost = cost;
    item.innerHTML = `
        <div class="list-item-info">
            <div class="list-item-name">${data.name}${owned ? ' ✓' : ''}</div>
            <div class="list-item-desc">${data.description}</div>
        </div>
        ${owned
            ? `<div class="list-item-status">${ownedLabel}</div>`
            : `<button class="list-item-button ${canAfford ? 'affordable' : ''}" ${locked ? 'disabled' : ''}>${locked ? '🔒 Locked' : label}</button>`}
    `;
    if (!owned && !locked) {
        purchaseHandlers.set(key, () => attemptPurchase(key, buy, { toast, sound: 'upgrade' }));
    }
    return item;
}

function renderStudents() {
    studentsGrid.replaceChildren(...STUDENTS.map(student => {
        const cost = game.calculateBuildingCost('student', student.id);
        const production = game.calculateStudentProduction(student.id);
        return createBuildingCard({
            key: `student:${student.id}`,
            data: student,
            count: game.students[student.id] || 0,
            cost,
            label: `Buy: ${game.formatNumberShort(cost)} (+${game.formatNumberShort(production)}/s)`,
            buy: () => game.purchaseStudent(student.id),
            toast: `${student.name} joined!`
        });
    }));
}

function renderTeachers() {
    teachersGrid.replaceChildren(...TEACHERS.map(teacher => {
        const cost = game.calculateBuildingCost('teacher', teacher.id);
        return createBuildingCard({
            key: `teacher:${teacher.id}`,
            data: teacher,
            count: game.teachers[teacher.id] || 0,
            cost,
            label: `Hire: ${game.formatNumberShort(cost)}`,
            buy: () => game.purchaseTeacher(teacher.id),
            toast: `${teacher.name} hired!`
        });
    }));
}

function renderFacilities() {
    facilitiesList.replaceChildren(...FACILITIES.map(facility => createListItem({
        key: `facility:${facility.id}`,
        data: facility,
        owned: game.facilities[facility.id],
        cost: facility.cost,
        label: `Build: ${game.formatNumberShort(facility.cost)} IQ`,
        ownedLabel: 'BUILT',
        buy: () => game.purchaseFacility(facility.id),
        toast: `${facility.name} built!`
    })));
}

function isUpgradeAvailable(upgrade) {
    if (!upgrade.requires) return true;
    const req = upgrade.requires;
    if (req in game.facilities) return game.facilities[req];
    if (req in game.upgrades) return game.upgrades[req];
    return true;
}

function renderAutoclicker() {
    const cost = game.getAutoclickerCost();
    const step = game.getAutoclickerStep(game.autoclickers);  // the finger after this one costs that much more
    const level = AUTOCLICKER_CONFIG.levels[game.finger_level];
    const bonus = level.mult > 1 ? ` ${level.icon} Yours are ${level.name}: ×${level.mult} IQ per tap.` : '';
    return createBuildingCard({
        key: 'autoclicker',
        data: {
            name: '👆 Auto-Clicker',
            description: `A finger that taps Study once a second (a real click). It pushes your combo while YOU tap too.${bonus} Price grows fast: the one after this costs ×${step.toFixed(2).replace(/\.?0+$/, '')}.`
        },
        count: game.autoclickers,
        cost,
        label: `Buy: ${game.formatNumberShort(cost)} IQ (+${AUTOCLICKER_CONFIG.clicks_per_second} click/s)`,
        buy: () => game.purchaseAutoclicker(),
        toast: 'Auto-Clicker hired! 👆'
    });
}

/** Finger training: one card that always offers the next level (kept on graduation) */
function renderFingerTraining() {
    const next = game.getNextFingerLevel();
    const current = AUTOCLICKER_CONFIG.levels[game.finger_level];
    if (!next) {
        return createListItem({
            key: 'finger-level',
            data: { name: `${current.icon} ${current.name}`, description: `Every finger tap gives ×${current.mult} IQ. Kept forever, even after graduation.` },
            owned: true,
            ownedLabel: 'MAX'
        });
    }
    const missing = Math.max(0, next.requires - game.autoclickers);
    return createListItem({
        key: 'finger-level',
        data: {
            name: `${next.icon} ${next.name}`,
            description: `Every finger tap gives ×${next.mult} IQ (now ×${current.mult}). Training is kept after graduation! `
                + (missing > 0 ? `Needs ${next.requires} fingers (${missing} more).` : `Needs ${next.requires} fingers ✓`)
        },
        owned: false,
        cost: next.cost,
        locked: missing > 0,
        label: `Train: ${game.formatNumberShort(next.cost)} IQ`,
        buy: () => game.purchaseFingerLevel(),
        toast: `${next.name}! ${next.icon}`
    });
}

function renderUpgrades() {
    // Cheapest first, show ALL upgrades; locked ones (unmet prerequisite) render disabled
    const available = [...UPGRADES].sort((a, b) => a.cost - b.cost);
    upgradesList.replaceChildren(renderAutoclicker(), renderFingerTraining(), ...available.map(upgrade => createListItem({
        key: `upgrade:${upgrade.id}`,
        data: upgrade,
        owned: game.upgrades[upgrade.id],
        cost: upgrade.cost,
        locked: !isUpgradeAvailable(upgrade),
        label: `Buy: ${game.formatNumberShort(upgrade.cost)} IQ`,
        ownedLabel: 'PURCHASED',
        buy: () => game.purchaseUpgrade(upgrade.id),
        toast: `${upgrade.name} unlocked!`
    })));
}

// ===== Combo meter =====
const comboMultEl = $('combo-mult');
const comboNextFill = $('combo-next-fill');
const comboNextLabel = $('combo-next-label');

function setText(el, text) {
    if (el.textContent !== text) el.textContent = text;
}

function updateCombo() {
    const combo = $('combo');
    if (!comboFx) comboFx = new ComboFx({ combo, button: studyButton, sound: soundManager, reduceMotion });
    if (game.combo < 2) {
        combo.classList.add('hidden');
        lastComboTier = 0;
        comboFx.setTier(0);
        comboFx.update(performance.now());
        return;
    }
    combo.classList.remove('hidden');
    $('combo-count').textContent = 'x' + game.combo;
    $('combo-meter-fill').style.width = (game.getComboTimeLeft() * 100) + '%';

    const mult = game.getComboMultiplier();
    const tier = game.getComboTier();
    const tierName = tier > 0 ? COMBO_CONFIG.tiers[tier - 1].name : '';
    setText(comboMultEl, mult > 1 ? `🔥 ×${mult} · ${tierName}` : 'keep tapping!');

    // Progress to the next tier: bar + "next name ×mult at N"
    const { next, progress } = game.getComboProgress();
    comboNextFill.style.transform = `scaleX(${progress.toFixed(3)})`;
    setText(comboNextLabel, next ? `${next.name} ×${next.mult} at ${next.min}` : '🏆 TOP TIER!');

    // Colour tier and a pop when a new tier is reached
    combo.dataset.tier = tier;
    // CSS: "1" = hand-made tiers 5-10, "2" = school tiers 11+ (generic palette-driven layers)
    if (tier >= 5) combo.dataset.epic = tier >= 11 ? '2' : '1';
    else delete combo.dataset.epic;
    if (tier > lastComboTier && !reduceMotion) {
        // The docked full-width panel on phones stays put; its count pops instead
        (sheetQuery.matches ? $('combo-count') : combo).animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
            { duration: 300, easing: 'ease-out' }
        );
    }
    // Tiers 5+ get their own fanfare from the effects module
    if (tier > lastComboTier && tier < 5) soundManager.playMilestone();
    lastComboTier = tier;
    comboFx.setTier(tier);
    comboFx.update(performance.now());
}

// ===== Golden School Badge =====
function scheduleGolden(first = false) {
    const range = game.getGoldenDelayRange();
    const lo = first ? GOLDEN_CONFIG.first_min_delay : range.min;
    const hi = first ? GOLDEN_CONFIG.first_max_delay : range.max;
    const delay = lo + Math.random() * (hi - lo);
    nextGoldenAt = performance.now() + delay * 1000;
}

function updateGolden(now) {
    const visible = !goldenBadge.classList.contains('hidden');
    if (visible) {
        if (now >= goldenExpiresAt) hideGolden();
    } else if (now >= nextGoldenAt && !document.body.classList.contains('modal-open')) {
        spawnGolden(now);
    }

    // Bonus countdown in the HUD
    const buff = game.active_events.find(e => e.id === 'golden');
    const buffBar = $('buff-bar');
    buffBar.classList.toggle('hidden', !buff);
    if (buff) {
        $('buff-time').textContent = Math.ceil(buff.time_remaining) + 's';
        $('buff-progress-fill').style.width = (buff.time_remaining / buff.duration * 100) + '%';
    }
}

function spawnGolden(now) {
    // Random spot in the middle band of the screen, away from the HUD and the shop bar
    const margin = 56;
    const x = margin + Math.random() * (window.innerWidth - margin * 2);
    const y = window.innerHeight * (0.22 + Math.random() * 0.33);
    goldenBadge.style.left = x + 'px';
    goldenBadge.style.top = y + 'px';
    goldenBadge.classList.remove('hidden');
    goldenExpiresAt = now + GOLDEN_CONFIG.lifetime * 1000;
    soundManager.playGoldenSpawn();
}

function hideGolden() {
    goldenBadge.classList.add('hidden');
    scheduleGolden();
}

function handleGoldenCatch(e) {
    e.preventDefault();
    const rect = goldenBadge.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    game.catchGoldenBadge();
    hideGolden();
    soundManager.playGoldenCatch();
    burst(x, y, 18, ['🌟', '✨', '⭐', '🏅'], 140);
    showToast({
        key: 'golden', icon: '🌟', kind: 'gold',
        title: `Golden Badge! x${GOLDEN_CONFIG.multiplier} IQ/s for ${Math.round(game.getGoldenDuration())}s`
    });
}

// ===== Campus evolution =====
function updateCampus(initial = false) {
    const stage = game.getCampusStage();
    const current = CAMPUS_STAGES[stage];
    const next = CAMPUS_STAGES[stage + 1];

    if (stage !== campusStage) {
        const campus = $('campus');
        campus.className = `campus stage-${stage}`;
        $('campus-name').textContent = current.name;
        $('campus-level').textContent = `${stage + 1}/${CAMPUS_STAGES.length}`;
        $('campus-icon').innerHTML = campusIcon(stage);
        renderScene(current.scene);
        if (!initial) {
            soundManager.playMilestone();
            showToast({ key: 'stage', icon: '🏫', kind: 'gold', title: `Your school grew into: ${current.name}!` });
            if (!reduceMotion) {
                // The edge-to-edge band on phones stays put; its icon tile pops instead
                const phone = sheetQuery.matches;
                (phone ? $('campus-icon') : campus).animate(
                    [{ transform: 'scale(1)' }, { transform: `scale(${phone ? 1.2 : 1.04})` }, { transform: 'scale(1)' }],
                    { duration: 500, easing: 'ease-out' }
                );
                const bar = campus.querySelector('.campus-progress');
                bar.classList.remove('stage-up');
                void bar.offsetWidth; // restart the animation
                bar.classList.add('stage-up');
            }
        }
        campusStage = stage;
    }

    // Progress to the next stage is on a log scale because thresholds grow x100
    const fill = $('campus-progress-fill');
    if (!next) {
        fill.style.width = '100%';
        const nextEl = $('campus-next');
        delete nextEl.dataset.goal;
        nextEl.textContent = 'Maximum level reached!';
        return;
    }
    const from = Math.log10(Math.max(current.threshold, 1));
    const to = Math.log10(next.threshold);
    const progress = Math.min(1, Math.max(0, (Math.log10(Math.max(game.lifetime_iq, 1)) - from) / (to - from)));
    fill.style.width = (progress * 100) + '%';
    // Reads "Next: Classroom at 1K IQ" on desktop; phones split it into label | goal
    const nextEl = $('campus-next');
    const goal = `${game.formatNumberShort(next.threshold)} IQ`;
    if (nextEl.dataset.goal !== goal) {
        nextEl.dataset.goal = goal;
        nextEl.innerHTML = '<span class="campus-next-label">Next: <b></b></span> <span class="campus-next-at">at</span> <span class="campus-next-goal"></span>';
        nextEl.querySelector('b').textContent = next.name;
        nextEl.querySelector('.campus-next-goal').textContent = goal;
    }
}

// Thin line icons for the phone campus card (24x24, stroke = currentColor), one per stage
const CAMPUS_ICONS = [
    // Study Corner: open book
    '<path d="M12 6.5C10.4 5.3 8.1 4.8 4 5v13c4.1-.2 6.4.3 8 1.5 1.6-1.2 3.9-1.7 8-1.5V5c-4.1-.2-6.4.3-8 1.5z"/><path d="M12 6.5v13"/>',
    // Classroom: chalkboard
    '<rect x="3" y="4" width="18" height="12" rx="1.5"/><path d="M8 20l1.5-4M16 20l-1.5-4M7 8.5h6M7 11.5h4"/>',
    // Primary School: school house
    '<path d="M3 21h18M5 21V10l7-5 7 5v11"/><path d="M10 21v-5h4v5"/><circle cx="12" cy="11" r="1.6"/>',
    // BISP Campus: graduation cap
    '<path d="M2 9.5L12 4.5l10 5-10 5z"/><path d="M6 11.5v4.5c3 2.4 9 2.4 12 0v-4.5M22 9.5v5.5"/>',
    // Grand Academy: columned hall
    '<path d="M3 9.5L12 4l9 5.5zM4 21h16M5 18h14"/><path d="M6.5 11v7M10 11v7M14 11v7M17.5 11v7"/>',
    // Genius City: skyline
    '<path d="M3 21h18M5 21v-9h4M9 21V5h6v16M15 21v-7h4v7"/><path d="M11.5 8.5h1M11.5 11.5h1M11.5 14.5h1"/>'
];

function campusIcon(stage) {
    const paths = CAMPUS_ICONS[Math.min(stage, CAMPUS_ICONS.length - 1)];
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}

function renderScene(scene) {
    const parts = typeof Intl !== 'undefined' && Intl.Segmenter
        ? Array.from(new Intl.Segmenter().segment(scene), s => s.segment)
        : Array.from(scene);
    $('campus-scene').replaceChildren(...parts.map((emoji, i) => {
        const span = document.createElement('span');
        span.textContent = emoji;
        span.style.animationDelay = (i * 0.15) + 's';
        return span;
    }));
}

// ===== Milestones =====
function highestReached(list, value) {
    return list.reduce((best, m) => (value >= m ? m : best), 0);
}

function checkMilestones() {
    const iqMilestone = highestReached(MILESTONES.iq, game.lifetime_iq);
    if (iqMilestone > lastIqMilestone) {
        lastIqMilestone = iqMilestone;
        celebrateMilestone(`${game.formatNumberShort(iqMilestone)} IQ earned!`);
    }
    const clickMilestone = highestReached(MILESTONES.clicks, game.clicks);
    if (clickMilestone > lastClickMilestone) {
        lastClickMilestone = clickMilestone;
        celebrateMilestone(`${game.formatNumberShort(clickMilestone)} clicks!`);
    }
}

function celebrateMilestone(text) {
    soundManager.playMilestone();
    showToast({ key: 'milestone:' + text, icon: '🎉', kind: 'milestone', title: text });
    if (!reduceMotion) {
        const rect = iqDisplay.getBoundingClientRect();
        burst(rect.left + rect.width / 2, rect.bottom, 10, ['🎉', '✨', '🎊'], 90);
        iqDisplay.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }],
            { duration: 500, easing: 'ease-out' }
        );
    }
}

// ===== Toasts =====
const activeToasts = new Map();  // key -> { el, count, timer }
const MAX_TOASTS = 3;

/**
 * Show a short notification. Repeating the same key (e.g. buying many
 * students quickly) updates one toast with a counter instead of stacking.
 */
function showToast({ key, icon, title, text = '', kind = 'buy' }) {
    const existing = activeToasts.get(key);
    if (existing) {
        existing.count++;
        existing.countEl.textContent = 'x' + existing.count;
        existing.countEl.hidden = false;
        clearTimeout(existing.timer);
        existing.timer = setTimeout(() => removeToast(key), 2200);
        existing.el.animate(
            [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }],
            { duration: 160 }
        );
        return;
    }

    // Drop the oldest toast if too many are visible
    if (activeToasts.size >= MAX_TOASTS) {
        removeToast(activeToasts.keys().next().value);
    }

    const el = document.createElement('div');
    el.className = `toast toast-${kind}`;
    el.innerHTML = `
        <span class="toast-icon"></span>
        <span class="toast-body"><span class="toast-title"></span><span class="toast-text"></span></span>
        <span class="toast-count" hidden></span>
    `;
    el.querySelector('.toast-icon').textContent = icon;
    el.querySelector('.toast-title').textContent = title;
    el.querySelector('.toast-text').textContent = text;
    toastsEl.appendChild(el);

    activeToasts.set(key, {
        el,
        count: 1,
        countEl: el.querySelector('.toast-count'),
        timer: setTimeout(() => removeToast(key), kind === 'achievement' ? 3500 : 2200)
    });
}

function removeToast(key) {
    const toast = activeToasts.get(key);
    if (!toast) return;
    activeToasts.delete(key);
    clearTimeout(toast.timer);
    toast.el.classList.add('leaving');
    setTimeout(() => toast.el.remove(), 300);
}

// ===== Achievements =====
function checkAchievements() {
    while (game.achievement_notifications.length > 0) {
        const ach = game.achievement_notifications.shift();
        soundManager.playAchievement();
        showToast({
            key: 'ach:' + ach.id, icon: '🏆', kind: 'achievement',
            title: 'Achievement unlocked: ' + ach.name, text: ach.description
        });
    }
}

// ===== Modals =====
// Modals ship with `hidden` so they stay invisible even if a stale cached stylesheet
// (e.g. v1 CSS, where .modal is always displayed) is paired with the new HTML.
function openModal(modal, focusEl) {
    modal.classList.remove('hidden');
    void modal.offsetWidth;  // Reflow so the fade-in transition still runs
    modal.classList.add('open');
    document.body.classList.add('modal-open');
    if (focusEl) focusEl.focus({ preventScroll: true });
}

function closeModal(modal) {
    modal.classList.remove('open');
    modal.classList.add('hidden');
    if (!document.querySelector('.modal.open')) {
        document.body.classList.remove('modal-open');
    }
}

/**
 * Show the shared confirm dialog.
 * @returns {Promise<boolean>} true when the player confirmed
 */
function confirmDialog({ emoji, title, text, okLabel = 'OK', cancelLabel = 'Cancel', danger = false, lockMs = 0, typeWord = '' }) {
    const modal = $('confirm-modal');
    const okBtn = $('confirm-ok');
    const cancelBtn = $('confirm-cancel');

    $('confirm-emoji').textContent = emoji;
    $('confirm-title').textContent = title;
    $('confirm-text').textContent = text;
    okBtn.textContent = okLabel;
    cancelBtn.textContent = cancelLabel;
    okBtn.classList.toggle('danger', danger);

    // Optional short lock so a double-tap can't skip the final warning
    okBtn.disabled = lockMs > 0;
    const unlockTimer = lockMs > 0 ? setTimeout(() => { okBtn.disabled = false; }, lockMs) : null;

    // Optional typed confirmation: OK stays disabled until the exact word is entered
    const typeWrap = $('confirm-type');
    const typeInput = $('confirm-type-input');
    typeWrap.classList.toggle('hidden', !typeWord);
    typeInput.value = '';
    if (typeWord) {
        okBtn.disabled = true;
        typeInput.placeholder = `Type ${typeWord}`;
    }
    const onType = () => { okBtn.disabled = typeInput.value !== typeWord; };
    if (typeWord) typeInput.addEventListener('input', onType);

    return new Promise(resolve => {
        const finish = (result) => {
            clearTimeout(unlockTimer);
            typeInput.removeEventListener('input', onType);
            okBtn.removeEventListener('click', onOk);
            cancelBtn.removeEventListener('click', onCancel);
            closeModal(modal);
            resolve(result);
        };
        const onOk = () => { if (!okBtn.disabled) finish(true); };
        const onCancel = () => finish(false);
        okBtn.addEventListener('click', onOk);
        cancelBtn.addEventListener('click', onCancel);
        openModal(modal, typeWord ? typeInput : cancelBtn);  // Focus the safe option by default
    });
}

// ===== Settings and reset =====
function openSettings() {
    const bestTier = game.getComboTier(game.best_combo);
    $('stat-best-combo').textContent = game.best_combo + (bestTier > 0 ? ' (' + COMBO_CONFIG.tiers[bestTier - 1].name + ')' : '');
    $('stat-golden').textContent = game.golden_clicks;
    $('name-settings-input').value = game.leaderboard_name;
    $('name-settings-error').textContent = '';
    $('settings-modal').querySelector('.modal-content').scrollTop = 0;
    openModal($('settings-modal'));
}

function syncSoundUI() {
    const on = soundManager.enabled;
    $('sound-switch').checked = on;
}

/** Full progress reset with a confirmation plus a typed RESET */
let resetting = false;

async function handleReset() {
    const first = await confirmDialog({
        emoji: '⚠️',
        title: 'Reset progress',
        text: 'This will erase EVERYTHING, including prestige. Are you sure?',
        okLabel: 'Yes, erase it',
        cancelLabel: 'Cancel',
        danger: true
    });
    if (!first) return;

    const second = await confirmDialog({
        emoji: '🛑',
        title: 'Final warning',
        text: 'This cannot be undone. Type RESET below to confirm.',
        okLabel: 'Erase forever',
        cancelLabel: 'Cancel',
        danger: true,
        typeWord: 'RESET'
    });
    if (!second) return;

    // Zero out the player's leaderboard entry BEFORE wiping the save,
    // so the old record does not linger on the server after the reset.
    // resetting stops pagehide/interval submits from re-posting the old score during reload.
    resetting = true;
    if (game.leaderboard_name) {
        try { await postScore(game.leaderboard_name, 0, 0); } catch { /* best effort */ }
    }

    // deleteSave() also blocks autosave/pagehide saves so nothing rewrites the old state
    saveManager.deleteSave();
    location.reload();
}

// ===== Graduate =====
function checkGraduateButton() {
    graduateButton.classList.toggle('hidden', !game.canGraduate());
}

async function handleGraduate() {
    const ok = await confirmDialog({
        emoji: '🎓',
        title: 'Graduate?',
        text: 'This resets your students, teachers, buildings and upgrades, but you earn certificates for permanent bonuses!',
        okLabel: 'Graduate!',
        cancelLabel: 'Not yet'
    });
    if (!ok) return;

    game.graduate();
    soundManager.playGraduate();
    showToast({ key: 'graduate', icon: '🎓', kind: 'gold', title: 'Congratulations, graduate!' });
    burst(window.innerWidth / 2, window.innerHeight * 0.3, 40, ['🎓', '🎉', '🎊', '⭐', '✨'], Math.min(window.innerWidth / 2, 260), 120);
    renderAll();
    submitScore();
}

// ===== Leaderboard =====
let lastSubmittedIq = -1;   // Last IQ the server accepted
let submitting = false;
let lbEntries = [];
let lbSortBy = 'iq';

/** Lifetime IQ is the ranking value: it never drops when the player graduates */
function scoreIq() {
    return Math.floor(game.lifetime_iq);
}

/** Send the score; unchanged IQ and a missing name are skipped unless forced */
async function submitScore(force = false) {
    const name = game.leaderboard_name;
    const iq = scoreIq();
    if (!name || submitting || resetting || (!force && iq === lastSubmittedIq)) return;
    submitting = true;
    const ok = await postScore(name, iq, game.graduations, Math.floor(game.getTotalIQPerSecond(false)));
    submitting = false;
    if (ok) lastSubmittedIq = iq;
}

function setupLeaderboard() {
    setInterval(() => { if (!document.hidden) submitScore(); }, SUBMIT_INTERVAL_MS);

    // First-run name prompt
    $('name-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const error = validateName($('name-input').value);
        $('name-error').textContent = error || '';
        if (error) return;
        setPlayerName($('name-input').value);
        closeModal($('name-modal'));
    });

    // Rename from settings
    $('name-save').addEventListener('click', () => {
        const input = $('name-settings-input');
        const error = validateName(input.value);
        $('name-settings-error').textContent = error || '';
        if (error) return;
        setPlayerName(input.value);
        input.value = game.leaderboard_name;
        showToast({ key: 'name', icon: '✓', title: 'Name saved' });
    });

    // Leaderboard screen
    $('leaderboard-button').addEventListener('click', openLeaderboard);
    $('settings-leaderboard-button').addEventListener('click', openLeaderboard);
    $('close-leaderboard').addEventListener('click', () => closeModal($('leaderboard-modal')));
    $('lb-retry').addEventListener('click', () => loadLeaderboard());
    $('lb-sort-iq').addEventListener('click', () => setLbSort('iq'));
    $('lb-sort-prestige').addEventListener('click', () => setLbSort('prestige'));
}

function setPlayerName(raw) {
    game.leaderboard_name = cleanName(raw);
    saveManager.saveGame(game);
    lastSubmittedIq = -1;  // A new name needs a fresh record
    submitScore(true);
}

function openNameModal() {
    $('name-error').textContent = '';
    openModal($('name-modal'), $('name-input'));
}

function openLeaderboard() {
    openModal($('leaderboard-modal'));
    $('leaderboard-modal').querySelector('.modal-content').scrollTop = 0;
    loadLeaderboard();
}

const LB_RETRY_DELAY_MS = 2500;
let lbRetryTimer = null;

async function loadLeaderboard(autoRetry = true) {
    clearTimeout(lbRetryTimer);
    const list = $('lb-list');
    $('lb-error').classList.add('hidden');
    list.classList.remove('hidden');
    list.setAttribute('aria-busy', 'true');
    list.innerHTML = Array.from({ length: 8 }, () => '<li class="lb-row lb-skeleton"><span></span></li>').join('');

    // Make sure the player's own latest score is on the board when it is fetched
    await submitScore();
    try {
        lbEntries = await fetchLeaderboard();
        renderLeaderboard();
    } catch (e) {
        console.error('Leaderboard failed:', e);
        if (autoRetry) {
            // One quiet retry while the skeleton stays on screen
            lbRetryTimer = setTimeout(() => {
                if ($('leaderboard-modal').classList.contains('open')) loadLeaderboard(false);
            }, LB_RETRY_DELAY_MS);
            return;
        }
        list.classList.add('hidden');
        $('lb-error').classList.remove('hidden');
    } finally {
        list.removeAttribute('aria-busy');
    }
}

function setLbSort(by) {
    lbSortBy = by;
    $('lb-sort-iq').classList.toggle('active', by === 'iq');
    $('lb-sort-prestige').classList.toggle('active', by === 'prestige');
    $('lb-sort-iq').setAttribute('aria-pressed', String(by === 'iq'));
    $('lb-sort-prestige').setAttribute('aria-pressed', String(by === 'prestige'));
    renderLeaderboard();
}

function renderLeaderboard() {
    const list = $('lb-list');
    list.textContent = '';
    if (lbEntries.length === 0) {
        const li = document.createElement('li');
        li.className = 'lb-empty';
        li.textContent = 'No scores yet. Be the first!';
        list.appendChild(li);
        return;
    }

    const me = game.leaderboard_name.toLowerCase();
    const primary = lbSortBy === 'iq' ? 'iq' : 'prestige';
    const secondary = primary === 'iq' ? 'prestige' : 'iq';
    const sorted = [...lbEntries].sort((a, b) => (b[primary] - a[primary]) || (b[secondary] - a[secondary]));

    sorted.forEach((entry, i) => {
        const li = document.createElement('li');
        li.className = 'lb-row' + (entry.name.toLowerCase() === me ? ' me' : '');

        const rank = document.createElement('span');
        rank.className = 'lb-rank';
        rank.textContent = ['🥇', '🥈', '🥉'][i] || String(i + 1);

        const who = document.createElement('span');
        who.className = 'lb-who';
        const nameEl = document.createElement('b');
        nameEl.textContent = entry.name;  // textContent: names are user input
        const seen = document.createElement('small');
        seen.textContent = 'last seen ' + timeAgo(entry.lastSeen);
        who.append(nameEl, seen);

        const stats = document.createElement('span');
        stats.className = 'lb-stats';
        const iq = document.createElement('b');
        iq.textContent = game.formatNumber(entry.iq) + ' IQ';
        const grad = document.createElement('small');
        grad.textContent = '🎓 ' + entry.prestige;
        const ips = document.createElement('small');
        ips.className = 'lb-ips';
        // Older records have no iqPerSec: show a dash
        ips.textContent = Number.isFinite(entry.iqPerSec) ? game.formatNumberShort(entry.iqPerSec) + '/s' : '—/s';
        stats.append(iq, ips, grad);

        li.append(rank, who, stats);
        list.appendChild(li);
    });
}

// ===== Daily bonus =====
function maybeShowDailyBonus() {
    if (!game.canClaimDailyBonus()) return;
    // Wait while another modal (welcome back, name) is open; the claim itself starts the cooldown
    if (document.querySelector('.modal.open')) {
        setTimeout(maybeShowDailyBonus, 800);
        return;
    }
    const reward = game.getDailyBonus();
    $('daily-iq').textContent = '+' + game.formatNumber(reward.iq) + ' IQ';
    $('daily-click').textContent = `🖱️ Click power x${reward.click_multiplier} for ${Math.round(reward.click_duration / 60)} minutes`;
    openModal($('daily-modal'), $('daily-claim'));
    soundManager.playMilestone();
}

function claimDaily() {
    const reward = game.claimDailyBonus();
    closeModal($('daily-modal'));
    if (!reward) return;
    saveManager.saveGame(game);
    showToast({ key: 'daily', icon: '🎁', kind: 'gold', title: 'Daily bonus claimed', text: '+' + game.formatNumber(reward.iq) + ' IQ' });
    renderAll();
}

// ===== Offline Progress =====
function showOfflineProgress(offlineIQ, seconds) {
    $('offline-iq').textContent = game.formatNumber(offlineIQ) + ' IQ';
    $('offline-time').textContent = formatDuration(seconds);
    openModal($('offline-modal'), $('close-offline-modal'));
    soundManager.playMilestone();
    renderAll();
}

function formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}min`;
    if (m > 0) return `${m} min`;
    return `${Math.floor(seconds)} sec`;
}

// ===== Game Loop =====
function syncAutoclickers(now) {
    autoClickers.setCount(game.autoclickers);
    autoClickers.setLevel(game.finger_level);
    autoClickers.update(now);
    const text = game.autoclickers > 0 ? `${AUTOCLICKER_CONFIG.levels[game.finger_level].icon} ×${game.autoclickers}` : '';
    if (fingerCount.textContent !== text) {
        fingerCount.textContent = text;
        fingerCount.classList.toggle('hidden', !text);
    }
}

function gameLoop(now) {
    // Clamp so a throttled/background frame never causes a huge jump
    // (time spent away is rewarded separately as offline progress)
    const deltaTime = Math.min((now - lastFrameTime) / 1000, 1);
    lastFrameTime = now;

    game.update(deltaTime);
    syncAutoclickers(now);

    updateStats();
    updateAffordability();  // Only toggles CSS classes, doesn't recreate the DOM
    updateCombo();
    updateGolden(now);
    updateCampus();
    checkMilestones();
    checkGraduateButton();
    checkAchievements();

    requestAnimationFrame(gameLoop);
}

// ===== Start the game =====
init();

// Make game accessible in console for debugging
window.game = game;

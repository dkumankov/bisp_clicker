import { LEADERBOARD_API } from './data.js?v=0cf4557e';

export const NAME_MAX = 24;
export const SUBMIT_INTERVAL_MS = 31000;  // Worker allows 1 write per IP per 30 s
const MAX_IQ = 1e15;                      // Must match the worker's ceiling
const NAME_RE = /^[\p{L}\p{N} ]+$/u;      // Letters, digits, spaces: no emoji

/** Collapse whitespace and trim */
export function cleanName(raw) {
    return String(raw).trim().replace(/\s+/g, ' ');
}

/** @returns {string|null} an error message, or null when the name is valid */
export function validateName(raw) {
    const name = cleanName(raw);
    if (name.length < 1) return 'Please enter a name';
    if (name.length > NAME_MAX) return `Max ${NAME_MAX} characters`;
    if (!NAME_RE.test(name)) return 'Letters, numbers and spaces only';
    return null;
}

/** @returns {Promise<Array<{name: string, iq: number, iqPerSec?: number, prestige: number, lastSeen: number}>>} iqPerSec is missing on older records */
export async function fetchLeaderboard() {
    const res = await fetch(`${LEADERBOARD_API}/leaderboard`, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error('Bad response');
    return data;
}

/**
 * Post the player's record. keepalive lets the request survive page exit.
 * @returns {Promise<boolean>} true when the server accepted the score
 */
export async function postScore(name, iq, prestige, iqPerSec = 0) {
    try {
        const res = await fetch(`${LEADERBOARD_API}/score`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: cleanName(name),
                iq: Math.floor(Math.min(iq, MAX_IQ)),
                prestige: Math.floor(prestige),
                iqPerSec: Math.max(0, Math.floor(Math.min(iqPerSec, MAX_IQ)) || 0)
            }),
            keepalive: true
        });
        return res.ok;
    } catch {
        return false;  // Offline: the periodic submit will retry
    }
}

/** "just now", "5 min ago", "3 h ago", "2 d ago" */
export function timeAgo(ts) {
    const sec = Math.max(0, (Date.now() - ts) / 1000);
    if (sec < 60) return 'just now';
    if (sec < 3600) return `${Math.floor(sec / 60)} min ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)} h ago`;
    return `${Math.floor(sec / 86400)} d ago`;
}

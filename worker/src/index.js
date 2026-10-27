// BISP Clicker leaderboard — Cloudflare Worker + KV.
//
// KV layout (binding: LEADERBOARD):
//   score:<name lowercase> -> JSON {name, iq, prestige, lastSeen}
//   lb:top                 -> JSON array with the top entries (served by GET /leaderboard)
//   rl:<ip>                -> timestamp (ms) of the last accepted write from that IP
//
// Routes (also reachable under the /api prefix, e.g. game.dimario.pro/api/score):
//   POST /score        {name, iq, prestige}
//   GET  /leaderboard
//   POST /reset        header X-Reset-Token: <RESET_TOKEN secret> — wipe all scores

// ===== Tunables =====
const ALLOWED_ORIGINS = ['https://game.dimario.pro'];
const LOCALHOST_RE = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

const TOP_SIZE = 50;
const NAME_MIN = 1;
const NAME_MAX = 24;
const NAME_RE = /^[\p{L}\p{N} ]+$/u;     // letters, digits and spaces only (no emoji)

const MAX_IQ = 1e15;                     // Absolute ceiling for any submitted IQ (matches leaderboard.js)
const MAX_PRESTIGE = 100000;

// Plausibility limits scale with graduations ("prestige"): the late tiers in data.js
// (professor = 3e9 IQ/s each) really do produce billions per second, so one flat
// ceiling either rejects honest veterans or lets a fresh account post billions.
// Calibrated against a greedy-bot simulation of game-engine.js (a human is slower):
//   prestige   bot IQ/s    ceiling      bot lifetime IQ   ceiling
//        3     4e4         2e5           7e6              6e10
//        6     6e5         8e6           7e7              4e12
//        9     2e7         5e8           3e9              2.6e14
//       12     3.5e9       3e10          2e11             1e15
//       15     2e11        2e12          1e13             1e15
const BASE_IQ_PER_SEC = 200_000;         // Ceiling for early players (prestige <= 3)
const IQ_PER_SEC_BASE_LATE = 2000;       // Late ceiling = 2000 * 4^prestige
const IQ_GROWTH_PER_PRESTIGE = 4;
const BASE_MAX_IQ = 1e9;                 // Absolute IQ ceiling at prestige 0, x4 per prestige
// Flat allowance on top of the per-second ceiling (golden badges, rounding).
const IQ_GAIN_SLACK = 5_000;
// A graduation takes at least a few minutes of play: one allowed per 5 min (+1 spare).
const SECONDS_PER_PRESTIGE = 300;
// The game credits at most 24 h of offline progress, so never allow more.
const MAX_ELAPSED_SECONDS = 86400;

const RATE_LIMIT_MS = 30_000;            // 1 accepted write per IP per 30 s
const RATE_LIMIT_TTL_S = 60;             // KV minimum expirationTtl

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const cors = corsHeaders(origin);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // Browsers always send Origin on cross-origin POSTs; refuse unknown ones.
    if (origin && !cors['Access-Control-Allow-Origin']) {
      return json({ error: 'forbidden origin' }, 403, cors);
    }

    const path = new URL(request.url).pathname.replace(/^\/api(?=\/)/, '').replace(/\/+$/, '');

    try {
      if (path === '/leaderboard' && request.method === 'GET') {
        return await handleLeaderboard(env, cors);
      }
      if (path === '/score' && request.method === 'POST') {
        return await handleScore(request, env, cors);
      }
      if (path === '/reset' && request.method === 'POST') {
        return await handleReset(request, env, cors);
      }
      return json({ error: 'not found' }, 404, cors);
    } catch (err) {
      console.error(err);
      return json({ error: 'internal error' }, 500, cors);
    }
  }
};

// ===== Handlers =====

/** Wipe every score:* key and the cached top list. Guarded by the RESET_TOKEN secret. */
async function handleReset(request, env, cors) {
  const token = request.headers.get('X-Reset-Token');
  if (!env.RESET_TOKEN || token !== env.RESET_TOKEN) {
    return json({ error: 'forbidden' }, 403, cors);
  }
  let deleted = 0;
  let cursor;
  do {
    const page = await env.LEADERBOARD.list({ cursor });
    for (const k of page.keys) {
      if (k.name.startsWith('score:') || k.name === 'lb:top') {
        await env.LEADERBOARD.delete(k.name);
        deleted++;
      }
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);
  return json({ ok: true, deleted }, 200, cors);
}

async function handleLeaderboard(env, cors) {
  const top = (await env.LEADERBOARD.get('lb:top', 'json')) || [];
  return json(top.slice(0, TOP_SIZE), 200, { ...cors, 'Cache-Control': 'public, max-age=15' });
}

async function handleScore(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid json' }, 400, cors);
  }

  const entry = validate(body);
  if (!entry) return json({ error: 'invalid payload' }, 400, cors);

  const absCap = maxIqFor(entry.prestige);
  if (entry.iq > absCap) {
    return json({ error: `IQ too high for ${entry.prestige} graduations (max ${absCap})` }, 422, cors);
  }

  // Rate limit per IP
  const now = Date.now();
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rlKey = 'rl:' + ip;
  const lastWrite = Number(await env.LEADERBOARD.get(rlKey)) || 0;
  if (now - lastWrite < RATE_LIMIT_MS) {
    const retryAfter = Math.ceil((RATE_LIMIT_MS - (now - lastWrite)) / 1000);
    return json({ error: 'rate limited' }, 429, { ...cors, 'Retry-After': String(retryAfter) });
  }

  const key = 'score:' + entry.name.toLowerCase();
  const prev = await env.LEADERBOARD.get(key, 'json');

  if (prev) {
    // Plausibility: the gain must fit in the time since the last accepted write.
    // Elapsed time is measured by the server (lastSeen), so the client cannot lie about it.
    const elapsed = Math.min((now - prev.lastSeen) / 1000, MAX_ELAPSED_SECONDS);
    const maxGain = elapsed * maxIqPerSec(entry.prestige) + IQ_GAIN_SLACK;
    if (entry.iq - prev.iq > maxGain) {
      return json({ error: `IQ gain too fast: +${entry.iq - prev.iq} in ${Math.round(elapsed)}s (max ${Math.floor(maxGain)})` }, 422, cors);
    }
    if (entry.prestige - prev.prestige > Math.floor(elapsed / SECONDS_PER_PRESTIGE) + 1) {
      return json({ error: 'graduations rising too fast' }, 422, cors);
    }
  }

  // Keep the personal best; lower values only refresh lastSeen and prestige.
  const saved = {
    name: entry.name,
    iq: prev ? Math.max(prev.iq, entry.iq) : entry.iq,
    prestige: prev ? Math.max(prev.prestige, entry.prestige) : entry.prestige,
    lastSeen: now
  };

  await env.LEADERBOARD.put(key, JSON.stringify(saved));
  await env.LEADERBOARD.put(rlKey, String(now), { expirationTtl: RATE_LIMIT_TTL_S });
  await updateTop(env, saved);

  return json({ ok: true, iq: saved.iq, prestige: saved.prestige }, 200, cors);
}

// ===== Helpers =====

function maxIqPerSec(prestige) {
  return Math.max(BASE_IQ_PER_SEC, IQ_PER_SEC_BASE_LATE * Math.pow(IQ_GROWTH_PER_PRESTIGE, prestige));
}

function maxIqFor(prestige) {
  return Math.min(MAX_IQ, BASE_MAX_IQ * Math.pow(IQ_GROWTH_PER_PRESTIGE, prestige));
}

/** Return a clean {name, iq, prestige} or null when the payload is not acceptable */
function validate(body) {
  if (!body || typeof body !== 'object') return null;
  const { name, iq, prestige } = body;

  if (typeof name !== 'string') return null;
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (trimmed.length < NAME_MIN || trimmed.length > NAME_MAX || !NAME_RE.test(trimmed)) return null;

  if (!Number.isInteger(iq) || iq < 0 || iq > MAX_IQ) return null;
  if (!Number.isInteger(prestige) || prestige < 0 || prestige > MAX_PRESTIGE) return null;

  return { name: trimmed, iq, prestige };
}

/** Merge one entry into the cached top list (read-modify-write; races only cost a stale row) */
async function updateTop(env, entry) {
  const top = (await env.LEADERBOARD.get('lb:top', 'json')) || [];
  const lowered = entry.name.toLowerCase();
  const next = top.filter(e => e.name.toLowerCase() !== lowered);
  next.push(entry);
  next.sort((a, b) => b.iq - a.iq);
  await env.LEADERBOARD.put('lb:top', JSON.stringify(next.slice(0, TOP_SIZE)));
}

function corsHeaders(origin) {
  const allowed = origin && (ALLOWED_ORIGINS.includes(origin) || LOCALHOST_RE.test(origin));
  const headers = {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
  if (allowed) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

function json(data, status, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  });
}

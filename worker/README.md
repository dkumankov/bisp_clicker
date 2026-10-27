# BISP Clicker leaderboard worker

Cloudflare Worker + KV. Nothing here is deployed automatically.

## API

- `POST /score` with `{name, iq, prestige}` upserts a player's record.
- `GET /leaderboard` returns the top 50 as `[{name, iq, prestige, lastSeen}]`.

Both are served under `https://game.dimario.pro/api/*` (the `/api` prefix is stripped by the worker).

## Anti-cheat (deliberately primitive)

- Name 1-24 chars (letters, digits, spaces); `iq` and `prestige` must be integers in range.
- One accepted write per IP per 30 s (`rl:<ip>` in KV).
- IQ gain since the previous write is capped at `elapsed * MAX_IQ_PER_SEC + IQ_GAIN_SLACK`.
  Elapsed time is measured by the server from the stored `lastSeen`, so a client-supplied
  `elapsedSeconds` is not needed. Tune `MAX_IQ_PER_SEC` at the top of `src/index.js`.
- Only the personal best is kept.
- Not covered: names have no owner (anyone can post under any name, though they can only raise
  a score, never lower it), and a patient cheater can still climb at the ceiling rate.

## Manual deploy steps

1. `cd worker && npm i -g wrangler` (or use `npx wrangler`), then `wrangler login`.
2. `wrangler kv namespace create LEADERBOARD` and copy the printed `id` into `wrangler.toml`.
3. Check the `routes` entry in `wrangler.toml`; `dimario.pro` must be a zone in your Cloudflare account.
4. `wrangler deploy`
5. Test: `curl https://game.dimario.pro/api/leaderboard` should return `[]`.

For local dev: `wrangler dev`, then point `LEADERBOARD_API` in `data.js` at `http://localhost:8787`
(localhost origins are allowed by CORS).

## Notes

- KV free tier allows 1000 writes/day; each accepted score costs 3 writes (score, rate limit, top list).
  Use the Workers Paid plan if the game gets popular.
- KV is eventually consistent (up to ~60 s), so a fresh score may take a moment to show.

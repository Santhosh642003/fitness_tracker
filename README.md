# The Average

A single-user tracker for one specific 15-week fat-loss protocol (Sep 1 – Dec 15, 2026): its macros,
its six-day push/pull/legs program, its $200/month grocery system, and its core rule — **only the
7-day rolling average matters, never a single day's number.**

## Screens

- **Today** — the Average Line (live-smoothing weight indicator), the 6-item daily scorecard, macro
  targets, and today's workout.
- **Tracker** — weight/waist logging, the 7-day average trend, and the plan's own adjustment
  algorithm (hold / watch / adjust) driving a status card.
- **Program** — the six-day PPL×2 program with double-progression set/rep logging and "last time"
  reference numbers.
- **Kitchen** — the meal template, a grocery cart with live Walmart pricing and a manual Weee price
  field, a budget bar against the $200/month ceiling, and the swap list.

## Stack

- Frontend: Vite + React + TypeScript + Tailwind v4 (CSS variable token system in `src/index.css`).
  All data is persisted to `localStorage`; use Settings → Export/Import for backups.
- Backend: a small Express server (`server/`) that holds the SerpApi key server-side and caches
  Walmart prices for 24h in a local JSON file (lowdb). The frontend works fully without it — grocery
  items just show the plan's fallback estimate prices instead of live pricing.

## Running it

```bash
npm install
npm run dev        # frontend only, http://localhost:5173
npm run server      # backend only, http://localhost:8787
npm run dev:all      # both, concurrently
```

### Enabling live Walmart pricing

1. Copy `server/.env.example` to `server/.env` and set `SERPAPI_KEY` (SerpApi's free tier covers
   ~100 searches/month, plenty for a weekly refresh of a 10-item cart).
2. Fill in `walmartProductId` for each item in `server/catalog.js` with the numeric ID from that
   product's Walmart page URL (`walmart.com/ip/<slug>/<ID>`). Until an ID is set, that item serves
   its `fallbackPrice` instead of calling out.
3. Enter a zip code in the app's Settings panel. Prices refresh automatically every 24h, or on demand
   via the "Refresh prices" button on the Kitchen screen.

Weee pricing is manual by design — type the price into the "Weee $" field per item when you check the
app; not worth a paid scraper for 2-3 comparison items.

## Build

```bash
npm run build
npm run lint
```

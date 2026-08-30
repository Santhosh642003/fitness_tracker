import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { CATALOG } from './catalog.js'
import { getDb } from './db.js'
import { lookupWalmartPrice } from './serpapi.js'

const PORT = process.env.PORT ?? 8787
const SERPAPI_KEY = process.env.SERPAPI_KEY
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h — a weekly-refresh cart costs pennies against SerpApi's free tier

const app = express()
app.use(cors())
app.use(express.json())

function isFresh(lastUpdated) {
  if (!lastUpdated) return false
  return Date.now() - new Date(lastUpdated).getTime() < CACHE_TTL_MS
}

/**
 * Resolves the price for one catalog item: fresh cache -> live SerpApi call
 * (only if the item has a walmartProductId and a key is configured) -> stale
 * cache -> the plan's own fallback estimate. Never throws — a single item's
 * lookup failure degrades to the next-best price instead of failing the batch.
 */
async function resolvePrice(item, zip, db, { forceRefresh }) {
  const cached = db.data.prices[item.id]

  if (!forceRefresh && isFresh(cached?.lastUpdated) && cached.zip === zip) {
    return { id: item.id, price: cached.price, lastUpdated: cached.lastUpdated, source: 'cache' }
  }

  if (item.walmartProductId && SERPAPI_KEY && zip) {
    try {
      const price = await lookupWalmartPrice({ productId: item.walmartProductId, zip, apiKey: SERPAPI_KEY })
      const lastUpdated = new Date().toISOString()
      db.data.prices[item.id] = { price, lastUpdated, zip }
      await db.write()
      return { id: item.id, price, lastUpdated, source: 'serpapi' }
    } catch (err) {
      console.error(`[prices] SerpApi lookup failed for ${item.id}:`, err.message)
    }
  }

  if (cached) {
    return { id: item.id, price: cached.price, lastUpdated: cached.lastUpdated, source: 'cache' }
  }

  return { id: item.id, price: item.fallbackPrice, lastUpdated: new Date().toISOString(), source: 'fallback' }
}

app.get('/api/prices', async (req, res) => {
  const db = await getDb()
  const zip = String(req.query.zip ?? db.data.settings.zip ?? '')
  const items = await Promise.all(CATALOG.map((item) => resolvePrice(item, zip, db, { forceRefresh: false })))
  res.json({ zip, items })
})

app.post('/api/prices/refresh', async (req, res) => {
  const db = await getDb()
  const zip = String(req.body?.zip ?? db.data.settings.zip ?? '')
  if (!zip) {
    res.status(400).json({ error: 'zip is required' })
    return
  }
  const items = await Promise.all(CATALOG.map((item) => resolvePrice(item, zip, db, { forceRefresh: true })))
  res.json({ zip, items })
})

app.post('/api/settings/zip', async (req, res) => {
  const zip = String(req.body?.zip ?? '')
  const db = await getDb()
  db.data.settings.zip = zip
  await db.write()
  res.json({ zip })
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, serpApiConfigured: Boolean(SERPAPI_KEY) })
})

app.listen(PORT, () => {
  console.log(`The Average price server listening on :${PORT}`)
  if (!SERPAPI_KEY) {
    console.log('SERPAPI_KEY not set — serving fallback/cached prices only. See server/.env.example.')
  }
})

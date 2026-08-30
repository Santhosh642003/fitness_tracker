import { JSONFilePreset } from 'lowdb/node'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, 'data', 'db.json')

const defaultData = {
  settings: { zip: '' },
  // prices: { [catalogItemId]: { price, lastUpdated, source } }
  prices: {},
}

export async function getDb() {
  return JSONFilePreset(DB_PATH, defaultData)
}

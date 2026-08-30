const SERPAPI_BASE = 'https://serpapi.com/search.json'

/**
 * Looks up a single Walmart product's localized price via SerpApi's
 * Walmart Product API (engine=walmart_product). Requires SERPAPI_KEY.
 * Returns null price on any failure so the caller can fall back gracefully —
 * this is a paid, rate-limited API and one bad item shouldn't break the batch.
 */
export async function lookupWalmartPrice({ productId, zip, apiKey }) {
  const url = new URL(SERPAPI_BASE)
  url.searchParams.set('engine', 'walmart_product')
  url.searchParams.set('product_id', productId)
  url.searchParams.set('zip', zip)
  url.searchParams.set('api_key', apiKey)

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`SerpApi request failed: ${res.status}`)
  }
  const data = await res.json()
  const price =
    data?.product_result?.price_map?.price ??
    data?.product_result?.price ??
    data?.product_result?.buybox_winner?.price
  if (typeof price !== 'number') {
    throw new Error('SerpApi response had no parseable price')
  }
  return price
}

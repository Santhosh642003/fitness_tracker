export interface PriceItem {
  id: string
  price: number
  lastUpdated: string
  source: 'serpapi' | 'cache' | 'fallback'
}

export interface PricesResponse {
  zip: string
  items: PriceItem[]
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`${res.status} ${res.statusText}${body ? `: ${body}` : ''}`)
  }
  return res.json() as Promise<T>
}

export function fetchPrices(serverUrl: string, zip: string) {
  return request<PricesResponse>(`${serverUrl}/api/prices?zip=${encodeURIComponent(zip)}`)
}

export function refreshPrices(serverUrl: string, zip: string) {
  return request<PricesResponse>(`${serverUrl}/api/prices/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zip }),
  })
}

export function saveZip(serverUrl: string, zip: string) {
  return request<{ zip: string }>(`${serverUrl}/api/settings/zip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ zip }),
  })
}

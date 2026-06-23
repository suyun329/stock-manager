const BASE = 'http://localhost:8000'

export interface StockResult {
  ticker: string
  name: string
  market: string
}

export async function searchStocks(q: string): Promise<{ loading: boolean; results: StockResult[] }> {
  const res = await fetch(`${BASE}/stocks/search?q=${encodeURIComponent(q)}`)
  return res.json()
}

export async function getStockNames(tickers: string[]): Promise<Record<string, string>> {
  if (tickers.length === 0) return {}
  const res = await fetch(`${BASE}/stocks/names?tickers=${tickers.join(',')}`)
  return res.json()
}

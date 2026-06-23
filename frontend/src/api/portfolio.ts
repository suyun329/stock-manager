import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

export interface PortfolioItem {
  ticker: string
  market: string
  currency: string
  quantity: number
  avg_buy_price: number
  invested_amount: number
  current_price: number
  evaluation_amount: number
  profit_loss: number
  profit_rate: number
}

export interface PortfolioSummary {
  total_invested: number
  total_evaluation: number
  total_profit_loss: number
  total_return_rate: number
  currency: string
}

export const getAllPortfolios = async (market?: 'KR' | 'US'): Promise<PortfolioItem[]> => {
  const { data } = await api.get('/portfolio', { params: market ? { market } : {} })
  return data
}

export const getPortfolioByTicker = async (ticker: string): Promise<PortfolioItem> => {
  const { data } = await api.get(`/portfolio/${ticker}`)
  return data
}

export const getPortfolioSummary = async (market?: 'KR' | 'US'): Promise<PortfolioSummary> => {
  const { data } = await api.get('/portfolio/summary', { params: market ? { market } : {} })
  return data
}

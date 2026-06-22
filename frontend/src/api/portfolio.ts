import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

export interface PortfolioItem {
  ticker: string
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
}

export const getAllPortfolios = async (): Promise<PortfolioItem[]> => {
  const { data } = await api.get('/portfolio')
  return data
}

export const getPortfolioByTicker = async (ticker: string): Promise<PortfolioItem> => {
  const { data } = await api.get(`/portfolio/${ticker}`)
  return data
}

export const getPortfolioSummary = async (): Promise<PortfolioSummary> => {
  const { data } = await api.get('/portfolio/summary')
  return data
}

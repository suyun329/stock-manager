import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

export interface Trade {
  id: number
  ticker: string
  trade_type: string
  quantity: number
  price: number
}

export interface TradeCreate {
  ticker: string
  trade_type: string
  quantity: number
  price: number
}

export const getTrades = async (): Promise<Trade[]> => {
  const { data } = await api.get('/trades')
  return data
}

export const createTrade = async (trade: TradeCreate): Promise<Trade> => {
  const { data } = await api.post('/trades', trade)
  return data
}

export const updateTrade = async (id: number, trade: TradeCreate): Promise<Trade> => {
  const { data } = await api.put(`/trades/${id}`, trade)
  return data
}

export const deleteTrade = async (id: number): Promise<void> => {
  await api.delete(`/trades/${id}`)
}

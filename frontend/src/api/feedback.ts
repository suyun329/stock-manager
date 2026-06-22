import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

export interface AIFeedback {
  ticker: string
  profit_rate: number
  feedback: string
}

export const getAIFeedback = async (ticker: string): Promise<AIFeedback> => {
  const { data } = await api.get(`/ai-feedback/${ticker}`)
  return data
}

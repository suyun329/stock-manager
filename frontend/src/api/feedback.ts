import api from './client'

export interface AIFeedback {
  ticker: string
  profit_rate: number
  feedback: string
}

export const getAIFeedback = async (ticker: string): Promise<AIFeedback> => {
  const { data } = await api.get(`/ai-feedback/${ticker}`)
  return data
}
